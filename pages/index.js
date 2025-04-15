
import { useState, useEffect } from "react";

export default function Home() {
  const [situation, setSituation] = useState("");
  const [response, setResponse] = useState("");
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem("reflectionHistory");
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("reflectionHistory", JSON.stringify(history));
  }, [history]);

  const handleReflect = async () => {
    const res = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ situation, response })
    });
    const data = await res.json();
    setResult(data);
    setHistory([{ situation, response, ...data }, ...history]);
  };

  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: "700px", margin: "auto", padding: "2em" }}>
      <h2>Mindset Mirror 🪞</h2>
      <label>Situation:</label>
      <textarea value={situation} onChange={(e) => setSituation(e.target.value)} rows="2" style={{ width: "100%" }} />
      <label>Your Reaction:</label>
      <textarea value={response} onChange={(e) => setResponse(e.target.value)} rows="3" style={{ width: "100%" }} />
      <button onClick={handleReflect} style={{ marginTop: "1em" }}>Reflect</button>

      {result && (
        <div style={{ marginTop: "2em", background: "#f0f0f0", padding: "1em", borderRadius: "8px" }}>
          <h3>Feedback</h3>
          <p><strong>Score:</strong> {result.score} / 5</p>
          <p>{result.feedback}</p>
        </div>
      )}

      {history.length > 0 && (
        <div style={{ marginTop: "2em" }}>
          <h4>Previous Reflections</h4>
          <ul>
            {history.map((entry, i) => (
              <li key={i} style={{ marginBottom: "1em" }}>
                <strong>Situation:</strong> {entry.situation}<br />
                <strong>Response:</strong> {entry.response}<br />
                <strong>Score:</strong> {entry.score}<br />
                <em>{entry.feedback}</em>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
