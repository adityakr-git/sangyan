/**
 * Deterministic Rule Engine for Investment Message Inspection
 * Evaluates messages against SEBI guidelines and common financial manipulation patterns.
 */

export type Severity = 'low' | 'medium' | 'high';

export type SignalCategory =
  | 'guaranteed_return'
  | 'urgency'
  | 'insider_operator'
  | 'chat_group'
  | 'apk_remote_access'
  | 'personal_payment'
  | 'sebi_format'
  | 'unsolicited_tip';

export interface AnalysisSignal {
  id: string;
  category: SignalCategory;
  severity: Severity;
  quote: string;
  explanation: string;
  isWeakSignal?: boolean;
}

export interface RuleEngineResult {
  signals: AnalysisSignal[];
  extractedClaims: string[];
  promisedReturns: string[];
  urgencyCues: string[];
  claimedRegistrationNumber: string | null;
  couldNotVerify: string[];
  overallConcern: 'low' | 'medium' | 'high';
  concernReason: string;
}

interface RuleDefinition {
  idPrefix: string;
  category: SignalCategory;
  severity: Severity;
  pattern: RegExp;
  explanationEn: string;
  explanationHi: string;
  isWeakSignal?: boolean;
}

const RULES: RuleDefinition[] = [
  // 1. Guaranteed / Assured Returns
  {
    idPrefix: 'RULE_GUARANTEED_RETURN',
    category: 'guaranteed_return',
    severity: 'high',
    pattern: /\b(?:guaranteed(?:\s+(?:returns?|profit|gain|income|monthly|daily))?|sure\s*shot|100%\s*(?:profit|accurate|sure|gain|return)|paisa\s*double|double\s*your\s*money|zero\s*risk|risk\s*free|no\s*loss|assured\s+(?:returns?|profit)|fixed\s+(?:profit|returns?)|गारंटीड|पक्का\s*मुनाफा|100%\s*प्रॉफिट|पैसा\s*डबल|बिना\s*रिस्क|नुकसान\s*नहीं|निश्चित\s*लाभ)\b/i,
    explanationEn: 'Under SEBI regulations, promising guaranteed or zero-risk returns in equity or derivatives markets is illegal and a hallmark of fraudulent schemes.',
    explanationHi: 'सेबी (SEBI) नियमों के अनुसार शेयर बाजार में किसी भी तरह का गारंटीड या बिना रिस्क का रिटर्न वादा करना गैरकानूनी है।',
  },
  // Specific percentage return promises (e.g. 30% monthly, 50% profit, 300% profit)
  {
    idPrefix: 'RULE_PERCENT_PROMISE',
    category: 'guaranteed_return',
    severity: 'high',
    pattern: /\b(?:\d{2,3}%\s*(?:monthly|daily|weekly|guaranteed|assured|profit|gain|target))\b/i,
    explanationEn: 'Promising specific high percentage returns (e.g. 30% or 100%) violates SEBI advertising codes and indicates an unrealistic get-rich-quick trap.',
    explanationHi: 'निश्चित प्रतिशत रिटर्न (जैसे 30% महीना या 100% मुनाफा) का दावा करना भ्रामक और खतरनाक जाल है।',
  },

  // 2. Urgency or Countdown Language
  {
    idPrefix: 'RULE_URGENCY',
    category: 'urgency',
    severity: 'medium',
    pattern: /\b(?:hurry|limited\s+(?:slots?|seats?|access|offer)|only\s+\d+\s+(?:seats?|slots?|spots?)\s+left|act\s+now|don't\s+miss\s+out|last\s+chance|before\s+market\s+opens|offer\s+expires|closing\s+(?:soon|today)|urgent|जल्दी\s*करें|केवल\s*\d+\s*सीटें|ऑफर\s*समाप्त|आखिरी\s*मौका|मार्केट\s*खुलने\s*से\s*पहले)\b/i,
    explanationEn: 'Artificial countdowns and urgency pressure are psychological tactics designed to induce FOMO and prevent you from consulting verified advisors.',
    explanationHi: 'सीटें सीमित होने या तुरंत फैसला लेने का दबाव मनोवैज्ञानिक हथकंडा है ताकि आप सोच-समझकर जांच न कर सकें।',
  },

  // 3. Insider, Operator, or Bulk Deal Claims
  {
    idPrefix: 'RULE_INSIDER_OPERATOR',
    category: 'insider_operator',
    severity: 'high',
    pattern: /\b(?:insider\s*(?:news|information|tip|trading|leak|source)|operator\s*(?:call|group|deal|pump|play|buying)|bulk\s*deal\s*(?:leak|alert|info)|whales?\s+buying|jackpot\s+call|secret\s+breakout|इनसाइडर\s*खबर|ऑपरेटर\s*कॉल|सीक्रेट\s*टिप|जैकपॉट\s*कॉल)\b/i,
    explanationEn: 'Trading on insider leaks or operator deals is strictly illegal. Scammers use these buzzwords to orchestrate pump-and-dump schemes on illiquid penny stocks.',
    explanationHi: 'इनसाइडर खबर या ऑपरेटर टिप का दावा अवैध है। यह अक्सर पेनी स्टॉक्स में आम लोगों को फंसाने के लिए किया जाता है।',
  },

  // 4. WhatsApp / Telegram Group Invites
  {
    idPrefix: 'RULE_CHAT_GROUP',
    category: 'chat_group',
    severity: 'medium',
    pattern: /(?:t\.me\/[a-zA-Z0-9_]+|telegram\.me\/[a-zA-Z0-9_]+|chat\.whatsapp\.com\/[a-zA-Z0-9_]+|join\s+(?:our\s+)?(?:vip|premium|exclusive|secret)?\s*(?:whatsapp|telegram)\s*(?:group|channel)|व्हाट्सएप\s*ग्रुप|टेलीग्राम\s*चैनल|वीआईपी\s*ग्रुप)/i,
    explanationEn: 'Unsolicited invitations to private WhatsApp or Telegram groups are unregulated channels where administrators evade SEBI compliance and investor grievance tracking.',
    explanationHi: 'व्हाट्सएप या टेलीग्राम के अज्ञात ग्रुप्स में जुड़ने का न्योता सेबी नियमों से बचने और मनमाने टिप्स बांटने के लिए दिया जाता है।',
  },

  // 5. APK or Remote-Access Software
  {
    idPrefix: 'RULE_APK_REMOTE',
    category: 'apk_remote_access',
    severity: 'high',
    pattern: /\b(?:\.apk\b|download\s+(?:our\s+)?(?:app|apk)|anydesk|teamviewer|quicksupport|rustdesk|install\s+(?:custom|trading)\s+app|ऐप\s*डाउनलोड\s*करें|एनीडेस्क|एपीके)/i,
    explanationEn: 'Requesting you to download an unofficial .apk file or install remote desktop tools (AnyDesk, TeamViewer) is a severe cyber hazard that can compromise your phone and banking credentials.',
    explanationHi: 'अनजान लिंक से एपीके (.apk) डाउनलोड करना या AnyDesk/TeamViewer जैसी स्क्रीन शेयरिंग ऐप इंस्टॉल करना आपके बैंक खाते के लिए बेहद खतरनाक है।',
  },

  // 6. Payment to Personal UPI or Account
  {
    idPrefix: 'RULE_PERSONAL_PAYMENT',
    category: 'personal_payment',
    severity: 'high',
    pattern: /(?:send\s+(?:fee|money|funds?|registration|payment)\s+to\s+upi|pay\s+to\s+(?:gpay|phonepe|paytm)|\[UPI REDACTED\]|transfer\s+to\s+(?:savings|personal|account)|registration\s+fee|membership\s+fee|फीस\s*भेजें|यूपीआई\s*पर\s*पैसे|पैसे\s*ट्रांसफर)/i,
    explanationEn: 'Legitimate SEBI-registered intermediaries accept payments strictly via institutional banking channels. Demanding fees via personal UPI or personal accounts is a serious warning sign.',
    explanationHi: 'सेबी-पंजीकृत संस्थाएं केवल आधिकारिक बैंक खातों में शुल्क लेती हैं, कभी भी निजी यूपीआई (UPI) या व्यक्तिगत बचत खाते में नहीं।',
  },
];

// Helper to check SEBI registration formats
function evaluateSebiClaim(text: string, lang: 'en' | 'hi' | 'mr' | 'gu' = 'en'): {
  signal: AnalysisSignal | null;
  registrationNumber: string | null;
} {
  // Look for mentions of SEBI registration
  const match = text.match(/\b(?:SEBI(?:\s*reg(?:istration)?(?:\s*no\.?)?|\s*no\.?)?[:\s-]*)([A-Za-z0-9/-]{5,20})\b/i);
  if (!match) return { signal: null, registrationNumber: null };

  const fullQuote = match[0];
  const claimedNumber = match[1].trim();

  // Genuine SEBI formats usually start with INH (Research Analyst), INA (Investment Adviser),
  // INZ (Stock Broker), INP (Portfolio Manager), INM (Merchant Banker), etc.
  const isValidFormat = /^IN[A-Z0-9]{8,12}$/i.test(claimedNumber);

  if (!isValidFormat) {
    return {
      registrationNumber: claimedNumber,
      signal: {
        id: 'RULE_SEBI_FORMAT_INVALID',
        category: 'sebi_format',
        severity: 'medium',
        quote: fullQuote,
        explanation:
          lang === 'hi'
            ? 'फॉर्मेट जांच (कमजोर संकेत): सेबी रजिस्ट्रेशन नंबर का प्रारूप गलत प्रतीत होता है (मानक फॉर्मेट INH/INA/INZ से शुरू होता है)। धोखेबाज अक्सर फर्जी नंबर लिख देते हैं।'
            : 'Format check only (weak signal): The claimed registration number does not match standard SEBI format (e.g. INH/INA/INZ followed by numbers). Format check alone does not prove fraud, but warrants verification.',
        isWeakSignal: true,
      },
    };
  }

  // Even if format looks correct, flag as a weak signal reminder that real numbers can be cloned
  return {
    registrationNumber: claimedNumber,
    signal: {
      id: 'RULE_SEBI_FORMAT_VERIFY',
      category: 'sebi_format',
      severity: 'low',
      quote: fullQuote,
      explanation:
        lang === 'hi'
          ? 'फॉर्मेट जांच (कमजोर संकेत): नंबर का फॉर्मेट सही दिख रहा है, लेकिन धोखेबाज अक्सर सेबी की वेबसाइट से असली सलाहकारों का नंबर चुरा लेते हैं। sebi.gov.in पर नाम व ईमेल मिलान जरूर करें।'
          : 'Format check only (weak signal): The registration format matches standard prefix, but fraudsters frequently clone legitimate publicly listed SEBI numbers. Always match the name and bank account on sebi.gov.in.',
      isWeakSignal: true,
    },
  };
}

export function analyzeWithRuleEngine(text: string, lang: 'en' | 'hi' | 'mr' | 'gu' = 'en'): RuleEngineResult {
  const signals: AnalysisSignal[] = [];
  const extractedClaims: string[] = [];
  const promisedReturns: string[] = [];
  const urgencyCues: string[] = [];

  // 1. Evaluate predefined pattern rules
  for (const rule of RULES) {
    const match = text.match(rule.pattern);
    if (match) {
      const quote = match[0];
      signals.push({
        id: `${rule.idPrefix}_${signals.length + 1}`,
        category: rule.category,
        severity: rule.severity,
        quote,
        explanation: lang === 'hi' ? rule.explanationHi : rule.explanationEn,
        isWeakSignal: rule.isWeakSignal,
      });

      if (rule.category === 'guaranteed_return') {
        promisedReturns.push(quote);
        extractedClaims.push(`Promise of return: "${quote}"`);
      } else if (rule.category === 'urgency') {
        urgencyCues.push(quote);
        extractedClaims.push(`Urgency cue: "${quote}"`);
      } else {
        extractedClaims.push(`Suspicious claim: "${quote}"`);
      }
    }
  }

  // 2. Evaluate SEBI claim format
  const sebiEval = evaluateSebiClaim(text, lang);
  if (sebiEval.signal) {
    signals.push(sebiEval.signal);
    extractedClaims.push(`Claimed registration: "${sebiEval.registrationNumber}"`);
  }

  // 3. Mandatory "What I could not verify" items (Hard Guardrail 5)
  const couldNotVerify = [
    lang === 'hi'
      ? 'मैसेज भेजने वाले की असली पहचान या उसका किसी अधिकृत ब्रोकर से वास्तविक संबंध।'
      : 'The real identity of the message sender or their true affiliation with any broker.',
    lang === 'hi'
      ? 'दावे किए गए पूर्व लाभ (Past Profits) या स्क्रीनशॉट्स की प्रामाणिकता।'
      : 'The authenticity of claimed past profits, member testimonials, or P&L screenshots.',
    lang === 'hi'
      ? 'क्या यह व्यक्ति वास्तव में सेबी के साथ पंजीकृत है (इसके लिए sebi.gov.in पर खोज जरूरी है)।'
      : 'Whether the sender is legally authorized by SEBI (requires cross-checking on sebi.gov.in).',
    lang === 'hi'
      ? 'दिए गए बैंक या यूपीआई खाते के असली खाताधारक का नाम व कानूनी स्थिति।'
      : 'The legal account holder name and status of the bank account or UPI receiving payments.',
  ];

  // 4. Determine overall concern level (Graded concern: never binary "scam" or "safe")
  const hasHigh = signals.some((s) => s.severity === 'high');
  const hasMedium = signals.some((s) => s.severity === 'medium');

  let overallConcern: 'low' | 'medium' | 'high' = 'low';
  let concernReason =
    lang === 'hi'
      ? 'इस टेक्स्ट में सीधे तौर पर कोई हाई-रिस्क संकेत नहीं मिला। हमेशा आधिकारिक स्रोतों से जांच करें।'
      : 'No explicit red-flag keywords were detected in this message. Remember that absence of obvious red flags does not mean endorsement.';

  if (hasHigh) {
    overallConcern = 'high';
    concernReason =
      lang === 'hi'
        ? 'इस संदेश में सेबी नियमों के गंभीर उल्लंघन या धोखाधड़ी के उच्च-जोखिम वाले संकेत पाए गए हैं।'
        : 'This message exhibits high-concern indicators that violate SEBI investor protection regulations.';
  } else if (hasMedium) {
    overallConcern = 'medium';
    concernReason =
      lang === 'hi'
        ? 'इस संदेश में कृत्रिम जल्दबाजी, असत्यापित चैट ग्रुप या संदिग्ध दावे मिले हैं। सावधानी जरूरी है।'
        : 'This message contains moderate concern cues such as urgency, private groups, or unverified claims.';
  }

  return {
    signals,
    extractedClaims,
    promisedReturns,
    urgencyCues,
    claimedRegistrationNumber: sebiEval.registrationNumber,
    couldNotVerify,
    overallConcern,
    concernReason,
  };
}
