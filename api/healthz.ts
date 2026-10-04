import { GoogleGenAI } from '@google/genai';

export default async function handler(_req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  const apiKey = process.env.GEMINI_API_KEY;
  const results: Record<string, any> = {};

  if (apiKey) {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const testModels = ['gemini-3.5-flash', 'gemini-flash-latest', 'gemini-2.5-flash'];
    for (const m of testModels) {
      const t0 = Date.now();
      try {
        const resp = await ai.models.generateContent({
          model: m,
          contents: 'Say hi',
        });
        results[m] = { success: true, text: resp.text, timeMs: Date.now() - t0 };
      } catch (e: any) {
        results[m] = { success: false, error: e.message, timeMs: Date.now() - t0 };
      }
    }
  }

  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    geminiKeyConfigured: Boolean(process.env.GEMINI_API_KEY),
    platform: 'vercel',
    nodeEnv: process.env.NODE_ENV || 'production',
    geminiModelResults: results,
  });
}
