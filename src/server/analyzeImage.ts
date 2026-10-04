import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { z } from 'zod';
import { analyzeWithRuleEngine, AnalysisSignal } from '../services/ruleEngine.js';
import { searchSebi } from '../services/sebiSearchService.js';

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

// Candidate multimodal Gemini models (2.0-flash and 1.5-flash)
export const CANDIDATE_GEMINI_MODELS = [
  process.env.GEMINI_MODEL,
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-2.5-flash',
].filter(Boolean) as string[];

/**
 * Robust Local OCR Engine using Tesseract.js with bundled traineddata and 6-second timeout guard.
 * Bundled eng.traineddata ensures zero external network dependencies.
 */
export async function extractTextWithTesseract(imageBuffer: Buffer, timeoutMs = 6000): Promise<string> {
  try {
    if (!imageBuffer || imageBuffer.length < 256) {
      return '';
    }

    const rootDir = process.cwd();
    const candidateDirs = [rootDir, path.resolve(rootDir, 'dist'), getDirname()];
    let langPath: string | undefined = undefined;

    for (const dir of candidateDirs) {
      if (fs.existsSync(path.resolve(dir, 'eng.traineddata'))) {
        langPath = dir;
        break;
      }
    }

    const langOptions: Record<string, unknown> = langPath ? { langPath } : {};

    const { default: Tesseract } = await import('tesseract.js');

    return await Promise.race([
      (async () => {
        try {
          const result = await Tesseract.recognize(imageBuffer, 'eng', langOptions);
          return result?.data?.text?.trim() || '';
        } catch (err) {
          console.warn('[IMAGE_ANALYSIS] Tesseract OCR extraction warning:', err instanceof Error ? err.message : err);
          return '';
        }
      })(),
      new Promise<string>((resolve) =>
        setTimeout(() => {
          console.warn(`[IMAGE_ANALYSIS] Tesseract OCR timed out after ${timeoutMs}ms. Continuing pipeline.`);
          resolve('');
        }, timeoutMs)
      ),
    ]);
  } catch (err) {
    console.warn('[IMAGE_ANALYSIS] Tesseract OCR error:', err instanceof Error ? err.message : err);
    return '';
  }
}

// Zod Schema for Strict JSON Output from LLM
export const LlmSignalSchema = z.object({
  id: z.string(),
  severity: z.enum(['low', 'medium', 'high']),
  quote: z.string(),
  explanation: z.string(),
});

export const LlmAnalysisSchema = z.object({
  extractedClaims: z.array(z.string()).default([]),
  promisedReturns: z.array(z.string()).default([]),
  urgencyCues: z.array(z.string()).default([]),
  claimedRegistrationNumber: z.string().nullable().default(null),
  signals: z.array(LlmSignalSchema).default([]),
  couldNotVerify: z.array(z.string()).default([]),
});

export interface AnalyzeRequestPayload {
  text?: string;
  imageBase64?: string;
  imageMimeType?: string;
  language?: string;
}

export interface AnalyzeResponseData {
  isBasicMode: boolean;
  modeLabel: string;
  targetText: string;
  extractedImageText: string;
  overallConcern: 'low' | 'medium' | 'high';
  concernReason: string;
  signals: AnalysisSignal[];
  extractedClaims: string[];
  promisedReturns: string[];
  urgencyCues: string[];
  claimedRegistrationNumber: string | null;
  couldNotVerify: string[];
  sebiVerification: {
    searched: boolean;
    debarredFound: boolean;
    debarredDetails?: string;
    registeredFound: boolean;
    matchedEntityName?: string;
    category?: string;
  };
}

/**
 * Shared Core Image & Claim Analysis Pipeline.
 * Executed identically by Express server (Render/Localhost) and Serverless Functions (Vercel).
 */
export async function executeImageAnalysis(
  payload: AnalyzeRequestPayload,
  explicitApiKey?: string
): Promise<AnalyzeResponseData> {
  const reqStart = Date.now();
  console.log('[IMAGE_ANALYSIS] Starting analysis execution');

  const { text, imageBase64, imageMimeType, language = 'en' } = payload || {};

  let targetText = typeof text === 'string' ? text.trim() : '';
  const selectedLang: 'en' | 'hi' | 'mr' | 'gu' =
    language === 'hi' ? 'hi' : language === 'mr' ? 'mr' : language === 'gu' ? 'gu' : 'en';

  let cleanBase64 = '';
  let imageBuffer: Buffer | null = null;
  let normalizedMime = 'image/jpeg';
  const hasImage = Boolean(imageBase64 && typeof imageBase64 === 'string' && imageBase64.length > 50);

  console.log(`[IMAGE_ANALYSIS] Image exists: ${hasImage}`);

  if (hasImage) {
    const rawMime = (imageMimeType || 'image/jpeg').trim().toLowerCase();
    if (rawMime.includes('png')) {
      normalizedMime = 'image/png';
    } else if (rawMime.includes('webp')) {
      normalizedMime = 'image/webp';
    } else {
      normalizedMime = 'image/jpeg';
    }

    cleanBase64 = (imageBase64 as string).replace(/^data:[^;]+;base64,/, '').replace(/\s+/g, '');
    imageBuffer = Buffer.from(cleanBase64, 'base64');

    console.log(`[IMAGE_ANALYSIS] Image MIME type: ${normalizedMime}`);
    console.log(`[IMAGE_ANALYSIS] Image base64 length: ${cleanBase64.length} chars (decoded: ${imageBuffer.length} bytes)`);
  }

  const apiKey = explicitApiKey || process.env.GEMINI_API_KEY;
  const hasGeminiKey = Boolean(apiKey && apiKey.trim().length > 0);
  console.log('[IMAGE_ANALYSIS] request received at /api/analyze');
  console.log(`[IMAGE_ANALYSIS] GEMINI_API_KEY configured: ${hasGeminiKey}`);

  if (!targetText && !hasImage) {
    const err = new Error('Please provide either a message text or upload an image screenshot.');
    (err as any).status = 400;
    throw err;
  }

  const isProduction =
    process.env.NODE_ENV === 'production' ||
    Boolean(process.env.VERCEL) ||
    Boolean(process.env.RENDER);

  if (!hasGeminiKey) {
    console.error(
      '[IMAGE_ANALYSIS] CRITICAL CONFIGURATION ERROR: GEMINI_API_KEY is missing in production environment. Gemini AI analysis cannot proceed without a valid GEMINI_API_KEY.'
    );
    if (isProduction && process.env.ALLOW_OFFLINE_FALLBACK !== 'true') {
      const err = new Error(
        'GEMINI_API_KEY is not configured in the production environment. Please configure GEMINI_API_KEY in your hosting Environment Variables (e.g. Vercel Project Settings > Environment Variables).'
      );
      (err as any).status = 500;
      throw err;
    } else {
      console.warn('[IMAGE_ANALYSIS] Falling back to offline OCR & Rule Engine (ALLOW_OFFLINE_FALLBACK is enabled or development mode).');
    }
  }

  let extractedImageText = '';
  let liveLlmResult: z.infer<typeof LlmAnalysisSchema> | null = null;
  let successfulModel = '';

  const langLabel =
    selectedLang === 'hi'
      ? 'Hindi (हिंदी)'
      : selectedLang === 'mr'
      ? 'Marathi (मराठी)'
      : selectedLang === 'gu'
      ? 'Gujarati (ગુજરાતી)'
      : 'English';

  // Step 1: Multimodal Gemini Vision AI (if GEMINI_API_KEY is configured)
  // Runs directly on image base64 without blocking on local OCR overhead
  if (hasGeminiKey) {
    console.log('[IMAGE_ANALYSIS] Initializing Gemini Multimodal Vision AI...');
    const ai = new GoogleGenAI({
      apiKey: apiKey!,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const systemPrompt = `You are "SANGYAN", an objective, calm pause-and-verify assistant for first-time Indian retail investors in Tier-2/3 cities.

CRITICAL HARD GUARDRAILS (Strictly Mandatory):
1. NEVER produce stock tips, buy/sell/hold ratings, price predictions, or recommend any specific financial instrument, broker, or platform.
2. Judge ONLY the MESSAGE, CLAIMS, TACTICS, or VISUAL ARTIFACTS in the content, never whether an instrument or company is inherently good or bad.
3. NEVER output a binary "scam" or "safe" verdict. Provide graded concern (low, medium, high) and always highlight unverified claims.
4. Output in ${langLabel}. Keep explanations plain, simple, and jargon-free for a senior citizen or first-time investor.
5. Extract EXACT verbatim quotes from the content for every signal.`;

    const userPromptText = targetText
      ? `Analyze this user-submitted financial screenshot and text for deceptive tactics, SEBI regulation compliance, guaranteed returns, artificial urgency, private group invites, or unauthorized software/payment requests.

Examine both textual claims and visual signals (such as fake SEBI seals, badges, charts, contact handles, UPI IDs, trading UI).

Content:
"""
${targetText}
"""

Return a JSON object conforming strictly to the requested schema.`
      : `Analyze this user-submitted financial screenshot for deceptive tactics, SEBI regulation compliance, guaranteed returns, artificial urgency, private group invites, or unauthorized software/payment requests.

Read all text visible in the screenshot, inspect visual elements (such as fake SEBI seals, badges, charts, contact handles, UPI IDs, trading UI), and cross-check the claims.

Return a JSON object conforming strictly to the requested schema.`;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const contentParts: any[] = [];
    if (hasImage && cleanBase64) {
      contentParts.push({
        inlineData: {
          mimeType: normalizedMime,
          data: cleanBase64,
        },
      });
    }
    contentParts.push({
      text: userPromptText,
    });

    let lastGeminiError: unknown = null;
    console.log('[IMAGE_ANALYSIS] Gemini request started');

    for (const modelCandidate of CANDIDATE_GEMINI_MODELS) {
      try {
        console.log(`[IMAGE_ANALYSIS] Attempting model: ${modelCandidate}`);
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
                  nullable: true,
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

        const rawText =
          response.text?.trim() ||
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (response as any).candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
          '{}';
        const cleanJson = rawText.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
        const parsedJson = JSON.parse(cleanJson);
        liveLlmResult = LlmAnalysisSchema.parse(parsedJson);
        successfulModel = modelCandidate;
        console.log(`[IMAGE_ANALYSIS] Gemini response received from model: ${modelCandidate}`);
        break;
      } catch (geminiErr) {
        lastGeminiError = geminiErr;
        const errDetail = geminiErr instanceof Error ? geminiErr.message : String(geminiErr);
        console.warn(`[IMAGE_ANALYSIS] Gemini Model ${modelCandidate} failed: ${errDetail}`);
      }
    }

    if (hasGeminiKey && !liveLlmResult) {
      const lastErrDetail =
        lastGeminiError instanceof Error ? lastGeminiError.message : String(lastGeminiError || 'All models failed');
      console.error(
        `[IMAGE_ANALYSIS] CRITICAL ERROR: Gemini AI analysis failed across all candidate models (${CANDIDATE_GEMINI_MODELS.join(', ')}): ${lastErrDetail}`
      );
      if (isProduction && process.env.ALLOW_OFFLINE_FALLBACK !== 'true') {
        const err = new Error(`Gemini AI analysis failed: ${lastErrDetail}`);
        (err as any).status = 500;
        throw err;
      } else {
        console.warn('[IMAGE_ANALYSIS] Falling back to offline OCR & Rule Engine after Gemini failure.');
      }
    }
  }

  // Step 2: Offline OCR Fallback (if Gemini was not available or failed)
  if (!liveLlmResult && hasImage && imageBuffer) {
    console.log('[IMAGE_ANALYSIS] Running offline Tesseract OCR fallback...');
    extractedImageText = await extractTextWithTesseract(imageBuffer);
    console.log(`[IMAGE_ANALYSIS] Local OCR extracted ${extractedImageText.length} characters of text.`);
    if (extractedImageText) {
      targetText = targetText
        ? `${targetText}\n\n[From Screenshot]:\n${extractedImageText}`
        : extractedImageText;
    }
  }

  // If an image was uploaded, but has no legible text, and no Gemini API response
  if (!targetText && hasImage && !liveLlmResult) {
    console.log(`[IMAGE_ANALYSIS] HTTP Response: 200 OK (Basic Mode - No text detected in ${Date.now() - reqStart}ms)`);
    return {
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
    };
  }

  // Step 3: Run deterministic rule engine
  // Build combined text for rule check (either companion text + OCR or text extracted by LLM)
  const textForRuleEngine = targetText || (liveLlmResult?.extractedClaims || []).join(' ');
  const ruleResult = analyzeWithRuleEngine(textForRuleEngine, selectedLang);

  // Cross-check against SEBI database for debarred entities and claimed registration numbers
  const checkQuery = targetText || (liveLlmResult?.extractedClaims || []).join(' ');
  const sebiDebarredCheck = searchSebi({ query: checkQuery });
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

  // Check either rule-detected reg number or LLM-detected reg number
  const regNumberToCheck = ruleResult.claimedRegistrationNumber || liveLlmResult?.claimedRegistrationNumber;
  if (regNumberToCheck) {
    const regCheck = searchSebi({ query: regNumberToCheck, limit: 5 });
    if (regCheck.entities.length > 0) {
      registeredFound = true;
      const matched = regCheck.entities[0];
      matchedEntityName = matched.name;
      matchedCategory = matched.category;
      ruleResult.signals.push({
        id: 'SEBI_REG_MATCH_CHECK',
        category: 'sebi_format',
        severity: 'medium',
        quote: regNumberToCheck,
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
        quote: regNumberToCheck,
        explanation:
          selectedLang === 'hi'
            ? `सेबी डेटाबेस अलर्ट: दावा किया गया रजिस्ट्रेशन नंबर "${regNumberToCheck}" सेबी के आधिकारिक 12,000+ इंटरमीडियरी डेटाबेस में नहीं मिला। यह फर्जी नंबर होने की प्रबल संभावना है!`
            : `SEBI Registry Alert: The claimed registration number "${regNumberToCheck}" was NOT found in SEBI's official database of 12,000+ registered entities. High probability of a fabricated registration number!`,
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

  // If Gemini was not used or failed, return the rule engine & OCR result
  if (!liveLlmResult) {
    console.log(`[IMAGE_ANALYSIS] Completed Basic Mode analysis in ${Date.now() - reqStart}ms`);
    return {
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
    };
  }

  // Merge and de-duplicate signals from LLM and Rule Engine
  const mergedSignals: AnalysisSignal[] = [];
  const seenQuotes = new Set<string>();

  for (const sig of ruleResult.signals) {
    const normalizedQuote = sig.quote.toLowerCase().trim();
    if (!seenQuotes.has(normalizedQuote)) {
      seenQuotes.add(normalizedQuote);
      mergedSignals.push(sig);
    }
  }

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

  const mergedCouldNotVerify = Array.from(
    new Set([...ruleResult.couldNotVerify, ...(liveLlmResult.couldNotVerify || [])])
  );

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

  console.log(`[IMAGE_ANALYSIS] Completed Live Vision AI analysis in ${Date.now() - reqStart}ms`);
  return {
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
      regNumberToCheck || ruleResult.claimedRegistrationNumber || liveLlmResult.claimedRegistrationNumber,
    couldNotVerify: mergedCouldNotVerify,
    sebiVerification: sebiVerificationPayload,
  };
}
