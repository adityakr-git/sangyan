/**
 * Client-Side Privacy Masking Utility
 * Hard Guardrail 4: Mask phone numbers, UPI IDs, emails, and 12-digit ID numbers (Aadhaar)
 * in the browser BEFORE any payload is transmitted to the network or API.
 */

export interface MaskingResult {
  originalText: string;
  maskedText: string;
  maskedCount: {
    emails: number;
    upi: number;
    ids: number;
    phones: number;
    total: number;
  };
  hasMaskedData: boolean;
}

// 1. Email pattern
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;

// 2. Common Indian UPI handles and general VPA pattern
const UPI_REGEX = /\b[a-zA-Z0-9._-]{2,}@(okhdfcbank|okhdfc|oksbi|okaxis|okicici|paytm|ybl|upi|apl|axl|ibl|sbi|hdfcbank|icici|federal|indus|kotak|barodampay|rbl|allbank|cnrb|airtel|postbank|jupiteraxis)\b|\b[a-zA-Z0-9._-]{3,}@upi\b/gi;

// 3. 12-Digit national ID (e.g. Aadhaar format: 1234 5678 9012 or 1234-5678-9012 or 123456789012)
const TWELVE_DIGIT_ID_REGEX = /\b(?:\d{4}[ -]\d{4}[ -]\d{4}|\d{12})\b/g;

// 4. Indian 10-digit mobile phone numbers with optional +91, 91, or 0 prefixes and separators
const PHONE_REGEX = /(?:\+?91[\s.-]?|0)?[6-9]\d{4}[\s.-]?\d{5}\b/g;

export function maskSensitiveData(input: string): MaskingResult {
  if (!input || typeof input !== 'string') {
    return {
      originalText: input || '',
      maskedText: input || '',
      maskedCount: { emails: 0, upi: 0, ids: 0, phones: 0, total: 0 },
      hasMaskedData: false,
    };
  }

  let text = input;
  let emailCount = 0;
  let upiCount = 0;
  let idCount = 0;
  let phoneCount = 0;

  // Step 1: Redact Emails first (so @domain.com is not misidentified as UPI handle)
  text = text.replace(EMAIL_REGEX, () => {
    emailCount++;
    return '[EMAIL REDACTED]';
  });

  // Step 2: Redact UPI IDs
  text = text.replace(UPI_REGEX, () => {
    upiCount++;
    return '[UPI REDACTED]';
  });

  // Step 3: Redact 12-digit IDs (Aadhaar / National ID)
  text = text.replace(TWELVE_DIGIT_ID_REGEX, () => {
    idCount++;
    return '[ID NUMBER REDACTED]';
  });

  // Step 4: Redact Phone Numbers
  text = text.replace(PHONE_REGEX, () => {
    phoneCount++;
    return '[PHONE REDACTED]';
  });

  const total = emailCount + upiCount + idCount + phoneCount;

  return {
    originalText: input,
    maskedText: text,
    maskedCount: {
      emails: emailCount,
      upi: upiCount,
      ids: idCount,
      phones: phoneCount,
      total,
    },
    hasMaskedData: total > 0,
  };
}
