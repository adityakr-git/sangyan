import fs from 'fs';
import path from 'path';

export default async function handler(_req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  let cwdFiles: string[] = [];
  try {
    cwdFiles = fs.readdirSync(process.cwd());
  } catch (e: any) {
    cwdFiles = [e.message];
  }

  let srcFiles: string[] = [];
  try {
    srcFiles = fs.readdirSync(path.join(process.cwd(), 'src'));
  } catch (e: any) {
    srcFiles = [e.message];
  }

  let sebiTest: string = 'untested';
  try {
    const sebi = await import('../src/services/sebiSearchService');
    sebiTest = `success: ${typeof sebi.getSebiStats}`;
  } catch (e: any) {
    sebiTest = `error: ${e.message} \n ${e.stack}`;
  }

  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    geminiKeyConfigured: Boolean(process.env.GEMINI_API_KEY),
    platform: 'vercel',
    nodeEnv: process.env.NODE_ENV || 'production',
    cwd: process.cwd(),
    cwdFiles,
    srcFiles,
    sebiTest,
  });
}
