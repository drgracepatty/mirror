
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ score: "N/A", feedback: "Missing OpenAI API key." });
  }

  const { situation, response } = req.body;

  const prompt = `
  Hi.  Will you respond to these as a psychotherapist would, offering insights and critiques based on the following situation and response:
  ${situation}
  ${response}`

  try {
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      }),
    });

    const data = await openaiRes.json();
    const output = data?.choices?.[0]?.message?.content?.trim() || "";

    const scoreMatch = output.match(/Score[:\s]*([1-5])/i);
    const feedbackMatch = output.match(/Feedback[:\s]*(.*)/is);

    const score = scoreMatch ? parseInt(scoreMatch[1]) : "N/A";
    const feedback = feedbackMatch ? feedbackMatch[1].trim() : output;

    res.status(200).json({ score, feedback });

  } catch (err) {
    console.error("OpenAI API error:", err);
    res.status(500).json({ score: "N/A", feedback: "Something went wrong. Please try again." });
  }
}
