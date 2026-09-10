const ISLAMIC_MONTH_MAP: Record<string, string> = {
  'Muharram': 'Muharram',
  'Safar': 'Safar',
  'Rabiʻ I': 'Rabi al-Awwal',
  'Rabiʻ II': 'Rabi al-Thani',
  'Jumada I': 'Jumada al-Awwal',
  'Jumada II': 'Jumada al-Thani',
  'Rajab': 'Rajab',
  'Shaʻban': 'Sha\'ban',
  'Ramadan': 'Ramadan',
  'Shawwal': 'Shawwal',
  'Dhuʻl-Qiʻdah': 'Dhu al-Qi\'dah',
  'Dhuʻl-Hijjah': 'Dhu al-Hijjah',
};

export interface HijriDateDetails {
  day: string;
  month: string;
  year: string;
  formatted: string;
}

export interface DateInfo {
  dateStr: string; // YYYY-MM-DD
  dayName: string; // e.g. Thursday
  gregorianDisplay: string; // e.g. Thursday, 10 September 2026
  gregorianShort: string; // e.g. 10 Sep 2026
  hijriDisplay: string; // e.g. 28 Rabi al-Awwal 1448 AH
  hijriDetails: HijriDateDetails;
}

export function parseLocalDate(dateInput: Date | string): Date {
  if (dateInput instanceof Date) return dateInput;
  if (typeof dateInput === 'string') {
    // If YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
      const [y, m, d] = dateInput.split('-').map(Number);
      return new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
    }
    const parsed = new Date(dateInput);
    if (!isNaN(parsed.getTime())) return parsed;
  }
  return new Date();
}

export function formatDateStr(dateInput: Date | string): string {
  const d = parseLocalDate(dateInput);
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getHijriDate(dateInput: Date | string): HijriDateDetails {
  try {
    const date = parseLocalDate(dateInput);
    const parts = new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    }).formatToParts(date);

    let day = '', monthRaw = '', year = '';
    for (const p of parts) {
      if (p.type === 'day') day = p.value;
      if (p.type === 'month') monthRaw = p.value;
      if (p.type === 'year') year = p.value;
    }
    const month = ISLAMIC_MONTH_MAP[monthRaw] || monthRaw || 'Ramadan';
    return {
      day: day || '1',
      month: month,
      year: year || '1448',
      formatted: `${day} ${month} ${year} AH`,
    };
  } catch (_e) {
    return {
      day: '1',
      month: 'Ramadan',
      year: '1448',
      formatted: '1 Ramadan 1448 AH',
    };
  }
}

export function getDateInfo(dateInput: Date | string): DateInfo {
  const d = parseLocalDate(dateInput);
  const dateStr = formatDateStr(d);

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const shortMonthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const dayOfWeek = dayNames[d.getUTCDay()];
  const dayNum = d.getUTCDate();
  const monthName = monthNames[d.getUTCMonth()];
  const shortMonthName = shortMonthNames[d.getUTCMonth()];
  const year = d.getUTCFullYear();

  const gregorianDisplay = `${dayOfWeek}, ${dayNum} ${monthName} ${year}`;
  const gregorianShort = `${dayNum} ${shortMonthName} ${year}`;
  const hijriDetails = getHijriDate(d);

  return {
    dateStr,
    dayName: dayOfWeek,
    gregorianDisplay,
    gregorianShort,
    hijriDisplay: hijriDetails.formatted,
    hijriDetails,
  };
}
