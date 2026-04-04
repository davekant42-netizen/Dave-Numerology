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
  const nums: number[] =[];

  for (const ch of String(day)) nums.push(Number(ch));
  for (const ch of String(month)) nums.push(Number(ch));
  for (const ch of shortYear) nums.push(Number(ch));

  // RN: include ONLY if DD is NOT 1-9 and NOT 10/20/30
  const exemptDays =[10, 20, 30];
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

// UPDATED LOGIC: Mahadasha loops indefinitely (1-9) up to 120 years
export function calculateMahadashas(dob: Date, totalYears: number = 120): MahadashaEntry[] {
  const entries: MahadashaEntry[] =[];
  let currentStartDate = new Date(dob);
  let currentMD = getRootNumber(dob);
  const targetYear = dob.getFullYear() + totalYears;

  while (currentStartDate.getFullYear() < targetYear) {
    const duration = currentMD;
    const end = addYears(currentStartDate, duration);
    
    entries.push({
      number: currentMD,
      planet: PLANET_MAP[currentMD],
      years: duration,
      startDate: new Date(currentStartDate),
      endDate: end,
    });
    
    currentStartDate = end;
    currentMD = (currentMD % 9) + 1; // Loops back to 1 after 9
  }
  
  return entries;
}
// UPDATED LOGIC: Antardasha follows standard ISO weekday and direct Modulo 9 formula
export function calculateAntardashas(dob: Date, totalYears: number = 120): AntardashaEntry[] {
  const rn = getRootNumber(dob);
  const birthMonth = dob.getMonth() + 1;
  const entries: AntardashaEntry[] =[];

  for (let i = 0; i < totalYears; i++) {
    const yearStart = addYears(dob, i);
    const yearEnd = addYears(dob, i + 1);
    const currentYear = yearStart.getFullYear();
    const last2 = currentYear % 100;

    // New AD Logic using day weights
    const jsDay = yearStart.getDay();
    const dayValue = WEEKDAY_VALUES[jsDay];
    const adTotal = last2 + rn + birthMonth + dayValue;
    const adNumber = reduceToSingle(adTotal);

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

// UPDATED LOGIC: PD calculates exact days of the year and assigns remainder to the 9th period
export function calculatePratyantars(adNumber: number, adStart: Date): PratyantarEntry[] {
  const seq = getSequenceFrom(adNumber);
  const entries: PratyantarEntry[] =[];
  
  // Calculate total days in this specific year (365 or 366 for leap years)
  const bMonth = adStart.getMonth();
  const bDay = adStart.getDate();
  const year = adStart.getFullYear();
  
  const periodStart = new Date(year, bMonth, bDay);
  const periodEnd = new Date(year + 1, bMonth, bDay);
  const totalDays = Math.round((periodEnd.getTime() - periodStart.getTime()) / (1000 * 60 * 60 * 24));

  let dCursor = new Date(periodStart);
  let usedDays = 0;

  for (let i = 0; i < 9; i++) {
    const currentPd = seq[i];
    let days = currentPd * 8;
    
    // Balancing remaining days of the year in the final PD cycle
    if (i === 8) {
      days = totalDays - usedDays;
    }

    const end = addDays(new Date(dCursor), days);

    entries.push({
      number: currentPd,
      planet: PLANET_MAP[currentPd],
      days,
      startDate: new Date(dCursor),
      endDate: end,
    });

    usedDays += days;
    dCursor = end;
  }
  
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