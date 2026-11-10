// Deterministic Ge'ez (Ethiopian) Calendar and 12-Hour Local Clock Utility
// Compliant with Ethiopian Public Administration standards

export interface EthiopianDate {
  year: number;
  month: number; // 1 to 13
  day: number;
  monthNameEn: string;
  monthNameAm: string;
}

export interface EthiopianTime {
  hours: number;
  minutes: number;
  periodEn: 'Morning' | 'Afternoon' | 'Night' | 'Dawn';
  periodAm: 'ጠዋት' | 'ከሰዓት' | 'ምሽት' | 'ሌሊት';
  formattedStringEn: string;
  formattedStringAm: string;
}

const ETHIOPIAN_MONTHS_AM = [
  'መስከረም', 'ጥቅምት', 'ኅዳር', 'ታኅሣሥ', 'ጥር', 'የካቲት',
  'መጋቢት', 'ሚያዝያ', 'ግንቦት', 'ሰኔ', 'ሐምሌ', 'ነሐሴ', 'ጳጉሜን'
];

const ETHIOPIAN_MONTHS_EN = [
  'Meskerem', 'Tikimt', 'Hidar', 'Tahsas', 'Tir', 'Yakatit',
  'Megabit', 'Miyazya', 'Ginbot', 'Sene', 'Hamle', 'Nehase', 'Pagume'
];

/**
 * Converts a standard JavaScript Date (Gregorian) to Ethiopian Date.
 * Handles leap years and Pagume 13th month accurately.
 */
export function toEthiopianDate(gregorianDate: Date = new Date()): EthiopianDate {
  const gYear = gregorianDate.getFullYear();
  const gMonth = gregorianDate.getMonth(); // 0-indexed (0=Jan, 11=Dec)
  const gDay = gregorianDate.getDate();

  // Basic Julian day calculation
  const a = Math.floor((14 - (gMonth + 1)) / 12);
  const y = gYear + 4800 - a;
  const m = (gMonth + 1) + 12 * a - 3;
  const jdn = gDay + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;

  // Ethiopian era JD constant
  const jdOffset = 1723856;
  const r = (jdn - jdOffset) % 1461;
  const n = (r % 365) + 365 * Math.floor(r / 1460);

  const ethYear = 4 * Math.floor((jdn - jdOffset) / 1461) + Math.floor(r / 365) - Math.floor(r / 1460);
  const ethMonth = Math.floor(n / 30) + 1;
  const ethDay = (n % 30) + 1;

  const validMonth = Math.min(13, Math.max(1, ethMonth));
  const monthIdx = validMonth - 1;

  return {
    year: ethYear,
    month: validMonth,
    day: ethDay,
    monthNameEn: ETHIOPIAN_MONTHS_EN[monthIdx] || 'Meskerem',
    monthNameAm: ETHIOPIAN_MONTHS_AM[monthIdx] || 'መስከረም'
  };
}

/**
 * Converts Gregorian 24-hour time to Ethiopian 12-hour local time.
 * In Ethiopia, the civil day starts at sunrise (~06:00 AM Gregorian = 12:00 morning local time).
 * 07:00 AM = 1:00 ጠዋት (morning)
 * 12:00 PM (Noon) = 6:00 ከሰዓት (afternoon)
 * 06:00 PM = 12:00 ምሽት (evening)
 * 07:00 PM = 1:00 ምሽት (evening)
 */
export function toEthiopianTime(date: Date = new Date()): EthiopianTime {
  const gHours = date.getHours();
  const minutes = date.getMinutes();

  // Convert to Ethiopian 12-hour clock (shift by 6 hours)
  let ethHours = (gHours + 6) % 12;
  if (ethHours === 0) ethHours = 12;

  let periodEn: 'Morning' | 'Afternoon' | 'Night' | 'Dawn' = 'Morning';
  let periodAm: 'ጠዋት' | 'ከሰዓት' | 'ምሽት' | 'ሌሊት' = 'ጠዋት';

  if (gHours >= 6 && gHours < 12) {
    periodEn = 'Morning';
    periodAm = 'ጠዋት';
  } else if (gHours >= 12 && gHours < 18) {
    periodEn = 'Afternoon';
    periodAm = 'ከሰዓት';
  } else if (gHours >= 18 && gHours < 24) {
    periodEn = 'Night';
    periodAm = 'ምሽት';
  } else {
    periodEn = 'Dawn';
    periodAm = 'ሌሊት';
  }

  const mm = minutes.toString().padStart(2, '0');

  return {
    hours: ethHours,
    minutes,
    periodEn,
    periodAm,
    formattedStringEn: `${ethHours}:${mm} ${periodEn}`,
    formattedStringAm: `${ethHours}:${mm} ${periodAm}`
  };
}

/**
 * Full formatted civil date string in Amharic & English.
 * e.g., "ጥቅምት 24, 2017 ዓ.ም | 4:30 ጠዋት"
 */
export function formatFullEthiopianDateTime(isoUtcString: string, lang: 'am' | 'en' | 'om' = 'en'): string {
  const d = new Date(isoUtcString);
  if (isNaN(d.getTime())) return isoUtcString;

  const ethDate = toEthiopianDate(d);
  const ethTime = toEthiopianTime(d);

  if (lang === 'am') {
    return `${ethDate.monthNameAm} ${ethDate.day}, ${ethDate.year} ዓ.ም — ${ethTime.formattedStringAm}`;
  } else if (lang === 'om') {
    return `${ethDate.day} ${ethDate.monthNameEn}, ${ethDate.year} A.L.I — ${ethTime.formattedStringEn}`;
  } else {
    return `${ethDate.monthNameEn} ${ethDate.day}, ${ethDate.year} E.C. (${ethTime.formattedStringEn})`;
  }
}
