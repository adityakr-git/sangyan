import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as XLSX from 'xlsx';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CATEGORIES = [
  { id: 30, code: 'SB', name: 'Stock Broker', nameHi: 'स्टॉक ब्रोकर' },
  { id: 13, code: 'IA', name: 'Investment Adviser', nameHi: 'इन्वेस्टमेंट एडवाइजर' },
  { id: 14, code: 'RA', name: 'Research Analyst', nameHi: 'रिसर्च एनालिस्ट' },
  { id: 33, code: 'PM', name: 'Portfolio Manager', nameHi: 'पोर्टफोलियो मैनेजर' },
  { id: 23, code: 'MF', name: 'Mutual Fund', nameHi: 'म्यूचुअल फंड' },
  { id: 19, code: 'DP-NSDL', name: 'Depository Participant (NSDL)', nameHi: 'डिपॉजिटरी पार्टिसिपेंट (NSDL)' },
  { id: 18, code: 'DP-CDSL', name: 'Depository Participant (CDSL)', nameHi: 'डिपॉजिटरी पार्टिसिपेंट (CDSL)' },
  { id: 9, code: 'MB', name: 'Merchant Banker', nameHi: 'मर्चेंट बैंकर' },
  { id: 10, code: 'RTA', name: 'Registrar & Transfer Agent', nameHi: 'रजिस्ट्रार और ट्रांसफर एजेंट' },
  { id: 6, code: 'DT', name: 'Debenture Trustee', nameHi: 'डिबेंचर ट्रस्टी' },
  { id: 7, code: 'CRA', name: 'Credit Rating Agency', nameHi: 'क्रेडिट रेटिंग एजेंसी' },
  { id: 16, code: 'AIF', name: 'Alternative Investment Fund', nameHi: 'अल्टरनेटिव इन्वेस्टमेंट फंड' }
];

function extractDomain(email) {
  if (!email) return '';
  const clean = email.trim().replace(/&#64;/g, '@').replace(/&#46;/g, '.');
  const match = clean.match(/@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
  return match ? match[1].toLowerCase() : '';
}

function cleanText(val) {
  if (val === undefined || val === null) return '';
  return String(val).trim().replace(/\s+/g, ' ');
}

async function fetchCategory(cat) {
  console.log(`Fetching ${cat.name} (id: ${cat.id})...`);
  const url = `https://www.sebi.gov.in/sebiweb/other/IntmExportAction.do?intmId=${cat.id}`;
  const resp = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  });

  if (!resp.ok) {
    throw new Error(`Failed to fetch ${cat.name}: status ${resp.status}`);
  }

  const buf = Buffer.from(await resp.arrayBuffer());
  const wb = XLSX.read(buf, { type: 'buffer' });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  const entities = [];
  // Row 0 is Title, Row 1 is group header, Row 2 is columns header, Row 3+ is data
  for (let i = 3; i < rows.length; i++) {
    const r = rows[i];
    if (!r || r.length === 0) continue;

    const name = cleanText(r[0]);
    const regNumber = cleanText(r[1]);
    if (!name && !regNumber) continue;

    const contactPerson = cleanText(r[2]);
    const address = cleanText(r[3]);
    const rawEmail = cleanText(r[4]);
    const cleanEmail = rawEmail.replace(/&#64;/g, '@').replace(/&#46;/g, '.');
    const phone = cleanText(r[5]);
    const city = cleanText(r[7]);
    const state = cleanText(r[8]);
    const pincode = cleanText(r[9]);
    const validFrom = cleanText(r[17]);
    const validTo = cleanText(r[18]) || 'Perpetual';

    let exchange = '';
    let tradeName = '';
    if (cat.id === 30) {
      exchange = cleanText(r[20]);
      tradeName = cleanText(r[21]);
    }

    const domain = extractDomain(cleanEmail);
    const isExpired = validTo && validTo !== 'Perpetual' && new Date(validTo) < new Date();

    entities.push({
      regNumber: regNumber || `${cat.code}-${entities.length + 1}`,
      name,
      category: cat.name,
      categoryCode: cat.code,
      categoryHi: cat.nameHi,
      status: isExpired ? 'Expired' : 'Active',
      email: cleanEmail,
      registeredEmailDomain: domain,
      phone,
      city,
      state,
      pincode,
      address,
      contactPerson,
      validFrom,
      validTo,
      tradeName,
      exchange
    });
  }

  console.log(`✓ Fetched ${entities.length} records for ${cat.name}`);
  return entities;
}

async function main() {
  const allEntities = [];
  for (const cat of CATEGORIES) {
    try {
      const list = await fetchCategory(cat);
      allEntities.push(...list);
    } catch (err) {
      console.error(`Error processing category ${cat.name}:`, err.message);
    }
  }

  console.log(`Total SEBI entities loaded: ${allEntities.length}`);

  const outDir = path.resolve(__dirname, '../src/data');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  // Save full JSON
  const fullPath = path.join(outDir, 'sebi_entities.json');
  fs.writeFileSync(fullPath, JSON.stringify(allEntities, null, 2), 'utf-8');
  console.log(`Saved ${allEntities.length} records to ${fullPath} (${(fs.statSync(fullPath).size / 1024 / 1024).toFixed(2)} MB)`);

  // Also save a minified version for fast frontend bundle/client loading
  const minPath = path.join(outDir, 'sebi_entities.min.json');
  fs.writeFileSync(minPath, JSON.stringify(allEntities), 'utf-8');
  console.log(`Saved minified records to ${minPath} (${(fs.statSync(minPath).size / 1024 / 1024).toFixed(2)} MB)`);

  // Copy to public/data so frontend or service worker can fetch dynamically
  const publicDir = path.resolve(__dirname, '../public/data');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  const publicPath = path.join(publicDir, 'sebi_entities.json');
  fs.writeFileSync(publicPath, JSON.stringify(allEntities), 'utf-8');
  console.log(`Saved public dataset to ${publicPath}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
