from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from threading import Thread
import torch
import numpy as np
import faiss

from models.registry import registry
from models.loaders import (
    DEVICE,
    load_sentiment_model, load_ner_model, load_summarizer,
    load_translator, load_zero_shot, load_embedding_model, load_qwen
)

print(f"[main] Backend starting on device: {DEVICE}")

app = FastAPI(title="NLP Toolkit API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- Request models ----------
class TextRequest(BaseModel):
    text: str

class SummarizeRequest(BaseModel):
    text: str
    max_length: int = 60
    min_length: int = 20

class ZeroShotRequest(BaseModel):
    text: str
    labels: list[str]

class EmbedRequest(BaseModel):
    texts: list[str]

class SearchRequest(BaseModel):
    query: str
    documents: list[str]
    top_k: int = 3

class GenerateRequest(BaseModel):
    prompt: str
    max_new_tokens: int = 60
    temperature: float = 0.7

# ---------- Health check ----------
@app.get("/")
def root():
    return {"status": "running", "device": DEVICE}

# ---------- Sentiment ----------
@app.post("/sentiment")
def sentiment_endpoint(request: TextRequest):
    pipe = registry.get("sentiment", load_sentiment_model)
    result = pipe(request.text)
    return {"result": result}

# ---------- NER ----------
@app.post("/ner")
def ner_endpoint(request: TextRequest):
    pipe = registry.get("ner", load_ner_model)
    result = pipe(request.text)
    for entity in result:
        entity["score"] = float(entity["score"])
    return {"result": result}

# ---------- Summarize ----------
@app.post("/summarize")
def summarize_endpoint(request: SummarizeRequest):
    bundle = registry.get("summarizer", load_summarizer)
    tok, mdl = bundle["tokenizer"], bundle["model"]
    inputs = tok(request.text, return_tensors="pt", truncation=True, max_length=1024).to(DEVICE)
    with torch.no_grad():
        summary_ids = mdl.generate(
            **inputs, max_length=request.max_length, min_length=request.min_length, num_beams=2
        )
    summary = tok.decode(summary_ids[0], skip_special_tokens=True)
    return {"summary": summary}

# ---------- Translate ----------
@app.post("/translate")
def translate_endpoint(request: TextRequest):
    bundle = registry.get("translator", load_translator)
    tok, mdl = bundle["tokenizer"], bundle["model"]
    inputs = tok(request.text, return_tensors="pt").to(DEVICE)
    with torch.no_grad():
        translated_ids = mdl.generate(**inputs, num_beams=2, max_length=60)
    translated = tok.decode(translated_ids[0], skip_special_tokens=True)
    return {"translation": translated}

# ---------- Zero-shot classification ----------
@app.post("/zero-shot")
def zero_shot_endpoint(request: ZeroShotRequest):
    pipe = registry.get("zero_shot", load_zero_shot)
    result = pipe(request.text, request.labels)
    return {"result": result}

# ---------- Embeddings ----------
@app.post("/embed")
def embed_endpoint(request: EmbedRequest):
    model = registry.get("embedding", load_embedding_model)
    embeddings = model.encode(request.texts, convert_to_tensor=False)
    return {"embeddings": np.array(embeddings).tolist()}

# ---------- Semantic search ----------
@app.post("/search")
def search_endpoint(request: SearchRequest):
    model = registry.get("embedding", load_embedding_model)

    doc_embeddings = np.array(model.encode(request.documents, convert_to_tensor=False)).astype("float32")
    query_embedding = np.array(model.encode([request.query], convert_to_tensor=False)).astype("float32")

    faiss.normalize_L2(doc_embeddings)
    faiss.normalize_L2(query_embedding)

    index = faiss.IndexFlatIP(doc_embeddings.shape[1])
    index.add(doc_embeddings)

    scores, indices = index.search(query_embedding, min(request.top_k, len(request.documents)))

    results = [
        {"document": request.documents[idx], "score": float(score)}
        for idx, score in zip(indices[0], scores[0])
    ]
    return {"results": results}

# ---------- Text generation (streaming) ----------
@app.post("/generate")
def generate_endpoint(request: GenerateRequest):
    bundle = registry.get("qwen", load_qwen)
    tok, mdl = bundle["tokenizer"], bundle["model"]

    from transformers import TextIteratorStreamer

    messages = [{"role": "user", "content": request.prompt}]
    prompt = tok.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
    inputs = tok(prompt, return_tensors="pt").to(DEVICE)

    streamer = TextIteratorStreamer(tok, skip_prompt=True, skip_special_tokens=True)
    generation_kwargs = dict(
        **inputs,
        max_new_tokens=request.max_new_tokens,
        do_sample=True,
        temperature=request.temperature,
        top_p=0.9,
        streamer=streamer
    )
    thread = Thread(target=mdl.generate, kwargs=generation_kwargs)
    thread.start()

    def token_stream():
        for new_text in streamer:
            yield new_text

    return StreamingResponse(token_stream(), media_type="text/plain")