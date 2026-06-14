import { useTheme } from '@/hooks/useTheme';
import {
  collectGridNumbers, findCurrentStatus, getWeekdayValue, reduceToSingle,
  MahadashaEntry, AntardashaEntry, PratyantarEntry,
  PLANET_MAP, getRootNumber, getDestinyNumber,
} from '@/lib/numerology';

interface VedicGridProps {
  dob?: Date;
  mahadashas?: MahadashaEntry[];
  antardashas?: AntardashaEntry[];
  customNumbers?: number[];
  small?: boolean;
  currentStatus?: {
    md?: MahadashaEntry;
    ad?: AntardashaEntry;
    pd?: PratyantarEntry;
    todayDD?: number;
  };
}

const GRID = [
  [3, 1, 9],
  [6, 7, 5],
  [2, 8, 4],
];

const PS = {
  md: { bg: '#7c3aed', glow: 'rgba(124,58,237,.22)', light: '#f5f3ff', border: '#ddd6fe', label: 'Maha Dasha',       short: 'MD' },
  ad: { bg: '#059669', glow: 'rgba(5,150,105,.22)',  light: '#ecfdf5', border: '#a7f3d0', label: 'Antar Dasha',      short: 'AD' },
  pd: { bg: '#d97706', glow: 'rgba(217,119,6,.22)',  light: '#fffbeb', border: '#fde68a', label: 'Pratyantar Dasha', short: 'PD' },
  dd: { bg: '#e11d48', glow: 'rgba(225,29,72,.22)',  light: '#fff1f2', border: '#fecdd3', label: 'Daily Dasha',      short: 'DD' },
} as const;

type PKey = keyof typeof PS;

/* ── helpers ─────────────────────────────────────────────────── */

function getDigitBreakdown(dob: Date) {
  const day   = dob.getDate();
  const month = dob.getMonth() + 1;
  const yr2   = (dob.getFullYear() % 100).toString().padStart(2, '0');
  const exempt = [10, 20, 30];

  const plainD: number[] = [];
  const rnD: number[]    = [];

  if (day < 10) {
    // single-digit day IS the root number
    rnD.push(day);
  } else {
    for (const ch of day.toString()) plainD.push(+ch);
    if (!exempt.includes(day)) rnD.push(getRootNumber(dob));
  }

  for (const ch of month.toString()) plainD.push(+ch);
  for (const ch of yr2)              plainD.push(+ch);

  const dnD = [getDestinyNumber(dob)];
  return { plainD, rnD, dnD };
}

/* ── Small variant ────────────────────────────────────────────── */

function SmallGrid({ numbers }: { numbers: number[] }) {
  const counts: Record<number, number> = {};
  for (const n of numbers) if (n >= 1 && n <= 9) counts[n] = (counts[n] || 0) + 1;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 3 }}>
      {GRID.flat().map((digit, i) => {
        const count = counts[digit] || 0;
        return (
          <div key={i} style={{
            width: 28, height: 28, borderRadius: 4,
            background: count > 0 ? '#eef2ff' : '#f5f5f5',
            border: `1px solid ${count > 0 ? '#c7d2fe' : '#e5e5e5'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontFamily: 'Georgia,serif', fontWeight: 700, fontSize: '0.7rem', color: count > 0 ? '#4338ca' : '#ccc' }}>
              {count > 0 ? Array(count).fill(digit).join('') : digit}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ── Main VedicGrid ───────────────────────────────────────────── */

const VedicGrid = ({ dob, mahadashas, antardashas, customNumbers, small, currentStatus: extStatus }: VedicGridProps) => {
  const { theme } = useTheme();
  const dk = theme === 'dark';

  if (small) {
    const numbers = customNumbers ?? (dob ? collectGridNumbers(dob) : []);
    return <SmallGrid numbers={numbers} />;
  }
  if (!dob) return null;

  const rn = getRootNumber(dob);
  const dn = getDestinyNumber(dob);
  const { plainD, rnD, dnD } = getDigitBreakdown(dob);

  let mdNum: number | undefined, adNum: number | undefined,
      pdNum: number | undefined, ddNum: number | undefined;
  if (extStatus) {
    mdNum = extStatus.md?.number;
    adNum = extStatus.ad?.number;
    pdNum = extStatus.pd?.number;
    ddNum = extStatus.todayDD;
  } else if (mahadashas && antardashas) {
    const cur = findCurrentStatus(dob, mahadashas, antardashas);
    mdNum = cur.md?.number;
    adNum = cur.ad?.number;
    pdNum = cur.pd?.number;
    if (pdNum != null) ddNum = reduceToSingle(pdNum + getWeekdayValue(new Date()));
  }

  const bnCounts: Record<number, number> = {};
  for (const n of collectGridNumbers(dob)) if (n >= 1 && n <= 9) bnCounts[n] = (bnCounts[n] || 0) + 1;

  // Which dasha types are active on each cell
  function cellDashas(cell: number): PKey[] {
    const d: PKey[] = [];
    if (mdNum === cell) d.push('md');
    if (adNum === cell) d.push('ad');
    if (pdNum === cell) d.push('pd');
    if (ddNum === cell) d.push('dd');
    return d;
  }

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'flex-start' }}>

      {/* ── 3×3 grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 7, flexShrink: 0 }}>
        {GRID.flat().map((cellNum, i) => {
          const plainHits = plainD.filter(n => n === cellNum);
          const rnHits    = rnD.filter(n  => n === cellNum);
          const dnHits    = dnD.filter(n  => n === cellNum);
          const dashas    = cellDashas(cellNum);
          const totalDigits = plainHits.length + rnHits.length + dnHits.length;
          const hasDigits  = totalDigits > 0;
          const hasContent = hasDigits || dashas.length > 0;

          const isRN = cellNum === rn;
          const isDN = cellNum === dn;

          const numColor    = dk ? '#e2e0f0' : '#1a1a1a';
          const rLabelColor = '#dc2626';
          const dLabelColor = '#16a34a';

          const cellBg    = isRN && hasDigits ? (dk ? '#2a1515' : '#fff5f5')
                          : isDN && hasDigits ? (dk ? '#0f2318' : '#f0fdf4')
                          : hasContent        ? (dk ? '#1e1c35' : '#fff')
                          :                     (dk ? '#18172b' : '#f8f7f6');

          const borderColor = dk
            ? (hasContent ? '#3d3a5c' : '#2a2840')
            : (hasContent ? '#dde0f0' : '#ece8e3');
          const accentColor = isRN ? (dk ? '#f87171' : '#dc2626')
                            : isDN ? (dk ? '#4ade80' : '#16a34a')
                            :        '#6366f1';
          const ghostColor  = dk ? '#3d3a5c' : '#ddd8cf';

          return (
            <div key={i} style={{
              position: 'relative',
              width: 90, height: 90,
              background: cellBg,
              border: `1.5px solid ${borderColor}`,
              borderRadius: 11,
              display: 'flex', flexDirection: 'column',
              padding: '7px 7px 5px 9px',
              boxShadow: hasContent
                ? (dk ? '0 1px 6px rgba(0,0,0,.3)' : '0 1px 6px rgba(99,102,241,.07)')
                : 'none',
              overflow: 'hidden',
            }}>

              {/* top accent stripe */}
              {hasContent && (
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                  background: `linear-gradient(90deg,${accentColor},${accentColor}55)`,
                }} />
              )}

              {/* active dasha dots */}
              {dashas.length > 0 && (
                <div style={{
                  position: 'absolute', bottom: 5, right: 5,
                  display: 'flex', gap: 2,
                }}>
                  {dashas.map(type => (
                    <div key={type} style={{
                      width: 6, height: 6, borderRadius: '50%',
                      background: PS[type].bg,
                      boxShadow: `0 0 4px ${PS[type].bg}`,
                    }} />
                  ))}
                </div>
              )}

              {/* ghost label */}
              <span style={{
                position: 'absolute', top: 6, right: 7,
                fontWeight: 700,
                fontSize: '0.62rem', color: ghostColor, lineHeight: 1, userSelect: 'none',
              }}>
                {cellNum}
              </span>

              {/* digits */}
              {hasDigits ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0 3px', paddingRight: 12, flex: 1, paddingTop: 7, alignItems: 'flex-start' }}>
                  {plainHits.map((_, j) => (
                    <span key={`p-${j}`} style={{ fontWeight: 800, fontSize: '1.45rem', color: numColor, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
                      {cellNum}
                    </span>
                  ))}
                  {rnHits.map((_, j) => (
                    <span key={`r-${j}`} style={{ display: 'inline-flex', alignItems: 'flex-start', gap: 1 }}>
                      <span style={{ fontWeight: 800, fontSize: '1.45rem', color: numColor, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{cellNum}</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: rLabelColor, lineHeight: 1, paddingTop: 2 }}>r</span>
                    </span>
                  ))}
                  {dnHits.map((_, j) => (
                    <span key={`d-${j}`} style={{ display: 'inline-flex', alignItems: 'flex-start', gap: 1 }}>
                      <span style={{ fontWeight: 800, fontSize: '1.45rem', color: numColor, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{cellNum}</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: dLabelColor, lineHeight: 1, paddingTop: 2 }}>d</span>
                    </span>
                  ))}
                </div>
              ) : <div style={{ flex: 1 }} />}

              {/* dasha circles */}
              {dashas.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, marginBottom: 2 }}>
                  {dashas.map(type => (
                    <div key={type} style={{
                      width: 25, height: 25, borderRadius: '50%',
                      background: PS[type].bg,
                      boxShadow: `0 2px 6px ${PS[type].glow}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <span style={{ fontWeight: 800, fontSize: '0.75rem', color: '#fff', lineHeight: 1 }}>
                        {cellNum}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Active Dasha panel ── */}
      <div style={{
        background: dk ? '#16142a' : 'linear-gradient(160deg,#fafafa 0%,#fff 100%)',
        border: `1px solid ${dk ? '#2e2b45' : '#ece8e2'}`,
        borderRadius: 16,
        overflow: 'hidden',
        minWidth: 270,
        flex: 1,
        boxShadow: dk ? '0 2px 16px rgba(0,0,0,.4)' : '0 2px 16px rgba(28,25,23,.07)',
      }}>
        {/* panel header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '12px 18px 10px',
          borderBottom: `1px solid ${dk ? '#2e2b45' : '#f0ece6'}`,
          background: dk ? '#1e1c35' : 'linear-gradient(90deg,#fafaf9,#f5f3f0)',
        }}>
          <span style={{
            fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase',
            letterSpacing: '2.5px', color: dk ? '#6b6888' : '#a8a09a',
          }}>
            Active Dasha Periods
          </span>
          <span style={{
            fontSize: '0.62rem', fontWeight: 500,
            color: dk ? '#6b6888' : '#b5b0aa',
            background: dk ? '#2a2840' : '#f0ede8',
            borderRadius: 50, padding: '2px 9px',
          }}>
            {dateStr}
          </span>
        </div>

        {/* rows */}
        <div style={{ padding: '4px 0' }}>
          <DashaRow
            color="#f97316" lightBg={dk ? '#2a1f0e' : '#fff7ed'} dk={dk}
            label="Birth Numbers" badge="BN"
            value={Object.keys(bnCounts).sort().join(', ') || '—'}
            planet={Object.keys(bnCounts).sort().map(n => PLANET_MAP[+n]).join(', ')}
            isBN
          />
          {(['md','ad','pd','dd'] as PKey[]).map(type => {
            const num = type === 'md' ? mdNum : type === 'ad' ? adNum : type === 'pd' ? pdNum : ddNum;
            return (
              <DashaRow
                key={type}
                color={PS[type].bg}
                lightBg={dk ? `${PS[type].bg}20` : PS[type].light}
                dk={dk}
                label={PS[type].label} badge={PS[type].short}
                value={num != null ? String(num) : '—'}
                planet={num != null ? PLANET_MAP[num] : ''}
              />
            );
          })}
        </div>

        {/* RN / DN footer */}
        <div style={{
          display: 'flex', gap: 10, padding: '12px 18px',
          borderTop: `1px solid ${dk ? '#2e2b45' : '#f0ece6'}`,
          background: dk ? '#1a1827' : '#faf9f7',
        }}>
          <Chip label="RN" value={rn} planet={PLANET_MAP[rn]}
            color={dk ? '#93c5fd' : '#1d4ed8'}
            bg={dk ? '#172038' : '#dbeafe'}
            border={dk ? '#2563eb50' : '#93c5fd'} />
          <Chip label="DN" value={dn} planet={PLANET_MAP[dn]}
            color={dk ? '#fca5a5' : '#b91c1c'}
            bg={dk ? '#2a1010' : '#fee2e2'}
            border={dk ? '#dc262650' : '#fca5a5'} />
        </div>
      </div>
    </div>
  );
};

/* ── Dasha Row ────────────────────────────────────────────────── */

function DashaRow({ color, lightBg, dk, label, badge, value, planet, isBN }: {
  color: string; lightBg: string; dk: boolean;
  label: string; badge: string;
  value: string; planet: string;
  isBN?: boolean;
}) {
  const labelColor  = dk ? '#c4c0d8' : '#3d3833';
  const valueColor  = dk ? '#e2e0f0' : '#1c1917';
  const mutedColor  = dk ? '#6b6888' : '#9c978f';
  const divider     = dk ? '#2a2840' : '#f5f2ee';

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '9px 18px 9px 0',
      borderBottom: `1px solid ${divider}`,
      gap: 10,
    }}>
      <div style={{
        width: 3, flexShrink: 0, alignSelf: 'stretch',
        background: color, borderRadius: '0 2px 2px 0',
        marginRight: 14,
      }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, flex: 1, minWidth: 0 }}>
        <span style={{ fontSize: '0.77rem', fontWeight: 600, color: labelColor, whiteSpace: 'nowrap' }}>
          {label}
        </span>
        <span style={{
          fontSize: '0.52rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.6px',
          color: color, background: lightBg,
          border: `1px solid ${color}40`,
          borderRadius: 50, padding: '2px 7px', flexShrink: 0,
        }}>
          {badge}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
        {isBN ? (
          <span style={{ fontWeight: 700, fontSize: '0.88rem', color: valueColor }}>
            {value}
          </span>
        ) : (
          <span style={{
            fontWeight: 800, fontSize: '1.2rem',
            color: value === '—' ? mutedColor : valueColor, lineHeight: 1,
          }}>
            {value}
          </span>
        )}
        {planet && <span style={{ fontSize: '0.68rem', color: mutedColor, fontWeight: 500 }}>· {planet}</span>}
      </div>
    </div>
  );
}

/* ── RN/DN Chip ───────────────────────────────────────────────── */

function Chip({ label, value, planet, color, bg, border }: {
  label: string; value: number; planet: string;
  color: string; bg: string; border: string;
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 7,
      background: bg, border: `1.5px solid ${border}`,
      borderRadius: 50, padding: '5px 14px',
      flex: 1, justifyContent: 'center',
      boxShadow: `0 2px 8px ${color}18`,
    }}>
      <span style={{ fontSize: '0.55rem', fontWeight: 800, color, textTransform: 'uppercase', letterSpacing: 1.2 }}>
        {label}
      </span>
      <span style={{ fontFamily: 'Georgia,serif', fontWeight: 800, fontSize: '1.2rem', color, lineHeight: 1 }}>
        {value}
      </span>
      <span style={{ fontSize: '0.7rem', color, fontWeight: 500, opacity: .75 }}>
        · {planet}
      </span>
    </div>
  );
}

export default VedicGrid;
