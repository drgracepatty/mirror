export default async function handler(req, res) {
  console.log("📥 Request received");

  if (req.method !== "POST") {
    console.log("❌ Invalid request method");
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  if (!process.env.OPENAI_API_KEY) {
    console.log("❌ Missing OpenAI API key");
    return res.status(500).json({ feedback: "Missing OpenAI API key." });
  }

  const { situation, response } = req.body;

  if (!situation || !response) {
    console.log("❌ Missing input fields");
    return res.status(400).json({ feedback: "Missing situation or response." });
  }

  const prompt = `
Hi. Please respond as a compassionate psychotherapist would, offering thoughtful insights into the mindset shown below.

Situation:
${situation}

Response:
${response}

Give a brief, therapist-style reflection or gentle critique to help the person reflect and grow.
`.trim();

  try {
    console.log("📡 Sending prompt to OpenAI...");

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
    console.log("✅ OpenAI response received");

    const output = data?.choices?.[0]?.message?.content?.trim() || "⚠️ No feedback returned.";
    res.status(200).json({ feedback: output });

  } catch (err) {
    console.error("🔥 Error from OpenAI:", err);
    res.status(500).json({ feedback: "Something went wrong. Please try again." });
  }
}
