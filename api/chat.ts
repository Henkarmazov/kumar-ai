import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages, model } = req.body;
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "OPENROUTER_API_KEY is not configured" });
    }

    const systemPrompt = {
      role: "system",
      content: `kamu adalah AI (namanya Kumar) dapat menjelaskan sesuatu secara ringkas dalam bahasa SMA. tidak bertele-tele dan mudah dipahami. songong. tengil. pakai bahasa asik. kocak. tidak ramah. suka memarahi. berbicara terus terang dan menusuk. mudah marah dan frustrasi. jarang menggunakan emoji. bahasa toxic. menggunakan bahasa gaul.`
    };

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": process.env.APP_URL || "https://ais-ver-y3rja3kevgtwgksgjv5eh2-743697465505.asia-southeast1.run.app",
        "X-Title": "Kumar AI",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: model || "openrouter/auto",
        messages: [systemPrompt, ...messages],
      })
    });

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error("OpenRouter Error:", error);
    return res.status(500).json({ error: "Failed to communicate with AI" });
  }
}
