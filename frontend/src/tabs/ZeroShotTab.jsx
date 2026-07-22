import { useState } from "react";
import axios from "axios";

function ZeroShotTab() {
  const [text, setText] = useState("");
  const [labelsInput, setLabelsInput] = useState("technology, sports, finance, cooking");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const labels = labelsInput.split(",").map((l) => l.trim()).filter(Boolean);
    setLoading(true);
    try {
      const res = await axios.post("http://127.0.0.1:8000/zero-shot", { text, labels });
      setResults(res.data.result);
    } catch (err) {
      console.error(err);
      setResults(null);
    }
    setLoading(false);
  };

  return (
    <div>
      <textarea
        rows={4}
        placeholder="Enter text to classify..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <br />
      <input
        type="text"
        placeholder="Comma-separated labels"
        value={labelsInput}
        onChange={(e) => setLabelsInput(e.target.value)}
        style={{ width: "100%", marginTop: "8px", padding: "8px" }}
      />
      <br />
      <button onClick={handleSubmit} disabled={loading || !text}>
        {loading ? "Classifying..." : "Classify"}
      </button>

      {results && (
        <div className="result">
          {results.labels.map((label, i) => (
            <div key={label}>
              {label} — {(results.scores[i] * 100).toFixed(1)}%
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ZeroShotTab;