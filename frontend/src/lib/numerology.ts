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

  const exemptDays =[10, 20, 30];
  if (day >= 10 && !exemptDays.includes(day)) {
    nums.push(getRootNumber(dob));
  }

  nums.push(getDestinyNumber(dob));

  return nums;
}

// ============ DASHA SYSTEM ============

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

export interface DailyDashaEntry {
  date: Date;
  weekday: string;
  wn: number;
  total: number;
  dd: number;
  planet: string;
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

export function getSequenceFrom(start: number): number[] {
  const seq: number[] = [start];
  let n = start;
  for (let i = 0; i < 8; i++) {
    n = n === 9 ? 1 : n + 1;
    seq.push(n);
  }
  return seq;
}

export function calculateMahadashas(dob: Date): MahadashaEntry[] {
  const seq = getSequenceFrom(getRootNumber(dob));
  const entries: MahadashaEntry[] = [];
  let currentStartDate = new Date(dob);

  for (const n of seq) {
    const end = addYears(currentStartDate, n);
    entries.push({
      number: n,
      planet: PLANET_MAP[n],
      years: n,
      startDate: new Date(currentStartDate),
      endDate: end,
    });
    currentStartDate = end;
  }
  
  return entries;
}

export function calculateAntardashas(dob: Date, totalYears: number = 120): AntardashaEntry[] {
  const rn = getRootNumber(dob);
  const birthMonth = dob.getMonth() + 1;
  const entries: AntardashaEntry[] = [];

  for (let i = 0; i < totalYears; i++) {
    const yearStart = addYears(dob, i);
    const yearEnd = addYears(dob, i + 1);
    const currentYear = yearStart.getFullYear();
    const last2 = currentYear % 100;

    const dobInY = new Date(currentYear, dob.getMonth(), dob.getDate());
    const dayValue = getWeekdayValue(dobInY);
    
    const num = reduceToSingle(last2 + birthMonth + rn + dayValue);

    entries.push({
      number: num,
      planet: PLANET_MAP[num],
      yearLabel: `${formatDateDMY(yearStart)} – ${formatDateDMY(yearEnd)}`,
      startDate: yearStart,
      endDate: yearEnd,
      age: i,
    });
  }

  return entries;
}

export function calculatePratyantars(adNumber: number, adStart: Date): PratyantarEntry[] {
  const seq = getSequenceFrom(adNumber);
  const entries: PratyantarEntry[] = [];
  
  const y = adStart.getFullYear();
  const leap = (y % 4 === 0 && y % 100 !== 0) || (y % 400 === 0);
  const bonus = new Array(9).fill(0);
  
  if (!leap) {
    bonus[2]++; bonus[4]++; bonus[6]++; bonus[8]++; bonus[8]++;
  } else {
    bonus[1]++; bonus[3]++; bonus[5]++; bonus[7]++; bonus[8] += 2;
  }

  let dCursor = new Date(adStart);

  seq.forEach((n, i) => {
    const days = n * 8 + bonus[i];
    const end = addDays(dCursor, days);

    entries.push({
      number: n,
      planet: PLANET_MAP[n],
      days,
      startDate: new Date(dCursor),
      endDate: end,
    });

    dCursor = addDays(end, 1);
  });
  
  return entries;
}

export interface MonthlyEntry {
  number: number;
  planet: string;
  startDate: Date;
  endDate: Date;
}

export function buildMonths(ad: AntardashaEntry): MonthlyEntry[] {
  const ms = ad.endDate.getTime() - ad.startDate.getTime();
  const seg = ms / 12;
  const out: MonthlyEntry[] = [];
  let n = ad.number;
  
  for (let i = 0; i < 12; i++) {
    out.push({
      number: n,
      planet: PLANET_MAP[n],
      startDate: new Date(ad.startDate.getTime() + seg * i),
      endDate: new Date(ad.startDate.getTime() + seg * (i + 1))
    });
    n = n === 9 ? 1 : n + 1;
  }
  
  return out;
}

export function buildDailyDasha(pd: PratyantarEntry): DailyDashaEntry[] {
  const entries: DailyDashaEntry[] = [];
  const cur = new Date(pd.startDate);
  cur.setHours(0, 0, 0, 0);
  const end = new Date(pd.endDate);
  end.setHours(0, 0, 0, 0);

  while (cur < end) {
    const wn = getWeekdayValue(cur);
    const total = pd.number + wn;
    const dd = reduceToSingle(total);
    
    entries.push({
      date: new Date(cur),
      weekday: cur.toLocaleDateString('en', { weekday: 'long' }),
      wn,
      total,
      dd,
      planet: PLANET_MAP[dd]
    });
    
    cur.setDate(cur.getDate() + 1);
  }
  
  return entries;
}

export function findCurrentStatus(
  dob: Date,
  mahadashas: MahadashaEntry[],
  antardashas: AntardashaEntry[]
): { md?: MahadashaEntry; ad?: AntardashaEntry; pd?: PratyantarEntry; todayDD?: number } {
  const now = Date.now();
  const md = mahadashas.find(m => now >= m.startDate.getTime() && now < m.endDate.getTime());
  const ad = antardashas.find(a => now >= a.startDate.getTime() && now < a.endDate.getTime());

  let pd: PratyantarEntry | undefined;
  let todayDD: number | undefined;

  if (ad) {
    const pds = calculatePratyantars(ad.number, ad.startDate);
    pd = pds.find(p => now >= p.startDate.getTime() && now < p.endDate.getTime());
    if (pd) {
      const today = new Date();
      const todayWN = getWeekdayValue(today);
      todayDD = reduceToSingle(pd.number + todayWN);
    }
  }

  return { md, ad, pd, todayDD };
}