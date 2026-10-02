export interface SebiEntity {
  regNumber: string;
  name: string;
  category: string;
  categoryCode?: string;
  categoryHi: string;
  status: 'Active' | 'Suspended' | 'Expired' | 'Debarred';
  registeredEmailDomain?: string;
  officialWebsite?: string;
  email?: string;
  phone?: string;
  city?: string;
  state?: string;
  pincode?: string;
  address?: string;
  contactPerson?: string;
  validFrom?: string;
  validTo?: string;
  validSince?: string;
  tradeName?: string;
  exchange?: string;
}

export interface DebarredEntity {
  id: string;
  name: string;
  aliases: string[];
  category: string;
  orderDate: string;
  orderRef: string;
  summary: string;
  summaryHi: string;
  status: string;
  modusOperandi: string;
  flagKeywords: string[];
}

export interface SebiRegulation {
  id: string;
  title: string;
  titleHi: string;
  shortCode: string;
  keySections: {
    section: string;
    heading: string;
    headingHi: string;
    explanation: string;
    explanationHi: string;
  }[];
}

export interface SebiPrefix {
  prefix: string;
  category: string;
  categoryHi: string;
  example: string;
  authority: string;
}

/**
 * SAMPLE SEBI REGISTRY DATASET
 * Pre-loaded marquee verified intermediaries for instantaneous client response and offline fallback.
 * The full dataset contains 12,397+ official SEBI intermediaries searchable via the search bar.
 */
export const SAMPLE_REGISTRY: SebiEntity[] = [
  {
    regNumber: 'INZ000031633',
    name: 'ZERODHA BROKING LIMITED',
    tradeName: 'Zerodha',
    category: 'Stock Broker',
    categoryCode: 'SB',
    categoryHi: 'स्टॉक ब्रोकर',
    status: 'Active',
    registeredEmailDomain: 'zerodha.com',
    email: 'compliance@zerodha.com',
    officialWebsite: 'https://zerodha.com',
    city: 'BANGALORE',
    state: 'KARNATAKA',
    pincode: '560078',
    address: '#153/154, 4th Cross, Dollars Colony, Opp. Clarence Public School, J.P Nagar 4th Phase',
    validFrom: '2015-06-19',
    validTo: 'Perpetual',
    validSince: '2015-06-19',
    exchange: 'NSE / BSE / MCX'
  },
  {
    regNumber: 'INZ000301838',
    name: 'GROWW INVEST TECH PRIVATE LIMITED',
    tradeName: 'Groww',
    category: 'Stock Broker',
    categoryCode: 'SB',
    categoryHi: 'स्टॉक ब्रोकर',
    status: 'Active',
    registeredEmailDomain: 'groww.in',
    email: 'compliance@groww.in',
    officialWebsite: 'https://groww.in',
    city: 'BANGALORE',
    state: 'KARNATAKA',
    pincode: '560103',
    address: 'Vaishnavi Tech Park, 3rd & 4th Floor, Sarjapur Main Road, Bellandur',
    validFrom: '2020-11-20',
    validTo: 'Perpetual',
    validSince: '2020-11-20',
    exchange: 'NSE / BSE'
  },
  {
    regNumber: 'INZ000161534',
    name: 'ANGEL ONE LIMITED',
    tradeName: 'Angel One',
    category: 'Stock Broker',
    categoryCode: 'SB',
    categoryHi: 'स्टॉक ब्रोकर',
    status: 'Active',
    registeredEmailDomain: 'angelbroking.com',
    email: 'compliance@angelbroking.com',
    officialWebsite: 'https://angelone.in',
    city: 'MUMBAI',
    state: 'MAHARASHTRA',
    pincode: '400093',
    address: 'G-1, Ackruti Trade Centre, Road No. 7, MIDC, Andheri (East)',
    validFrom: '2018-05-02',
    validTo: 'Perpetual',
    validSince: '2018-05-02',
    exchange: 'NSE / BSE / MCX'
  },
  {
    regNumber: 'INZ000186937',
    name: 'RKSV SECURITIES INDIA PRIVATE LIMITED',
    tradeName: 'Upstox',
    category: 'Stock Broker',
    categoryCode: 'SB',
    categoryHi: 'स्टॉक ब्रोकर',
    status: 'Active',
    registeredEmailDomain: 'upstox.com',
    email: 'compliance@upstox.com',
    officialWebsite: 'https://upstox.com',
    city: 'MUMBAI',
    state: 'MAHARASHTRA',
    pincode: '400059',
    address: '807, New Delhi House, Barakhamba Road, Connaught Place / Mumbai Office',
    validFrom: '2018-09-12',
    validTo: 'Perpetual',
    validSince: '2018-09-12',
    exchange: 'NSE / BSE / MCX'
  },
  {
    regNumber: 'INZ000010231',
    name: '5PAISA CAPITAL LIMITED',
    tradeName: '5paisa',
    category: 'Stock Broker',
    categoryCode: 'SB',
    categoryHi: 'स्टॉक ब्रोकर',
    status: 'Active',
    registeredEmailDomain: '5paisa.com',
    email: 'teamcompliance@5paisa.com',
    officialWebsite: 'https://5paisa.com',
    city: 'THANE',
    state: 'MAHARASHTRA',
    pincode: '400604',
    address: 'IIFL House, Sun Infotech Park, Road No. 16V, B-23, MIDC, Wagle Estate',
    validFrom: '2015-03-30',
    validTo: 'Perpetual',
    validSince: '2015-03-30',
    exchange: 'NSE / BSE / MCX'
  },
  {
    regNumber: 'INZ000183631',
    name: 'ICICI SECURITIES LIMITED',
    tradeName: 'ICICI Direct',
    category: 'Stock Broker',
    categoryCode: 'SB',
    categoryHi: 'स्टॉक ब्रोकर',
    status: 'Active',
    registeredEmailDomain: 'icicisecurities.com',
    email: 'customercare@icicisecurities.com',
    officialWebsite: 'https://icicidirect.com',
    city: 'NAVI MUMBAI',
    state: 'MAHARASHTRA',
    pincode: '400705',
    address: 'ICICI Centre, H.T. Parekh Marg, Churchgate, Mumbai',
    validFrom: '2018-08-01',
    validTo: 'Perpetual',
    validSince: '2018-08-01',
    exchange: 'NSE / BSE / MCX'
  },
  {
    regNumber: 'INZ000186437',
    name: 'HDFC SECURITIES LIMITED',
    tradeName: 'HDFC Sky / Securities',
    category: 'Stock Broker',
    categoryCode: 'SB',
    categoryHi: 'स्टॉक ब्रोकर',
    status: 'Active',
    registeredEmailDomain: 'hdfcsec.com',
    email: 'services@hdfcsec.com',
    officialWebsite: 'https://hdfcsec.com',
    city: 'MUMBAI',
    state: 'MAHARASHTRA',
    pincode: '400083',
    address: 'Office Floor 8, I Think Techno Campus, Building B, Alpha, Kanjurmarg (East)',
    validFrom: '2018-08-20',
    validTo: 'Perpetual',
    validSince: '2018-08-20',
    exchange: 'NSE / BSE / MCX'
  },
  {
    regNumber: 'INA000017523',
    name: '1 Finance Private Limited',
    category: 'Investment Adviser',
    categoryCode: 'IA',
    categoryHi: 'इन्वेस्टमेंट एडवाइजर',
    status: 'Active',
    registeredEmailDomain: '1finance.co.in',
    email: 'compliance@1finance.co.in',
    officialWebsite: 'https://1finance.co.in',
    city: 'MUMBAI',
    state: 'MAHARASHTRA',
    pincode: '400063',
    address: 'Unit No B-1101/1102, Lotus Corporate Park, Off Western Express Highway, Goregaon (E)',
    validFrom: '2022-12-22',
    validTo: 'Perpetual',
    validSince: '2022-12-22'
  },
  {
    regNumber: 'INA000000037',
    name: 'Kavitha Menon',
    category: 'Investment Adviser',
    categoryCode: 'IA',
    categoryHi: 'इन्वेस्टमेंट एडवाइजर',
    status: 'Active',
    registeredEmailDomain: 'probituswealth.com',
    email: 'cavithamenon@gmail.com',
    officialWebsite: 'https://probituswealth.com',
    city: 'MUMBAI',
    state: 'MAHARASHTRA',
    pincode: '400022',
    address: '1203, Gala Altezza, Near Shanmukhanand Hall, Sion',
    validFrom: '2013-08-01',
    validTo: 'Perpetual',
    validSince: '2013-08-01'
  },
  {
    regNumber: 'INH000000016',
    name: 'Stakeholders Empowerment Services',
    category: 'Research Analyst',
    categoryCode: 'RA',
    categoryHi: 'रिसर्च एनालिस्ट',
    status: 'Active',
    registeredEmailDomain: 'sesgovernance.com',
    email: 'devendra.bhandari@sesgovernance.com',
    officialWebsite: 'https://sesgovernance.com',
    city: 'MUMBAI',
    state: 'MAHARASHTRA',
    pincode: '400097',
    address: 'A202, Muktangan Complex, Upper Govind Nagar, Malad (East)',
    validFrom: '2014-11-28',
    validTo: 'Perpetual',
    validSince: '2014-11-28'
  },
  {
    regNumber: 'MF/020/94/8',
    name: 'ADITYA BIRLA SUN LIFE MUTUAL FUND',
    category: 'Mutual Fund',
    categoryCode: 'MF',
    categoryHi: 'म्यूचुअल फंड',
    status: 'Active',
    registeredEmailDomain: 'adityabirlacapital.com',
    email: 'care.mutualfunds@adityabirlacapital.com',
    officialWebsite: 'https://mutualfund.adityabirlacapital.com',
    city: 'MUMBAI',
    state: 'MAHARASHTRA',
    pincode: '400013',
    address: 'One World Center, Tower 1, 17th Floor, Jupiter Mills Compound, 841 Senapati Bapat Marg, Elphinstone Road',
    validFrom: '1994-12-23',
    validTo: 'Perpetual',
    validSince: '1994-12-23'
  },
  {
    regNumber: 'MF/009/93/3',
    name: 'SBI MUTUAL FUND',
    category: 'Mutual Fund',
    categoryCode: 'MF',
    categoryHi: 'म्यूचुअल फंड',
    status: 'Active',
    registeredEmailDomain: 'sbimf.com',
    email: 'customer.delight@sbimf.com',
    officialWebsite: 'https://sbimf.com',
    city: 'MUMBAI',
    state: 'MAHARASHTRA',
    pincode: '400020',
    address: '9th Floor, Crescenzo, C-38 & 39, G Block, Bandra Kurla Complex, Bandra (East)',
    validFrom: '1993-12-23',
    validTo: 'Perpetual',
    validSince: '1993-12-23'
  },
  {
    regNumber: 'INP000000187',
    name: 'QUANTUM ADVISORS PRIVATE LIMITED',
    category: 'Portfolio Manager',
    categoryCode: 'PM',
    categoryHi: 'पोर्टफोलियो मैनेजर',
    status: 'Active',
    registeredEmailDomain: 'qasl.com',
    email: 'ketav@qasl.com',
    officialWebsite: 'https://quantumadvisors.co.in',
    city: 'MUMBAI',
    state: 'MAHARASHTRA',
    pincode: '400020',
    address: '1st Floor, Apeejay House, 3 Dinshaw Vachha Road, Backbay Reclamation, Churchgate',
    validFrom: '2005-11-09',
    validTo: 'Perpetual',
    validSince: '2005-11-09'
  },
  {
    regNumber: 'IN-DP-NSDL-12-96',
    name: 'NATIONAL SECURITIES DEPOSITORY LIMITED (NSDL)',
    category: 'Depository Participant (NSDL)',
    categoryCode: 'DP-NSDL',
    categoryHi: 'डिपॉजिटरी (NSDL)',
    status: 'Active',
    registeredEmailDomain: 'nsdl.co.in',
    email: 'info@nsdl.co.in',
    officialWebsite: 'https://nsdl.co.in',
    city: 'MUMBAI',
    state: 'MAHARASHTRA',
    pincode: '400013',
    address: 'Trade World, A Wing, 4th Floor, Kamala Mills Compound, Senapati Bapat Marg, Lower Parel',
    validFrom: '1996-08-08',
    validTo: 'Perpetual',
    validSince: '1996-08-08'
  },
  {
    regNumber: 'IN/CRA/001/1999',
    name: 'CRISIL RATINGS LIMITED',
    category: 'Credit Rating Agency',
    categoryCode: 'CRA',
    categoryHi: 'क्रेडिट रेटिंग एजेंसी',
    status: 'Active',
    registeredEmailDomain: 'crisil.com',
    email: 'srilaxmi.pai@crisil.com',
    officialWebsite: 'https://crisil.com',
    city: 'MUMBAI',
    state: 'MAHARASHTRA',
    pincode: '400072',
    address: 'CRISIL House, Central Avenue, Hiranandani Business Park, Powai',
    validFrom: '1999-12-04',
    validTo: 'Perpetual',
    validSince: '1999-12-04'
  }
];

export function lookupSampleRegistry(query: string, category: string = 'all'): SebiEntity[] {
  if (!query || query.trim().length < 2) {
    if (category === 'all') return SAMPLE_REGISTRY.slice(0, 10);
    return SAMPLE_REGISTRY.filter((e) => e.categoryCode === category);
  }
  const clean = query.trim().toLowerCase();
  return SAMPLE_REGISTRY.filter((e) => {
    if (category !== 'all' && e.categoryCode !== category && e.category !== category) return false;
    return (
      e.regNumber.toLowerCase().includes(clean) ||
      e.name.toLowerCase().includes(clean) ||
      (e.tradeName && e.tradeName.toLowerCase().includes(clean)) ||
      (e.registeredEmailDomain && e.registeredEmailDomain.toLowerCase().includes(clean)) ||
      (e.city && e.city.toLowerCase().includes(clean))
    );
  });
}

// Official SEBI URLs
export const SEBI_LOOKUP_OFFICIAL_URL = 'https://www.sebi.gov.in/sebiweb/other/OtherAction.do?doRecognised=yes';
export const SEBI_PORTAL_URL = 'https://www.sebi.gov.in';
export const SCORES_OFFICIAL_URL = 'https://scores.sebi.gov.in';
export const CYBERCRIME_OFFICIAL_URL = 'https://cybercrime.gov.in';
export const NATIONAL_CYBER_HELPLINE = '1930';
