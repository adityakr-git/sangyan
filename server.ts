import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { executeImageAnalysis } from './src/server/analyzeImage';
import {
  searchSebi,
  getSebiStats,
  getDebarredList,
  getRegulationsList,
  getPrefixesList,
} from './src/services/sebiSearchService';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// Support dynamic PORT assigned by hosting providers like Render
const PORT = Number(process.env.PORT) || 3000;

// Enable JSON body parser with 50MB limit to support high-res screenshots
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// CORS headers to prevent cross-origin issues in production deployments
app.use((_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (_req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Process error guards to prevent unhandled worker errors from crashing the server
process.on('unhandledRejection', (reason, promise) => {
  console.warn('[Server Guard] Unhandled Rejection at:', promise, 'reason:', reason);
});
process.on('uncaughtException', (err) => {
  console.warn('[Server Guard] Uncaught Exception:', err.message);
});



/**
 * Health check endpoint for Render monitoring and verification
 */
app.get(['/healthz', '/api/healthz'], (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    geminiKeyConfigured: Boolean(process.env.GEMINI_API_KEY),
    port: PORT,
    nodeEnv: process.env.NODE_ENV || 'development',
  });
});

/**
 * HARD GUARDRAIL 4: Privacy enforcement
 * No messages or user inputs are logged or persisted to disk or database.
 * Uses shared analysis engine shared across Express (Render/Localhost) and Serverless (Vercel).
 */
app.post('/api/analyze', async (req, res) => {
  console.log('[EXPRESS_API] request received at /api/analyze');
  console.log(`[EXPRESS_API] GEMINI_API_KEY configured: ${Boolean(process.env.GEMINI_API_KEY)}`);
  try {
    const result = await executeImageAnalysis(req.body);
    res.json(result);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    const statusCode = (err as any)?.status || (errorMsg.includes('Please provide') ? 400 : 500);
    console.error(`[IMAGE_ANALYSIS] Server error handling /api/analyze: ${errorMsg}`);
    res.status(statusCode).json({ error: errorMsg });
  }
});

/**
 * SEBI Unified Search & Verification API
 * Covers 12,397 official registered intermediaries, debarred operators, regulations, and prefixes.
 */
app.get('/api/sebi/search', (req, res) => {
  try {
    const { q = '', category = 'all', page = '1', limit = '25' } = req.query;
    const results = searchSebi({
      query: String(q),
      category: String(category),
      page: parseInt(String(page), 10) || 1,
      limit: parseInt(String(limit), 10) || 25,
    });
    res.json(results);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('Error handling /api/sebi/search:', errorMsg);
    res.status(500).json({ error: 'Search failed. Please try again.' });
  }
});

app.get('/api/sebi/stats', (_req, res) => {
  try {
    res.json(getSebiStats());
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch SEBI statistics' });
  }
});

app.get('/api/sebi/debarred', (_req, res) => {
  try {
    res.json(getDebarredList());
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch debarred entities' });
  }
});

app.get('/api/sebi/regulations', (_req, res) => {
  try {
    res.json(getRegulationsList());
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch regulations' });
  }
});

app.get('/api/sebi/prefixes', (_req, res) => {
  try {
    res.json(getPrefixesList());
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch prefix directory' });
  }
});

// Setup Vite or static serving
async function startServer() {
  const distPath = path.resolve(__dirname, 'dist');
  const hasDist = fs.existsSync(path.resolve(distPath, 'index.html'));
  const isProduction = process.env.NODE_ENV === 'production' || hasDist;

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SERVER_START] Sangyan server running on http://0.0.0.0:${PORT} (Production: ${isProduction})`);
  });
}

startServer().catch((err) => {
  console.error('[SERVER_START] Failed to start server:', err);
  process.exit(1);
});
