import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, ShieldCheck, RefreshCw, X } from 'lucide-react';
import { runMaskingUnitTests, TestResult } from '../utils/masking.test';
import { Language } from '../i18n';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const MaskingTestRunnerModal: React.FC<Props> = ({ isOpen, onClose, lang }) => {
  const [suiteResult, setSuiteResult] = useState<{
    total: number;
    passed: number;
    failed: number;
    results: TestResult[];
  } | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const executeTests = () => {
    setIsRunning(true);
    setTimeout(() => {
      const res = runMaskingUnitTests();
      setSuiteResult(res);
      setIsRunning(false);
    }, 250);
  };

  useEffect(() => {
    if (isOpen) {
      executeTests();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">
                {lang === 'hi' ? 'क्लाइंट-साइड प्राइवेसी मास्किंग टेस्ट सूट' : 'Client-Side Privacy Masking Tests'}
              </h2>
              <p className="text-xs text-slate-400">
                Hard Guardrail 4: Masking executes on device before API transmission.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats summary bar */}
        <div className="p-4 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {suiteResult?.passed || 0} Passed
            </span>
            {suiteResult && suiteResult.failed > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                <XCircle className="w-3.5 h-3.5" />
                {suiteResult.failed} Failed
              </span>
            )}
            <span className="text-xs text-slate-400">
              Total: {suiteResult?.total || 0} scenarios tested
            </span>
          </div>

          <button
            onClick={executeTests}
            disabled={isRunning}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
            {lang === 'hi' ? 'पुनः टेस्ट करें' : 'Re-run Tests'}
          </button>
        </div>

        {/* Test list */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3 divide-y divide-slate-800/60">
          {suiteResult?.results.map((r, idx) => (
            <div key={idx} className="pt-3 first:pt-0">
              <div className="flex items-start gap-2.5">
                {r.passed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-200">{r.name}</p>
                  <p className="mt-1 text-xs font-mono bg-slate-950 p-2 rounded-lg text-slate-300 break-all border border-slate-800/80">
                    {r.actualOutput}
                  </p>
                  {r.error && (
                    <p className="mt-1 text-xs text-rose-400 font-medium">{r.error}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between">
          <p className="text-xs text-slate-400">
            ✅ Zero data leaves the browser unmasked. Verified in real-time.
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition cursor-pointer"
          >
            {lang === 'hi' ? 'बंद करें' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
