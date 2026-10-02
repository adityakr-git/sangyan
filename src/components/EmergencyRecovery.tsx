import React, { useState } from 'react';
import {
  PhoneCall,
  ShieldAlert,
  Copy,
  Check,
  ExternalLink,
  Lock,
  Camera,
  FileText,
  Clock,
  Building2,
  AlertTriangle,
} from 'lucide-react';
import { Language } from '../i18n';
import { SCORES_OFFICIAL_URL, CYBERCRIME_OFFICIAL_URL } from '../constants/registry';

interface EmergencyRecoveryProps {
  lang: Language;
  messageText?: string;
  claimedRegistration?: string | null;
  onClose?: () => void;
}

export const EmergencyRecovery: React.FC<EmergencyRecoveryProps> = ({
  lang,
  messageText = '',
  claimedRegistration = null,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const isHi = lang === 'hi';

  const [step1Done, setStep1Done] = useState(false);
  const [step2Done, setStep2Done] = useState(false);
  const [step3Done, setStep3Done] = useState(false);
  const [step4Done, setStep4Done] = useState(false);

  // Generate pre-populated formal complaint template
  const todayDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const todayTime = new Date().toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const complaintDraft = `SUBJECT: Urgent Cyber Fraud / Unauthorized Financial Solicitation Complaint

To:
The Cyber Crime Police Station / Bank Grievance Officer / SEBI SCORES Portal

Date: ${todayDate} at ${todayTime}

Sir/Madam,

I am writing to immediately report a financial deception and fraudulent inducement to transfer funds under the guise of an investment / stock advisory scheme.

1. Incident Summary:
I was contacted via an unsolicited communication (WhatsApp / Telegram / SMS) promising guaranteed returns / insider recommendations. Under psychological urgency pressure, funds were solicited.

2. Evidence & Message Content:
The communication contained the following message/claims:
"""
${messageText ? messageText.slice(0, 300) : '[Paste full message / chat text here]'}
"""
${claimedRegistration ? `Claimed SEBI Reg: ${claimedRegistration}` : ''}

3. Steps Taken Under Golden-Hour Protocol:
- Dialed National Cybercrime Helpline 1930 to initiate transaction freeze.
- Requested Bank Customer Support to dispute and place a lien on the recipient account.
- Preserved all transaction IDs, UTR numbers, and uncompressed chat screenshots.

I request immediate formal registration of this complaint, intimation to the recipient payment gateway/bank to freeze proceeds, and issuance of an acknowledgment number.

Sincerely,
[Your Full Name]
[Contact Number]
[Bank Account & Reference / UTR Number]
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(complaintDraft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="w-full max-w-2xl mx-auto rounded-3xl bg-slate-900 border border-rose-500/50 p-6 sm:p-8 shadow-2xl space-y-6 text-slate-100">
      {/* Golden-Hour Header */}
      <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-start gap-3.5">
          <div className="p-3 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase bg-rose-500/20 text-rose-300 border border-rose-500/30">
                {isHi ? 'गोल्डन ऑवर प्रोटोकॉल' : 'Golden-Hour Protocol'}
              </span>
              <span className="text-xs text-amber-400 font-bold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {isHi ? 'पहले 60 मिनट महत्वपूर्ण हैं' : 'First 60 mins are critical'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
              {isHi ? 'पैसे दे चुके हैं? तुरंत ये कदम उठाएं' : 'Already Transferred Money? Act Now'}
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              {isHi
                ? 'घबराएं नहीं। जितनी जल्दी आप 1930 पर फोन करेंगे और बैंक को सूचित करेंगे, पैसे रुकने की संभावना उतनी अधिक होगी।'
                : 'Do not panic. Fast reporting within the first hour gives cyber cells the best chance to freeze the fraudster’s bank account.'}
            </p>
          </div>
        </div>
      </div>

      {/* Emergency Helpline Tap-to-Call Card */}
      <div className="rounded-2xl bg-gradient-to-r from-rose-950/70 to-slate-950 border border-rose-500/60 p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
        <div>
          <span className="text-xs font-bold text-rose-400 uppercase tracking-wider block">
            {isHi ? 'कदम 1: तुरंत फोन मिलाएं' : 'Step 1: Immediate Call'}
          </span>
          <h3 className="text-xl font-black text-white mt-0.5">
            {isHi ? 'राष्ट्रीय साइबर हेल्पलाइन 1930' : 'National Cyber Helpline: 1930'}
          </h3>
          <p className="text-xs text-slate-300 mt-1">
            {isHi
              ? 'टोल-फ्री नंबर। बैंक का नाम, ट्रांजैक्शन आईडी (UTR) और समय तैयार रखें।'
              : 'Toll-free 24/7. Keep UTR/transaction ID, bank account, and amount ready.'}
          </p>
        </div>

        <a
          href="tel:1930"
          className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-base shadow-xl shadow-rose-600/30 transition flex items-center justify-center gap-2.5 active:scale-95 shrink-0 min-h-[52px]"
        >
          <PhoneCall className="w-5 h-5 animate-bounce" />
          <span>{isHi ? '1930 पर कॉल करें' : 'Call 1930 Now'}</span>
        </a>
      </div>

      {/* First-Hour Recovery Checklist */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
          {isHi ? 'रिकवरी चेकलिस्ट (प्राथमिकता के अनुसार):' : 'Crisis Action Checklist:'}
        </h3>

        <div className="space-y-2.5">
          {/* Item 1 */}
          <button
            type="button"
            onClick={() => setStep1Done(!step1Done)}
            className={`w-full text-left p-3.5 rounded-2xl border transition flex items-start gap-3 cursor-pointer min-h-[48px] ${
              step1Done
                ? 'bg-emerald-950/30 border-emerald-500/40 text-slate-300'
                : 'bg-slate-950 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-md border shrink-0 mt-0.5 flex items-center justify-center ${
                step1Done ? 'bg-emerald-500 border-emerald-400 text-slate-950' : 'border-slate-600'
              }`}
            >
              {step1Done && <Check className="w-3.5 h-3.5 stroke-3" />}
            </div>
            <div className="text-xs sm:text-sm">
              <span className="font-bold text-white block">
                {isHi ? '1. अपने बैंक के कस्टमर केयर को फोन करें' : '1. Notify your bank immediately'}
              </span>
              <p className="text-slate-400 text-xs mt-0.5">
                {isHi
                  ? 'लेन-देन पर तुरंत "Dispute / Fraud Freeze" दर्ज कराएं ताकि पैसा आगे न निकल सके।'
                  : 'Ask to freeze the transaction or place a lien on the recipient bank account.'}
              </p>
            </div>
          </button>

          {/* Item 2 */}
          <button
            type="button"
            onClick={() => setStep2Done(!step2Done)}
            className={`w-full text-left p-3.5 rounded-2xl border transition flex items-start gap-3 cursor-pointer min-h-[48px] ${
              step2Done
                ? 'bg-emerald-950/30 border-emerald-500/40 text-slate-300'
                : 'bg-slate-950 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-md border shrink-0 mt-0.5 flex items-center justify-center ${
                step2Done ? 'bg-emerald-500 border-emerald-400 text-slate-950' : 'border-slate-600'
              }`}
            >
              {step2Done && <Check className="w-3.5 h-3.5 stroke-3" />}
            </div>
            <div className="text-xs sm:text-sm">
              <span className="font-bold text-white block">
                {isHi ? '2. cybercrime.gov.in पर आधिकारिक शिकायत दर्ज करें' : '2. File complaint on cybercrime.gov.in'}
              </span>
              <p className="text-slate-400 text-xs mt-0.5">
                {isHi
                  ? 'ऑनलाइन पोर्टल पर शिकायत दर्ज कर एक्नॉलेजमेंट नंबर (Acknowledgement No.) प्राप्त करें।'
                  : 'National portal report generates an official incident ID required by banks.'}
              </p>
            </div>
          </button>

          {/* Item 3 */}
          <button
            type="button"
            onClick={() => setStep3Done(!step3Done)}
            className={`w-full text-left p-3.5 rounded-2xl border transition flex items-start gap-3 cursor-pointer min-h-[48px] ${
              step3Done
                ? 'bg-emerald-950/30 border-emerald-500/40 text-slate-300'
                : 'bg-slate-950 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-md border shrink-0 mt-0.5 flex items-center justify-center ${
                step3Done ? 'bg-emerald-500 border-emerald-400 text-slate-950' : 'border-slate-600'
              }`}
            >
              {step3Done && <Check className="w-3.5 h-3.5 stroke-3" />}
            </div>
            <div className="text-xs sm:text-sm">
              <span className="font-bold text-white block">
                {isHi ? '3. सारे सबूत सुरक्षित रखें (Screenshots & UTR)' : '3. Preserve all digital evidence'}
              </span>
              <p className="text-slate-400 text-xs mt-0.5">
                {isHi
                  ? 'चैट न मिटाएं। बैंक ट्रांसफर का UTR नंबर, स्क्रीनशॉट और ग्रुप लिंक सेव रखें।'
                  : 'Do not delete the chat. Capture full uncropped screenshots, UTRs, and payment receipts.'}
              </p>
            </div>
          </button>

          {/* Item 4 */}
          <button
            type="button"
            onClick={() => setStep4Done(!step4Done)}
            className={`w-full text-left p-3.5 rounded-2xl border transition flex items-start gap-3 cursor-pointer min-h-[48px] ${
              step4Done
                ? 'bg-emerald-950/30 border-emerald-500/40 text-slate-300'
                : 'bg-slate-950 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-md border shrink-0 mt-0.5 flex items-center justify-center ${
                step4Done ? 'bg-emerald-500 border-emerald-400 text-slate-950' : 'border-slate-600'
              }`}
            >
              {step4Done && <Check className="w-3.5 h-3.5 stroke-3" />}
            </div>
            <div className="text-xs sm:text-sm">
              <span className="font-bold text-white block">
                {isHi ? '4. सेबी स्कोर्स (SEBI SCORES) पर शिकायत दर्ज करें' : '4. File on SEBI SCORES (if entity claimed)'}
              </span>
              <p className="text-slate-400 text-xs mt-0.5">
                {isHi
                  ? 'यदि ब्रोकर या सेबी सलाहकार का नाम इस्तेमाल हुआ हो तो scores.sebi.gov.in पर रिपोर्ट करें।'
                  : 'Report impersonation or fraud to SEBI via scores.sebi.gov.in.'}
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Copyable Structured Complaint Draft */}
      <div className="rounded-2xl bg-slate-950 border border-slate-800 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-400" />
            <h4 className="text-sm font-bold text-slate-200">
              {isHi ? 'तैयार शिकायत प्रारूप (कॉपी करें):' : 'Pre-Formatted Complaint Draft:'}
            </h4>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition active:scale-95 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>{isHi ? 'कॉपी हो गया!' : 'Copied!'}</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>{isHi ? 'प्रारूप कॉपी करें' : 'Copy Draft'}</span>
              </>
            )}
          </button>
        </div>

        <p className="text-xs text-slate-400">
          {isHi
            ? 'गोपनीयता नियम: यह शिकायत स्वतः कहीं नहीं भेजी जाती। इसे कॉपी करके बैंक या साइबर पोर्टल में पेस्ट करें।'
            : 'Hard Guardrail: This draft is NEVER submitted automatically. Copy and use it in your official bank email or police portal.'}
        </p>

        <pre className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300 whitespace-pre-wrap max-h-56 overflow-y-auto leading-relaxed">
          {complaintDraft}
        </pre>
      </div>

      {/* Official External Links */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs">
        <a
          href={CYBERCRIME_OFFICIAL_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 font-semibold"
        >
          <span>cybercrime.gov.in Portal</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>

        <a
          href={SCORES_OFFICIAL_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 font-semibold"
        >
          <span>SEBI SCORES Portal</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>

        {onClose && (
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white px-3 py-1.5 rounded-lg"
          >
            {isHi ? 'वापस जाएं' : 'Back to Analysis'}
          </button>
        )}
      </div>
    </div>
  );
};
