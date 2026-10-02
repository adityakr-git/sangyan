import React, { useState } from 'react';
import { Download, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC<{ lang?: 'hi' | 'en' }> = ({ lang = 'en' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-3 py-2 text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer min-h-[44px]"
      >
        <Download className="w-4 h-4" />
        <span>{lang === 'hi' ? 'ऐप इंस्टॉल करें' : 'Install App'}</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition min-h-[44px]"
        >
          <Download className="w-3.5 h-3.5 text-amber-400" />
          <span>{lang === 'hi' ? 'iPhone पर इंस्टॉल करें' : 'Install on iPhone'}</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl text-slate-100">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="font-bold text-base text-amber-400">
                  {lang === 'hi' ? 'iPhone पर ऐप जोड़ें' : 'Add Ruko to iPhone'}
                </h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="mt-4 text-sm text-slate-300 leading-relaxed">
                {lang === 'hi' ? (
                  <>
                    1. Safari में नीचे <strong>Share</strong> (शेयर) बटन दबाएं。<br />
                    2. नीचे स्क्रॉल करके <strong>Add to Home Screen</strong> चुनें।
                  </>
                ) : (
                  <>
                    1. Tap the <strong>Share</strong> icon in the Safari toolbar.<br />
                    2. Scroll down and tap <strong>Add to Home Screen</strong>.
                  </>
                )}
              </p>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-6 w-full rounded-xl bg-amber-500 py-2.5 text-sm font-bold text-slate-950 hover:bg-amber-400 transition"
              >
                {lang === 'hi' ? 'ठीक है' : 'Got it'}
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
