import { useMemo, useState } from 'react';
import {
  getRootNumber, getDestinyNumber, formatDateDMY,
  calculatePratyantars, reduceToSingle, getWeekdayValue,
  MahadashaEntry, AntardashaEntry,
} from '@/lib/numerology';

const GRID_ORDER = [3, 1, 9, 6, 7, 5, 2, 8, 4];

const PERIOD = {
  md: { bg: '#7c3aed', glow: 'rgba(124,58,237,.30)', label: 'MD' },
  ad: { bg: '#047857', glow: 'rgba(4,120,87,.30)',   label: 'AD' },
  pd: { bg: '#b45309', glow: 'rgba(180,83,9,.30)',   label: 'PD' },
  dd: { bg: '#be185d', glow: 'rgba(190,24,93,.30)',  label: 'DD' },
} as const;

type PeriodKey = keyof typeof PERIOD;

interface Props {
  dob: Date;
  mahadashas: MahadashaEntry[];
  antardashas: AntardashaEntry[];
}

function getGridBreakdown(dob: Date) {
  const day   = dob.getDate();
  const month = dob.getMonth() + 1;
  const yr2   = (dob.getFullYear() % 100).toString().padStart(2, '0');
  const dobDigits: number[] = [];
  for (const ch of day.toString())   dobDigits.push(+ch);
  for (const ch of month.toString()) dobDigits.push(+ch);
  for (const ch of yr2)              dobDigits.push(+ch);
  const exempt   = [10, 20, 30];
  const rnDigits = day >= 10 && !exempt.includes(day) ? [getRootNumber(dob)] : [];
  const dnDigits = [getDestinyNumber(dob)];
  return { dobDigits, rnDigits, dnDigits };
}

// ── Grid Cell ─────────────────────────────────────────────────────
function GridCell({
  cellNum, dobDigits, rnDigits, dnDigits, mdN, adN, pdN, ddN,
}: {
  cellNum: number;
  dobDigits: number[]; rnDigits: number[]; dnDigits: number[];
  mdN: number; adN: number; pdN: number; ddN: number;
}) {
  const dobHits = dobDigits.filter(n => n === cellNum);
  const rnHits  = rnDigits.filter(n  => n === cellNum);
  const dnHits  = dnDigits.filter(n  => n === cellNum);

  const badges: { type: PeriodKey; n: number }[] = [];
  if (mdN === cellNum) badges.push({ type: 'md', n: mdN });
  if (adN === cellNum) badges.push({ type: 'ad', n: adN });
  if (pdN === cellNum) badges.push({ type: 'pd', n: pdN });
  if (ddN === cellNum) badges.push({ type: 'dd', n: ddN });

  const hasDigits = dobHits.length || rnHits.length || dnHits.length;
  const hasContent = hasDigits || badges.length;

  return (
    <div style={{
      position: 'relative',
      background: hasContent ? '#fff' : '#f8f7f5',
      border: `1.5px solid ${hasContent ? '#c7d2fe' : '#e4e0d8'}`,
      borderLeft: `3px solid ${hasContent ? '#6366f1' : '#e4e0d8'}`,
      borderRadius: 8,
      minHeight: 72,
      display: 'flex',
      flexDirection: 'column',
      padding: '6px 6px 6px 8px',
    }}>
      {/* top accent bar */}
      {hasContent && (
        <div style={{
          position: 'absolute', top: 0, left: 2, right: 0,
          height: 2,
          background: 'linear-gradient(90deg,#4f46e5,#818cf8)',
          borderRadius: '0 8px 0 0', opacity: .65,
        }} />
      )}

      {/* ghost label */}
      <span style={{
        position: 'absolute', top: 5, right: 6,
        fontFamily: 'Georgia,serif', fontWeight: 700,
        fontSize: '0.62rem', color: '#d6d0c7',
        lineHeight: 1, pointerEvents: 'none', userSelect: 'none',
      }}>
        {cellNum}
      </span>

      {/* large digits */}
      {hasDigits ? (
        <div style={{
          display: 'flex', flexWrap: 'wrap',
          gap: '0px 4px', paddingRight: 14, flex: 1, paddingTop: 5,
          alignItems: 'flex-start',
        }}>
          {dobHits.map((_, i) => (
            <span key={`d${i}`} style={{
              fontFamily: 'Georgia,serif', fontWeight: 700,
              fontSize: '1.35rem', color: '#1a1a1a', lineHeight: 1.05,
            }}>
              {cellNum}
            </span>
          ))}
          {rnHits.map((_, i) => (
            <span key={`r${i}`} style={{
              fontFamily: 'Georgia,serif', fontWeight: 700,
              fontSize: '1.35rem', color: '#1d4ed8', lineHeight: 1.05,
            }}>
              {cellNum}
            </span>
          ))}
          {dnHits.map((_, i) => (
            <span key={`n${i}`} style={{
              fontFamily: 'Georgia,serif', fontWeight: 700,
              fontSize: '1.35rem', color: '#b91c1c', lineHeight: 1.05,
            }}>
              {cellNum}
            </span>
          ))}
        </div>
      ) : <div style={{ flex: 1 }} />}

      {/* dasha circles */}
      {badges.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, marginTop: 4 }}>
          {badges.map(({ type, n }) => (
            <div key={type} style={{
              width: 24, height: 24, borderRadius: '50%',
              background: PERIOD[type].bg,
              boxShadow: `0 2px 7px ${PERIOD[type].glow}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{
                fontFamily: 'Georgia,serif', fontWeight: 700,
                fontSize: '0.75rem', color: '#fff', lineHeight: 1,
              }}>
                {n}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Year Card ─────────────────────────────────────────────────────
function YearCard({
  calYear, isCurrent, mdN, adN, pdN, ddN,
  dobDigits, rnDigits, dnDigits,
}: {
  calYear: number; isCurrent: boolean;
  mdN: number; adN: number; pdN: number; ddN: number;
  dobDigits: number[]; rnDigits: number[]; dnDigits: number[];
}) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 16,
      border: `1.5px solid ${isCurrent ? '#a5b4fc' : '#eae7e1'}`,
      boxShadow: isCurrent
        ? '0 0 0 3px rgba(99,102,241,.13), 0 8px 24px rgba(28,25,23,.10)'
        : '0 1px 4px rgba(28,25,23,.05), 0 4px 12px rgba(28,25,23,.06)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      transition: 'transform .18s ease, box-shadow .18s ease',
    }}
    onMouseEnter={e => {
      (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
      (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(28,25,23,.12), 0 2px 6px rgba(28,25,23,.06)';
    }}
    onMouseLeave={e => {
      (e.currentTarget as HTMLElement).style.transform = '';
      (e.currentTarget as HTMLElement).style.boxShadow = isCurrent
        ? '0 0 0 3px rgba(99,102,241,.13), 0 8px 24px rgba(28,25,23,.10)'
        : '0 1px 4px rgba(28,25,23,.05), 0 4px 12px rgba(28,25,23,.06)';
    }}>

      {/* current indicator bar */}
      {isCurrent && (
        <div style={{
          height: 3, flexShrink: 0,
          background: 'linear-gradient(90deg,#4f46e5,#818cf8,#7c3aed)',
        }} />
      )}

      {/* ── header ── */}
      <div style={{
        background: isCurrent
          ? 'linear-gradient(160deg,#f5f3ff 0%,#faf9fd 100%)'
          : 'linear-gradient(180deg,#fdfcfa 0%,#f9f8f5 100%)',
        borderBottom: `1px solid ${isCurrent ? '#ddd6fe' : '#eae7e1'}`,
        padding: '10px 12px 9px',
      }}>
        {/* year + pill */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{
            fontFamily: 'Georgia,serif', fontWeight: 700,
            fontSize: '1.6rem', letterSpacing: '-0.5px',
            color: isCurrent ? '#4338ca' : '#1c1917', lineHeight: 1,
          }}>
            {calYear}
          </span>
          <span style={{
            fontSize: '0.54rem', textTransform: 'uppercase' as const,
            letterSpacing: '.7px', fontWeight: 700,
            color: isCurrent ? '#fff' : '#4338ca',
            background: isCurrent ? 'linear-gradient(135deg,#4f46e5,#7c3aed)' : '#eef2ff',
            border: `1px solid ${isCurrent ? 'transparent' : '#c7d2fe'}`,
            borderRadius: 50, padding: '3px 9px',
            boxShadow: isCurrent ? '0 2px 8px rgba(79,70,229,.28)' : 'none',
            whiteSpace: 'nowrap' as const,
          }}>
            ✦ VEDIC GRID
          </span>
        </div>

        {/* period row */}
        <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '5px 9px', alignItems: 'center' }}>
          {(['md', 'ad', 'pd', 'dd'] as PeriodKey[]).map(type => {
            const n = type === 'md' ? mdN : type === 'ad' ? adN : type === 'pd' ? pdN : ddN;
            return (
              <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <span style={{
                  fontSize: '0.5rem', fontWeight: 700,
                  textTransform: 'uppercase' as const,
                  color: PERIOD[type].bg, letterSpacing: '.5px',
                }}>
                  {PERIOD[type].label}
                </span>
                <div style={{
                  width: 23, height: 23, borderRadius: '50%',
                  background: PERIOD[type].bg,
                  boxShadow: `0 2px 6px ${PERIOD[type].glow}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{
                    fontFamily: 'Georgia,serif', fontWeight: 700,
                    fontSize: '0.78rem', color: '#fff', lineHeight: 1,
                  }}>
                    {n}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 3×3 grid ── */}
      <div style={{ padding: 8, flex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 5 }}>
          {GRID_ORDER.map(cellNum => (
            <GridCell
              key={cellNum}
              cellNum={cellNum}
              dobDigits={dobDigits} rnDigits={rnDigits} dnDigits={dnDigits}
              mdN={mdN} adN={adN} pdN={pdN} ddN={ddN}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────
export default function YearGridCards({ dob, mahadashas, antardashas }: Props) {
  const rn = getRootNumber(dob);
  const dn = getDestinyNumber(dob);
  const { dobDigits, rnDigits, dnDigits } = useMemo(() => getGridBreakdown(dob), [dob]);
  const now = new Date();
  const [showAll, setShowAll] = useState(false);

  const allCards = useMemo(() => {
    return antardashas.map(ad => {
      const md  = mahadashas.find(m => ad.startDate >= m.startDate && ad.startDate < m.endDate);
      const mdN = md ? md.number : rn;
      const pds = calculatePratyantars(ad.number, ad.startDate);
      const isCurrent = now >= ad.startDate && now < ad.endDate;

      const cardPD = isCurrent
        ? (pds.find(p => now >= p.startDate && now < p.endDate) ?? pds[0])
        : now >= ad.endDate ? pds[pds.length - 1] : pds[0];

      const ddDate = isCurrent ? now : cardPD.startDate;
      const ddN    = reduceToSingle(cardPD.number + getWeekdayValue(ddDate));

      return { calYear: ad.startDate.getFullYear(), isCurrent, mdN, adN: ad.number, pdN: cardPD.number, ddN };
    });
  }, [dob, mahadashas, antardashas]);

  const currentIdx   = allCards.findIndex(c => c.isCurrent);
  const startIdx     = Math.max(0, currentIdx >= 0 ? currentIdx : 0);
  const visibleCards = showAll ? allCards : allCards.slice(startIdx, startIdx + 12);
  const startYear    = visibleCards[0]?.calYear ?? new Date().getFullYear();

  return (
    <section>
      {/* ── header bar ── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', flexWrap: 'wrap', gap: 14, marginBottom: 20,
        padding: '14px 20px',
        background: 'linear-gradient(135deg,#f5f3ff 0%,#fff 60%,#fdf2f8 100%)',
        borderRadius: 14,
        border: '1px solid #e9e7f0',
        boxShadow: '0 2px 8px rgba(99,102,241,.07)',
      }}>
        <div>
          <p style={{
            fontSize: '1.05rem', fontWeight: 700,
            color: '#1c1917', letterSpacing: '-0.2px',
          }}>
            DOB:&nbsp;
            <span style={{ fontFamily: 'Georgia,serif' }}>{formatDateDMY(dob)}</span>
            <span style={{ color: '#c4bfb8', margin: '0 8px' }}>·</span>
            <span style={{ fontFamily: 'Georgia,serif' }}>{visibleCards.length}</span>
            <span style={{ fontWeight: 500, color: '#78716c' }}> Years from </span>
            <span style={{ fontFamily: 'Georgia,serif' }}>{startYear}</span>
          </p>
          <p style={{ fontSize: '0.76rem', color: '#a09590', marginTop: 3 }}>
            Showing {visibleCards.length} individual grids — all years at a glance
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{
            background: '#dbeafe', border: '1.5px solid #93c5fd', borderRadius: 50,
            display: 'flex', alignItems: 'center', gap: 6, padding: '6px 16px',
            boxShadow: '0 2px 8px rgba(29,78,216,.12)',
          }}>
            <span style={{ fontSize: '0.58rem', color: '#1d4ed8', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' as const }}>RN</span>
            <span style={{ fontFamily: 'Georgia,serif', fontWeight: 700, fontSize: '1.3rem', color: '#1d4ed8', lineHeight: 1 }}>{rn}</span>
          </div>
          <div style={{
            background: '#fee2e2', border: '1.5px solid #fca5a5', borderRadius: 50,
            display: 'flex', alignItems: 'center', gap: 6, padding: '6px 16px',
            boxShadow: '0 2px 8px rgba(185,28,28,.12)',
          }}>
            <span style={{ fontSize: '0.58rem', color: '#b91c1c', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' as const }}>DN</span>
            <span style={{ fontFamily: 'Georgia,serif', fontWeight: 700, fontSize: '1.3rem', color: '#b91c1c', lineHeight: 1 }}>{dn}</span>
          </div>
        </div>
      </div>

      {/* ── cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {visibleCards.map(card => (
          <YearCard
            key={card.calYear}
            {...card}
            dobDigits={dobDigits}
            rnDigits={rnDigits}
            dnDigits={dnDigits}
          />
        ))}
      </div>

      {/* ── expand button ── */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
        <button
          onClick={() => setShowAll(v => !v)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            padding: '9px 24px', cursor: 'pointer',
            fontSize: '0.8rem', fontWeight: 600, color: '#4338ca',
            background: '#eef2ff', border: '1.5px solid #c7d2fe',
            borderRadius: 8, transition: 'all .15s',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = '#e0e7ff';
            (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(99,102,241,.2)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = '#eef2ff';
            (e.currentTarget as HTMLElement).style.boxShadow = 'none';
          }}
        >
          {showAll ? '↑ Show Less' : '↓ Show All 120 Years'}
        </button>
      </div>
    </section>
  );
}
