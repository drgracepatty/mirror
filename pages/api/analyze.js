export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ feedback: "Missing OpenAI API key." });
  }

  const { situation, response } = req.body;

  if (!situation || !response) {
    return res.status(400).json({ feedback: "Missing situation or response." });
  }

  const prompt = `
Hi. Will you respond to these as a psychotherapist would, offering insights and critiques based on the following situation and response?

Situation:
${situation}

Response:
${response}
`.trim();

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

    // ✅ This is what was missing:
    res.status(200).json({ feedback: output });

  } catch (err) {
    console.error("OpenAI API error:", err);
    res.status(500).json({ feedback: "Something went wrong. Please try again." });
  }
}
