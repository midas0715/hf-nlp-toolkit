import { useState } from "react";

function GenerateTab() {
  const [prompt, setPrompt] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setOutput("");
    setLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:8000/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, max_new_tokens: 150, temperature: 0.7 }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setOutput((prev) => prev + chunk);
      }
    } catch (err) {
      console.error(err);
      setOutput("Error — check backend terminal.");
    }
    setLoading(false);
  };

  return (
    <div>
      <textarea
        rows={3}
        placeholder="Enter a prompt..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      <br />
      <button onClick={handleSubmit} disabled={loading || !prompt}>
        {loading ? "Generating..." : "Generate"}
      </button>

      {output && <div className="result">{output}</div>}
    </div>
  );
}

export default GenerateTab;