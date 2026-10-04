import fs from 'fs';
import path from 'path';

interface TestCase {
  id: string;
  name: string;
  filename: string;
  expectedConcern: 'low' | 'medium' | 'high';
  expectedSignalsMin: number;
  expectedKeywords: string[];
}

const TEST_CASES: TestCase[] = [
  {
    id: 'TEST_1',
    name: 'WhatsApp Investment Scam Screenshot',
    filename: 'test_screenshots/test1_whatsapp_scam.png',
    expectedConcern: 'high',
    expectedSignalsMin: 2,
    expectedKeywords: ['Guaranteed', 'whatsapp', 'return'],
  },
  {
    id: 'TEST_2',
    name: 'Telegram Trading / Operator Tip Screenshot',
    filename: 'test_screenshots/test2_telegram_tips.png',
    expectedConcern: 'high',
    expectedSignalsMin: 2,
    expectedKeywords: ['Operator', 'Telegram', 'profit'],
  },
  {
    id: 'TEST_3',
    name: 'Fake Guaranteed-Return Advertisement',
    filename: 'test_screenshots/test3_guaranteed_ad.png',
    expectedConcern: 'high',
    expectedSignalsMin: 2,
    expectedKeywords: ['guaranteed', 'Zero risk', 'APK'],
  },
  {
    id: 'TEST_4',
    name: 'Normal Educational Financial Content',
    filename: 'test_screenshots/test4_educational_safe.png',
    expectedConcern: 'low',
    expectedSignalsMin: 0,
    expectedKeywords: ['market', 'performance'],
  },
  {
    id: 'TEST_5',
    name: 'Claimed SEBI Registration Intermediary Screenshot',
    filename: 'test_screenshots/test5_sebi_reg.png',
    expectedConcern: 'medium', // or high depending on DB match
    expectedSignalsMin: 1,
    expectedKeywords: ['SEBI', 'INH'],
  },
];

async function runTests() {
  console.log('================================================================');
  console.log('       SANGYAN REAL IMAGE ANALYSIS PIPELINE VERIFICATION        ');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  for (const tc of TEST_CASES) {
    const fullPath = path.resolve(process.cwd(), tc.filename);
    if (!fs.existsSync(fullPath)) {
      console.error(`[FAIL] ${tc.id}: Image file not found: ${fullPath}`);
      failed++;
      continue;
    }

    const imageBytes = fs.readFileSync(fullPath);
    const base64 = `data:image/png;base64,${imageBytes.toString('base64')}`;

    console.log(`----------------------------------------------------------------`);
    console.log(`Running ${tc.id}: "${tc.name}"`);
    console.log(`Image Size: ${imageBytes.length} bytes`);

    const startTime = Date.now();
    try {
      const response = await fetch('http://localhost:3000/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64,
          imageMimeType: 'image/png',
          language: 'en',
        }),
      });

      const elapsed = Date.now() - startTime;

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[FAIL] Server returned HTTP ${response.status}: ${errorText}`);
        failed++;
        continue;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data: any = await response.json();

      console.log(`Elapsed Time: ${elapsed}ms`);
      console.log(`Mode: ${data.modeLabel}`);
      console.log(`Extracted OCR Text:\n"${data.extractedImageText?.replace(/\n/g, ' ')}"`);
      console.log(`Overall Concern Level: ${data.overallConcern.toUpperCase()}`);
      console.log(`Concern Summary: ${data.concernReason}`);
      console.log(`Detected Signals (${data.signals?.length || 0}):`);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data.signals?.forEach((s: any, idx: number) => {
        console.log(`  [${idx + 1}] [${s.severity?.toUpperCase()}] "${s.quote}" -> ${s.explanation}`);
      });
      console.log(`SEBI Verification:`, data.sebiVerification);

      // Assertions
      const hasExtractedText = Boolean(data.extractedImageText && data.extractedImageText.length > 5);
      const concernMatches = tc.id === 'TEST_5' 
        ? (data.overallConcern === 'medium' || data.overallConcern === 'high')
        : data.overallConcern === tc.expectedConcern;
      const signalsCountOk = (data.signals?.length || 0) >= tc.expectedSignalsMin;

      if (hasExtractedText && concernMatches && signalsCountOk) {
        console.log(`=> RESULT: PASS [OK]`);
        passed++;
      } else {
        console.log(`=> RESULT: FAILED`);
        console.log(`   Criteria: text extracted=${hasExtractedText}, concern match (${data.overallConcern} vs ${tc.expectedConcern})=${concernMatches}, signals count=${signalsCountOk}`);
        failed++;
      }
    } catch (err) {
      console.error(`[FAIL] Exception during test execution:`, err);
      failed++;
    }
  }

  console.log('\n================================================================');
  console.log(`TEST SUMMARY: ${passed} Passed, ${failed} Failed out of ${TEST_CASES.length} Tests`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
