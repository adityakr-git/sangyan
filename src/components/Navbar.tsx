import React from 'react';
import {
  ShieldCheck,
  Languages,
  FlaskConical,
  MessageSquare,
  Timer,
  Flame,
  ShieldAlert,
  Building,
  Sun,
  Moon,
} from 'lucide-react';
import { Language, SUPPORTED_LANGUAGES } from '../i18n';
import { ThemeMode } from '../hooks/useTheme';
import { PWAInstallButton } from './PWAInstallButton';

export type AppNavTab = 'verify' | 'pause' | 'scamgym' | 'emergency' | 'registry';

interface NavbarProps {
  lang: Language;
  theme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  activeTab: AppNavTab;
  onSelectTab: (tab: AppNavTab) => void;
  onLanguageChange: (lang: Language) => void;
  onOpenTests: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  lang,
  theme,
  onThemeChange,
  activeTab,
  onSelectTab,
  onLanguageChange,
  onOpenTests,
}) => {
  const isHi = lang === 'hi';
  const isMr = lang === 'mr';
  const isGu = lang === 'gu';

  const navItems: { id: AppNavTab; label: string; icon: React.ReactNode; isEmergency?: boolean }[] = [
    {
      id: 'verify',
      label: isHi ? 'मैसेज जांचें' : isMr ? 'मेसेज तपासा' : isGu ? 'મેસેજ તપાસો' : 'Verify Message',
      icon: <MessageSquare className="w-4 h-4" />,
    },
    {
      id: 'pause',
      label: isHi ? '60s संयम' : isMr ? '60s थांबा' : isGu ? '60s થોભો' : '60s Pause',
      icon: <Timer className="w-4 h-4" />,
    },
    {
      id: 'scamgym',
      label: isHi ? 'स्कैम जिम' : isMr ? 'स्कॅम जिम' : isGu ? 'સ્કેમ જિમ' : 'Scam Gym',
      icon: <Flame className="w-4 h-4 text-amber-400" />,
    },
    {
      id: 'registry',
      label: isHi ? 'सेबी गाइड' : isMr ? 'सेबी मार्गदर्शक' : isGu ? 'સેબી માર્ગદર્શિકા' : 'SEBI Guide',
      icon: <Building className="w-4 h-4" />,
    },
    {
      id: 'emergency',
      label: isHi ? 'पैसे दे चुके हैं?' : isMr ? 'पैसे पाठवलेत?' : isGu ? 'પૈસા આપ્યા છે?' : 'I Already Paid',
      icon: <ShieldAlert className="w-4 h-4 text-rose-400" />,
      isEmergency: true,
    },
  ];

  const toggleLightDark = () => {
    onThemeChange(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-900/95 backdrop-blur-md">
      <div className="max-w-4xl mx-auto px-4 py-2.5 flex flex-col gap-2">
        {/* Top row: Brand & utility actions */}
        <div className="flex items-center justify-between gap-2">
          {/* Brand logo & name */}
          <button
            onClick={() => onSelectTab('verify')}
            className="flex items-center gap-2.5 text-left cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 text-slate-950 font-black text-xl group-hover:scale-105 transition">
              सं
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-white">SANGYAN</span>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  संज्ञान
                </span>
              </div>
            </div>
          </button>

          {/* Right actions: Theme Toggle, Install PWA, Language Toggle */}
          <div className="flex items-center gap-2">
            {/* Simple Light / Dark 1-click Toggle */}
            <button
              onClick={toggleLightDark}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-bold transition active:scale-95 cursor-pointer min-h-[36px]"
              aria-label="Toggle light/dark theme"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-semibold">{isHi ? 'लाइट' : isMr ? 'लाइट' : isGu ? 'લાઈટ' : 'Light'}</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-slate-700" />
                  <span className="text-xs font-semibold">{isHi ? 'डार्क' : isMr ? 'डार्क' : isGu ? 'ડાર્ક' : 'Dark'}</span>
                </>
              )}
            </button>

            {/* PWA In-App Install Button */}
            <PWAInstallButton lang={lang === 'gu' || lang === 'mr' ? 'hi' : lang} />

            {/* Regional Languages Pill Switcher */}
            <div className="flex items-center bg-slate-800 border border-slate-700 rounded-xl p-0.5">
              {SUPPORTED_LANGUAGES.map((item) => {
                const isActive = lang === item.code;
                return (
                  <button
                    key={item.code}
                    onClick={() => onLanguageChange(item.code)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer min-h-[30px] whitespace-nowrap ${
                      isActive
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : 'text-slate-300 hover:text-white'
                    }`}
                    aria-label={`Switch to ${item.label}`}
                  >
                    {item.nativeLabel}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom row: Feature Navigation Bar */}
        <nav className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer min-h-[38px] ${
                  isActive
                    ? item.isEmergency
                      ? 'bg-rose-500/25 border border-rose-500/50 text-rose-200'
                      : 'bg-amber-500 text-slate-950 shadow-sm'
                    : item.isEmergency
                    ? 'border border-rose-500/30 bg-rose-950/20 text-rose-300 hover:bg-rose-950/40'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80 border border-transparent'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

