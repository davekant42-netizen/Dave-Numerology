// ============ DAVE NUMEROLOGY CORE ============

export const PLANET_MAP: Record<number, string> = {
  1: 'Sun', 2: 'Moon', 3: 'Jupiter', 4: 'Rahu',
  5: 'Mercury', 6: 'Venus', 7: 'Ketu', 8: 'Saturn', 9: 'Mars',
};

// Weekday values (JS 0=Sun..6=Sat)
const WEEKDAY_VALUES: Record<number, number> = {
  0: 1, // Sunday
  1: 2, // Monday
  2: 9, // Tuesday
  3: 5, // Wednesday
  4: 3, // Thursday
  5: 6, // Friday
  6: 8, // Saturday
};

export function reduceToSingle(n: number): number {
  while (n > 9) {
    n = String(n).split('').reduce((s, d) => s + Number(d), 0);
  }
  return n;
}

export function getRootNumber(dob: Date): number {
  const day = dob.getDate();
  // Exemption: 10→1, 20→2, 30→3 (no double processing)
  if (day === 10) return 1;
  if (day === 20) return 2;
  if (day === 30) return 3;
  return reduceToSingle(day);
}

export function getDestinyNumber(dob: Date): number {
  const d = dob.getDate();
  const m = dob.getMonth() + 1;
  const y = dob.getFullYear();
  return reduceToSingle(d + m + reduceToSingle(y));
}

export function getWeekdayValue(date: Date): number {
  return WEEKDAY_VALUES[date.getDay()];
}

export function formatDateDMY(date: Date): string {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
}

// ============ VEDIC GRID ============

export function collectGridNumbers(dob: Date): number[] {
  const day = dob.getDate();
  const month = dob.getMonth() + 1;
  const year = dob.getFullYear();
  const shortYear = String(year).slice(2);
  const nums: number[] = [];

  for (const ch of String(day)) nums.push(Number(ch));
  for (const ch of String(month)) nums.push(Number(ch));
  for (const ch of shortYear) nums.push(Number(ch));

  // RN: include ONLY if DD is NOT 1-9 and NOT 10/20/30
  const exemptDays = [10, 20, 30];
  if (day >= 10 && !exemptDays.includes(day)) {
    nums.push(getRootNumber(dob));
  }

  // Destiny Number: always
  nums.push(getDestinyNumber(dob));

  return nums;
}

// ============ DASHA SYSTEM (120-Year) ============

export interface MahadashaEntry {
  number: number;
  planet: string;
  years: number;
  startDate: Date;
  endDate: Date;
}

export interface AntardashaEntry {
  number: number;
  planet: string;
  yearLabel: string;
  startDate: Date;
  endDate: Date;
  age: number;
}

export interface PratyantarEntry {
  number: number;
  planet: string;
  days: number;
  startDate: Date;
  endDate: Date;
}

function addYears(date: Date, years: number): Date {
  const d = new Date(date);
  d.setFullYear(d.getFullYear() + years);
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

// Generate 1-9 sequence starting from a given number
function getSequenceFrom(start: number): number[] {
  const seq: number[] = [start];
  let n = start;
  for (let i = 0; i < 8; i++) {
    n = n === 9 ? 1 : n + 1;
    seq.push(n);
  }
  return seq;
}

// Mahadasha: starts with RN, each MD lasts [MD number] years, sequence 1-9 repeating until 120 years
export function calculateMahadashas(dob: Date): MahadashaEntry[] {
  const rn = getRootNumber(dob);
  const entries: MahadashaEntry[] = [];
  let current = new Date(dob);
  let totalYears = 0;
  let currentMD = rn;

  while (totalYears < 120) {
    const end = addYears(current, currentMD);
    entries.push({
      number: currentMD,
      planet: PLANET_MAP[currentMD],
      years: currentMD,
      startDate: new Date(current),
      endDate: end,
    });
    totalYears += currentMD;
    current = end;

    currentMD++;
    if (currentMD > 9) {
      currentMD = 1;
    }
  }
  return entries;
}

// Antardasha: yearly (DOB to DOB), formula-based
export function calculateAntardashas(dob: Date, totalYears: number = 120): AntardashaEntry[] {
  const rn = getRootNumber(dob);
  const birthMonth = dob.getMonth() + 1;
  const entries: AntardashaEntry[] = [];

  for (let i = 0; i < totalYears; i++) {
    const yearStart = addYears(dob, i);
    const yearEnd = addYears(dob, i + 1);
    const currentYear = yearStart.getFullYear();
    const last2 = currentYear % 100;

    // Weekday value of DOB in that year
    const dobInYear = new Date(currentYear, dob.getMonth(), dob.getDate());
    const weekdayVal = getWeekdayValue(dobInYear);

    const adNumber = reduceToSingle(last2 + birthMonth + rn + weekdayVal);

    entries.push({
      number: adNumber,
      planet: PLANET_MAP[adNumber],
      yearLabel: `${formatDateDMY(yearStart)} – ${formatDateDMY(yearEnd)}`,
      startDate: yearStart,
      endDate: yearEnd,
      age: i,
    });
  }

  return entries;
}

// Pratyantar Dasha: 9 periods within each AD year (leap-year aware)
export function calculatePratyantars(adNumber: number, adStart: Date): PratyantarEntry[] {
  const seq = getSequenceFrom(adNumber);
  const entries: PratyantarEntry[] = [];

  // Leap-year adjustment — based on the AD period's own year, not today
  const year = adStart.getFullYear();
  const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  const extraDays = isLeapYear ? 6 : 5;

  // Distribute extra days across the 9 PDs
  // Normal year (5): +1 each to PDs at index 2,4,6,8 and +1 extra to last (index 8)
  // Leap year   (6): +1 each to PDs at index 1,3,5,7 and +1 extra to last two (index 7,8)
  const bonus = new Array(9).fill(0);
  if (extraDays === 5) {
    bonus[2] += 1; bonus[4] += 1; bonus[6] += 1; bonus[8] += 1;
    bonus[8] += 1;
  } else {
    bonus[1] += 1; bonus[3] += 1; bonus[5] += 1; bonus[7] += 1;
    bonus[8] += 2;
  }

  let current = new Date(adStart);
  seq.forEach((num, i) => {
    const days = num * 8 + bonus[i]; // base PD × 8 + leap-year share
    const end = addDays(current, days);
    entries.push({
      number: num,
      planet: PLANET_MAP[num],
      days,
      startDate: new Date(current),
      endDate: end,
    });
    // Next PD starts the day AFTER previous PD end (no overlap)
    current = addDays(end, 1);
  });
  return entries;
}

// Find current active periods
export function findCurrentStatus(
  dob: Date,
  mahadashas: MahadashaEntry[],
  antardashas: AntardashaEntry[]
): { md?: MahadashaEntry; ad?: AntardashaEntry; pd?: PratyantarEntry } {
  const now = Date.now();

  const md = mahadashas.find(m => now >= m.startDate.getTime() && now < m.endDate.getTime());
  const ad = antardashas.find(a => now >= a.startDate.getTime() && now < a.endDate.getTime());

  let pd: PratyantarEntry | undefined;
  if (ad) {
    const pds = calculatePratyantars(ad.number, ad.startDate);
    pd = pds.find(p => now >= p.startDate.getTime() && now < p.endDate.getTime());
  }

  return { md, ad, pd };
}

/**
 * Subdivide an Antardasha year into 12 equal months.
 * Sequence 1-9 looping from the AD number.
 */
export function buildMonths(ad: AntardashaEntry) {
  const ms = ad.endDate.getTime() - ad.startDate.getTime();
  const seg = ms / 12;
  const months: { number: number; planet: string; start: Date; end: Date }[] = [];
  let n = ad.number;
  for (let i = 0; i < 12; i++) {
    const start = new Date(ad.startDate.getTime() + seg * i);
    const end = new Date(ad.startDate.getTime() + seg * (i + 1));
    months.push({ number: n, planet: PLANET_MAP[n], start, end });
    n = n === 9 ? 1 : n + 1;
  }
  return months;
}
