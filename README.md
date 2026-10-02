# SANGYAN (संज्ञान) - Pause & Verify Investor Companion
> **Investor Resilience Companion**

**Ruko** is an empathetic, high-contrast, bilingual (Hindi & English) pause-and-verify companion for first-time retail investors and senior citizens in Tier-2/3 cities. When a user receives an unsolicited WhatsApp stock tip, a Telegram group invite, or a "paisa double" promise, Ruko encourages a calm pause and evaluates the message against SEBI regulations and deceptive manipulation tactics.

---

## 🏆 Hackathon Tracks & Unique Features Aligned with Problem Statement

| Problem Statement Track | Unique Ruko Feature | How It Directly Solves The Problem |
|---|---|---|
| **Track A: Digital Fraud & Scam Resilience** | **Multimodal Claim Verifier & Tip-Group Risk Profiler** | Users paste text, voice notes, or upload chat screenshots. Ruko redacts private data client-side, extracts claims via Gemini, and flags guaranteed returns, countdowns, and unregistered apps. |
| **Track B: Rights & Grievance Redressal** | **"I Already Paid" Golden-Hour Crisis Protocol & Complaint Generator** | 1-tap call to `1930`, direct links to SCORES and `cybercrime.gov.in`, a bank freeze checklist, and an auto-generated formal complaint draft pre-populated with incident timestamps and evidence. |
| **Track C: Investor Education for Bharat** | **Bilingual Voice-First Explainer & High-Contrast UX** | Built in authentic Hindi & English with Web Speech API recording, `speechSynthesis` audio playback, and 48px+ touch targets designed for low-literacy seniors and Tier-2/3 investors. |
| **Track D: Behavioural Resilience** | **60-Second Cooling-Off Circuit Breaker** | Calming 60-second breathing timer with 3 self-reflection tap checks ("Who contacted me first?", "Am I being rushed?", "Did I check sebi.gov.in?") to disrupt emotional FOMO. |
| **Track E: Misinformation Literacy** | **Interactive "Scam Gym" & Pre/Post Quiz** | A 2-minute simulated WhatsApp group where users experience realistic shill accounts and fake P&L screenshots, tapping manipulative messages to see before-and-after resilience score gains. |

---

## 🛡️ Guardrails Enforcement (Strict Compliance)

| Guardrail | Requirement | How Ruko Enforces It |
|---|---|---|
| **1. No Stock Tips or Recommendations** | Never produce buy/sell/hold ratings, price predictions, or recommend instruments, brokers, or platforms. | Both the system prompts and deterministic rule engine are prohibited from discussing instrument viability. Any claim about a stock is treated strictly as an unverified external assertion. |
| **2. Judge Message, Not Instrument** | Evaluate only the communication techniques and claims, not whether a stock is good or bad. | Signals focus strictly on manipulation patterns: guaranteed return claims, artificial countdowns, insider leaks, or unofficial payment requests. |
| **3. No Monetisation** | No affiliate links, ads, upsells, or broker integrations. | Zero commercial links. Links strictly route to statutory Indian authorities: SEBI (`sebi.gov.in`), SCORES (`scores.sebi.gov.in`), National Cyber Crime Reporting Portal (`cybercrime.gov.in`), and National Cyber Helpline `tel:1930`. |
| **4. Client-Side Privacy First** | Never read SMS or OTPs automatically. Store nothing server-side. | The browser masks phone numbers (`[PHONE REDACTED]`), UPI VPAs (`[UPI REDACTED]`), email addresses (`[EMAIL REDACTED]`), and 12-digit Aadhaar/ID numbers (`[ID NUMBER REDACTED]`) **before** any network payload is dispatched. Zero messages or user identifiers are logged or written to disk. An in-app test suite verifies masking in real time. |
| **5. Graded Concern, Never Binary** | Never declare binary "Scam" or "Safe". | Results are categorized into graded concern levels (High, Moderate, Low) accompanied by an explicit **"What We Could Not Verify"** section clarifying that text messages alone cannot verify identity, past profits, or true registration status. |

---

## 🚀 Stack & Architecture

- **Frontend**: React 19 + TypeScript + Tailwind CSS (Vite), engineered as a lightweight Progressive Web App (PWA) with offline capabilities.
- **Backend API**: Express server running on port 3000 (`/api/analyze`).
- **AI Engine**: Google Gemini API (`@google/genai` TypeScript SDK with model `gemini-3.8-flash`) for nuanced claim extraction and multimodal screenshot OCR.
- **Resilient Fallback**: If no `GEMINI_API_KEY` is provided, Ruko automatically falls back to the deterministic TypeScript Rule Engine and indicates **"Basic Mode (Offline Rule-Engine)"**, ensuring the demo never breaks.
- **Bharat Multi-Language Support**: Hindi (`hi`), English (`en`), Marathi (`mr`), and Gujarati (`gu`) via modular JSON files with automatic voice recognition (`Web Speech API`) and speech synthesis support.
- **Adaptive Accessibility Themes**: 🌙 Dark Trust (default), ☀️ Daylight Light Mode, and 👓 Senior High-Contrast Mode (extra-large typography, boosted contrast, 52px+ touch targets).

---

## ⚙️ Environment Variables

Create a `.env` file (refer to `.env.example`):

```bash
# GEMINI_API_KEY: Required for Gemini AI multimodal extraction and claim analysis.
# If omitted, Ruko operates in Basic Mode using the deterministic rule engine.
GEMINI_API_KEY="your-gemini-api-key"

# APP_URL: Current app URL (injected automatically in AI Studio)
APP_URL="http://localhost:3000"
```

---

## 📦 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Visit `http://localhost:3000` in your browser.

### 3. Run Privacy Masking Unit Tests
You can verify the client-side masking test suite via CLI:
```bash
npx tsx -e "import { runMaskingUnitTests } from './src/utils/masking.test.ts'; console.log(runMaskingUnitTests());"
```
Or click the **"Masking Tests"** beaker icon in the app header to view all unit test cases passing in real time.

### 4. Build for Production
```bash
npm run build
npm start
```

---

## 🔍 Official SEBI Registry & Search Integration

SANGYAN includes an aggregated, indexed statutory directory of **12,397+ official SEBI-registered entities** directly mapped from SEBI records:

- **Stock Brokers (`INZ`)**: 4,993 records (Zerodha, Groww, Angel One, 5paisa, HDFC Securities, ICICI Direct, etc.)
- **Research Analysts (`INH`)**: 2,248 records
- **Alternative Investment Funds (`AIF`)**: 2,037 records
- **Investment Advisers (`INA`)**: 1,050 records
- **Depository Participants (`DP`)**: 1,105 records (NSDL & CDSL)
- **Portfolio Managers (`INP`)**: 537 records
- **Merchant Bankers (`INM`)**: 252 records
- **Mutual Funds (`INF`)**: 61 registered Asset Management Companies (SBI MF, HDFC MF, etc.)
- **Registrars & Share Transfer Agents (`RTA`)**: 79 records
- **Debenture Trustees (`DT`)**: 26 records
- **Credit Rating Agencies (`CRA`)**: 9 records

### Dedicated Search Endpoints:
- `GET /api/sebi/search?q={query}&category={category}&page={page}`: Full-text & prefix search across 12,397 entities, debarred operators, regulations, and prefixes.
- `GET /api/sebi/stats`: Category counts and directory metadata.
- `GET /api/sebi/debarred`: High-profile debarred operators (Baap of Chart, Gunjan Verma, Bliss Consultants, etc.).
- `GET /api/sebi/regulations`: Core investor protection clauses (SEBI Act, PFUTP 2003, RA Regulations 2014, IA Regulations 2013, Finfluencer Circular 2024, SCORES 2.0).
- `GET /api/sebi/prefixes`: SEBI statutory registration code directory and authority mapping.

