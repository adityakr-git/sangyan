import React, { useState, useEffect } from 'react';
import { Timer, ArrowRight, ShieldCheck, HeartPulse, CheckCircle2, CircleDot } from 'lucide-react';
import { Language } from '../i18n';

interface PauseCircuitBreakerProps {
  lang: Language;
  onComplete: () => void;
  onSkip: () => void;
}

export const PauseCircuitBreaker: React.FC<PauseCircuitBreakerProps> = ({
  lang,
  onComplete,
  onSkip,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [q1Answer, setQ1Answer] = useState<string | null>(null);
  const [q2Answer, setQ2Answer] = useState<string | null>(null);
  const [q3Answer, setQ3Answer] = useState<string | null>(null);

  useEffect(() => {
    if (secondsLeft <= 0) {
      onComplete();
      return;
    }
    const timer = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [secondsLeft, onComplete]);

  const progressPercent = ((60 - secondsLeft) / 60) * 100;
  const isHi = lang === 'hi';

  const questions = [
    {
      id: 'q1',
      title: isHi ? '1. मुझसे सबसे पहले किसने संपर्क किया?' : '1. Who contacted me first?',
      options: [
        {
          label: isHi ? 'मुझे बिना मांगे ग्रुप में जोड़ा गया / अनजान नंबर से आया' : 'I was added to a group / unknown message came to me',
          risk: 'high',
        },
        {
          label: isHi ? 'मैंने खुद किसी अधिकृत ब्रोकर से सलाह मांगी थी' : 'I actively reached out to an authorized advisory service',
          risk: 'low',
        },
      ],
      selected: q1Answer,
      setSelected: setQ1Answer,
    },
    {
      id: 'q2',
      title: isHi ? '2. क्या मुझ पर जल्दबाजी का दबाव बनाया जा रहा है?' : '2. Am I being rushed into taking immediate action?',
      options: [
        {
          label: isHi ? 'हाँ, "मार्केट खुलने से पहले" या "सीमित सीटें" कहकर दबाव है' : 'Yes, "before market opens" or "limited slots" pressure',
          risk: 'high',
        },
        {
          label: isHi ? 'नहीं, मुझे सोचने व स्वतंत्र जांच करने का पूरा समय है' : 'No, I have ample time to read disclosures and research',
          risk: 'low',
        },
      ],
      selected: q2Answer,
      setSelected: setQ2Answer,
    },
    {
      id: 'q3',
      title: isHi ? '3. क्या मैंने सेबी की आधिकारिक वेबसाइट पर जांच की है?' : '3. Have I verified the name & bank on SEBI’s official portal?',
      options: [
        {
          label: isHi ? 'नहीं, सिर्फ मैसेज में लिखे दावे पर भरोसा किया है' : 'Not yet, I only trusted what was typed in the message',
          risk: 'high',
        },
        {
          label: isHi ? 'हाँ, sebi.gov.in पर नाम, ईमेल व बैंक खाता सत्यापित किया है' : 'Yes, I matched their name & corporate account on sebi.gov.in',
          risk: 'low',
        },
      ],
      selected: q3Answer,
      setSelected: setQ3Answer,
    },
  ];

  const highRiskAnswersCount = [q1Answer, q2Answer, q3Answer].filter(
    (ans) => ans && ans.includes('high')
  ).length;

  return (
    <div className="w-full max-w-2xl mx-auto rounded-3xl bg-slate-900 border border-amber-500/40 p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
      {/* Background Soft Breathing Glow */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />

      {/* Header & 60s Breathing Timer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
            <HeartPulse className="w-7 h-7 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              {isHi ? '60 सेकंड का संयम (Cooling-Off Pause)' : '60-Second Cooling-Off Pause'}
            </h2>
            <p className="text-xs text-slate-300">
              {isHi
                ? 'पैसा आपका है—1 मिनट शांत मन से सोचें। जल्दबाजी ही धोखे का पहला हथियार है।'
                : 'Pause your impulse. High-pressure tactics rely on panic and FOMO.'}
            </p>
          </div>
        </div>

        {/* Circular Countdown Progress Badge */}
        <div className="flex items-center gap-3 bg-slate-950 px-4 py-2.5 rounded-2xl border border-slate-800 shrink-0">
          <Timer className="w-5 h-5 text-amber-400" />
          <div className="text-right">
            <span className="text-2xl font-black font-mono text-amber-400">
              {secondsLeft}s
            </span>
            <span className="text-[10px] text-slate-400 block -mt-1">
              {isHi ? 'बाकी' : 'remaining'}
            </span>
          </div>
        </div>
      </div>

      {/* Breathing Instruction Cue */}
      <div className="rounded-2xl bg-slate-950/80 border border-slate-800 p-4 text-center">
        <p className="text-xs font-semibold text-amber-300/90 tracking-wide uppercase">
          {isHi ? 'लंबी सांस लें... और इन 3 सवालों पर विचार करें:' : 'Take a deep breath... and reflect on these 3 checks:'}
        </p>
        <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
          <div
            className="bg-amber-500 h-full transition-all duration-1000 ease-linear rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* 3 Interactive Tap Reflection Questions */}
      <div className="space-y-4">
        {questions.map((q) => (
          <div
            key={q.id}
            className="rounded-2xl bg-slate-950/60 border border-slate-800/80 p-4 space-y-2.5"
          >
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <CircleDot className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{q.title}</span>
            </h3>

            <div className="grid grid-cols-1 gap-2 pt-1">
              {q.options.map((opt, idx) => {
                const isSelected = q.selected === `${q.id}_${opt.risk}`;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => q.setSelected(`${q.id}_${opt.risk}`)}
                    className={`w-full text-left p-3 rounded-xl border text-xs sm:text-sm font-medium transition cursor-pointer flex items-start gap-2.5 min-h-[48px] ${
                      isSelected
                        ? opt.risk === 'high'
                          ? 'bg-rose-950/40 border-rose-500 text-rose-200'
                          : 'bg-emerald-950/40 border-emerald-500 text-emerald-200'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850 hover:border-slate-700'
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full border shrink-0 mt-0.5 flex items-center justify-center ${
                        isSelected
                          ? opt.risk === 'high'
                            ? 'border-rose-400 bg-rose-500'
                            : 'border-emerald-400 bg-emerald-500'
                          : 'border-slate-600'
                      }`}
                    >
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                    </span>
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Dynamic Feedback Banner based on self-reflection */}
      {highRiskAnswersCount > 0 && (
        <div className="rounded-2xl bg-rose-950/50 border border-rose-500/40 p-4 text-xs text-rose-200 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-rose-300">
              {isHi ? 'आत्म-निरीक्षण का परिणाम:' : 'Self-Reflection Takeaway:'}
            </span>{' '}
            {isHi
              ? 'आपके उत्तर बताते हैं कि यह संपर्क बिना बुलाए हुआ और आपको तुरंत पैसे देने के लिए उकसाया जा रहा है। कृपया किसी भी हालत में पैसे न ट्रांसफर करें।'
              : 'Your responses confirm unsolicited outreach and urgency pressure. Do NOT transfer funds or execute trades based on this.'}
          </div>
        </div>
      )}

      {/* Action Buttons: Proceed or Skip */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={onSkip}
          className="text-xs text-slate-400 hover:text-slate-200 underline underline-offset-4 py-2 px-3 cursor-pointer min-h-[44px]"
        >
          {isHi ? 'मैं समझ गया, सीधे एक्शन स्टेप्स देखें (Skip)' : 'I understand, skip to action steps'}
        </button>

        <button
          type="button"
          onClick={onComplete}
          className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2 cursor-pointer active:scale-95 min-h-[48px]"
        >
          <span>{isHi ? 'सुरक्षा कदम आगे बढ़ाएं' : 'Proceed to Safe Action Steps'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
