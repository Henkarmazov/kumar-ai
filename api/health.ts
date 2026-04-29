import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ status: "error", message: "API Key belum dikonfigurasi di secrets" });
  }
  
  try {
    const response = await fetch("https://openrouter.ai/api/v1/models", {
      headers: { "Authorization": `Bearer ${apiKey}` }
    });
    
    if (response.ok) {
      return res.status(200).json({ status: "connected", message: "Koneksi ke OpenRouter Berhasil" });
    } else {
      return res.status(502).json({ status: "failed", message: "API Key tidak valid atau limit tercapai" });
    }
  } catch (error) {
    return res.status(500).json({ status: "error", message: "Gagal menghubungi OpenRouter" });
  }
}
