/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Navbar, AppNavTab } from './components/Navbar';
import { MessageInput } from './components/MessageInput';
import { AnalysisResult, AnalysisResponseData } from './components/AnalysisResult';
import { PauseCircuitBreaker } from './components/PauseCircuitBreaker';
import { EmergencyRecovery } from './components/EmergencyRecovery';
import { ScamGym } from './components/ScamGym';
import { RegistryLookup } from './components/RegistryLookup';
import { MaskingTestRunnerModal } from './components/MaskingTestRunnerModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { Language, getTranslation } from './i18n';
import { useTheme } from './hooks/useTheme';
import { MaskingResult } from './utils/masking';
import { ShieldCheck, PhoneCall, ExternalLink, AlertCircle, FlaskConical } from 'lucide-react';
import {
  SCORES_OFFICIAL_URL,
  CYBERCRIME_OFFICIAL_URL,
  NATIONAL_CYBER_HELPLINE,
} from './constants/registry';

export default function App() {
  const [lang, setLang] = useState<Language>('hi');
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<AppNavTab>('verify');
  const [analysisData, setAnalysisData] = useState<AnalysisResponseData | null>(null);
  const [lastMaskingInfo, setLastMaskingInfo] = useState<MaskingResult | null>(null);
  const [lastOriginalText, setLastOriginalText] = useState<string>('');
  const [registryPrefill, setRegistryPrefill] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);

  const t = (k: string) => getTranslation(lang, k);

  const handleAnalyze = async (payload: {
    text: string;
    originalInput: string;
    imageBase64?: string;
    imageMimeType?: string;
    maskingInfo: MaskingResult;
  }) => {
    setIsLoading(true);
    setApiError(null);
    setLastMaskingInfo(payload.maskingInfo);
    setLastOriginalText(payload.originalInput);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: payload.text,
          imageBase64: payload.imageBase64,
          imageMimeType: payload.imageMimeType,
          language: lang,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || `Server returned error (${response.status})`);
      }

      const data: AnalysisResponseData = await response.json();
      setAnalysisData(data);
      setActiveTab('verify');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('Analysis request error:', msg);
      setApiError(
        lang === 'hi'
          ? 'जांच के दौरान कोई समस्या आई। कृपया पुनः प्रयास करें।'
          : 'Could not complete analysis. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setAnalysisData(null);
    setApiError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenRegistryGuide = (regNum?: string) => {
    if (regNum) setRegistryPrefill(regNum);
    setActiveTab('registry');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top Navigation */}
      <Navbar
        lang={lang}
        theme={theme}
        onThemeChange={setTheme}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onLanguageChange={setLang}
        onOpenTests={() => setIsTestModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 sm:py-8">
        {/* VIEW 1: MESSAGE VERIFIER */}
        {activeTab === 'verify' && (
          <div>
            {!analysisData ? (
              <div className="space-y-8">
                {/* Hero / Empathy Banner for Tier-2/3 Investors */}
                <div className="text-center max-w-2xl mx-auto space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
                    <ShieldCheck className="w-4 h-4" />
                    <span>{t('hackathon_badge')}</span>
                  </div>

                  <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                    {t('hero_title')}
                  </h1>

                  <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
                    {t('hero_subtitle')}
                  </p>
                </div>

                {/* Error Notification if any */}
                {apiError && (
                  <div className="max-w-2xl mx-auto p-4 rounded-2xl bg-rose-950/50 border border-rose-500/50 text-rose-300 text-sm flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
                    <span>{apiError}</span>
                  </div>
                )}

                {/* Message Input Component */}
                <MessageInput
                  lang={lang}
                  onAnalyze={handleAnalyze}
                  isLoading={isLoading}
                />
              </div>
            ) : (
              <AnalysisResult
                lang={lang}
                data={analysisData}
                maskingInfo={lastMaskingInfo || undefined}
                onReset={handleReset}
                onOpenPauseBreaker={() => setActiveTab('pause')}
                onOpenEmergency={() => setActiveTab('emergency')}
                onOpenRegistryGuide={handleOpenRegistryGuide}
              />
            )}
          </div>
        )}

        {/* VIEW 2: 60-SECOND COOLING-OFF PAUSE (PDF Track D) */}
        {activeTab === 'pause' && (
          <PauseCircuitBreaker
            lang={lang}
            onComplete={() => {
              if (analysisData) {
                setActiveTab('verify');
              } else {
                setActiveTab('verify');
              }
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onSkip={() => {
              setActiveTab('verify');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {/* VIEW 3: SCAM GYM (PDF Track A/E & Phase 4) */}
        {activeTab === 'scamgym' && (
          <ScamGym
            lang={lang}
            onExit={() => {
              setActiveTab('verify');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {/* VIEW 4: EMERGENCY "I ALREADY PAID" GOLDEN HOUR RECOVERY (PDF Track B) */}
        {activeTab === 'emergency' && (
          <EmergencyRecovery
            lang={lang}
            messageText={lastOriginalText || analysisData?.targetText}
            claimedRegistration={analysisData?.claimedRegistrationNumber}
            onClose={() => {
              setActiveTab('verify');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {/* VIEW 5: SAMPLE SEBI REGISTRY & IMPERSONATION DEFENSE */}
        {activeTab === 'registry' && (
          <RegistryLookup
            lang={lang}
            prefillQuery={registryPrefill}
          />
        )}
      </main>

      {/* Official Emergency & Regulatory Resource Footer */}
      <footer className="w-full border-t border-slate-800 bg-slate-950/80 py-5 px-4 mt-auto">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <a
              href={`tel:${NATIONAL_CYBER_HELPLINE}`}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-500/15 text-rose-300 border border-rose-500/30 font-bold hover:bg-rose-500/25 transition"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>{t('official_helpline')}</span>
            </a>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-slate-400">
            <a
              href="https://www.sebi.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-amber-400 transition flex items-center gap-1"
            >
              <span>SEBI Official Portal</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <span className="text-slate-700">•</span>
            <a
              href={SCORES_OFFICIAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-amber-400 transition flex items-center gap-1"
            >
              <span>SCORES Grievance</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <span className="text-slate-700">•</span>
            <a
              href={CYBERCRIME_OFFICIAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-amber-400 transition flex items-center gap-1"
            >
              <span>cybercrime.gov.in</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <span className="text-slate-700">•</span>
            <button
              onClick={() => setIsTestModalOpen(true)}
              className="hover:text-emerald-400 text-slate-400 transition flex items-center gap-1 cursor-pointer"
            >
              <FlaskConical className="w-3.5 h-3.5 text-emerald-400" />
              <span>{lang === 'hi' ? 'प्राइवेसी टेस्ट्स' : 'Privacy Tests'}</span>
            </button>
          </div>
        </div>
      </footer>

      {/* PWA Offline Indicator */}
      <OfflineIndicator lang={lang} />

      {/* Privacy Masking Test Suite Modal */}
      <MaskingTestRunnerModal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
        lang={lang}
      />
    </div>
  );
}
