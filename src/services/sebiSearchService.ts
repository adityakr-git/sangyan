import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const getDirname = () => {
  if (typeof __dirname !== 'undefined' && __dirname) return __dirname;
  if (typeof import.meta !== 'undefined' && import.meta && import.meta.url) {
    try {
      return path.dirname(fileURLToPath(import.meta.url));
    } catch {
      // fallback
    }
  }
  return process.cwd();
};

export interface SebiIntermediary {
  regNumber: string;
  name: string;
  category: string;
  categoryCode: string;
  categoryHi: string;
  status: 'Active' | 'Suspended' | 'Expired';
  email: string;
  registeredEmailDomain: string;
  phone?: string;
  city?: string;
  state?: string;
  pincode?: string;
  address?: string;
  contactPerson?: string;
  validFrom?: string;
  validTo?: string;
  tradeName?: string;
  exchange?: string;
}

export interface DebarredEntity {
  id: string;
  name: string;
  aliases: string[];
  category: string;
  orderDate: string;
  orderRef: string;
  summary: string;
  summaryHi: string;
  status: string;
  modusOperandi: string;
  flagKeywords: string[];
}

export interface SebiRegulation {
  id: string;
  title: string;
  titleHi: string;
  shortCode: string;
  keySections: {
    section: string;
    heading: string;
    headingHi: string;
    explanation: string;
    explanationHi: string;
  }[];
}

export interface SebiPrefix {
  prefix: string;
  category: string;
  categoryHi: string;
  example: string;
  authority: string;
}

export interface SebiSearchResult {
  query: string;
  category: string;
  totalEntities: number;
  totalMatched: number;
  page: number;
  limit: number;
  hasMore: boolean;
  entities: SebiIntermediary[];
  debarredMatches: DebarredEntity[];
  matchedRegulations: SebiRegulation[];
  matchedPrefixes: SebiPrefix[];
  prefixAnalysis?: {
    isValidFormat: boolean;
    prefixMatched?: SebiPrefix;
    explanation: string;
    explanationHi: string;
  };
}

let cachedEntities: SebiIntermediary[] | null = null;
let cachedDebarred: DebarredEntity[] | null = null;
let cachedRegulations: SebiRegulation[] | null = null;
let cachedPrefixes: SebiPrefix[] | null = null;

function loadData() {
  if (cachedEntities) return;

  const currentDir = getDirname();
  const candidateDirs = [
    path.resolve(currentDir, '../data'),
    path.resolve(currentDir, 'src/data'),
    path.resolve(process.cwd(), 'src/data'),
    path.resolve(process.cwd(), 'data'),
  ];

  let dataDir = candidateDirs[0];
  for (const dir of candidateDirs) {
    if (fs.existsSync(path.join(dir, 'sebi_entities.json'))) {
      dataDir = dir;
      break;
    }
  }

  try {
    const entPath = path.join(dataDir, 'sebi_entities.json');
    if (fs.existsSync(entPath)) {
      cachedEntities = JSON.parse(fs.readFileSync(entPath, 'utf-8'));
    } else {
      cachedEntities = [];
    }
  } catch (err) {
    console.error('Failed to load sebi_entities.json:', err);
    cachedEntities = [];
  }

  try {
    const debPath = path.join(dataDir, 'sebi_debarred.json');
    if (fs.existsSync(debPath)) {
      cachedDebarred = JSON.parse(fs.readFileSync(debPath, 'utf-8'));
    } else {
      cachedDebarred = [];
    }
  } catch (err) {
    console.error('Failed to load sebi_debarred.json:', err);
    cachedDebarred = [];
  }

  try {
    const regPath = path.join(dataDir, 'sebi_regulations.json');
    if (fs.existsSync(regPath)) {
      cachedRegulations = JSON.parse(fs.readFileSync(regPath, 'utf-8'));
    } else {
      cachedRegulations = [];
    }
  } catch (err) {
    console.error('Failed to load sebi_regulations.json:', err);
    cachedRegulations = [];
  }

  try {
    const prefPath = path.join(dataDir, 'sebi_prefixes.json');
    if (fs.existsSync(prefPath)) {
      cachedPrefixes = JSON.parse(fs.readFileSync(prefPath, 'utf-8'));
    } else {
      cachedPrefixes = [];
    }
  } catch (err) {
    console.error('Failed to load sebi_prefixes.json:', err);
    cachedPrefixes = [];
  }
}

export function getSebiStats() {
  loadData();
  const entities = cachedEntities || [];

  const categoryCounts: Record<string, { count: number; name: string; nameHi: string }> = {};
  for (const item of entities) {
    const code = item.categoryCode || 'OTHER';
    if (!categoryCounts[code]) {
      categoryCounts[code] = { count: 0, name: item.category, nameHi: item.categoryHi };
    }
    categoryCounts[code].count++;
  }

  return {
    totalEntities: entities.length,
    categoryCounts,
    totalDebarred: cachedDebarred?.length || 0,
    totalRegulations: cachedRegulations?.length || 0,
    totalPrefixes: cachedPrefixes?.length || 0,
    lastUpdated: 'October 2026'
  };
}

export function searchSebi(options: {
  query?: string;
  category?: string;
  page?: number;
  limit?: number;
}): SebiSearchResult {
  loadData();

  const query = (options.query || '').trim();
  const cleanQ = query.toLowerCase();
  const category = options.category || 'all';
  const page = Math.max(1, options.page || 1);
  const limit = Math.min(100, Math.max(5, options.limit || 25));

  const allEntities = cachedEntities || [];
  const allDebarred = cachedDebarred || [];
  const allRegulations = cachedRegulations || [];
  const allPrefixes = cachedPrefixes || [];

  // Match debarred entities
  const matchedDebarred: DebarredEntity[] = [];
  if (cleanQ.length >= 2) {
    for (const deb of allDebarred) {
      const matchName = deb.name.toLowerCase().includes(cleanQ);
      const matchAliases = deb.aliases.some((a) => a.toLowerCase().includes(cleanQ));
      const matchKeywords = deb.flagKeywords.some((k) => cleanQ.includes(k) || k.includes(cleanQ));
      const matchSummary = deb.summary.toLowerCase().includes(cleanQ) || deb.summaryHi.toLowerCase().includes(cleanQ);

      if (matchName || matchAliases || matchKeywords || matchSummary) {
        matchedDebarred.push(deb);
      }
    }
  }

  // Match regulations
  const matchedRegulations: SebiRegulation[] = [];
  if (cleanQ.length >= 2) {
    for (const reg of allRegulations) {
      const titleMatch =
        reg.title.toLowerCase().includes(cleanQ) ||
        reg.titleHi.toLowerCase().includes(cleanQ) ||
        reg.shortCode.toLowerCase().includes(cleanQ);
      const sectionMatch = reg.keySections.some(
        (s) =>
          s.section.toLowerCase().includes(cleanQ) ||
          s.heading.toLowerCase().includes(cleanQ) ||
          s.explanation.toLowerCase().includes(cleanQ) ||
          s.headingHi.toLowerCase().includes(cleanQ) ||
          s.explanationHi.toLowerCase().includes(cleanQ)
      );

      if (titleMatch || sectionMatch) {
        matchedRegulations.push(reg);
      }
    }
  }

  // Match prefixes
  const matchedPrefixes: SebiPrefix[] = [];
  let prefixAnalysis: SebiSearchResult['prefixAnalysis'];

  if (cleanQ.length >= 2) {
    for (const p of allPrefixes) {
      if (
        p.prefix.toLowerCase().includes(cleanQ) ||
        cleanQ.startsWith(p.prefix.toLowerCase()) ||
        p.category.toLowerCase().includes(cleanQ) ||
        p.categoryHi.toLowerCase().includes(cleanQ)
      ) {
        matchedPrefixes.push(p);
      }
    }

    // Check if query looks like a SEBI Registration Number
    const upperQ = query.toUpperCase();
    const matchedP = allPrefixes.find((p) => upperQ.startsWith(p.prefix));
    if (matchedP) {
      prefixAnalysis = {
        isValidFormat: true,
        prefixMatched: matchedP,
        explanation: `Prefix "${matchedP.prefix}" indicates a SEBI-registered ${matchedP.category}, regulated under ${matchedP.authority}.`,
        explanationHi: `प्रीफिक्स "${matchedP.prefix}" यह दर्शाता है कि यह संस्था सेबी रजिस्टर्ड "${matchedP.categoryHi}" है, जिसका विनियमन ${matchedP.authority} द्वारा किया जाता है।`
      };
    } else if (/^[A-Z]{3}/i.test(cleanQ)) {
      prefixAnalysis = {
        isValidFormat: false,
        explanation: `Prefix "${upperQ.slice(0, 3)}" does not match standard SEBI intermediary registration categories (INZ, INA, INH, INP, INF, INM). Verify with caution.`,
        explanationHi: `प्रीफिक्स "${upperQ.slice(0, 3)}" सेबी के मानक इंटरमीडियरी रजिस्ट्रेशन कोड्स (INZ, INA, INH, INP, INF) से मेल नहीं खाता है। सतर्क रहें।`
      };
    }
  }

  // Match Intermediary Entities
  let matchedEntities: SebiIntermediary[] = [];

  if (!cleanQ && category === 'all') {
    // Return sample top marquee brokers, advisors, analysts, mutual funds by default
    matchedEntities = allEntities.filter((e) =>
      ['SB', 'IA', 'RA', 'MF', 'PM'].includes(e.categoryCode)
    ).slice(0, 50);
  } else {
    for (const item of allEntities) {
      // Category filter check
      if (category !== 'all') {
        const catMatch =
          item.categoryCode.toLowerCase() === category.toLowerCase() ||
          item.category.toLowerCase().includes(category.toLowerCase());
        if (!catMatch) continue;
      }

      if (!cleanQ) {
        matchedEntities.push(item);
        continue;
      }

      // Search across name, regNumber, domain, trade name, city, email
      const nameMatch = item.name.toLowerCase().includes(cleanQ);
      const regMatch = item.regNumber.toLowerCase().includes(cleanQ);
      const domainMatch = item.registeredEmailDomain && item.registeredEmailDomain.toLowerCase().includes(cleanQ);
      const tradeMatch = item.tradeName && item.tradeName.toLowerCase().includes(cleanQ);
      const cityMatch = item.city && item.city.toLowerCase().includes(cleanQ);
      const emailMatch = item.email && item.email.toLowerCase().includes(cleanQ);
      const contactMatch = item.contactPerson && item.contactPerson.toLowerCase().includes(cleanQ);

      if (nameMatch || regMatch || domainMatch || tradeMatch || cityMatch || emailMatch || contactMatch) {
        matchedEntities.push(item);
      }
    }
  }

  const totalMatched = matchedEntities.length;
  const startIndex = (page - 1) * limit;
  const paginated = matchedEntities.slice(startIndex, startIndex + limit);
  const hasMore = startIndex + limit < totalMatched;

  return {
    query,
    category,
    totalEntities: allEntities.length,
    totalMatched,
    page,
    limit,
    hasMore,
    entities: paginated,
    debarredMatches: matchedDebarred,
    matchedRegulations,
    matchedPrefixes,
    prefixAnalysis
  };
}

export function getDebarredList(): DebarredEntity[] {
  loadData();
  return cachedDebarred || [];
}

export function getRegulationsList(): SebiRegulation[] {
  loadData();
  return cachedRegulations || [];
}

export function getPrefixesList(): SebiPrefix[] {
  loadData();
  return cachedPrefixes || [];
}
