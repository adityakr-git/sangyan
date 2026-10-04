import { executeImageAnalysis } from '../src/server/analyzeImage.js';

export default async function handler(req: any, res: any) {
  // Production CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  try {
    let payload = req.body;
    if (typeof payload === 'string') {
      try {
        payload = JSON.parse(payload);
      } catch {
        // use raw
      }
    }

    if (!payload) {
      payload = await new Promise((resolve, reject) => {
        let raw = '';
        req.on('data', (chunk: any) => {
          raw += chunk;
        });
        req.on('end', () => {
          try {
            resolve(raw ? JSON.parse(raw) : {});
          } catch {
            resolve({});
          }
        });
        req.on('error', reject);
      });
    }

    console.log('[VERCEL_API] Executing /api/analyze request');
    const result = await executeImageAnalysis(payload);
    return res.status(200).json(result);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    const statusCode = (err as any)?.status || (errorMsg.includes('Please provide') ? 400 : 500);
    console.error(`[VERCEL_API] Analysis error: ${errorMsg}`);
    return res.status(statusCode).json({ error: errorMsg });
  }
}
