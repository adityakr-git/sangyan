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

    const availableModels: string[] = [];
    try {
      const list = await ai.models.list();
      for await (const m of list) {
        if (m.name) availableModels.push(m.name);
      }
      results['available_models'] = availableModels.slice(0, 30);
    } catch (e: any) {
      results['list_error'] = e.message;
    }

    const testModels = ['gemini-3.8-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
    for (const m of testModels) {
      try {
        const resp = await ai.models.generateContent({
          model: m,
          contents: 'Say hi',
        });
        results[m] = { success: true, text: resp.text };
      } catch (e: any) {
        results[m] = { success: false, error: e.message, status: e.status || e.code };
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
