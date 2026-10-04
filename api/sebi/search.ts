import { searchSebi } from '../../src/services/sebiSearchService';

export default function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { q = '', category = 'all', page = '1', limit = '25' } = req.query || {};
    const results = searchSebi({
      query: String(q),
      category: String(category),
      page: parseInt(String(page), 10) || 1,
      limit: parseInt(String(limit), 10) || 25,
    });
    return res.status(200).json(results);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('[VERCEL_SEBI] Search error:', errorMsg);
    return res.status(500).json({ error: 'Search failed' });
  }
}
