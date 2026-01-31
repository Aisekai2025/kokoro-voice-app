console.log("ENV KEY:", process.env.GEMINI_API_KEY);
export const config = {
  runtime: "edge",
};

export default async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  const { prompt } = await req.json();

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "API key missing" }, { status: 500 });
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
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

  const text = await response.text();

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    return Response.json(
      { error: "Invalid JSON from Gemini API", raw: text },
      { status: 500 }
    );
  }

  const reply =
    data?.candidates?.[0]?.content?.parts?.[0]?.text ||
    data?.error?.message ||
    "うまく返答できませんでした。";

  return Response.json({ reply });
}