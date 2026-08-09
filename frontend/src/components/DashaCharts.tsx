import React, { useState, useMemo } from 'react';
import { useTheme } from '@/hooks/useTheme';
import {
  getRootNumber, getDestinyNumber, collectGridNumbers,
  calculatePratyantars, reduceToSingle, getWeekdayValue,
  MahadashaEntry, AntardashaEntry, PLANET_MAP,
} from '@/lib/numerology';

/* ── constants ─────────────────────────────────────────────────────── */

const GRID_CELLS = [3, 1, 9, 6, 7, 5, 2, 8, 4];

const PC = {
  md: { c: '#ef4444', label: 'Mahadasha' },
  ad: { c: '#22c55e', label: 'Antardasha' },
  pd: { c: '#a855f7', label: 'Pratyantar' },
  dd: { c: '#d4af37', label: 'Dina Dasha' },
} as const;
type PK = keyof typeof PC;

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

/* ── helpers ───────────────────────────────────────────────────────── */

function buildFullMDs(dob: Date): MahadashaEntry[] {
  const rn = getRootNumber(dob);
  const limit = new Date(dob.getFullYear() + 120, dob.getMonth(), dob.getDate());
  const out: MahadashaEntry[] = [];
  let cur = new Date(dob), n = rn;
  while (cur < limit) {
    const end = new Date(cur.getFullYear() + n, cur.getMonth(), cur.getDate());
    out.push({ number: n, planet: PLANET_MAP[n], years: n, startDate: new Date(cur), endDate: new Date(end) });
    cur = end;
    n = n === 9 ? 1 : n + 1;
  }
  return out;
}

function digitCounts(dob: Date): Record<number, number> {
  const c: Record<number, number> = {};
  for (const n of collectGridNumbers(dob)) {
    if (n >= 1 && n <= 9) c[n] = (c[n] ?? 0) + 1;
  }
  return c;
}

function ageAt(dob: Date, d: Date): number {
  let a = d.getFullYear() - dob.getFullYear();
  if (d.getMonth() < dob.getMonth() || (d.getMonth() === dob.getMonth() && d.getDate() < dob.getDate())) a--;
  return Math.max(0, a);
}

function fmtD(d: Date) {
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function findMDN(date: Date, mds: MahadashaEntry[]): number {
  return (mds.find(m => date >= m.startDate && date < m.endDate) ?? mds[mds.length - 1]).number;
}

/* ── MiniGrid ──────────────────────────────────────────────────────── */

interface CircleDef { type: PK; n: number }

function MiniGrid({ rn, dn, counts, circles, dk }: {
  rn: number; dn: number;
  counts: Record<number, number>;
  circles: CircleDef[];
  dk: boolean;
}) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 3 }}>
      {GRID_CELLS.map(cell => {
        const cnt = counts[cell] ?? 0;
        const cirs = circles.filter(c => c.n === cell);
        const isRN = cell === rn, isDN = cell === dn;
        const hasCnt = cnt > 0, hasCir = cirs.length > 0;

        let bg = dk ? '#18172b' : '#f9fafb';
        if (isRN && hasCnt) bg = dk ? '#2a1515' : '#fff0f0';
        else if (isDN && hasCnt) bg = dk ? '#0f2318' : '#f0fdf4';
        else if (hasCnt || hasCir) bg = dk ? '#1e1c35' : '#fff';

        const txtColor = isRN
          ? (dk ? '#f87171' : '#dc2626')
          : isDN
          ? (dk ? '#4ade80' : '#16a34a')
          : (dk ? '#e2e0f0' : '#111827');

        const borderColor = dk ? '#2e2b45' : '#e5e7eb';
        const ghostColor  = dk ? '#3d3a5c' : '#d1d5db';

        return (
          <div key={cell} style={{
            background: bg,
            border: `1px solid ${borderColor}`,
            borderRadius: 5, minHeight: 48,
            padding: '3px 4px',
            display: 'flex', flexDirection: 'column',
            position: 'relative',
          }}>
            <span style={{
              position: 'absolute', top: 2, right: 3,
              fontSize: '0.4rem', color: ghostColor, lineHeight: 1,
            }}>
              {cell}
            </span>
            {hasCnt ? (
              <span style={{
                fontWeight: 800,
                fontSize: cnt > 2 ? '0.75rem' : '1rem',
                color: txtColor, lineHeight: 1,
                paddingTop: 5, flex: 1,
                letterSpacing: '-0.5px',
                fontVariantNumeric: 'tabular-nums',
              }}>
                {String(cell).repeat(cnt)}
              </span>
            ) : <div style={{ flex: 1 }} />}
            {hasCir && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {cirs.map(({ type, n }) => (
                  <div key={type} style={{
                    width: 18, height: 18, borderRadius: '50%',
                    background: PC[type].c,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <span style={{ fontWeight: 800, fontSize: '0.58rem', color: '#fff', letterSpacing: '-0.3px' }}>
                      {n}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Shared Card ───────────────────────────────────────────────────── */

function GridCard({ topLeft, topRight, extra, periodItems, isActive, activeColor, rn, dn, counts, dk }: {
  topLeft: React.ReactNode;
  topRight?: React.ReactNode;
  extra?: React.ReactNode;
  periodItems: CircleDef[];
  isActive: boolean;
  activeColor: string;
  rn: number; dn: number;
  counts: Record<number, number>;
  dk: boolean;
}) {
  return (
    <div style={{
      background: dk ? '#1e1c35' : '#fff',
      border: `1.5px solid ${isActive ? activeColor : (dk ? '#3d3a5c' : '#e5e7eb')}`,
      borderRadius: 10,
      overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
      boxShadow: isActive
        ? `0 4px 20px ${activeColor}30, 0 1px 4px ${activeColor}20`
        : (dk ? '0 1px 3px rgba(0,0,0,.3)' : '0 1px 3px rgba(0,0,0,.05)'),
    }}>
      {/* header — solid colored bg when active */}
      <div style={{
        background: isActive
          ? `linear-gradient(135deg,${activeColor},${activeColor}cc)`
          : (dk ? '#18172b' : '#fafafa'),
        padding: '8px 10px 7px',
        borderBottom: isActive ? 'none' : `1px solid ${dk ? '#2a2840' : '#f0f0f0'}`,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 5 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{
              fontWeight: 700, fontSize: '0.82rem', lineHeight: 1.2,
              color: isActive ? '#fff' : (dk ? '#e2e0f0' : '#111827'),
            }}>
              {topLeft}
            </span>
            {isActive && (
              <span style={{
                fontSize: '0.48rem', fontWeight: 900, letterSpacing: '1px',
                background: 'rgba(255,255,255,.25)', color: '#fff',
                borderRadius: 4, padding: '2px 6px',
                border: '1px solid rgba(255,255,255,.4)',
              }}>
                NOW
              </span>
            )}
          </div>
          <span style={{
            fontSize: '0.65rem', textAlign: 'right', lineHeight: 1.2,
            color: isActive ? 'rgba(255,255,255,.75)' : (dk ? '#6b6888' : '#9ca3af'),
          }}>
            {topRight}
          </span>
        </div>
        {extra}
      </div>
      {/* grid */}
      <div style={{ padding: 7, flex: 1 }}>
        <MiniGrid rn={rn} dn={dn} counts={counts} circles={periodItems} dk={dk} />
      </div>
    </div>
  );
}

/* ── Basic Grid Card ───────────────────────────────────────────────── */

function BasicGridCard({ rn, dn, counts, dk }: { rn: number; dn: number; counts: Record<number, number>; dk: boolean }) {
  return (
    <div style={{
      background: dk ? '#1e1c35' : '#fff',
      border: `1.5px solid ${dk ? '#3d3a5c' : '#e5e7eb'}`,
      borderRadius: 10, overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
    }}>
      <div style={{
        background: '#1e293b', padding: '10px 12px',
        color: '#fff', fontSize: '0.78rem', fontWeight: 700,
      }}>
        Basic Grid
      </div>
      <div style={{ padding: 7, flex: 1 }}>
        <MiniGrid rn={rn} dn={dn} counts={counts} circles={[]} dk={dk} />
      </div>
    </div>
  );
}

/* ── Legend ────────────────────────────────────────────────────────── */

function Legend({ dk }: { dk: boolean }) {
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
      {(Object.entries(PC) as [PK, typeof PC[PK]][]).map(([k, v]) => (
        <span key={k} style={{
          display: 'inline-flex', alignItems: 'center',
          background: v.c,
          color: '#fff',
          fontSize: '0.75rem', fontWeight: 700,
          padding: '5px 12px',
          borderRadius: 6,
          letterSpacing: '.2px',
        }}>
          {v.label}
        </span>
      ))}
    </div>
  );
}

/* ── Select helper ─────────────────────────────────────────────────── */

function Sel({ value, onChange, children, style, dk }: {
  value: string | number;
  onChange: (v: string) => void;
  children: React.ReactNode;
  style?: React.CSSProperties;
  dk: boolean;
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        border: `1px solid ${dk ? '#3d3a5c' : '#e5e7eb'}`,
        borderRadius: 6,
        padding: '4px 8px', fontSize: '0.75rem',
        color: dk ? '#e2e0f0' : '#374151',
        background: dk ? '#18172b' : '#fff',
        cursor: 'pointer', outline: 'none',
        colorScheme: dk ? 'dark' : 'light',
        ...style,
      }}
    >
      {children}
    </select>
  );
}

/* ── Main Component ────────────────────────────────────────────────── */

interface Props {
  dob: Date;
  mahadashas: MahadashaEntry[];
  antardashas: AntardashaEntry[];
}

type TabKey = 'mahadasha' | 'yearly' | 'monthly' | 'daily';

const TABS: { key: TabKey; label: string; isNew?: boolean; activeColor: string }[] = [
  { key: 'mahadasha', label: 'Mahadasha', activeColor: '#ef4444' },
  { key: 'yearly',    label: 'Yearly',    activeColor: '#6366f1' },
  { key: 'monthly',   label: 'Monthly',   activeColor: '#22c55e' },
  { key: 'daily',     label: 'Daily',     activeColor: '#f97316', isNew: true },
];

export default function DashaCharts({ dob, mahadashas, antardashas }: Props) {
  const { theme } = useTheme();
  const dk = theme === 'dark';

  const [tab, setTab] = useState<TabKey>('mahadasha');

  const now = useMemo(() => new Date(), []);
  const rn = useMemo(() => getRootNumber(dob), [dob]);
  const dn = useMemo(() => getDestinyNumber(dob), [dob]);
  const counts = useMemo(() => digitCounts(dob), [dob]);
  const fullMDs = useMemo(() => buildFullMDs(dob), [dob]);

  // ── Yearly state ──
  const [fromYear, setFromYear] = useState(() => Math.max(dob.getFullYear(), now.getFullYear() - 5));
  const [toYear,   setToYear]   = useState(() => now.getFullYear() + 15);

  // ── Monthly state ──
  const defaultAdIdx = useMemo(() => {
    const i = antardashas.findIndex(a => now >= a.startDate && now < a.endDate);
    return i >= 0 ? i : 0;
  }, [antardashas, now]);
  const [selAdIdx, setSelAdIdx] = useState(defaultAdIdx);

  // ── Daily state ──
  const [dailyYear,  setDailyYear]  = useState(now.getFullYear());
  const [dailyMonth, setDailyMonth] = useState(now.getMonth());

  // ── Current indicators ──
  const currentMD = useMemo(() => fullMDs.find(m => now >= m.startDate && now < m.endDate), [fullMDs, now]);
  const currentAD = useMemo(() => antardashas.find(a => now >= a.startDate && now < a.endDate), [antardashas, now]);

  // ── Yearly data ──
  const yearlyCards = useMemo(() => {
    return antardashas.filter(ad =>
      ad.startDate.getFullYear() >= fromYear &&
      ad.startDate.getFullYear() <= toYear
    ).map(ad => ({
      ad,
      mdN: findMDN(ad.startDate, fullMDs),
      isActive: !!currentAD && ad.startDate.getTime() === currentAD.startDate.getTime(),
    }));
  }, [antardashas, fromYear, toYear, fullMDs, currentAD]);

  // ── Monthly data (PDs of selected AD) ──
  const monthlyCards = useMemo(() => {
    const ad = antardashas[selAdIdx];
    if (!ad) return [];
    const pds = calculatePratyantars(ad.number, ad.startDate);
    const mdN = findMDN(ad.startDate, fullMDs);
    return pds.map(pd => ({
      pd,
      mdN,
      adN: ad.number,
      isActive: now >= pd.startDate && now < pd.endDate,
    }));
  }, [antardashas, selAdIdx, fullMDs, now]);

  // ── Daily data ──
  const dailyCards = useMemo(() => {
    const daysInMonth = new Date(dailyYear, dailyMonth + 1, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => {
      const date = new Date(dailyYear, dailyMonth, i + 1);
      const mdN = findMDN(date, fullMDs);
      const ad  = antardashas.find(a => date >= a.startDate && date < a.endDate);
      const adN = ad?.number ?? rn;
      let pdN = rn, ddN = rn;
      if (ad) {
        const pds = calculatePratyantars(ad.number, ad.startDate);
        const pd  = pds.find(p => date >= p.startDate && date < p.endDate) ?? pds[pds.length - 1];
        pdN = pd.number;
        ddN = reduceToSingle(pd.number + getWeekdayValue(date));
      }
      return {
        date, mdN, adN, pdN, ddN,
        isToday: date.toDateString() === now.toDateString(),
      };
    });
  }, [dailyYear, dailyMonth, fullMDs, antardashas, rn, now]);

  // ── Year options for dropdowns ──
  const yearOptions = useMemo(() =>
    antardashas.map((ad, i) => ({ value: i, label: `${ad.startDate.getFullYear()} – ${ad.endDate.getFullYear()} (${ad.age} yrs)` }))
  , [antardashas]);

  const activeTab = TABS.find(t => t.key === tab)!;

  return (
    <section>
      {/* ── Tab bar ── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: 12,
        marginBottom: 16,
        padding: '10px 16px',
        background: dk ? '#1a1827' : '#fff',
        border: `1px solid ${dk ? '#2e2b45' : '#e5e7eb'}`,
        borderRadius: 12,
        boxShadow: dk ? '0 1px 4px rgba(0,0,0,.3)' : '0 1px 4px rgba(0,0,0,.06)',
      }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {TABS.map(t => {
            const isActive = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                style={{
                  padding: '7px 18px',
                  borderRadius: 8,
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  letterSpacing: '.2px',
                  transition: 'all .15s',
                  background: isActive ? t.activeColor : 'transparent',
                  color: isActive ? '#fff' : (dk ? '#8b8aa0' : '#6b7280'),
                  position: 'relative',
                }}
              >
                {t.label}
                {t.isNew && (
                  <span style={{
                    position: 'absolute', top: -4, right: -2,
                    background: '#f97316', color: '#fff',
                    fontSize: '0.38rem', fontWeight: 900,
                    padding: '1px 4px', borderRadius: 4,
                    letterSpacing: '.8px',
                  }}>
                    NEW
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <Legend dk={dk} />
      </div>

      {/* ── Sub-header per tab ── */}
      <div style={{
        display: 'flex', alignItems: 'center', flexWrap: 'wrap',
        gap: 12, marginBottom: 14,
      }}>
        <span style={{ fontWeight: 700, fontSize: '0.82rem', color: dk ? '#e2e0f0' : '#374151' }}>
          {activeTab.label} Charts
        </span>

        {tab === 'yearly' && (
          <>
            <span style={{ fontSize: '0.75rem', color: dk ? '#6b6888' : '#9ca3af' }}>From</span>
            <Sel value={fromYear} onChange={v => setFromYear(Number(v))} dk={dk}>
              {antardashas.map(ad => (
                <option key={ad.startDate.getFullYear()} value={ad.startDate.getFullYear()}>
                  {ad.startDate.getFullYear()} ({ad.age} yrs)
                </option>
              ))}
            </Sel>
            <span style={{ fontSize: '0.75rem', color: dk ? '#6b6888' : '#9ca3af' }}>To</span>
            <Sel value={toYear} onChange={v => setToYear(Number(v))} dk={dk}>
              {antardashas.map(ad => (
                <option key={ad.startDate.getFullYear()} value={ad.startDate.getFullYear()}>
                  {ad.startDate.getFullYear()} ({ad.age} yrs)
                </option>
              ))}
            </Sel>
          </>
        )}

        {tab === 'monthly' && (
          <>
            <span style={{ fontSize: '0.75rem', color: dk ? '#6b6888' : '#9ca3af' }}>Year</span>
            <Sel value={selAdIdx} onChange={v => setSelAdIdx(Number(v))} dk={dk}>
              {yearOptions.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </Sel>
          </>
        )}

        {tab === 'daily' && (
          <>
            <span style={{ fontSize: '0.75rem', color: dk ? '#6b6888' : '#9ca3af' }}>Year</span>
            <Sel value={dailyYear} onChange={v => setDailyYear(Number(v))} dk={dk}>
              {Array.from({ length: 120 }, (_, i) => dob.getFullYear() + i).map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </Sel>
            <span style={{ fontSize: '0.75rem', color: dk ? '#6b6888' : '#9ca3af' }}>Month</span>
            <Sel value={dailyMonth} onChange={v => setDailyMonth(Number(v))} dk={dk}>
              {MONTH_NAMES.map((m, i) => (
                <option key={i} value={i}>{m}</option>
              ))}
            </Sel>
          </>
        )}
      </div>

      {/* ── Card grid ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">

        {/* Basic Grid — always first */}
        <BasicGridCard rn={rn} dn={dn} counts={counts} dk={dk} />

        {/* ── Mahadasha view ── */}
        {tab === 'mahadasha' && fullMDs.map((md, i) => {
          const isActive = !!currentMD && md.startDate.getTime() === currentMD.startDate.getTime();
          const startAge = ageAt(dob, md.startDate);
          const endAge   = ageAt(dob, md.endDate);
          return (
            <GridCard
              key={i}
              topLeft={`${md.startDate.getFullYear()} – ${md.endDate.getFullYear()}`}
              topRight={`${startAge} – ${endAge} yrs`}
              periodItems={[{ type: 'md', n: md.number }]}
              isActive={isActive}
              activeColor={activeTab.activeColor}
              rn={rn} dn={dn} counts={counts} dk={dk}
            />
          );
        })}

        {/* ── Yearly view ── */}
        {tab === 'yearly' && yearlyCards.map(({ ad, mdN, isActive }, i) => (
          <GridCard
            key={i}
            topLeft={`${ad.startDate.getFullYear()} – ${ad.endDate.getFullYear()}`}
            topRight={`${ad.age} yrs`}
            periodItems={[
              { type: 'md', n: mdN },
              { type: 'ad', n: ad.number },
            ]}
            isActive={isActive}
            activeColor={activeTab.activeColor}
            rn={rn} dn={dn} counts={counts} dk={dk}
          />
        ))}

        {/* ── Monthly view ── */}
        {tab === 'monthly' && monthlyCards.map(({ pd, mdN, adN, isActive }, i) => (
          <GridCard
            key={i}
            topLeft={fmtD(pd.startDate)}
            topRight={fmtD(pd.endDate)}
            periodItems={[
              { type: 'md', n: mdN },
              { type: 'ad', n: adN },
              { type: 'pd', n: pd.number },
            ]}
            isActive={isActive}
            activeColor={activeTab.activeColor}
            rn={rn} dn={dn} counts={counts} dk={dk}
          />
        ))}

        {/* ── Daily view ── */}
        {tab === 'daily' && dailyCards.map(({ date, mdN, adN, pdN, ddN, isToday }, i) => (
          <GridCard
            key={i}
            topLeft={fmtD(date)}
            topRight={isToday
              ? <span style={{
                  background: '#f97316', color: '#fff',
                  fontSize: '0.52rem', fontWeight: 900,
                  padding: '2px 7px', borderRadius: 4, letterSpacing: 1,
                }}>TODAY</span>
              : undefined
            }
            periodItems={[
              { type: 'md', n: mdN },
              { type: 'ad', n: adN },
              { type: 'pd', n: pdN },
              { type: 'dd', n: ddN },
            ]}
            isActive={isToday}
            activeColor={activeTab.activeColor}
            rn={rn} dn={dn} counts={counts} dk={dk}
          />
        ))}
      </div>
    </section>
  );
}
