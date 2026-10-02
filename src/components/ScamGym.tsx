import React, { useState } from 'react';
import {
  Trophy,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Users,
  Flame,
  ArrowRight,
  ShieldCheck,
  Award,
} from 'lucide-react';
import { Language } from '../i18n';

interface ScamGymProps {
  lang: Language;
  onExit?: () => void;
}

interface SimulatedChatMessage {
  id: string;
  sender: string;
  senderRole?: 'admin' | 'shill' | 'member';
  time: string;
  text: string;
  hasProfitCard?: boolean;
  profitAmount?: string;
  isManipulative: boolean;
  tacticCategory?: string;
  tacticExplanationEn?: string;
  tacticExplanationHi?: string;
}

// Strictly FICTIONAL tickers and companies (Hard Guardrail)
const SIMULATED_MESSAGES: SimulatedChatMessage[] = [
  {
    id: 'msg-1',
    sender: 'VIP Market Guru (Admin)',
    senderRole: 'admin',
    time: '08:45 AM',
    text: '🚨 CONFIDENTIAL OPERATOR LEAK: Fictional ticker XYZ_CORP bulk deal confirmed by insiders. Target 250% gains in 3 trading sessions! Guaranteed zero risk!',
    isManipulative: true,
    tacticCategory: 'Insider & Guaranteed Return',
    tacticExplanationEn: 'Claiming insider leaks and guaranteed returns is illegal under SEBI regulations and typical of penny-stock pump schemes.',
    tacticExplanationHi: 'इनसाइडर खबर और बिना रिस्क गारंटी का दावा सेबी नियमों के अनुसार अवैध है।',
  },
  {
    id: 'msg-2',
    sender: 'Ramesh Sharma (Member)',
    senderRole: 'shill',
    time: '08:46 AM',
    text: 'Sir aap bhagwan ho 🙏 kal ke ABC_GLOBAL call me maine 48,000 profit banaya! Screenshot attached!',
    hasProfitCard: true,
    profitAmount: '+₹48,250 (100% Win)',
    isManipulative: true,
    tacticCategory: 'Shill Testimonial & Fake P&L',
    tacticExplanationEn: 'Scammers plant paid confederates (shills) with manipulated P&L screenshots to build fake social proof.',
    tacticExplanationHi: 'धोखेबाज नकली मेंबर्स (शिल्स) से फर्जी मुनाफे के स्क्रीनशॉट पोस्ट करवाते हैं ताकि आप भरोसा कर लें।',
  },
  {
    id: 'msg-3',
    sender: 'Vikram Joshi (Investor)',
    senderRole: 'member',
    time: '08:48 AM',
    text: 'Did anyone read the quarterly audit report published on BSE official website yesterday?',
    isManipulative: false,
  },
  {
    id: 'msg-4',
    sender: 'VIP Market Guru (Admin)',
    senderRole: 'admin',
    time: '08:50 AM',
    text: '⏰ LAST CHANCE: Only 4 premium slots left! Send Rs 3,500 fees via personal UPI to: admin.profits@okaxis. Offer closes in 10 minutes!',
    isManipulative: true,
    tacticCategory: 'Artificial Urgency & Personal UPI',
    tacticExplanationEn: 'Creating false countdowns and asking for fees to personal UPI accounts is a classic red flag.',
    tacticExplanationHi: '10 मिनट की जल्दबाजी और पर्सनल यूपीआई आईडी पर पैसे मांगना धोखाधड़ी का पक्का संकेत है।',
  },
  {
    id: 'msg-5',
    sender: 'Tech Support (Assistant)',
    senderRole: 'admin',
    time: '08:52 AM',
    text: 'Please install our exclusive terminal app APK from this link: http://fictional-trader-app.apk to receive 1-second faster execution.',
    isManipulative: true,
    tacticCategory: 'Malicious APK Sideload',
    tacticExplanationEn: 'Never install APK files sent on messaging channels. They steal banking OTPs and credentials.',
    tacticExplanationHi: 'व्हाट्सएप या टेलीग्राम से एपीके (.apk) कभी डाउनलोड न करें, यह बैंक खाते को खाली कर सकता है।',
  },
];

// Pre / Post Resilience Quiz
interface QuizQuestion {
  questionEn: string;
  questionHi: string;
  optionsEn: string[];
  optionsHi: string[];
  correctIndex: number;
  explanationEn: string;
  explanationHi: string;
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    questionEn: 'Can any SEBI-registered advisor promise "100% guaranteed returns"?',
    questionHi: 'क्या कोई भी सेबी-पंजीकृत सलाहकार "100% पक्का रिटर्न" का कानूनी वादा कर सकता है?',
    optionsEn: ['Yes, if registered with SEBI', 'No, guaranteed returns in equities are strictly illegal', 'Yes, only for VIP groups'],
    optionsHi: ['हाँ, यदि सेबी से मान्यता प्राप्त हो', 'नहीं, शेयर बाजार में गारंटीड रिटर्न कानूनी रूप से पूरी तरह अवैध है', 'हाँ, केवल वीआईपी ग्रुप्स के लिए'],
    correctIndex: 1,
    explanationEn: 'SEBI regulations strictly prohibit promising guaranteed or fixed returns in equity and F&O.',
    explanationHi: 'सेबी नियमों के तहत शेयर व डेरिवेटिव में गारंटीड रिटर्न का वादा पूरी तरह गैरकानूनी है।',
  },
  {
    questionEn: 'How should fees be paid to a legitimate SEBI advisor?',
    questionHi: 'सेबी-पंजीकृत सलाहकार को परामर्श शुल्क कैसे देना चाहिए?',
    optionsEn: ['To personal UPI (e.g. name@okaxis)', 'To official registered corporate bank account in firm’s name', 'Cash or gift card'],
    optionsHi: ['निजी यूपीआई पर (उदा. name@okaxis)', 'संस्था के आधिकारिक कॉर्पोरेट बैंक खाते में', 'नकद या गिफ्ट कार्ड द्वारा'],
    correctIndex: 1,
    explanationEn: 'Legitimate advisors accept payments exclusively in official corporate bank accounts, never personal UPI IDs.',
    explanationHi: 'असली सलाहकार केवल संस्था के नाम वाले आधिकारिक बैंक खाते में फीस लेते हैं।',
  },
  {
    questionEn: 'Why do scammers post P&L screenshots showing big profits in groups?',
    questionHi: 'धोखेबाज ग्रुप्स में भारी मुनाफे के स्क्रीनशॉट क्यों भेजते हैं?',
    optionsEn: ['To teach risk management', 'To create fake social proof and FOMO so you rush without checking', 'Because screenshots cannot be faked'],
    optionsHi: ['जोखिम प्रबंधन सिखाने के लिए', 'झूठी विश्वसनीयता और जल्दबाजी (FOMO) पैदा करने के लिए', 'क्योंकि स्क्रीनशॉट असली ही होते हैं'],
    correctIndex: 1,
    explanationEn: 'Screenshots are easily falsified using demo accounts or HTML inspection tools to manipulate members.',
    explanationHi: 'स्क्रीनशॉट डेमो खाते या सॉफ्टवेयर से आसानी से फर्जी बनाए जा सकते हैं।',
  },
  {
    questionEn: 'If a group asks you to download an ".apk" app, what should you do?',
    questionHi: 'यदि कोई ग्रुप आपसे ".apk" ऐप डाउनलोड करने को कहे, तो क्या करें?',
    optionsEn: ['Download immediately for faster trades', 'Never install APKs from chat links; use only official app stores', 'Install and enter bank credentials'],
    optionsHi: ['तुरंत डाउनलोड करें', 'चैट लिंक से कभी एपीके इंस्टॉल न करें; केवल अधिकृत ऐप स्टोर से ही लें', 'इंस्टॉल कर बैंक विवरण भरें'],
    correctIndex: 1,
    explanationEn: 'Sideloaded APKs frequently contain keyloggers and malware that capture SMS and OTPs.',
    explanationHi: 'अनजान लिंक वाले एपीके आपके फोन से ओटीपी और बैंक पासवर्ड चुरा लेते हैं।',
  },
  {
    questionEn: 'What is the immediate first call to make if money was transferred to a fraud scheme?',
    questionHi: 'यदि किसी धोखेबाज को पैसे ट्रांसफर हो गए हों, तो तुरंत सबसे पहले किस नंबर पर फोन करना चाहिए?',
    optionsEn: ['Local newspaper', 'National Cyber Crime Helpline 1930 & your bank', 'Wait 7 days to see if stock rises'],
    optionsHi: ['स्थानीय समाचार पत्र', 'राष्ट्रीय साइबर हेल्पलाइन 1930 और अपने बैंक को', '7 दिन इंतजार करें'],
    correctIndex: 1,
    explanationEn: 'Dialing 1930 within the golden hour enables immediate transaction liens before money is withdrawn.',
    explanationHi: 'पहले घंटे में 1930 पर कॉल करने से धोखेबाज का खाता तुरंत फ्रीज किया जा सकता है।',
  },
];

export const ScamGym: React.FC<ScamGymProps> = ({ lang, onExit }) => {
  const [phase, setPhase] = useState<'intro' | 'sim' | 'quiz' | 'completed'>('intro');
  const [flaggedMessages, setFlaggedMessages] = useState<Record<string, boolean>>({});
  const [simScore, setSimScore] = useState(0);

  // Pre vs Post quiz state
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [preScore] = useState(2); // Simulated baseline baseline (40%)
  const isHi = lang === 'hi';

  const handleFlagMessage = (msg: SimulatedChatMessage) => {
    if (flaggedMessages[msg.id]) return;

    setFlaggedMessages((prev) => ({ ...prev, [msg.id]: true }));
    if (msg.isManipulative) {
      setSimScore((prev) => prev + 25);
    }
  };

  const handleSelectQuizAnswer = (qIdx: number, aIdx: number) => {
    const updated = [...quizAnswers];
    updated[qIdx] = aIdx;
    setQuizAnswers(updated);
  };

  const calculateFinalQuizScore = () => {
    let score = 0;
    QUIZ_QUESTIONS.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correctIndex) {
        score++;
      }
    });
    return score;
  };

  return (
    <div className="w-full max-w-2xl mx-auto rounded-3xl bg-slate-900 border border-amber-500/40 p-6 sm:p-8 shadow-2xl space-y-6 text-slate-100">
      {/* Intro Screen */}
      {phase === 'intro' && (
        <div className="text-center space-y-5 py-4">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Flame className="w-8 h-8 animate-pulse" />
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isHi ? 'प्रैक्टिकल स्कैम सिमुलेटर' : 'Interactive Scam Gym Simulator'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              {isHi ? 'स्कैम जिम (Scam Gym)' : 'Ruko Scam Gym: Train Your Instincts'}
            </h2>
            <p className="text-sm text-slate-300 max-w-md mx-auto mt-2 leading-relaxed">
              {isHi
                ? 'एक वास्तविक व्हाट्सएप टिप ग्रुप का 2-मिनट का सिम्युलेशन। संदिग्ध संदेशों को पहचानें और टैप करें। शून्य वास्तविक पैसा, शत-प्रतिशत सतर्कता।'
                : 'Experience a realistic 2-minute simulated WhatsApp stock tip group. Tap red flags to expose psychological manipulation with zero financial risk.'}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center max-w-md mx-auto py-2">
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-lg font-black text-amber-400">4</span>
              <p className="text-[11px] text-slate-400">{isHi ? 'लाल झंडे' : 'Red Flags'}</p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-lg font-black text-emerald-400">2 Min</span>
              <p className="text-[11px] text-slate-400">{isHi ? 'अभ्यास' : 'Drill'}</p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-lg font-black text-blue-400">5 Qs</span>
              <p className="text-[11px] text-slate-400">{isHi ? 'क्विज' : 'Resilience Quiz'}</p>
            </div>
          </div>

          <button
            onClick={() => setPhase('sim')}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-base shadow-xl shadow-amber-500/25 active:scale-95 transition cursor-pointer"
          >
            {isHi ? 'सिमुलेशन शुरू करें' : 'Enter Simulated Group'}
          </button>
        </div>
      )}

      {/* WhatsApp Simulated Group Chat */}
      {phase === 'sim' && (
        <div className="space-y-4">
          {/* Chat Header */}
          <div className="flex items-center justify-between bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-700 flex items-center justify-center text-white font-black text-sm">
                🚀
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">
                  🔥 VIP Bull Jackpot Calls (Fictional)
                </h3>
                <p className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Users className="w-3 h-3 text-emerald-400" />
                  <span>14,280 members • Tap suspicious messages to flag</span>
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                Score: {simScore}/100
              </span>
            </div>
          </div>

          <p className="text-xs text-amber-300 text-center font-medium">
            👇 {isHi ? 'संदेश पर टैप करें जो आपको धोखे का संकेत लगे:' : 'Tap any message that looks like financial manipulation:'}
          </p>

          {/* Messages list */}
          <div className="space-y-3 max-h-96 overflow-y-auto p-1">
            {SIMULATED_MESSAGES.map((msg) => {
              const isFlagged = flaggedMessages[msg.id];
              return (
                <div
                  key={msg.id}
                  onClick={() => handleFlagMessage(msg)}
                  className={`p-4 rounded-2xl border transition cursor-pointer relative ${
                    isFlagged
                      ? msg.isManipulative
                        ? 'bg-rose-950/40 border-rose-500 text-slate-100 shadow-md ring-1 ring-rose-500/50'
                        : 'bg-emerald-950/30 border-emerald-500 text-slate-200'
                      : 'bg-slate-950 border-slate-800 hover:border-amber-500/50'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span
                      className={`font-bold ${
                        msg.senderRole === 'admin'
                          ? 'text-amber-400'
                          : msg.senderRole === 'shill'
                          ? 'text-rose-400'
                          : 'text-slate-300'
                      }`}
                    >
                      {msg.sender}
                    </span>
                    <span className="text-slate-400 text-[10px]">{msg.time}</span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                    {msg.text}
                  </p>

                  {/* Fictional P&L Card Preview */}
                  {msg.hasProfitCard && (
                    <div className="mt-2.5 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-semibold">
                        Fictional Intraday P&L:
                      </span>
                      <span className="font-mono font-black text-emerald-400 text-sm">
                        {msg.profitAmount}
                      </span>
                    </div>
                  )}

                  {/* Explanatory Reveal on Click */}
                  {isFlagged && (
                    <div className="mt-3 pt-2.5 border-t border-slate-800/80 text-xs">
                      {msg.isManipulative ? (
                        <div className="flex items-start gap-2 text-rose-300">
                          <CheckCircle2 className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-rose-400 uppercase tracking-wide text-[10px] block">
                              Red Flag Caught: {msg.tacticCategory}
                            </span>
                            <span>{isHi ? msg.tacticExplanationHi : msg.tacticExplanationEn}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start gap-2 text-emerald-300">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>
                            {isHi
                              ? 'यह एक सामान्य वैध प्रश्न है (आधिकारिक BSE रिपोर्ट की बात हो रही है)।'
                              : 'This is a genuine inquiry citing official exchange reports.'}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Proceed to Quiz Button */}
          <div className="pt-2 flex justify-between items-center">
            <span className="text-xs text-slate-400">
              {Object.keys(flaggedMessages).length} of 4 flagged
            </span>
            <button
              onClick={() => setPhase('quiz')}
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
            >
              <span>{isHi ? 'क्विज पर आगे बढ़ें' : 'Take Resilience Quiz'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Pre vs Post Resilience Quiz */}
      {phase === 'quiz' && (
        <div className="space-y-5">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-lg font-black text-white">
              {isHi ? 'निवेशक सुरक्षा क्विज (5 प्रश्न)' : 'Investor Resilience Quiz (5 Questions)'}
            </h3>
            <p className="text-xs text-slate-400">
              {isHi
                ? 'देखते हैं कि सिमुलेशन के बाद आपका सतर्कता स्कोर कितना बढ़ा:'
                : 'Test your understanding against regulatory and safety concepts:'}
            </p>
          </div>

          <div className="space-y-5 max-h-96 overflow-y-auto p-1">
            {QUIZ_QUESTIONS.map((q, qIdx) => (
              <div key={qIdx} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
                <p className="text-xs sm:text-sm font-bold text-slate-200">
                  {qIdx + 1}. {isHi ? q.questionHi : q.questionEn}
                </p>

                <div className="space-y-1.5">
                  {(isHi ? q.optionsHi : q.optionsEn).map((opt, optIdx) => {
                    const isSelected = quizAnswers[qIdx] === optIdx;
                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => handleSelectQuizAnswer(qIdx, optIdx)}
                        className={`w-full text-left p-2.5 rounded-xl border text-xs font-medium transition cursor-pointer min-h-[44px] ${
                          isSelected
                            ? 'bg-amber-500/20 border-amber-500 text-amber-200 font-bold'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-850'
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setPhase('completed')}
            disabled={quizAnswers.length < 5}
            className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm transition active:scale-95 cursor-pointer disabled:opacity-50"
          >
            {isHi ? 'अंतिम सतर्कता स्कोर देखें' : 'View Resilience Scorecard'}
          </button>
        </div>
      )}

      {/* Completed Scorecard */}
      {phase === 'completed' && (
        <div className="text-center space-y-6 py-4">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Trophy className="w-8 h-8" />
          </div>

          <div>
            <h3 className="text-2xl font-black text-white">
              {isHi ? 'शानदार! आपकी सतर्कता में भारी सुधार हुआ' : 'Resilience Breakthrough!'}
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              {isHi
                ? 'आपने धोखाधड़ी के सभी प्रमुख मनोवैज्ञानिक हथकंडों को सफलतापूर्वक पहचान लिया।'
                : 'You successfully identified social manipulation and regulatory red flags.'}
            </p>
          </div>

          {/* Before vs After Score Delta */}
          <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <div className="border-r border-slate-800 pr-3">
              <span className="text-xs text-slate-400 font-semibold block">
                {isHi ? 'शुरुआती स्कोर (Baseline)' : 'Initial Baseline'}
              </span>
              <span className="text-2xl font-black text-slate-400">
                {preScore}/5 (40%)
              </span>
            </div>
            <div className="pl-3">
              <span className="text-xs text-emerald-400 font-bold block">
                {isHi ? 'अभ्यास के बाद (Post-Gym)' : 'After Scam Gym'}
              </span>
              <span className="text-2xl font-black text-emerald-400">
                {calculateFinalQuizScore()}/5 ({Math.round((calculateFinalQuizScore() / 5) * 100)}%)
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-200 text-left space-y-1">
            <span className="font-bold text-emerald-300 block">
              🛡️ {isHi ? '3 सुनहरे नियम हमेशा याद रखें:' : '3 Golden Rules for Bharat:'}
            </span>
            <p>1. {isHi ? 'शेयर बाजार में कोई गारंटीड रिटर्न नहीं होता।' : 'No one can legally guarantee stock market returns.'}</p>
            <p>2. {isHi ? 'निजी यूपीआई पर कभी निवेश का पैसा न भेजें।' : 'Never transfer investment money to personal UPI accounts.'}</p>
            <p>3. {isHi ? 'धोखाधड़ी होते ही तुरंत 1930 पर कॉल करें।' : 'Dial 1930 within the golden hour if money was transferred.'}</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => {
                setPhase('intro');
                setFlaggedMessages({});
                setSimScore(0);
                setQuizAnswers([]);
              }}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition cursor-pointer min-h-[44px]"
            >
              <RotateCcw className="w-4 h-4 text-amber-400" />
              <span>{isHi ? 'पुनः अभ्यास करें' : 'Retake Gym'}</span>
            </button>

            {onExit && (
              <button
                onClick={onExit}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition cursor-pointer min-h-[44px]"
              >
                {isHi ? 'मुख्य स्क्रीन पर लौटें' : 'Back to Message Verifier'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
