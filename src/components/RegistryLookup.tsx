import React, { useState, useEffect, useTransition } from 'react';
import {
  Search,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Building,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Copy,
  Check,
  Scale,
  BookOpen,
  AlertOctagon,
  Info,
  ChevronRight,
  ChevronLeft,
  Filter,
  RefreshCw,
  BadgeAlert,
} from 'lucide-react';
import { Language } from '../i18n';
import {
  SebiEntity,
  DebarredEntity,
  SebiRegulation,
  SebiPrefix,
  lookupSampleRegistry,
  SAMPLE_REGISTRY,
  SEBI_LOOKUP_OFFICIAL_URL,
  SEBI_PORTAL_URL,
  SCORES_OFFICIAL_URL,
} from '../constants/registry';

interface RegistryLookupProps {
  lang: Language;
  prefillQuery?: string;
}

type CategoryTab =
  | 'all'
  | 'SB'
  | 'RA'
  | 'IA'
  | 'MF'
  | 'PM'
  | 'DP'
  | 'debarred'
  | 'regulations'
  | 'prefixes';

interface SearchApiResponse {
  query: string;
  category: string;
  totalEntities: number;
  totalMatched: number;
  page: number;
  limit: number;
  hasMore: boolean;
  entities: SebiEntity[];
  debarredMatches: DebarredEntity[];
  matchedRegulations: SebiRegulation[];
  matchedPrefixes: SebiPrefix[];
  prefixAnalysis?: {
    isValidFormat: boolean;
    prefixMatched?: SebiPrefix;
    explanation: string;
    explanationHi: string;
  };
}

export const RegistryLookup: React.FC<RegistryLookupProps> = ({
  lang,
  prefillQuery = '',
}) => {
  const [query, setQuery] = useState(prefillQuery);
  const [activeCategory, setActiveCategory] = useState<CategoryTab>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedReg, setCopiedReg] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<SearchApiResponse | null>(null);
  const [stats, setStats] = useState<{ totalEntities: number; lastUpdated: string } | null>({
    totalEntities: 12397,
    lastUpdated: 'October 2026',
  });
  const [allDebarred, setAllDebarred] = useState<DebarredEntity[]>([]);
  const [allRegulations, setAllRegulations] = useState<SebiRegulation[]>([]);
  const [allPrefixes, setAllPrefixes] = useState<SebiPrefix[]>([]);

  const isHi = lang === 'hi';
  const isMr = lang === 'mr';
  const isGu = lang === 'gu';

  // Category Tabs Configuration
  const categoryTabs: { id: CategoryTab; labelEn: string; labelHi: string; count?: string }[] = [
    { id: 'all', labelEn: 'All Intermediaries', labelHi: 'सभी संस्थाएं', count: '12,397' },
    { id: 'SB', labelEn: 'Stock Brokers', labelHi: 'स्टॉक ब्रोकर', count: '4,993' },
    { id: 'RA', labelEn: 'Research Analysts', labelHi: 'रिसर्च एनालिस्ट', count: '2,248' },
    { id: 'IA', labelEn: 'Investment Advisers', labelHi: 'इन्वेस्टमेंट एडवाइजर', count: '1,050' },
    { id: 'MF', labelEn: 'Mutual Funds', labelHi: 'म्यूचुअल फंड', count: '61' },
    { id: 'PM', labelEn: 'Portfolio Managers', labelHi: 'पोर्टफोलियो मैनेजर', count: '537' },
    { id: 'DP', labelEn: 'Depositories (DP)', labelHi: 'डिपॉजिटरी (NSDL/CDSL)', count: '1,105' },
    { id: 'debarred', labelEn: '⚠️ Debarred & Alerts', labelHi: '⚠️ प्रतिबंधित व फ्रॉड', count: 'Alerts' },
    { id: 'regulations', labelEn: '📜 SEBI Regulations', labelHi: '📜 सेबी नियम व अधिकार' },
    { id: 'prefixes', labelEn: '🔍 Prefix Decoder', labelHi: '🔍 कोड डिकोडर' },
  ];

  // Quick chips
  const quickChips = [
    { label: 'Zerodha', q: 'zerodha', cat: 'SB' as CategoryTab },
    { label: 'Groww', q: 'groww', cat: 'SB' as CategoryTab },
    { label: 'Angel One', q: 'angel one', cat: 'SB' as CategoryTab },
    { label: '5Paisa', q: '5paisa', cat: 'SB' as CategoryTab },
    { label: 'HDFC Securities', q: 'hdfc securities', cat: 'SB' as CategoryTab },
    { label: 'ICICI Direct', q: 'icici securities', cat: 'SB' as CategoryTab },
    { label: 'SBI Mutual Fund', q: 'sbi mutual fund', cat: 'MF' as CategoryTab },
    { label: 'Baap of Chart (Banned)', q: 'baap of chart', cat: 'debarred' as CategoryTab },
    { label: 'Gunjan Verma (Banned)', q: 'gunjan verma', cat: 'debarred' as CategoryTab },
    { label: 'Bliss Consultants (Ponzi)', q: 'bliss consultants', cat: 'debarred' as CategoryTab },
    { label: 'Finfluencer Ban', q: 'finfluencer', cat: 'regulations' as CategoryTab },
    { label: 'INH Prefix', q: 'INH', cat: 'prefixes' as CategoryTab },
  ];

  // Fetch meta lists once on mount
  useEffect(() => {
    fetch('/api/sebi/stats')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setStats(d))
      .catch(() => {});

    fetch('/api/sebi/debarred')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setAllDebarred(d))
      .catch(() => {});

    fetch('/api/sebi/regulations')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setAllRegulations(d))
      .catch(() => {});

    fetch('/api/sebi/prefixes')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setAllPrefixes(d))
      .catch(() => {});
  }, []);

  // Perform search
  useEffect(() => {
    let isCancelled = false;
    setIsLoading(true);

    const timer = setTimeout(async () => {
      try {
        const catParam =
          activeCategory === 'debarred' ||
          activeCategory === 'regulations' ||
          activeCategory === 'prefixes'
            ? 'all'
            : activeCategory;

        const res = await fetch(
          `/api/sebi/search?q=${encodeURIComponent(query)}&category=${catParam}&page=${currentPage}&limit=20`
        );

        if (res.ok) {
          const data: SearchApiResponse = await res.json();
          if (!isCancelled) {
            setSearchResult(data);
            setIsLoading(false);
          }
        } else {
          throw new Error('API request failed');
        }
      } catch (e) {
        if (!isCancelled) {
          // Offline Fallback using SAMPLE_REGISTRY
          const fallbackMatches = lookupSampleRegistry(query, activeCategory);
          setSearchResult({
            query,
            category: activeCategory,
            totalEntities: SAMPLE_REGISTRY.length,
            totalMatched: fallbackMatches.length,
            page: 1,
            limit: 20,
            hasMore: false,
            entities: fallbackMatches,
            debarredMatches: [],
            matchedRegulations: [],
            matchedPrefixes: [],
          });
          setIsLoading(false);
        }
      }
    }, 200);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [query, activeCategory, currentPage]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedReg(text);
    setTimeout(() => setCopiedReg(null), 2000);
  };

  const handleChipClick = (chip: { q: string; cat: CategoryTab }) => {
    setQuery(chip.q);
    setActiveCategory(chip.cat);
    setCurrentPage(1);
  };

  const handleTabChange = (tabId: CategoryTab) => {
    setActiveCategory(tabId);
    setCurrentPage(1);
  };

  return (
    <div className="w-full max-w-4xl mx-auto rounded-3xl bg-slate-900 border border-slate-800 p-5 sm:p-8 shadow-2xl space-y-6 text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-start gap-3.5">
          <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 shrink-0">
            <Building className="w-7 h-7" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-white">
                {isHi
                  ? 'सेबी (SEBI) सम्पूर्ण डेटाबेस सर्च व सत्यापन'
                  : 'SEBI Official Database & Verification Portal'}
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>
                  {stats?.totalEntities
                    ? `${stats.totalEntities.toLocaleString()} Intermediaries`
                    : '12,397+ Records'}
                </span>
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              {isHi
                ? 'स्टॉक ब्रोकर, रिसर्च एनालिस्ट, एडवाइजर, म्यूचुअल फंड और प्रतिबंधित ऑपरेटरों की आधिकारिक पुष्टि करें।'
                : 'Instant statutory lookup across Stock Brokers, Research Analysts, Investment Advisers, Mutual Funds, and Debarred Entities.'}
            </p>
          </div>
        </div>

        {/* Live SEBI link */}
        <a
          href={SEBI_LOOKUP_OFFICIAL_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-amber-300 hover:text-amber-200 transition shrink-0 self-start sm:self-auto"
        >
          <span>{isHi ? 'आधिकारिक sebi.gov.in' : 'Official sebi.gov.in'}</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Mandatory Statutory Notice */}
      <div className="rounded-2xl bg-amber-950/30 border border-amber-500/30 p-3.5 text-xs text-amber-200/90 flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-amber-300">
            {isHi ? 'महत्वपूर्ण सुरक्षा निर्देश:' : 'Statutory Verification Rule:'}
          </span>{' '}
          {isHi
            ? 'धोखेबाज अक्सर असली सेबी रजिस्ट्रेशन नंबर चुराकर मैसेज में लिख देते हैं। रजिस्ट्रेशन नंबर के साथ-साथ यह जरूर जांचें कि भेजने वाले का ईमेल आधिकारिक डोमेन (@domain.com) से है और बैंक खाता किसी व्यक्ति के नाम पर नहीं है।'
            : 'Fraudsters routinely paste genuine registration numbers copied from SEBI directories. Always cross-verify that the sender email domain matches the official registered domain, and payments never go to personal individual UPI accounts.'}
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setCurrentPage(1);
          }}
          placeholder={
            isHi
              ? 'संस्था का नाम, रजिस्ट्रेशन नंबर, ईमेल डोमेन या कीवर्ड खोजें (उदा. Zerodha, INH000000016, @groww.in, Baap of Chart)...'
              : 'Search by intermediary name, reg number, domain, or operator (e.g. Zerodha, INH000000016, @groww.in, Baap of Chart)...'
          }
          className="w-full rounded-2xl bg-slate-950 border border-slate-700 pl-11 pr-10 py-3.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-amber-500/50 shadow-inner"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setCurrentPage(1);
            }}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1 text-xs"
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      {/* Quick Search Chips */}
      <div className="space-y-1.5">
        <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
          <span>{isHi ? 'लोकप्रिय सर्च:' : 'Quick Searches:'}</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {quickChips.map((chip) => (
            <button
              key={chip.label}
              onClick={() => handleChipClick(chip)}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-300 hover:text-white transition cursor-pointer"
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-slate-800">
        {categoryTabs.map((tab) => {
          const isActive = activeCategory === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
                isActive
                  ? tab.id === 'debarred'
                    ? 'bg-rose-500 text-slate-950 shadow-md font-black'
                    : 'bg-amber-500 text-slate-950 shadow-md font-black'
                  : tab.id === 'debarred'
                  ? 'bg-rose-950/40 text-rose-300 border border-rose-500/30 hover:bg-rose-950/60'
                  : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700/60'
              }`}
            >
              <span>{isHi ? tab.labelHi : tab.labelEn}</span>
              {tab.count && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive
                      ? 'bg-slate-950/30 text-slate-950'
                      : 'bg-slate-900 text-slate-400 border border-slate-700'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* VIEW: DEBARRED ENTITIES / FRAUD ALERTS (Special prominent view) */}
      {(activeCategory === 'debarred' || (searchResult?.debarredMatches && searchResult.debarredMatches.length > 0)) && (
        <div className="space-y-3.5">
          <div className="flex items-center gap-2 text-rose-400">
            <BadgeAlert className="w-5 h-5 text-rose-400 shrink-0" />
            <h3 className="text-sm font-black uppercase tracking-wider">
              {isHi ? 'सेबी आदेश व प्रतिबंधित ऑपरेटर अलर्ट:' : 'SEBI Debarred Entities & Enforcement Orders:'}
            </h3>
          </div>

          <div className="space-y-3">
            {(activeCategory === 'debarred' && !query
              ? allDebarred
              : searchResult?.debarredMatches || []
            ).map((deb) => (
              <div
                key={deb.id}
                className="p-4 sm:p-5 rounded-2xl bg-rose-950/30 border-2 border-rose-500/60 shadow-lg space-y-3 relative overflow-hidden"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-rose-500/30 pb-3">
                  <div>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded bg-rose-500 text-slate-950 uppercase tracking-wide">
                      {deb.status}
                    </span>
                    <h4 className="text-base sm:text-lg font-black text-white mt-1">
                      {deb.name}
                    </h4>
                    {deb.aliases.length > 0 && (
                      <p className="text-xs text-rose-200/80">
                        {isHi ? 'उर्फ / चैनल नाम:' : 'Known aliases / channels:'}{' '}
                        <span className="font-semibold text-rose-100">{deb.aliases.join(', ')}</span>
                      </p>
                    )}
                  </div>

                  <div className="text-left sm:text-right text-xs text-rose-300/80 shrink-0">
                    <span className="block font-mono text-[11px] font-bold">{deb.orderRef}</span>
                    <span className="text-[11px]">{deb.orderDate}</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs sm:text-sm text-slate-200">
                  <p className="leading-relaxed">
                    <strong>{isHi ? 'सेबी का आदेश:' : 'SEBI Order Summary:'}</strong>{' '}
                    {isHi ? deb.summaryHi : deb.summary}
                  </p>
                  <p className="text-xs text-rose-200/90 leading-relaxed bg-rose-900/20 p-2.5 rounded-xl border border-rose-500/20">
                    <strong>{isHi ? 'धोखाधड़ी का तरीका (Modus Operandi):' : 'Modus Operandi:'}</strong>{' '}
                    {deb.modusOperandi}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW: REGULATIONS (Tab Selected) */}
      {activeCategory === 'regulations' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-amber-400">
            <Scale className="w-5 h-5 shrink-0" />
            <h3 className="text-sm font-black uppercase tracking-wider">
              {isHi ? 'प्रमुख सेबी अधिनियम व निवेशक सुरक्षा विनियम:' : 'Key SEBI Acts & Investor Protection Regulations:'}
            </h3>
          </div>

          <div className="space-y-3.5">
            {(query ? searchResult?.matchedRegulations || [] : allRegulations).map((reg) => (
              <div
                key={reg.id}
                className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3"
              >
                <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {reg.shortCode}
                    </span>
                    <h4 className="text-base font-bold text-white mt-1">
                      {isHi ? reg.titleHi : reg.title}
                    </h4>
                  </div>
                </div>

                <div className="space-y-2.5 pt-1">
                  {reg.keySections.map((sec, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 space-y-1"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-amber-400">
                          {sec.section}
                        </span>
                        <span className="text-xs font-semibold text-slate-300">
                          — {isHi ? sec.headingHi : sec.heading}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {isHi ? sec.explanationHi : sec.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW: PREFIX DECODER (Tab Selected or Prefix detected) */}
      {(activeCategory === 'prefixes' || searchResult?.prefixAnalysis) && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-amber-400">
            <BookOpen className="w-5 h-5 shrink-0" />
            <h3 className="text-sm font-black uppercase tracking-wider">
              {isHi ? 'सेबी रजिस्ट्रेशन नंबर डिकोडर:' : 'SEBI Registration Prefix Directory & Validator:'}
            </h3>
          </div>

          {searchResult?.prefixAnalysis && (
            <div
              className={`p-4 rounded-2xl border ${
                searchResult.prefixAnalysis.isValidFormat
                  ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                  : 'bg-rose-950/30 border-rose-500/40 text-rose-200'
              } text-xs leading-relaxed`}
            >
              <div className="font-bold mb-1 flex items-center gap-1.5">
                {searchResult.prefixAnalysis.isValidFormat ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <AlertOctagon className="w-4 h-4 text-rose-400" />
                )}
                <span>
                  {searchResult.prefixAnalysis.isValidFormat
                    ? isHi
                      ? 'वैध सेबी प्रारूप संरचना'
                      : 'Valid SEBI Format Structure'
                    : isHi
                    ? 'अमान्य सेबी प्रारूप'
                    : 'Unrecognized Prefix Format'}
                </span>
              </div>
              <p>
                {isHi
                  ? searchResult.prefixAnalysis.explanationHi
                  : searchResult.prefixAnalysis.explanation}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {allPrefixes.map((p) => (
              <div
                key={p.prefix}
                className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-black text-amber-400 text-sm">
                    {p.prefix}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    उदा. {p.example}
                  </span>
                </div>
                <div className="text-xs font-bold text-slate-100">
                  {isHi ? p.categoryHi : p.category}
                </div>
                <div className="text-[11px] text-slate-400">
                  {isHi ? 'प्राधिकरण:' : 'Authority:'} {p.authority}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW: MAIN INTERMEDIARY SEARCH RESULTS */}
      {activeCategory !== 'debarred' && activeCategory !== 'regulations' && activeCategory !== 'prefixes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
            <span>
              {isLoading ? (
                <span className="flex items-center gap-2 text-amber-400 font-semibold">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  {isHi ? 'खोज रहे हैं...' : 'Searching SEBI records...'}
                </span>
              ) : searchResult ? (
                isHi
                  ? `कुल ${searchResult.totalMatched.toLocaleString()} परिणाम मिले (पेज ${searchResult.page})`
                  : `Showing ${searchResult.entities.length} of ${searchResult.totalMatched.toLocaleString()} results (Page ${searchResult.page})`
              ) : (
                'Loading...'
              )}
            </span>

            {searchResult && searchResult.totalMatched > 20 && (
              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage <= 1 || isLoading}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold text-slate-200 transition flex items-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>{isHi ? 'पिछला' : 'Prev'}</span>
                </button>
                <span className="font-mono text-xs font-bold text-amber-400">{currentPage}</span>
                <button
                  disabled={!searchResult.hasMore || isLoading}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold text-slate-200 transition flex items-center gap-1"
                >
                  <span>{isHi ? 'अगला' : 'Next'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {searchResult && searchResult.entities.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-3">
              <div className="p-3 rounded-full bg-slate-900 w-12 h-12 mx-auto flex items-center justify-center text-slate-400">
                <Search className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-200">
                {isHi ? 'कोई मेल नहीं मिला' : 'No Intermediaries Found'}
              </h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                {isHi
                  ? `"${query}" के लिए कोई रजिस्टर्ड संस्था नहीं मिली। कृपया नाम की वर्तनी जांचें या आधिकारिक सेबी पोर्टल पर सीधे सर्च करें।`
                  : `No registered intermediary matching "${query}". Double check spelling or use the official SEBI directory.`}
              </p>
              <div className="pt-2">
                <a
                  href={SEBI_LOOKUP_OFFICIAL_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition"
                >
                  <span>{isHi ? 'आधिकारिक सेबी पोर्टल पर खोजें' : 'Search on sebi.gov.in'}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {searchResult?.entities.map((entity, idx) => (
                <div
                  key={`${entity.regNumber}_${idx}`}
                  className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition space-y-3 shadow-md"
                >
                  {/* Row 1: Reg Number, Category, Status */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-amber-300 text-xs sm:text-sm tracking-wide">
                        {entity.regNumber}
                      </span>
                      <button
                        onClick={() => handleCopy(entity.regNumber)}
                        title="Copy Registration Number"
                        className="text-slate-400 hover:text-amber-300 p-1 rounded hover:bg-slate-900 transition"
                      >
                        {copiedReg === entity.regNumber ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {isHi ? entity.categoryHi : entity.category}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          entity.status === 'Active'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        }`}
                      >
                        {entity.status}
                      </span>
                    </div>
                  </div>

                  {/* Row 2: Name & Trade Name */}
                  <div>
                    <h4 className="font-bold text-sm sm:text-base text-slate-100">
                      {entity.name}
                    </h4>
                    {entity.tradeName && entity.tradeName !== entity.name && (
                      <p className="text-xs text-amber-400 font-semibold mt-0.5">
                        {isHi ? 'ट्रेड नाम (Trade Name):' : 'Trade Name:'} {entity.tradeName}
                      </p>
                    )}
                  </div>

                  {/* Row 3: Official Domain Highlight & Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-400 pt-1">
                    {entity.registeredEmailDomain ? (
                      <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-[11px] block text-slate-400">
                          {isHi ? 'अधिकृत ईमेल डोमेन (Email Domain):' : 'Official Registered Domain:'}
                        </span>
                        <span className="text-emerald-400 font-mono font-bold text-xs sm:text-sm">
                          @{entity.registeredEmailDomain}
                        </span>
                      </div>
                    ) : (
                      <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-[11px] block text-slate-400">
                          {isHi ? 'ईमेल:' : 'Registered Email:'}
                        </span>
                        <span className="text-slate-300 font-mono text-xs break-all">
                          {entity.email || 'N/A'}
                        </span>
                      </div>
                    )}

                    <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-[11px] block text-slate-400">
                        {isHi ? 'वैधता (Validity):' : 'Validity:'}
                      </span>
                      <span className="text-slate-200 font-medium">
                        {entity.validFrom ? `${entity.validFrom} → ` : ''}
                        {entity.validTo || entity.validSince || 'Perpetual'}
                      </span>
                    </div>
                  </div>

                  {/* Row 4: Address, Contact Person & City */}
                  {(entity.address || entity.city || entity.contactPerson) && (
                    <div className="text-[11px] text-slate-400 space-y-0.5 pt-1 border-t border-slate-900">
                      {entity.contactPerson && (
                        <div>
                          <span className="text-slate-500 font-semibold">
                            {isHi ? 'संपर्क व्यक्ति:' : 'Contact:'}{' '}
                          </span>
                          <span className="text-slate-300">{entity.contactPerson}</span>
                        </div>
                      )}
                      {entity.city && (
                        <div>
                          <span className="text-slate-500 font-semibold">
                            {isHi ? 'स्थान:' : 'Location:'}{' '}
                          </span>
                          <span className="text-slate-300">
                            {entity.city}, {entity.state} {entity.pincode ? `(${entity.pincode})` : ''}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Row 5: Action Link */}
                  <div className="pt-1 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 font-mono">
                      {entity.exchange ? `Exchanges: ${entity.exchange}` : 'SEBI Statutory Record'}
                    </span>
                    <a
                      href={`https://www.sebi.gov.in/sebiweb/other/OtherAction.do?doRecognised=yes`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition"
                    >
                      <span>{isHi ? 'सेबी साइट पर पुष्टि करें' : 'Verify on SEBI'}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination at bottom */}
          {searchResult && searchResult.totalMatched > 20 && (
            <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800">
              <span>
                {isHi
                  ? `पेज ${currentPage} (कुल ${searchResult.totalMatched.toLocaleString()} परिणाम)`
                  : `Page ${currentPage} of ${Math.ceil(searchResult.totalMatched / 20)}`}
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage <= 1 || isLoading}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold text-slate-200 transition flex items-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>{isHi ? 'पिछला' : 'Previous'}</span>
                </button>
                <button
                  disabled={!searchResult.hasMore || isLoading}
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold text-slate-200 transition flex items-center gap-1"
                >
                  <span>{isHi ? 'अगला' : 'Next'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3 Golden Rules to Detect Impersonation & Cloned Intermediaries */}
      <div className="rounded-2xl bg-slate-950 border border-slate-800 p-5 space-y-3 mt-6">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-amber-400" />
          <h4 className="text-sm font-bold text-slate-200">
            {isHi ? 'क्लोन (नकली) ब्रोकर को पहचानने के 3 स्वर्णिम नियम:' : 'How to Spot Impersonation & Cloned Registrations:'}
          </h4>
        </div>

        <div className="space-y-2.5 text-xs text-slate-300">
          <div className="flex items-start gap-2.5">
            <span className="font-black text-amber-400 shrink-0 bg-slate-900 rounded px-1.5 py-0.5">1</span>
            <span>
              <strong className="text-amber-300">{isHi ? 'बैंक खाता नाम:' : 'Corporate Bank Account:'}</strong>{' '}
              {isHi
                ? 'पैसा कभी किसी व्यक्ति के निजी बैंक खाते या व्यक्तिगत UPI (उदा. ramesh@okaxis) पर नहीं भेजना चाहिए। पैसा हमेशा सेबी में पंजीकृत कंपनी के आधिकारिक बैंक खाते में ही जाना चाहिए।'
                : 'Account name must match the registered company name. Never send funds to an individual’s personal savings account or personal UPI VPA.'}
            </span>
          </div>

          <div className="flex items-start gap-2.5">
            <span className="font-black text-amber-400 shrink-0 bg-slate-900 rounded px-1.5 py-0.5">2</span>
            <span>
              <strong className="text-amber-300">{isHi ? 'अधिकृत ईमेल डोमेन:' : 'Official Email Domain:'}</strong>{' '}
              {isHi
                ? 'मैसेज भेजने वाले का ईमेल @gmail.com या @yahoo.com नहीं, बल्कि सेबी लिस्टेड कंपनी के आधिकारिक डोमेन (उदा. @zerodha.com या @5paisa.com) से होना चाहिए।'
                : 'Communication must originate from the verified corporate domain, never from free webmail accounts like Gmail, Yahoo, or ProtonMail.'}
            </span>
          </div>

          <div className="flex items-start gap-2.5">
            <span className="font-black text-amber-400 shrink-0 bg-slate-900 rounded px-1.5 py-0.5">3</span>
            <span>
              <strong className="text-amber-300">{isHi ? 'चोरी किया गया नंबर:' : 'Stolen Number Detection:'}</strong>{' '}
              {isHi
                ? 'धोखेबाज अक्सर सेबी की सार्वजनिक डायरेक्टरी से असली ब्रोकरों/एनालिस्टों का नंबर चुराकर मैसेज में चिपका देते हैं। हमेशा सेबी पोर्टल पर दिए गए फोन व पते से मिलान करें।'
                : 'Fraudsters copy legitimate SEBI registration numbers onto fake PDF brochures and WhatsApp chats. Always confirm the official telephone and address listed on sebi.gov.in.'}
            </span>
          </div>
        </div>
      </div>

      {/* Direct link to SEBI official live registry */}
      <div className="pt-2">
        <a
          href={SEBI_LOOKUP_OFFICIAL_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full min-h-[50px] rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
        >
          <span>{isHi ? 'सेबी (SEBI) की आधिकारिक डायरेक्टरी खोलें' : 'Open Live Official SEBI Directory'}</span>
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
};
