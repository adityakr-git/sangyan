import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { Language } from '../i18n';

export const OfflineIndicator: React.FC<{ lang?: Language }> = ({ lang = 'en' }) => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-600/95 backdrop-blur-md px-4 py-2.5 text-xs font-bold text-white shadow-xl border border-amber-400/40">
      <WifiOff className="w-4 h-4 animate-pulse" />
      <span>
        {lang === 'hi'
          ? 'ऑफलाइन मोड: स्थानीय नियम इंजन सक्रिय है।'
          : lang === 'mr'
          ? 'ऑफलाइन मोड: स्थानिक नियम इंजिन सक्रिय आहे.'
          : lang === 'gu'
          ? 'ઓફલાઇન મોડ: સ્થાનિક નિયમ એન્જિન સક્રિય છે.'
          : 'Offline Mode: Local rule engine is active.'}
      </span>
    </div>
  );
};
