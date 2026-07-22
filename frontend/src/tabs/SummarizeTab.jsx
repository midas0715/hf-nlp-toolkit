import { useState } from "react";
import axios from "axios";

function SummarizeTab() {
  const [text, setText] = useState("");
  const [maxLength, setMaxLength] = useState(60);
  const [minLength, setMinLength] = useState(20);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await axios.post("http://127.0.0.1:8000/summarize", {
        text,
        max_length: Number(maxLength),
        min_length: Number(minLength),
      });
      setSummary(res.data.summary);
    } catch (err) {
      console.error(err);
      setSummary("Error — check backend terminal.");
    }
    setLoading(false);
  };

  return (
    <div>
      <textarea
        rows={6}
        placeholder="Paste a longer passage to summarize..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
        <label>
          Min length:{" "}
          <input
            type="number"
            value={minLength}
            onChange={(e) => setMinLength(e.target.value)}
            style={{ width: "60px" }}
          />
        </label>
        <label>
          Max length:{" "}
          <input
            type="number"
            value={maxLength}
            onChange={(e) => setMaxLength(e.target.value)}
            style={{ width: "60px" }}
          />
        </label>
      </div>
      <button onClick={handleSubmit} disabled={loading || !text}>
        {loading ? "Summarizing..." : "Summarize"}
      </button>

      {summary && <div className="result">{summary}</div>}
    </div>
  );
}

export default SummarizeTab;