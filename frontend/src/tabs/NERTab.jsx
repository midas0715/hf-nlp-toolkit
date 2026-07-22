import { useState } from "react";
import axios from "axios";

function NERTab() {
  const [text, setText] = useState("");
  const [entities, setEntities] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await axios.post("http://127.0.0.1:8000/ner", { text });
      setEntities(res.data.result);
    } catch (err) {
      console.error(err);
      setEntities([]);
    }
    setLoading(false);
  };

  return (
    <div>
      <textarea
        rows={4}
        placeholder="Enter text to extract entities from..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <br />
      <button onClick={handleSubmit} disabled={loading || !text}>
        {loading ? "Extracting..." : "Extract Entities"}
      </button>

      {entities && entities.length > 0 && (
        <div className="result">
          {entities.map((ent, i) => (
            <div key={i}>
              <strong>{ent.word}</strong> — {ent.entity_group} ({(ent.score * 100).toFixed(1)}%)
            </div>
          ))}
        </div>
      )}
      {entities && entities.length === 0 && (
        <div className="result">No entities found.</div>
      )}
    </div>
  );
}

export default NERTab;