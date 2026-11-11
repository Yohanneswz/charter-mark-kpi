// Centralized Sovereign Trilingual Localization Dictionary
// Covers: English (en), Amharic (am), Afaan Oromoo (om)
// Mandated under FDRE Civil Service Standards & Digital Ethiopia 2030
import { Language } from '../types';

export interface TranslationDictionary {
  [key: string]: {
    en: string;
    am: string;
    om: string;
  };
}

export const translations: TranslationDictionary = {
  // Sovereign Header & System Identification
  republicTitle: {
    en: 'Federal Democratic Republic of Ethiopia',
    am: 'የኢትዮጵያ ፌዴራላዊ ዲሞክራሲያዊ ሪፐብሊክ',
    om: 'Rippaabiliika Dimookraatawaa Federaalawaa Itoophiyaa'
  },
  commissionTitle: {
    en: 'Civil Service Commission & Public Service Quality Directorate',
    am: 'የሲቪል ሰርቪስ ኮሚሽን እና የህዝብ አገልግሎት ጥራት ዳይሬክቶሬት',
    om: 'Koomishinii Sivilii Sarviisii fi Daayirektooreetii Qulqullina Tajaajila Uummataa'
  },
  systemName: {
    en: 'Charter Mark Citizen Feedback & Civil Servant KPI Tracker',
    am: 'የዜጎች ቻርተር ማርክ ግብረ-መልስ እና የሲቪል ሰርቫንት የስራ አፈጻጸም መከታተያ',
    om: 'Madaallii Tajaajilamtootaa fi Hordoffii Raawwii Hojjettoota Sivilii'
  },
  legalProclamation: {
    en: 'FDRE Federal Civil Servants Proclamation No. 1353/2025',
    am: 'የፌዴራል ሲቪል ሰርቫንቶች አዋጅ ቁጥር 1353/2017',
    om: 'Labsii Hojjettoota Sivilii Federaalaa Lakkoofsa 1353/2017'
  },

  // Navigation Links
  navDeskStands: {
    en: 'QR Counter Directory',
    am: 'የመስተንግዶ ዴስክ ኪዮስኮች',
    om: 'Galmee Kiosk Mootummaa'
  },
  navPublicBoard: {
    en: 'Public Waiting Display',
    am: 'የህዝብ መረጃ ሰሌዳ',
    om: 'Gabatee Odeeffannoo Uummataa'
  },
  navClerkTerminal: {
    en: 'Frontline Clerk Desk',
    am: 'የባለሙያ መስተንግዶ መስኮት',
    om: 'Mootummaa Fuula Duraa'
  },
  navOperationsCenter: {
    en: 'Operations & Sentinel',
    am: 'ኦፕሬሽን እና ጸረ-ብልሹ ዳሽቦርድ',
    om: 'Giddu-gala Hojii fi Qorannoo'
  },
  navTwoYearAppraisal: {
    en: 'Two-Year CSC Appraisal',
    am: 'የሁለት ዓመት የስራ አፈጻጸም ግምገማ',
    om: 'Madaallii Raawwii Waggaa Lamaa'
  },
  navVerifyReceipt: {
    en: 'Verify SHA-256 Signature',
    am: 'ዲጂታል ፊርማ ማረጋገጫ',
    om: 'Mirkaneessa Mallattoo Dijitaalaa'
  },

  // Service & Counter Concepts
  ticketNumber: {
    en: 'Ticket Number',
    am: 'የቲኬት ቁጥር',
    om: 'Lakkoofsa Tikkeetii'
  },
  windowNumber: {
    en: 'Counter Window',
    am: 'የመስተንግዶ መስኮት',
    om: 'Foddaa Tajaajilaa'
  },
  charterStandard: {
    en: 'Charter Standard Turnaround',
    am: 'የቻርተር ስታንዳርድ ጊዜ',
    om: 'Yeroo Qajeelfama Tajaajilaa'
  },
  faydaDigitalId: {
    en: 'Fayda National Digital ID (FIN)',
    am: 'ፋይዳ ብሔራዊ ዲጂታል መታወቂያ',
    om: 'Waraqaa Eenyummaa Fayidaa'
  },
  secretPin: {
    en: 'Secret 4-Digit Completion PIN',
    am: 'ምስጢራዊ 4-ዲጂት ማጠናቀቂያ ፒን',
    om: 'Koodii Dhokataa Dijitii 4'
  },

  // Statutory Performance Formulas (Proclamation 1353/2025)
  objectiveScore60: {
    en: 'Empirical Desk Transactions (60% Weight)',
    am: 'ተጨባጭ የመስኮት ስራ አፈጻጸም (60% ክብደት)',
    om: 'Madaallii Qabatamaa Foddaa (Qabxii 60%)'
  },
  supervisorScore40: {
    en: 'Qualitative Supervisor Evaluation (40% Weight)',
    am: 'የቅርብ ኃላፊ የባህሪና ስነ-ምግባር ምዘና (40% ክብደት)',
    om: 'Madaallii Hogganaa Dhiyoo (Qabxii 40%)'
  },
  stepIncrement80: {
    en: 'Statutory Step Increment (≥ 80.0% Threshold for +7.5% Salary Step)',
    am: 'የደመወዝ እርከን ጭማሪ (≥ 80.0% ውጤት ለ +7.5% የደረጃ ጭማሪ)',
    om: 'Guddina Sadarkaa Mindaa (≥ 80.0% Qabxii daballii +7.5%)'
  },

  // General Status Actions
  statusOnline: {
    en: 'Operational (Sovereign LAN)',
    am: 'በስራ ላይ (ሉዓላዊ ኔትወርክ)',
    om: 'Hojirra Jira (Sovereign LAN)'
  },
  actionSubmit: {
    en: 'Submit',
    am: 'አስገባ',
    om: 'Galchi'
  },
  actionClose: {
    en: 'Close',
    am: 'ዝጋ',
    om: 'Cufi'
  },
  actionSearch: {
    en: 'Search Records',
    am: 'መረጃ ፈልግ',
    om: 'Barbaadi'
  }
};

/**
 * Helper to retrieve a translated string with graceful English fallback
 */
export function t(key: string, lang: Language = 'en'): string {
  if (translations[key] && translations[key][lang]) {
    return translations[key][lang];
  }
  if (translations[key] && translations[key]['en']) {
    return translations[key]['en'];
  }
  return key;
}
