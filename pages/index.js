export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const apiKey = process.env.apiKey;

  if (!apiKey) {
    return res.status(500).json({ feedback: "Missing OpenAI API key." });
  }

  const { situation, response } = req.body;

  if (!situation || !response) {
    return res.status(400).json({ feedback: "Missing situation or response." });
  }

  const prompt = `
You are a compassionate psychotherapist.

Please reflect on the following:

Situation:
${situation}

Response:
${response}

Offer a gentle, insightful critique of the response from a mental health perspective. Keep it brief and supportive.
`.trim();

  try {
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      }),
    });

    const data = await openaiRes.json();

    // Handle OpenAI error response
    if (data.error) {
      console.error("OpenAI error:", data.error);
      return res.status(500).json({ feedback: `OpenAI error: ${data.error.message}` });
    }

    const output = data?.choices?.[0]?.message?.content?.trim();

    if (!output) {
      return res.status(500).json({ feedback: "No response from GPT." });
    }

    res.status(200).json({ feedback: output });

  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ feedback: "Something went wrong. Please try again." });
  }
}
