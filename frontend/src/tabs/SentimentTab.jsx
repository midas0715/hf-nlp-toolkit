import { useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

function SentimentTab() {
  const [text, setText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/sentiment`, { text });
      setResult(res.data.result[0]);
    } catch (err) {
      console.error(err);
      setResult({ error: "Something went wrong. Check the backend terminal." });
    }
    setLoading(false);
  };

  return (
    <div>
      <textarea
        rows={4}
        placeholder="Enter text to analyze..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <br />
      <button onClick={handleSubmit} disabled={loading || !text}>
        {loading ? "Analyzing..." : "Analyze Sentiment"}
      </button>

      {result && !result.error && (
        <div className="result">
          <strong>{result.label}</strong> — {(result.score * 100).toFixed(1)}% confidence
        </div>
      )}
      {result?.error && <div className="error">{result.error}</div>}
    </div>
  );
}

export default SentimentTab;