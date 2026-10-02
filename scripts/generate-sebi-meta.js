import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEBARRED_ENTITIES = [
  {
    id: 'deb_001',
    name: 'Nasiruddin Ansari ("Baap of Chart")',
    aliases: ['Baap of Chart', 'Nasir Ansari', 'Golden Strategy'],
    category: 'Unregistered Investment Advisory & Social Media Tipster',
    orderDate: '2023-10-25',
    orderRef: 'SEBI/WTM/ASB/MIRSD/15286/2023-24',
    summary: 'Debarred from securities market. Ordered to refund ₹17.20 crore disgorged fees. Promised 90%+ accuracy and assured profits to retail investors on Telegram & YouTube without SEBI registration.',
    summaryHi: 'सेबी द्वारा सिक्योरिटीज मार्केट से प्रतिबंधित। ₹17.20 करोड़ वापस करने का आदेश। बिना सेबी रजिस्ट्रेशन टेलीग्राम और यूट्यूब पर 90%+ सटीक मुनाफे का झूठा वादा किया।',
    status: 'Debarred / Impounded',
    modusOperandi: 'Sold expensive "educational courses" which actually provided real-time buy/sell stock options tips with guaranteed returns.',
    flagKeywords: ['baap of chart', 'nasiruddin', 'nasir ansari']
  },
  {
    id: 'deb_002',
    name: 'Gunjan Verma',
    aliases: ['Gunjan Verma Calls', 'Option Queen Gunjan'],
    category: 'Telegram Stock Tipster',
    orderDate: '2024-02-14',
    orderRef: 'SEBI/WTM/SK/MIRSD/23910/2023-24',
    summary: 'Banned for promising 800% guaranteed returns on Telegram channels and running unauthorized trading advice schemes.',
    summaryHi: 'टेलीग्राम चैनलों पर 800% गारंटीड रिटर्न का वादा करने और अनाधिकृत टिप्स स्कीम चलाने के आरोप में सेबी द्वारा प्रतिबंधित।',
    status: 'Debarred',
    modusOperandi: 'Created fake screenshots of bumper profits on WhatsApp/Telegram and solicited funds into personal savings bank accounts.',
    flagKeywords: ['gunjan verma', 'option queen gunjan']
  },
  {
    id: 'deb_003',
    name: 'Ashesh Mehta & Shivangi Mehta (Bliss Consultants)',
    aliases: ['Bliss Consultants', 'Different Art Scheme'],
    category: 'Illegal Collective Investment / Ponzi Scheme',
    orderDate: '2023-05-18',
    orderRef: 'SEBI/WTM/AB/EFD1/12876/2023-24',
    summary: 'Restrained from market. Ran an illicit Ponzi scheme under Bliss Consultants promising 2.5% fixed monthly returns, collecting over ₹1,000+ crore from retail investors.',
    summaryHi: 'मार्केट से प्रतिबंधित। ब्लिस कंसल्टेंट्स के नाम पर 2.5% निश्चित मासिक रिटर्न का झांसा देकर ₹1000+ करोड़ की अवैध पोंजी स्कीम चलाई।',
    status: 'Debarred / Criminal Prosecution',
    modusOperandi: 'Guaranteed 30% annual returns through an algorithmic trading software called "Different Art", diverting funds to offshore and personal accounts.',
    flagKeywords: ['bliss consultants', 'ashesh mehta', 'shivangi mehta', 'different art']
  },
  {
    id: 'deb_004',
    name: 'Mansun Consultancy Private Limited & PR Sundar',
    aliases: ['PR Sundar', 'Mansun Consultancy'],
    category: 'Unregistered Investment Advisory via Social Media',
    orderDate: '2023-05-25',
    orderRef: 'SEBI/Settlement/Order/2023/164',
    summary: 'Agreed to 1-year trading debarment and ₹46 lakh settlement + fee disgorgement for providing unregistered investment advisory through website and social media.',
    summaryHi: 'बिना रजिस्ट्रेशन सोशल मीडिया और वेबसाइट के जरिए निवेश सलाह देने पर 1 साल के लिए मार्केट बैन और सेटलमेंट पेनल्टी स्वीकार की।',
    status: 'Settlement & Debarment',
    modusOperandi: 'Collected fees for advisory packages and option recommendations without holding a valid SEBI Investment Adviser (INA) registration.',
    flagKeywords: ['pr sundar', 'p.r. sundar', 'mansun consultancy']
  },
  {
    id: 'deb_005',
    name: 'Ravindra Balu Bharti (Bharti Share Market)',
    aliases: ['Bharti Share Market', 'Ravindra Bharti Education'],
    category: 'Unregistered Advisory & Guaranteed Profit Scheme',
    orderDate: '2024-04-12',
    orderRef: 'SEBI/WTM/AN/MIRSD/31415/2024-25',
    summary: 'Interim order impounding ₹83.38 crore unlawful gains. Offered investment schemes promising up to 1000% returns to investors through seminars and video channels.',
    summaryHi: '₹83.38 करोड़ की अवैध कमाई जब्त करने का अंतरिम आदेश। सेमिनार और वीडियो के माध्यम से निवेशकों को 1000% तक रिटर्न का झूठा आश्वासन दिया।',
    status: 'Debarred / Funds Frozen',
    modusOperandi: 'Promised guaranteed 25% to 1000% annual returns on capital, asking investors to deposit funds for managed trading.',
    flagKeywords: ['ravindra bharti', 'bharti share market', 'ravindra balu bharti']
  },
  {
    id: 'deb_006',
    name: 'Tradetron Automated Strategies Unregistered Sellers',
    aliases: ['Algo Guaranteed Trading', 'Auto Wealth Bot'],
    category: 'Unauthorized Algorithmic Trading Sellers',
    orderDate: '2024-01-19',
    orderRef: 'SEBI/HO/MIRSD/MIRSD-PoD-1/P/CIR/2024/09',
    summary: 'SEBI cautioned investors against subscribing to third-party algos promising fixed returns or zero-risk hedging on marketplace platforms.',
    summaryHi: 'सेबी ने तीसरे पक्ष के एल्गो बॉट्स और फिक्स्ड रिटर्न का दावा करने वाली अनधिकृत ऑटोमेटेड स्ट्रैटेजीज से बचने की चेतावनी जारी की।',
    status: 'Enforcement Alert / Caution',
    modusOperandi: 'Selling pre-configured automated API algos with exaggerated backtested returns claiming 500% profit with zero drawdown.',
    flagKeywords: ['tradetron algo', 'guaranteed algo', 'automated trading bot', 'zero loss bot']
  },
  {
    id: 'deb_007',
    name: 'Fake "SEBI VIP Allotment Desk" & Institutional IPO Scams',
    aliases: ['SEBI Pre-IPO Quota', 'Institutional Allocation Desk', 'FII Direct Allotment'],
    category: 'Impersonation & Advance Fee Scam',
    orderDate: '2024-06-10',
    orderRef: 'SEBI Press Release PR No.14/2024',
    summary: 'Criminal syndicates impersonating SEBI officials offering guaranteed 100% allotment in high-demand IPOs and SME issues through fictitious institutional accounts.',
    summaryHi: 'सेबी अधिकारियों और संस्थागत कोटा का फर्जी दावा कर SME और मेनबोर्ड IPO में 100% अलॉटमेंट का झांसा देने वाले गिरोह।',
    status: 'Criminal Fraud Warning',
    modusOperandi: 'Adding victims to WhatsApp VIP groups, providing forged SEBI letters, and asking money to be transferred to private current/savings accounts.',
    flagKeywords: ['institutional ipo', 'sebi quota', 'vip allotment desk', 'pre-ipo allocation', 'fii allotment']
  },
  {
    id: 'deb_008',
    name: 'BlackRock / Morgan Stanley APK Clone Scams',
    aliases: ['BlackRock India Wealth APK', 'Morgan Stanley Institutional Terminal'],
    category: 'Sideloaded Malicious APK & Cloned Broker App',
    orderDate: '2024-05-02',
    orderRef: 'SEBI Public Caution Notice May 2024',
    summary: 'Fraudulent mobile applications (.apk files) impersonating reputable multinational investment banks. Displays fictitious multi-crore profits to trick victims into depositing money.',
    summaryHi: 'ब्लैकरॉक और मॉर्गन स्टेनली जैसे बड़े ब्रांड्स की नकल करने वाले फर्जी APK ऐप्स, जो स्क्रीन पर नकली भारी मुनाफा दिखाकर पैसे ऐंठते हैं।',
    status: 'Severe Cyber Fraud Alert',
    modusOperandi: 'Asking victims to download .apk files directly via WhatsApp/Telegram web links instead of Google Play Store, showing simulated trading balances.',
    flagKeywords: ['blackrock apk', 'morgan stanley app', 'goldman terminal apk', 'sideloaded apk']
  },
  {
    id: 'deb_009',
    name: 'Rajiv Jain / GQG Partners Block Deal Impersonation',
    aliases: ['GQG Partners VIP Group', 'Rajiv Jain Insider Club'],
    category: 'Deepfake & Executive Impersonation',
    orderDate: '2024-03-20',
    orderRef: 'SEBI Advisory on Impersonation Schemes',
    summary: 'Scammers using deepfake AI videos and fake WhatsApp profiles of marquee fund manager Rajiv Jain to run fake block-deal investment pools.',
    summaryHi: 'मशहूर फंड मैनेजर राजीव जैन की फर्जी डीपफेक वीडियो और प्रोफाइल बनाकर ब्लॉक डील में पैसे लगाने का झांसा देने वाले फ्रॉड।',
    status: 'Cybercrime Syndicate Alert',
    modusOperandi: 'Using fabricated institutional trade confirmation slips and promising access to institutional private placement pricing.',
    flagKeywords: ['rajiv jain', 'gqg partners', 'block deal vip', 'institutional placement']
  },
  {
    id: 'deb_010',
    name: 'Ankit Saini & Bull Run Traders',
    aliases: ['Bull Run SMS Tips', 'Sure Shot Stock Picks'],
    category: 'Bulk SMS Pump and Dump Operator',
    orderDate: '2023-08-11',
    orderRef: 'SEBI/WTM/MB/ISD/18921/2023-24',
    summary: 'Debarred for orchestrating pump-and-dump operations in illiquid penny stocks using automated bulk SMS blasts to retail mobile numbers.',
    summaryHi: 'इललिक्विड पेनी स्टॉक्स में बल्क SMS भेजकर कृत्रिम तेजी लाने और फिर शेयर बेचकर भागने (पंप एंड डंप) के आरोप में प्रतिबंधित।',
    status: 'Debarred / Penalized',
    modusOperandi: 'Buying large volumes of illiquid micro-cap shares, sending millions of unsolicited SMS tips ("Buy now, target ₹150"), and dumping on retail buyers.',
    flagKeywords: ['bull run traders', 'ankit saini', 'penny stock tip']
  },
  {
    id: 'deb_011',
    name: 'Profit Pulse / Rich Mind Impersonation Fraud',
    aliases: ['Profit Pulse Advisory', 'Rich Mind Wealth'],
    category: 'Stolen SEBI Registration Number Fraud',
    orderDate: '2024-07-04',
    orderRef: 'SEBI Impersonation Advisory 2024',
    summary: 'Fraudulent group that copied genuine SEBI Research Analyst registration number INH000008888 onto fraudulent invoices and payment QR codes.',
    summaryHi: 'असली सेबी रजिस्टर्ड रिसर्च एनालिस्ट का नंबर चुराकर फर्जी इनवॉइस और QR कोड के जरिए धोखाधड़ी करने वाला गिरोह।',
    status: 'Impersonation Warning',
    modusOperandi: 'Pasted valid SEBI registration numbers on PDF letters while routing UPI collections to unrelated mule accounts.',
    flagKeywords: ['profit pulse', 'rich mind', 'stolen sebi number']
  }
];

const SEBI_REGULATIONS = [
  {
    id: 'reg_act_1992',
    title: 'Securities and Exchange Board of India Act, 1992',
    titleHi: 'भारतीय प्रतिभूति और विनिमय बोर्ड अधिनियम, 1992',
    shortCode: 'SEBI Act 1992',
    keySections: [
      {
        section: 'Section 11 & 11B',
        heading: 'Powers to Issue Directions & Protect Investors',
        headingHi: 'निर्देश जारी करने और निवेशकों की सुरक्षा की शक्तियां',
        explanation: 'Empowers SEBI to issue binding directions, impound illicit proceeds, freeze bank accounts, and debar fraudulent market participants.',
        explanationHi: 'सेबी को अवैध कमाई जब्त करने, बैंक खाते सीज करने और धोखेबाजों को मार्केट से प्रतिबंधित करने का पूर्ण वैधानिक अधिकार देता है।'
      },
      {
        section: 'Section 12',
        heading: 'Mandatory Prior Registration',
        headingHi: 'अनिवार्य पूर्व पंजीकरण',
        explanation: 'Strictly prohibits any person or entity from acting as a stock broker, investment adviser, research analyst, or portfolio manager without obtaining a valid certificate of registration from SEBI.',
        explanationHi: 'बिना सेबी के वैध रजिस्ट्रेशन सर्टिफिकेट के स्टॉक ब्रोकर, निवेश सलाहकार, या रिसर्च एनालिस्ट के रूप में काम करना गैरकानूनी और दंडनीय है।'
      },
      {
        section: 'Section 12A',
        heading: 'Prohibition of Fraudulent and Manipulative Conduct',
        headingHi: 'धोखाधड़ी और हेरफेर पर पूर्ण प्रतिबंध',
        explanation: 'Explicitly bans any manipulative device, scheme, or artifice to defraud retail investors or engage in insider trading.',
        explanationHi: 'खुदरा निवेशकों को धोखा देने, इनसाइडर ट्रेडिंग करने या कृत्रिम रूप से बाजार में हेरफेर करने वाली किसी भी योजना पर सख्त रोक।'
      }
    ]
  },
  {
    id: 'reg_pfutp_2003',
    title: 'SEBI (Prohibition of Fraudulent and Unfair Trade Practices) Regulations, 2003',
    titleHi: 'सेबी (धोखाधड़ी और अनुचित व्यापार प्रथाओं का निषेध) विनियम, 2003',
    shortCode: 'PFUTP 2003',
    keySections: [
      {
        section: 'Regulation 3',
        heading: 'Prohibition of Dealing in Fraudulent Manner',
        headingHi: 'धोखाधड़ी से सिक्योरिटीज में लेन-देन पर रोक',
        explanation: 'No person shall directly or indirectly use deceptive statements, publish unverified tips, or induce another to buy/sell shares based on false promises.',
        explanationHi: 'झूठे वादों या असत्यापित टिप्स के आधार पर किसी को शेयर खरीदने या बेचने के लिए प्रेरित करना पूरी तरह गैरकानूनी है।'
      },
      {
        section: 'Regulation 4',
        heading: 'Market Manipulation, Pump & Dump and Front Running',
        headingHi: 'मार्केट मैनिपुलेशन, पंप एंड डंप और फ्रंट रनिंग',
        explanation: 'Prohibits artificial volume creation, circular trading, front-running (buying before advising clients), and orchestrating pump-and-dump operations via WhatsApp or Telegram.',
        explanationHi: 'फर्जी वॉल्यूम बनाना, फ्रंट रनिंग (क्लाइंट को सलाह देने से पहले खुद खरीदना) और सोशल मीडिया पर पंप-एंड-डंप करना दंडनीय अपराध है।'
      }
    ]
  },
  {
    id: 'reg_ra_2014',
    title: 'SEBI (Research Analysts) Regulations, 2014',
    titleHi: 'सेबी (रिसर्च एनालिस्ट) विनियम, 2014',
    shortCode: 'RA Regulations 2014',
    keySections: [
      {
        section: 'Regulation 3',
        heading: 'Registration Requirement (INH Prefix)',
        headingHi: 'पंजीकरण अनिवार्यता (INH प्रीफिक्स)',
        explanation: 'Any entity providing stock recommendations or research reports must hold an active INH registration number and NISM-Series-XV certification.',
        explanationHi: 'स्टॉक सिफारिशें या रिसर्च रिपोर्ट देने वाली हर संस्था के पास एक्टिव INH रजिस्ट्रेशन और NISM-Series-XV सर्टिफिकेट होना अनिवार्य है।'
      },
      {
        section: 'Regulation 15 & 16',
        heading: 'Strict Conflict of Interest Disclosures',
        headingHi: 'हितों के टकराव का अनिवार्य खुलासा',
        explanation: 'Research Analysts cannot trade against their recommendations within 30 days and must disclose financial interest in recommended stocks.',
        explanationHi: 'रिसर्च एनालिस्ट अपनी सिफारिश के 30 दिनों के भीतर विपरीत ट्रेडिंग नहीं कर सकते और उन्हें अपना वित्तीय हित उजागर करना होता है।'
      },
      {
        section: 'Prohibition on Guaranteed Returns',
        heading: 'No Assurance of Profit',
        headingHi: 'गारंटीड मुनाफे का दावा पूर्णतः प्रतिबंधित',
        explanation: 'SEBI rules strictly forbid any registered research analyst from guaranteeing returns, profit-sharing models, or jackpot call assurances.',
        explanationHi: 'कोई भी सेबी रजिस्टर्ड एनालिस्ट मुनाफे की गारंटी, प्रॉफिट शेयरिंग या जैकपॉट रिटर्न का दावा नहीं कर सकता।'
      }
    ]
  },
  {
    id: 'reg_ia_2013',
    title: 'SEBI (Investment Advisers) Regulations, 2013',
    titleHi: 'सेबी (इन्वेस्टमेंट एडवाइजर) विनियम, 2013',
    shortCode: 'IA Regulations 2013',
    keySections: [
      {
        section: 'Regulation 15',
        heading: 'Fiduciary Duty to Client',
        headingHi: 'क्लाइंट के प्रति विश्वासपात्रता (फिड्यूशियरी ड्यूटी)',
        explanation: 'Advisers must act exclusively in the best financial interest of the client with complete transparency and zero hidden commissions.',
        explanationHi: 'सलाहकार को बिना किसी छिपे कमीशन के पूरी पारदर्शिता के साथ केवल क्लाइंट के सर्वोत्तम हित में कार्य करना अनिवार्य है।'
      },
      {
        section: 'Regulation 16 & 17',
        heading: 'Mandatory Risk Profiling & Suitability',
        headingHi: 'अनिवार्य रिस्क प्रोफाइलिंग और उपयुक्तता',
        explanation: 'An Investment Adviser cannot provide advice without formally evaluating the client’s risk tolerance, age, income, and financial goals.',
        explanationHi: 'क्लाइंट की उम्र, आय, और जोखिम क्षमता की औपचारिक जांच (रिस्क प्रोफाइलिंग) किए बिना सलाह देना वर्जित है।'
      },
      {
        section: 'Fee Cap Norms',
        heading: 'Statutory Fee Limits (₹1.25 Lakh or 2.5% AUA)',
        headingHi: 'फीस की अधिकतम कानूनी सीमा (₹1.25 लाख या 2.5% AUA)',
        explanation: 'SEBI caps maximum advisory fees at ₹1,25,000 per annum per family, or 2.5% of Assets Under Advice (AUA). Exorbitant charges are illegal.',
        explanationHi: 'सेबी ने सालाना अधिकतम फीस ₹1.25 लाख प्रति परिवार या AUA का 2.5% तय की है। अत्यधिक या मनमानी फीस वसूलना गैरकानूनी है।'
      }
    ]
  },
  {
    id: 'reg_finfluencer_2024',
    title: 'SEBI Mandate on Unregistered Financial Influencers (2024)',
    titleHi: 'अनधिकृत फिनफ्लूएंशर्स पर सेबी का 2024 का परिपत्र',
    shortCode: 'Finfluencer Norms 2024',
    keySections: [
      {
        section: 'Association Ban',
        heading: 'Prohibition on Regulated Entities Partnering with Finfluencers',
        headingHi: 'रजिस्टर्ड संस्थाओं के फिनफ्लूएंशर्स से जुड़ने पर रोक',
        explanation: 'SEBI-registered brokers, mutual funds, and advisers are prohibited from having any direct or indirect association, referral fees, or brand deals with unregistered individuals giving stock tips or performance claims.',
        explanationHi: 'सेबी रजिस्टर्ड ब्रोकर या म्यूचुअल फंड किसी भी अनरजिस्टर्ड इन्फ्लुएंसर को टिप देने या रेफरल कमीशन देने के लिए पार्टनर नहीं बना सकते।'
      },
      {
        section: 'Performance Claims Ban',
        heading: 'Prohibition on Backtested/Past Performance Claims',
        headingHi: 'पुराने या बैकटेस्टेड रिटर्न के प्रचार पर रोक',
        explanation: 'Entities cannot use historical returns or backtested metrics in advertisements to entice investors into algorithmic or derivative trading.',
        explanationHi: 'विज्ञापनों में ऐतिहासिक या बैकटेस्टेड रिटर्न दिखाकर निवेशकों को लुभाने पर पूरी तरह रोक है।'
      }
    ]
  },
  {
    id: 'reg_scores_framework',
    title: 'SCORES 2.0 & SMART ODR Grievance Redressal Framework',
    titleHi: 'SCORES 2.0 और स्मार्ट ODR शिकायत निवारण ढांचा',
    shortCode: 'SCORES 2.0 Redressal',
    keySections: [
      {
        section: '21-Day Mandatory Resolution',
        heading: 'Strict Resolution Timelines',
        headingHi: '21 दिनों में अनिवार्य समाधान',
        explanation: 'Every registered intermediary must resolve investor complaints on the SCORES portal within 21 calendar days of receipt.',
        explanationHi: 'प्रत्येक रजिस्टर्ड संस्था को SCORES पोर्टल पर मिली शिकायत का 21 दिनों के भीतर समाधान करना अनिवार्य है।'
      },
      {
        section: 'Two-Tier Auto Escalation',
        heading: 'Automatic Escalation to Designated Body & SEBI',
        headingHi: 'ऑटो-एस्केलेशन (डेजिग्नेटेड बॉडी और सेबी)',
        explanation: 'If unresolved in 21 days, complaint automatically escalates to First Reviewer (Stock Exchange/Association) and then to SEBI.',
        explanationHi: '21 दिनों में समाधान न होने पर शिकायत स्वतः पहले समीक्षक (एक्सचेंज) और फिर सेबी के पास ट्रांसफर हो जाती है।'
      },
      {
        section: 'SMART ODR Portal',
        heading: 'Online Dispute Resolution Conciliation & Arbitration',
        headingHi: 'स्मार्ट ODR ऑनलाइन मध्यस्थता पोर्टल',
        explanation: 'Investors can initiate independent, cost-effective online conciliation and arbitration against any market intermediary via smartodr.in.',
        explanationHi: 'निवेशक smartodr.in के माध्यम से किसी भी ब्रोकर या सलाहकार के खिलाफ स्वतंत्र ऑनलाइन मध्यस्थता शुरू कर सकते हैं।'
      }
    ]
  }
];

const SEBI_PREFIXES = [
  { prefix: 'INZ', category: 'Stock Broker', categoryHi: 'स्टॉक ब्रोकर', example: 'INZ000031633', authority: 'SEBI / Exchanges' },
  { prefix: 'INA', category: 'Investment Adviser', categoryHi: 'इन्वेस्टमेंट एडवाइजर', example: 'INA000017523', authority: 'SEBI / BSE Administration & Supervision (BASL)' },
  { prefix: 'INH', category: 'Research Analyst', categoryHi: 'रिसर्च एनालिस्ट', example: 'INH000000211', authority: 'SEBI / RA Administration' },
  { prefix: 'INP', category: 'Portfolio Manager', categoryHi: 'पोर्टफोलियो मैनेजर (PMS)', example: 'INP000006721', authority: 'SEBI' },
  { prefix: 'INF', category: 'Mutual Fund', categoryHi: 'म्यूचुअल फंड (AMC)', example: 'MF/020/94/8 or INF...', authority: 'SEBI Mutual Funds Dept' },
  { prefix: 'INM', category: 'Merchant Banker', categoryHi: 'मर्चेंट बैंकर', example: 'INM000010361', authority: 'SEBI' },
  { prefix: 'IND', category: 'Depository', categoryHi: 'डिपॉजिटरी (NSDL / CDSL)', example: 'IND000000001', authority: 'SEBI' },
  { prefix: 'IN-DP', category: 'Depository Participant', categoryHi: 'डिपॉजिटरी पार्टिसिपेंट', example: 'IN-DP-NSDL-12-96', authority: 'NSDL / CDSL / SEBI' },
  { prefix: 'INR', category: 'Registrar & Share Transfer Agent (RTA)', categoryHi: 'रजिस्ट्रार और ट्रांसफर एजेंट', example: 'INR000004058', authority: 'SEBI' },
  { prefix: 'IN/CRA', category: 'Credit Rating Agency', categoryHi: 'क्रेडिट रेटिंग एजेंसी', example: 'IN/CRA/001/1999', authority: 'SEBI' },
  { prefix: 'IN/AIF', category: 'Alternative Investment Fund', categoryHi: 'अल्टरनेटिव इन्वेस्टमेंट फंड (AIF)', example: 'IN/AIF1/17-18/0312', authority: 'SEBI' },
  { prefix: 'IN/DT', category: 'Debenture Trustee', categoryHi: 'डिबेंचर ट्रस्टी', example: 'INDT00000001', authority: 'SEBI' }
];

function main() {
  const srcDir = path.resolve(__dirname, '../src/data');
  const pubDir = path.resolve(__dirname, '../public/data');

  for (const dir of [srcDir, pubDir]) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'sebi_debarred.json'), JSON.stringify(DEBARRED_ENTITIES, null, 2), 'utf-8');
    fs.writeFileSync(path.join(dir, 'sebi_regulations.json'), JSON.stringify(SEBI_REGULATIONS, null, 2), 'utf-8');
    fs.writeFileSync(path.join(dir, 'sebi_prefixes.json'), JSON.stringify(SEBI_PREFIXES, null, 2), 'utf-8');
  }

  console.log('Successfully generated Debarred Entities, Regulations, and Prefixes datasets in src/data and public/data!');
}

main();
