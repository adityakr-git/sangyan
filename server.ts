import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { z } from 'zod';
import Tesseract from 'tesseract.js';
import { analyzeWithRuleEngine, AnalysisSignal } from './src/services/ruleEngine';
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
const PORT = 3000;

// Enable JSON body parser with 10MB limit for image uploads
app.use(express.json({ limit: '10mb' }));

// Shared Gemini AI Client (Telemetry User-Agent: aistudio-build)
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Process error guards to prevent unhandled worker errors from crashing the server
process.on('unhandledRejection', (reason, promise) => {
  console.warn('[Server Guard] Unhandled Rejection at:', promise, 'reason:', reason);
});
process.on('uncaughtException', (err) => {
  console.warn('[Server Guard] Uncaught Exception:', err.message);
});

// Valid Gemini models fallback sequence
const CANDIDATE_GEMINI_MODELS = [
  process.env.GEMINI_MODEL,
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
].filter(Boolean) as string[];

/**
 * Robust Local OCR Engine using Tesseract.js
 * Runs 100% locally and offline without external API dependencies.
 */
async function extractTextWithTesseract(imageBuffer: Buffer): Promise<string> {
  try {
    // Sanity check: Real screenshot files are at least several hundred bytes
    if (!imageBuffer || imageBuffer.length < 256) {
      return '';
    }
    const result = await Tesseract.recognize(imageBuffer, 'eng');
    return result?.data?.text?.trim() || '';
  } catch (err) {
    console.warn('[Tesseract OCR extraction warning]:', err instanceof Error ? err.message : err);
    return '';
  }
}

// Zod Schema for Strict JSON Output from LLM
const LlmSignalSchema = z.object({
  id: z.string(),
  severity: z.enum(['low', 'medium', 'high']),
  quote: z.string(),
  explanation: z.string(),
});

const LlmAnalysisSchema = z.object({
  extractedClaims: z.array(z.string()).default([]),
  promisedReturns: z.array(z.string()).default([]),
  urgencyCues: z.array(z.string()).default([]),
  claimedRegistrationNumber: z.string().nullable().default(null),
  signals: z.array(LlmSignalSchema).default([]),
  couldNotVerify: z.array(z.string()).default([]),
});

/**
 * HARD GUARDRAIL 4: Privacy enforcement
 * No messages or user inputs are logged or persisted to disk or database.
 */
app.post('/api/analyze', async (req, res) => {
  try {
    const { text, imageBase64, imageMimeType, language = 'en' } = req.body;

    let targetText = typeof text === 'string' ? text.trim() : '';
    const selectedLang: 'en' | 'hi' | 'mr' | 'gu' =
      language === 'hi' ? 'hi' : language === 'mr' ? 'mr' : language === 'gu' ? 'gu' : 'en';

    let extractedImageText = '';
    let cleanBase64 = '';
    let imageBuffer: Buffer | null = null;

    // Step 1: Decode and inspect real image if provided
    if (imageBase64 && typeof imageBase64 === 'string') {
      try {
        cleanBase64 = imageBase64.replace(/^data:[^;]+;base64,/, '').trim();
        if (cleanBase64) {
          imageBuffer = Buffer.from(cleanBase64, 'base64');
          console.log(`[Image Analysis] Received image: ${imageBuffer.length} bytes, MIME: ${imageMimeType || 'image/jpeg'}`);
          
          // Execute local Tesseract OCR to extract verbatim text from the screenshot
          extractedImageText = await extractTextWithTesseract(imageBuffer);
          console.log(`[Image OCR] Extracted ${extractedImageText.length} characters of text from screenshot.`);
        }
      } catch (imgErr) {
        console.error('[Image Processing Error]:', imgErr);
      }
    }

    // Merge extracted OCR text with any companion text
    if (extractedImageText) {
      targetText = targetText
        ? `${targetText}\n\n[From Screenshot]:\n${extractedImageText}`
        : extractedImageText;
    }

    // If neither text nor image was provided
    if (!targetText && !imageBuffer) {
      return res.status(400).json({
        error: 'Please provide either a message text or upload an image screenshot.',
      });
    }

    // If an image was uploaded but contains no legible text and no companion note was provided
    if (!targetText && imageBuffer) {
      return res.json({
        isBasicMode: true,
        modeLabel: 'Basic Mode (Offline Image Inspection)',
        targetText: '',
        extractedImageText: '',
        overallConcern: 'low',
        concernReason:
          selectedLang === 'hi'
            ? 'अपलोड किए गए स्क्रीनशॉट में कोई पठनीय वित्तीय टेक्स्ट या दावा नहीं मिला। कृपया स्पष्ट स्क्रीनशॉट अपलोड करें।'
            : 'No legible financial text, stock recommendations, or investment claims could be extracted from this image. Please ensure the screenshot is clear and readable.',
        signals: [],
        extractedClaims: [],
        promisedReturns: [],
        urgencyCues: [],
        claimedRegistrationNumber: null,
        couldNotVerify: [
          selectedLang === 'hi'
            ? 'स्क्रीनशॉट से टेक्स्ट नहीं पढ़ा जा सका। कृपया स्पष्ट छवि अपलोड करें।'
            : 'Could not detect legible text or financial claims in the uploaded screenshot. Please upload a clear image of the chat, ad, or post.',
        ],
        sebiVerification: {
          searched: false,
          debarredFound: false,
          registeredFound: false,
        },
      });
    }

    // Step 2: Run deterministic rule engine
    const ruleResult = analyzeWithRuleEngine(targetText, selectedLang);

    // Step 2b: Cross-check against SEBI database for debarred entities and claimed registration numbers
    const sebiDebarredCheck = searchSebi({ query: targetText });
    let debarredFound = false;
    let debarredDetails: string | undefined = undefined;

    if (sebiDebarredCheck.debarredMatches.length > 0) {
      debarredFound = true;
      debarredDetails = sebiDebarredCheck.debarredMatches[0].name;
      for (const deb of sebiDebarredCheck.debarredMatches) {
        const alreadyFlagged = ruleResult.signals.some((s) => s.id === `SEBI_DEBARRED_${deb.id}`);
        if (!alreadyFlagged) {
          ruleResult.signals.unshift({
            id: `SEBI_DEBARRED_${deb.id}`,
            category: 'sebi_format',
            severity: 'high',
            quote: deb.name,
            explanation:
              selectedLang === 'hi'
                ? `सेबी आदेश चेतावनी: "${deb.name}" को सेबी द्वारा अनाधिकृत गतिविधियों के लिए प्रतिबंधित (Debarred) किया गया है। (आदेश संदर्भ: ${deb.orderRef})`
                : `CRITICAL SEBI ORDER: "${deb.name}" has been debarred/penalized by SEBI for illegal market activities (Order Ref: ${deb.orderRef}).`,
          });
          ruleResult.overallConcern = 'high';
          ruleResult.concernReason =
            selectedLang === 'hi'
              ? `इस संदेश में सेबी द्वारा प्रतिबंधित व्यक्ति/संस्था (${deb.name}) का उल्लेख मिला है। अत्यधिक सावधानी बरतें!`
              : `This message mentions an entity or individual (${deb.name}) formally debarred by SEBI. Extreme risk!`;
        }
      }
    }

    let registeredFound = false;
    let matchedEntityName: string | undefined = undefined;
    let matchedCategory: string | undefined = undefined;

    if (ruleResult.claimedRegistrationNumber) {
      const regCheck = searchSebi({ query: ruleResult.claimedRegistrationNumber, limit: 5 });
      if (regCheck.entities.length > 0) {
        registeredFound = true;
        const matched = regCheck.entities[0];
        matchedEntityName = matched.name;
        matchedCategory = matched.category;
        ruleResult.signals.push({
          id: 'SEBI_REG_MATCH_CHECK',
          category: 'sebi_format',
          severity: 'medium',
          quote: ruleResult.claimedRegistrationNumber,
          explanation:
            selectedLang === 'hi'
              ? `सेबी डेटाबेस मिलान: यह नंबर सेबी रिकॉर्ड में "${matched.name}" (${matched.categoryHi}) के नाम पर दर्ज है। पुष्टि करें कि मैसेज भेजने वाले का ईमेल @${matched.registeredEmailDomain || 'आधिकारिक डोमेन'} है और भुगतान व्यक्तिगत UPI पर नहीं मांगा गया।`
              : `SEBI Registry Match: This registration number belongs to "${matched.name}" (${matched.category}). WARNING: Fraudsters frequently impersonate legitimate firms. Ensure sender email ends with @${matched.registeredEmailDomain || 'official domain'} and payment is not to personal UPI.`,
        });
      } else {
        ruleResult.signals.push({
          id: 'SEBI_REG_NOT_FOUND',
          category: 'sebi_format',
          severity: 'high',
          quote: ruleResult.claimedRegistrationNumber,
          explanation:
            selectedLang === 'hi'
              ? `सेबी डेटाबेस अलर्ट: दावा किया गया रजिस्ट्रेशन नंबर "${ruleResult.claimedRegistrationNumber}" सेबी के आधिकारिक 12,000+ इंटरमीडियरी डेटाबेस में नहीं मिला। यह फर्जी नंबर होने की प्रबल संभावना है!`
              : `SEBI Registry Alert: The claimed registration number "${ruleResult.claimedRegistrationNumber}" was NOT found in SEBI's official database of 12,000+ registered entities. High probability of a fabricated registration number!`,
        });
        ruleResult.overallConcern = 'high';
      }
    }

    const sebiVerificationPayload = {
      searched: true,
      debarredFound,
      debarredDetails,
      registeredFound,
      matchedEntityName,
      category: matchedCategory,
    };

    // Step 3: Multimodal LLM Step (if Gemini API key is configured)
    if (!ai) {
      // Basic Mode Fallback: No API key configured
      return res.json({
        isBasicMode: true,
        modeLabel: 'Basic Mode (Offline OCR & Rule-Engine)',
        targetText,
        extractedImageText,
        overallConcern: ruleResult.overallConcern,
        concernReason: ruleResult.concernReason,
        signals: ruleResult.signals,
        extractedClaims: ruleResult.extractedClaims,
        promisedReturns: ruleResult.promisedReturns,
        urgencyCues: ruleResult.urgencyCues,
        claimedRegistrationNumber: ruleResult.claimedRegistrationNumber,
        couldNotVerify: ruleResult.couldNotVerify,
        sebiVerification: sebiVerificationPayload,
      });
    }

    const langLabel =
      selectedLang === 'hi'
        ? 'Hindi (हिंदी)'
        : selectedLang === 'mr'
        ? 'Marathi (मराठी)'
        : selectedLang === 'gu'
        ? 'Gujarati (ગુજરાતી)'
        : 'English';

    // Call Gemini with strict system instructions and structured JSON response
    const systemPrompt = `You are "SANGYAN", an objective, calm pause-and-verify assistant for first-time Indian retail investors in Tier-2/3 cities.

CRITICAL HARD GUARDRAILS (Strictly Mandatory):
1. NEVER produce stock tips, buy/sell/hold ratings, price predictions, or recommend any specific financial instrument, broker, or platform.
2. Judge ONLY the MESSAGE, CLAIMS, TACTICS, or VISUAL ARTIFACTS in the content, never whether an instrument or company is inherently good or bad.
3. NEVER output a binary "scam" or "safe" verdict. Provide graded concern (low, medium, high) and always highlight unverified claims.
4. Output in ${langLabel}. Keep explanations plain, simple, and jargon-free for a senior citizen or first-time investor.
5. Extract EXACT verbatim quotes from the content for every signal.`;

    const userPromptText = `Analyze this user-submitted financial screenshot and text for deceptive tactics, SEBI regulation compliance, guaranteed returns, artificial urgency, private group invites, or unauthorized software/payment requests.

Examine both textual claims and visual signals (such as fake SEBI seals, badges, charts, contact handles, UPI IDs, trading UI).

Content:
"""
${targetText}
"""

Return a JSON object conforming strictly to the requested schema.`;

    // Construct multimodal content parts if image is present
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const contentParts: any[] = [];
    if (cleanBase64) {
      contentParts.push({
        inlineData: {
          mimeType: imageMimeType || 'image/jpeg',
          data: cleanBase64,
        },
      });
    }
    contentParts.push({
      text: userPromptText,
    });

    let liveLlmResult: z.infer<typeof LlmAnalysisSchema> | null = null;
    let successfulModel = '';

    // Attempt Gemini call across candidate models
    for (const modelCandidate of CANDIDATE_GEMINI_MODELS) {
      try {
        const response = await ai.models.generateContent({
          model: modelCandidate,
          contents: contentParts,
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                extractedClaims: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Key promises or claims extracted from the image or text.',
                },
                promisedReturns: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Specific return promises or percentages claimed.',
                },
                urgencyCues: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Artificial urgency phrases or countdown language.',
                },
                claimedRegistrationNumber: {
                  type: Type.STRING,
                  description: 'Claimed SEBI registration number if mentioned, or null.',
                },
                signals: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      severity: {
                        type: Type.STRING,
                        description: 'Severity level: low, medium, or high',
                      },
                      quote: {
                        type: Type.STRING,
                        description: 'Exact verbatim quote from the message or image text',
                      },
                      explanation: {
                        type: Type.STRING,
                        description: 'One plain-language sentence explaining why this is a warning signal under SEBI guidelines.',
                      },
                    },
                    required: ['id', 'severity', 'quote', 'explanation'],
                  },
                },
                couldNotVerify: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Things that cannot be verified from a message alone (e.g. sender identity, past profits, SEBI directory check).',
                },
              },
              required: ['signals', 'couldNotVerify'],
            },
          },
        });

        const responseText = response.text?.trim() || '{}';
        const parsedJson = JSON.parse(responseText);
        liveLlmResult = LlmAnalysisSchema.parse(parsedJson);
        successfulModel = modelCandidate;
        break; // Successfully generated content
      } catch (err) {
        console.warn(`[Gemini Model ${modelCandidate} failed]:`, err);
      }
    }

    if (!liveLlmResult) {
      // Fallback gracefully to Rule Engine + OCR output
      return res.json({
        isBasicMode: true,
        modeLabel: 'Basic Mode (Offline OCR & Rule-Engine Active)',
        targetText,
        extractedImageText,
        overallConcern: ruleResult.overallConcern,
        concernReason: ruleResult.concernReason,
        signals: ruleResult.signals,
        extractedClaims: ruleResult.extractedClaims,
        promisedReturns: ruleResult.promisedReturns,
        urgencyCues: ruleResult.urgencyCues,
        claimedRegistrationNumber: ruleResult.claimedRegistrationNumber,
        couldNotVerify: ruleResult.couldNotVerify,
        sebiVerification: sebiVerificationPayload,
      });
    }

    // Step 4: Merge and de-duplicate signals from LLM and Rule Engine
    const mergedSignals: AnalysisSignal[] = [];
    const seenQuotes = new Set<string>();

    // Rule engine signals are authoritative on SEBI formats and key words
    for (const sig of ruleResult.signals) {
      const normalizedQuote = sig.quote.toLowerCase().trim();
      if (!seenQuotes.has(normalizedQuote)) {
        seenQuotes.add(normalizedQuote);
        mergedSignals.push(sig);
      }
    }

    // Add LLM signals if distinct
    for (const sig of liveLlmResult.signals) {
      const normalizedQuote = sig.quote.toLowerCase().trim();
      const isDuplicate = Array.from(seenQuotes).some(
        (q) => q.includes(normalizedQuote) || normalizedQuote.includes(q)
      );

      if (!isDuplicate) {
        seenQuotes.add(normalizedQuote);
        mergedSignals.push({
          id: sig.id || `LLM_${mergedSignals.length + 1}`,
          category: 'unsolicited_tip',
          severity: sig.severity,
          quote: sig.quote,
          explanation: sig.explanation,
        });
      }
    }

    // Merge "Could Not Verify" items
    const mergedCouldNotVerify = Array.from(
      new Set([...ruleResult.couldNotVerify, ...(liveLlmResult.couldNotVerify || [])])
    );

    // Compute combined concern level
    const hasHigh = mergedSignals.some((s) => s.severity === 'high');
    const hasMedium = mergedSignals.some((s) => s.severity === 'medium');

    let overallConcern: 'low' | 'medium' | 'high' = 'low';
    let concernReason = ruleResult.concernReason;

    if (hasHigh) {
      overallConcern = 'high';
      concernReason =
        selectedLang === 'hi'
          ? 'इस संदेश या स्क्रीनशॉट में सेबी नियमों के गंभीर उल्लंघन या धोखाधड़ी के उच्च-जोखिम वाले संकेत मिले हैं।'
          : 'This screenshot/message exhibits high-concern indicators that violate SEBI investor protection regulations.';
    } else if (hasMedium) {
      overallConcern = 'medium';
      concernReason =
        selectedLang === 'hi'
          ? 'इस संदेश या स्क्रीनशॉट में जल्दबाजी, असत्यापित चैट ग्रुप या संदेहास्पद दावे मिले हैं। सावधानी जरूरी है।'
          : 'This screenshot/message displays moderate concern cues such as urgency, private groups, or unverified claims.';
    }

    return res.json({
      isBasicMode: false,
      modeLabel: `Live Vision AI Analysis (${successfulModel})`,
      targetText,
      extractedImageText,
      overallConcern,
      concernReason,
      signals: mergedSignals,
      extractedClaims: Array.from(
        new Set([...ruleResult.extractedClaims, ...(liveLlmResult.extractedClaims || [])])
      ),
      promisedReturns: Array.from(
        new Set([...ruleResult.promisedReturns, ...(liveLlmResult.promisedReturns || [])])
      ),
      urgencyCues: Array.from(
        new Set([...ruleResult.urgencyCues, ...(liveLlmResult.urgencyCues || [])])
      ),
      claimedRegistrationNumber:
        ruleResult.claimedRegistrationNumber || liveLlmResult.claimedRegistrationNumber,
      couldNotVerify: mergedCouldNotVerify,
      sebiVerification: sebiVerificationPayload,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('Server error handling /api/analyze:', errorMsg);
    res.status(500).json({ error: 'Failed to complete analysis. Please try again.' });
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
  if (process.env.NODE_ENV !== 'production') {
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
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Sangyan server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
