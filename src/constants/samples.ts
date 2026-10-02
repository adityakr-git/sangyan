export interface SampleMessage {
  id: string;
  titleEn: string;
  titleHi: string;
  badge: string;
  text: string;
}

export const SAMPLE_MESSAGES: SampleMessage[] = [
  {
    id: 'sample_vip_telegram',
    titleEn: 'VIP Telegram Stock Tip',
    titleHi: 'VIP टेलीग्राम स्टॉक टिप',
    badge: 'Jackpot & Operator Tip',
    text: `🔥 100% SURE SHOT JACKPOT CALL! 
Buy XYZ Infra tomorrow at 9:15 AM! Operator bulk deal insider news confirmed. Target 300% profit in 5 days! Guaranteed return with ZERO risk. 
Only 5 slots left in our VIP group! Act now before market opens.
Join now: https://t.me/vip_super_trader_calls
Send Rs 5,000 registration fee to UPI: 9876543210@paytm or call +91 98765 43210.
SEBI Reg No: SEBI-VIP-998877. Don't miss this life-changing chance!`,
  },
  {
    id: 'sample_apk_pension',
    titleEn: 'Pension Scheme APK & 40% Return',
    titleHi: 'पेंशन स्कीम APK और 40% रिटर्न',
    badge: 'Fake App & Sideload APK',
    text: `Dear Senior Investor, 
Earn 40% guaranteed monthly returns on your retirement pension savings! Special government-backed high-yield scheme.
Download our official high-frequency trading terminal APK: http://secure-wealth-direct.apk.
Call our relationship officer on 9812345678 or install AnyDesk so our executive can configure your trading portal.
Limited time quota expires in 30 minutes! Send documents to verify@fastreturns.in.`,
  },
  {
    id: 'sample_pre_ipo',
    titleEn: 'Pre-IPO Allocation & Personal UPI',
    titleHi: 'प्री-आईपीओ और निजी UPI',
    badge: 'Pre-IPO Allotment Scam',
    text: `Exclusive confidential Pre-IPO allotment of ABC Tech available before NSE listing! 
Assured 50% listing gains on Day 1. Only 200 shares allocated per investor.
Transfer payment immediately via UPI to personal nodal account: ramesh.investor@okaxis.
Claimed SEBI registered research analyst: INH00099999.
Join private WhatsApp group for daily breakout levels: https://chat.whatsapp.com/samplePreIpoInvite`,
  },
];
