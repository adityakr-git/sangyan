import React, { useState } from 'react';
import {
  AlertTriangle,
  AlertOctagon,
  ShieldCheck,
  Volume2,
  VolumeX,
  RotateCcw,
  HelpCircle,
  Sparkles,
  Cpu,
  Quote,
  Timer,
  ShieldAlert,
  Search,
  ExternalLink,
  PhoneCall,
  ArrowRight,
} from 'lucide-react';
import { Language, getTranslation, getSpeechLangCode } from '../i18n';
import { AnalysisSignal } from '../services/ruleEngine';
import { MaskingResult } from '../utils/masking';
import {
  SEBI_LOOKUP_OFFICIAL_URL,
  SCORES_OFFICIAL_URL,
  CYBERCRIME_OFFICIAL_URL,
  NATIONAL_CYBER_HELPLINE,
} from '../constants/registry';

export interface AnalysisResponseData {
  isBasicMode: boolean;
  modeLabel: string;
  targetText: string;
  overallConcern: 'low' | 'medium' | 'high';
  concernReason: string;
  signals: AnalysisSignal[];
  extractedClaims: string[];
  promisedReturns: string[];
  urgencyCues: string[];
  claimedRegistrationNumber: string | null;
  couldNotVerify: string[];
}

interface AnalysisResultProps {
  lang: Language;
  data: AnalysisResponseData;
  maskingInfo?: MaskingResult;
  onReset: () => void;
  onOpenPauseBreaker?: () => void;
  onOpenEmergency?: () => void;
  onOpenRegistryGuide?: (regNum?: string) => void;
}

export const AnalysisResult: React.FC<AnalysisResultProps> = ({
  lang,
  data,
  maskingInfo,
  onReset,
  onOpenPauseBreaker,
  onOpenEmergency,
  onOpenRegistryGuide,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const t = (k: string) => getTranslation(lang, k);
  const isHi = lang === 'hi';

  // Text-to-Speech "Listen" functionality using browser SpeechSynthesis
  const handleListenSummary = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported on this browser.');
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    window.speechSynthesis.cancel();

    const concernTitle =
      data.overallConcern === 'high'
        ? t('concern_high')
        : data.overallConcern === 'medium'
        ? t('concern_medium')
        : t('concern_low');

    const spokenText = `${concernTitle}. ${data.concernReason}. Found ${data.signals.length} signals. ${
      data.signals.map((s) => s.explanation).join('. ')
    }`;

    const utterance = new SpeechSynthesisUtterance(spokenText);
    utterance.lang = getSpeechLangCode(lang);
    utterance.rate = 0.95;

    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.speak(utterance);
    setIsPlayingAudio(true);
  };

  // Traffic light styling
  const trafficLightConfig = {
    high: {
      bg: 'bg-rose-950/40',
      border: 'border-rose-500/50',
      badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      icon: <AlertOctagon className="w-9 h-9 text-rose-400 shrink-0" />,
      title: t('concern_high'),
      dotColor: 'bg-rose-500 ring-rose-500/30',
    },
    medium: {
      bg: 'bg-amber-950/40',
      border: 'border-amber-500/50',
      badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      icon: <AlertTriangle className="w-9 h-9 text-amber-400 shrink-0" />,
      title: t('concern_medium'),
      dotColor: 'bg-amber-500 ring-amber-500/30',
    },
    low: {
      bg: 'bg-emerald-950/40',
      border: 'border-emerald-500/50',
      badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      icon: <ShieldCheck className="w-9 h-9 text-emerald-400 shrink-0" />,
      title: t('concern_low'),
      dotColor: 'bg-emerald-500 ring-emerald-500/30',
    },
  }[data.overallConcern];

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Top Banner: Mode Indicator & Privacy badge */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          {data.isBasicMode ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700">
              <Cpu className="w-3.5 h-3.5 text-amber-400" />
              {data.modeLabel}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              {data.modeLabel}
            </span>
          )}
        </div>

        {maskingInfo && maskingInfo.hasMaskedData && (
          <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            {maskingInfo.maskedCount.total} private items masked
          </span>
        )}
      </div>

      {/* Traffic Light Card */}
      <div
        className={`rounded-3xl p-6 sm:p-7 border ${trafficLightConfig.border} ${trafficLightConfig.bg} shadow-2xl relative overflow-hidden`}
      >
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800">
              {trafficLightConfig.icon}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <span className={`w-3.5 h-3.5 rounded-full ${trafficLightConfig.dotColor} ring-4 animate-pulse`} />
                <h2 className="text-xl sm:text-2xl font-black text-white">
                  {trafficLightConfig.title}
                </h2>
              </div>
              <p className="mt-2 text-base text-slate-200 leading-relaxed font-medium">
                {data.concernReason}
              </p>
            </div>
          </div>

          {/* Listen aloud button */}
          <button
            onClick={handleListenSummary}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 text-xs font-bold transition active:scale-95 shrink-0 min-h-[44px] cursor-pointer"
            aria-label="Listen to summary"
          >
            {isPlayingAudio ? (
              <>
                <VolumeX className="w-4 h-4 text-rose-400" />
                <span>{lang === 'hi' ? 'आवाज़ रोकें' : 'Stop Audio'}</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-amber-400" />
                <span>{lang === 'hi' ? 'सुनें (Listen)' : 'Listen Aloud'}</span>
              </>
            )}
          </button>
        </div>

        {/* Claimed SEBI number banner if present */}
        {data.claimedRegistrationNumber && (
          <div className="mt-5 p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400 font-medium">
              {lang === 'hi' ? 'मैसेज में उल्लिखित रजिस्ट्रेशन नंबर:' : 'Claimed SEBI Registration No:'}
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-amber-300">
                {data.claimedRegistrationNumber}
              </span>
              {onOpenRegistryGuide && (
                <button
                  onClick={() => onOpenRegistryGuide(data.claimedRegistrationNumber || undefined)}
                  className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold hover:bg-amber-500/30"
                >
                  Verify
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Prominent Cooling-Off Pause Circuit Breaker Card */}
      {onOpenPauseBreaker && (
        <div className="rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/40 border border-amber-500/40 p-5 sm:p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 text-center sm:text-left">
            <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
              <Timer className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="font-black text-base text-white">
                {isHi ? '60 सेकंड का संयम (Cooling-Off Pause)' : 'Take the 60-Second Cooling-Off Pause'}
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                {isHi
                  ? '3 आत्म-निरीक्षण प्रश्न पूछें और जल्दबाजी के दबाव को खत्म करें।'
                  : 'Answer 3 reflective tap questions to clear impulsive FOMO.'}
              </p>
            </div>
          </div>

          <button
            onClick={onOpenPauseBreaker}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-95 shrink-0 min-h-[48px]"
          >
            <span>{isHi ? 'पॉज़ शुरू करें' : 'Start 60s Pause'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Signals List Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <span>{t('signals_heading')}</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-amber-400 font-bold border border-slate-700">
              {data.signals.length}
            </span>
          </h3>
          <p className="text-xs text-slate-400 hidden sm:block">
            Verbatim quotes & SEBI criteria
          </p>
        </div>

        {data.signals.length === 0 ? (
          <p className="text-sm text-slate-400 italic py-4 text-center">
            {lang === 'hi'
              ? 'इस संदेश में कोई स्पष्ट रेड फ्लैग नहीं मिला।'
              : 'No specific red flags were triggered by this text.'}
          </p>
        ) : (
          <div className="space-y-4">
            {data.signals.map((signal, idx) => {
              const badgeStyle = {
                high: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
                medium: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
                low: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
              }[signal.severity];

              return (
                <div
                  key={signal.id || idx}
                  className="rounded-2xl bg-slate-950 border border-slate-800/80 p-4 space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[11px] font-black uppercase px-2.5 py-1 rounded-md border tracking-wider ${badgeStyle}`}
                    >
                      {signal.severity} Concern
                    </span>

                    {signal.isWeakSignal && (
                      <span className="text-[11px] font-semibold text-amber-400/90 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        {t('weak_signal_note')}
                      </span>
                    )}
                  </div>

                  {/* Verbatim quote from the message */}
                  <div className="flex items-start gap-2 text-sm bg-slate-900/90 border border-slate-800 p-3 rounded-xl">
                    <Quote className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 block mb-0.5">
                        {t('exact_quote_label')}
                      </span>
                      <p className="font-semibold text-amber-200 break-words font-mono text-xs sm:text-sm">
                        "{signal.quote}"
                      </p>
                    </div>
                  </div>

                  {/* One-sentence plain-language explanation */}
                  <p className="text-sm text-slate-200 leading-relaxed font-sans">
                    {signal.explanation}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* "What I Could Not Verify" Card (Hard Guardrail 5) */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-3">
        <div className="flex items-center gap-2.5">
          <HelpCircle className="w-5 h-5 text-amber-400" />
          <h3 className="text-base font-bold text-slate-100">
            {t('could_not_verify_heading')}
          </h3>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          {t('could_not_verify_sub')}
        </p>

        <ul className="space-y-2 mt-3">
          {data.couldNotVerify.map((item, idx) => (
            <li
              key={idx}
              className="flex items-start gap-2.5 text-xs text-slate-300 bg-slate-950 p-2.5 rounded-xl border border-slate-800/80"
            >
              <span className="text-amber-400 font-bold shrink-0">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Action Card: Official Verified Links & "I Already Paid" Branch */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
          {isHi ? 'आधिकारिक सत्यापन एवं सुरक्षा विकल्प:' : 'Official Action & Safety Hub:'}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* SEBI Directory Lookup */}
          <a
            href={SEBI_LOOKUP_OFFICIAL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3.5 rounded-2xl bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/40 transition flex items-center justify-between text-xs"
          >
            <div>
              <span className="font-bold text-white block">SEBI Official Directory</span>
              <span className="text-slate-400 text-[11px]">sebi.gov.in Intermediary Search</span>
            </div>
            <ExternalLink className="w-4 h-4 text-amber-400 shrink-0" />
          </a>

          {/* SCORES Grievance */}
          <a
            href={SCORES_OFFICIAL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3.5 rounded-2xl bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/40 transition flex items-center justify-between text-xs"
          >
            <div>
              <span className="font-bold text-white block">SEBI SCORES Portal</span>
              <span className="text-slate-400 text-[11px]">Lodge official market grievance</span>
            </div>
            <ExternalLink className="w-4 h-4 text-amber-400 shrink-0" />
          </a>

          {/* Cybercrime Helpline 1930 */}
          <a
            href={`tel:${NATIONAL_CYBER_HELPLINE}`}
            className="p-3.5 rounded-2xl bg-rose-950/40 hover:bg-rose-950/60 border border-rose-500/40 transition flex items-center justify-between text-xs text-rose-200"
          >
            <div>
              <span className="font-bold block">Dial 1930 Helpline</span>
              <span className="text-rose-300 text-[11px]">Toll-free immediate financial freeze</span>
            </div>
            <PhoneCall className="w-4 h-4 text-rose-400 shrink-0" />
          </a>

          {/* "I Already Paid" Drawer Trigger */}
          {onOpenEmergency && (
            <button
              onClick={onOpenEmergency}
              className="p-3.5 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 transition flex items-center justify-between text-xs cursor-pointer text-left"
            >
              <div>
                <span className="font-bold block">
                  {isHi ? 'पैसे दे चुके हैं? (I Already Paid)' : 'I Already Paid (Crisis Steps)'}
                </span>
                <span className="text-amber-400/80 text-[11px]">
                  {isHi ? 'गोल्डन ऑवर रिकवरी व शिकायत ड्राफ्ट' : 'Golden hour recovery checklist & draft'}
                </span>
              </div>
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
            </button>
          )}
        </div>
      </div>

      {/* Reset button */}
      <div className="pt-2">
        <button
          onClick={onReset}
          className="w-full min-h-[52px] rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-base shadow-md transition flex items-center justify-center gap-2.5 active:scale-98 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4 text-amber-400" />
          <span>{t('check_another')}</span>
        </button>
      </div>

      {/* Hackathon Disclaimer */}
      <p className="text-[11px] text-center text-slate-500 leading-relaxed px-4">
        {t('guardrail_disclaimer')}
      </p>
    </div>
  );
};

