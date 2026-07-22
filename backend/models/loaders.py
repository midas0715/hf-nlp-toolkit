import torch
from transformers import pipeline
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM, AutoModelForCausalLM
from transformers import MarianTokenizer, MarianMTModel
from sentence_transformers import SentenceTransformer

# Auto-detect: use GPU if available (your laptop), fall back to CPU (deployment)
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
PIPELINE_DEVICE = 0 if DEVICE == "cuda" else -1  # HF pipelines use -1 for CPU, 0 for first GPU

print(f"[loaders] Running on device: {DEVICE}")


def load_sentiment_model():
    return pipeline("sentiment-analysis", device=PIPELINE_DEVICE)

def load_ner_model():
    return pipeline("ner", aggregation_strategy="simple", device=PIPELINE_DEVICE)

def load_zero_shot():
    return pipeline("zero-shot-classification", device=PIPELINE_DEVICE)

def load_summarizer():
    tok = AutoTokenizer.from_pretrained("sshleifer/distilbart-cnn-12-6")
    mdl = AutoModelForSeq2SeqLM.from_pretrained("sshleifer/distilbart-cnn-12-6").to(DEVICE)
    return {"tokenizer": tok, "model": mdl}

def load_translator():
    tok = MarianTokenizer.from_pretrained("Helsinki-NLP/opus-mt-en-hi")
    mdl = MarianMTModel.from_pretrained("Helsinki-NLP/opus-mt-en-hi").to(DEVICE)
    return {"tokenizer": tok, "model": mdl}

def load_embedding_model():
    return SentenceTransformer("all-MiniLM-L6-v2", device=DEVICE)

def load_qwen():
    tok = AutoTokenizer.from_pretrained("Qwen/Qwen2.5-1.5B-Instruct")
    # float16 only makes sense on GPU — CPU needs float32
    dtype = torch.float16 if DEVICE == "cuda" else torch.float32
    mdl = AutoModelForCausalLM.from_pretrained(
        "Qwen/Qwen2.5-1.5B-Instruct", torch_dtype=dtype
    ).to(DEVICE)
    return {"tokenizer": tok, "model": mdl}