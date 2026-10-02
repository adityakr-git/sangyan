import { maskSensitiveData } from './masking';

export interface TestCase {
  name: string;
  input: string;
  expectedPattern: (result: string) => boolean;
  expectedCounts: {
    emails?: number;
    upi?: number;
    ids?: number;
    phones?: number;
  };
}

export const MASKING_TEST_CASES: TestCase[] = [
  {
    name: 'Redacts standard Indian 10-digit phone number with +91',
    input: 'Call me immediately on +91 98765 43210 for tips.',
    expectedPattern: (out) => out.includes('[PHONE REDACTED]') && !out.includes('98765'),
    expectedCounts: { phones: 1 },
  },
  {
    name: 'Redacts phone number with 0 prefix and no spaces',
    input: 'Helpline: 09812345678 available 24/7.',
    expectedPattern: (out) => out.includes('[PHONE REDACTED]') && !out.includes('9812345678'),
    expectedCounts: { phones: 1 },
  },
  {
    name: 'Redacts multiple UPI IDs with various handles',
    input: 'Send Rs 2000 to amit.kumar@okaxis or backup vpa rajesh123@paytm or quick@upi',
    expectedPattern: (out) => (out.match(/\[UPI REDACTED\]/g) || []).length === 3,
    expectedCounts: { upi: 3 },
  },
  {
    name: 'Redacts email addresses without affecting text',
    input: 'Send documents to verification@wealthguard-portal.com right away.',
    expectedPattern: (out) => out.includes('[EMAIL REDACTED]') && !out.includes('wealthguard-portal.com'),
    expectedCounts: { emails: 1 },
  },
  {
    name: 'Redacts 12-digit Aadhaar ID with spaces (4-4-4)',
    input: 'My Aadhaar number is 5432 1098 7654 for verification.',
    expectedPattern: (out) => out.includes('[ID NUMBER REDACTED]') && !out.includes('5432 1098 7654'),
    expectedCounts: { ids: 1 },
  },
  {
    name: 'Redacts 12-digit continuous ID number',
    input: 'National ID: 123456789012 registered.',
    expectedPattern: (out) => out.includes('[ID NUMBER REDACTED]') && !out.includes('123456789012'),
    expectedCounts: { ids: 1 },
  },
  {
    name: 'Preserves non-sensitive investment numbers (percentages, stock counts, amounts)',
    input: 'Target 30% profit in 5 days with 100 shares of XYZ at Rs 500 each.',
    expectedPattern: (out) =>
      out.includes('30%') &&
      out.includes('5 days') &&
      out.includes('100 shares') &&
      out.includes('Rs 500') &&
      !out.includes('[PHONE REDACTED]') &&
      !out.includes('[ID NUMBER REDACTED]'),
    expectedCounts: { phones: 0, ids: 0, emails: 0, upi: 0 },
  },
  {
    name: 'Complex WhatsApp scam message with all 4 sensitive types',
    input: 'VIP Call: Call 9876543210. Pay fees to vip.trader@okhdfc. Email receipt to info@stocktips.org with Aadhaar 9988-7766-5544.',
    expectedPattern: (out) =>
      out.includes('[PHONE REDACTED]') &&
      out.includes('[UPI REDACTED]') &&
      out.includes('[EMAIL REDACTED]') &&
      out.includes('[ID NUMBER REDACTED]'),
    expectedCounts: { phones: 1, upi: 1, emails: 1, ids: 1 },
  },
];

export interface TestResult {
  name: string;
  passed: boolean;
  actualOutput: string;
  error?: string;
}

export function runMaskingUnitTests(): {
  total: number;
  passed: number;
  failed: number;
  results: TestResult[];
} {
  const results: TestResult[] = [];

  for (const tc of MASKING_TEST_CASES) {
    try {
      const res = maskSensitiveData(tc.input);
      const patternOk = tc.expectedPattern(res.maskedText);
      const emailsOk = tc.expectedCounts.emails === undefined || res.maskedCount.emails === tc.expectedCounts.emails;
      const upiOk = tc.expectedCounts.upi === undefined || res.maskedCount.upi === tc.expectedCounts.upi;
      const idsOk = tc.expectedCounts.ids === undefined || res.maskedCount.ids === tc.expectedCounts.ids;
      const phonesOk = tc.expectedCounts.phones === undefined || res.maskedCount.phones === tc.expectedCounts.phones;

      const passed = patternOk && emailsOk && upiOk && idsOk && phonesOk;

      results.push({
        name: tc.name,
        passed,
        actualOutput: res.maskedText,
        error: passed
          ? undefined
          : `Checks failed: pattern=${patternOk}, emails=${emailsOk}, upi=${upiOk}, ids=${idsOk}, phones=${phonesOk}`,
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      results.push({
        name: tc.name,
        passed: false,
        actualOutput: '',
        error: errorMessage,
      });
    }
  }

  const passedCount = results.filter((r) => r.passed).length;
  return {
    total: results.length,
    passed: passedCount,
    failed: results.length - passedCount,
    results,
  };
}
