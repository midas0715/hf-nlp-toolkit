import { useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

function TranslateTab() {
  const [text, setText] = useState("");
  const [translation, setTranslation] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/translate`, { text });
      setTranslation(res.data.translation);
    } catch (err) {
      console.error(err);
      setTranslation("Error — check backend terminal.");
    }
    setLoading(false);
  };

  return (
    <div>
      <textarea
        rows={4}
        placeholder="Enter English text to translate to Hindi..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <br />
      <button onClick={handleSubmit} disabled={loading || !text}>
        {loading ? "Translating..." : "Translate to Hindi"}
      </button>

      {translation && <div className="result">{translation}</div>}
    </div>
  );
}

export default TranslateTab;