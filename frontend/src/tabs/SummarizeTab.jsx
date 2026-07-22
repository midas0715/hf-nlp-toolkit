import { useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

function SearchTab() {
  const [docsInput, setDocsInput] = useState(
    "The Reserve Bank of India kept interest rates unchanged.\nManchester United signed a new striker.\nResearchers published a paper on transformer attention."
  );
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const documents = docsInput.split("\n").map((d) => d.trim()).filter(Boolean);
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/search`, {
        query,
        documents,
        top_k: 3,
      });
      setResults(res.data.results);
    } catch (err) {
      console.error(err);
      setResults(null);
    }
    setLoading(false);
  };

  return (
    <div>
      <label>Documents (one per line):</label>
      <textarea
        rows={5}
        value={docsInput}
        onChange={(e) => setDocsInput(e.target.value)}
      />
      <input
        type="text"
        placeholder="Search query..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ width: "100%", marginTop: "8px", padding: "8px" }}
      />
      <br />
      <button onClick={handleSubmit} disabled={loading || !query || !docsInput}>
        {loading ? "Searching..." : "Search"}
      </button>

      {results && (
        <div className="result">
          {results.map((r, i) => (
            <div key={i} style={{ marginBottom: "8px" }}>
              <strong>{(r.score * 100).toFixed(1)}%</strong> — {r.document}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SearchTab;