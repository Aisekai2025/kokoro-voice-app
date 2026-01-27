console.log("ENV TEST:", process.env);
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

console.log("NODE KEY:", process.env.NODE_GEMINI_API_KEY);

app.post("/api/gemini", async (req, res) => {
  const { prompt } = req.body;

  try {
    const response = await fetch(
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" +
  process.env.NODE_GEMINI_API_KEY,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
    }),
  }
);

    const data = await response.json();
    console.log("GEMINI RAW RESPONSE:", JSON.stringify(data, null, 2));

    const text =
  data?.candidates?.[0]?.content?.parts?.map(p => p.text).join("") ||
  "すみません、うまく返答できませんでした。";

    res.json({ reply: text });

  } catch (err) {
    console.error("SERVER ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(3001, () => {
  console.log("Server running on http://localhost:3001");
});