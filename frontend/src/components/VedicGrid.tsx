import { collectGridNumbers, findCurrentStatus, getWeekdayValue, reduceToSingle, MahadashaEntry, AntardashaEntry, PratyantarEntry, PLANET_MAP } from '@/lib/numerology';

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

const BADGES: { key: 'md' | 'ad' | 'pd' | 'dd'; label: string }[] = [
  { key: 'md', label: 'MD' },
  { key: 'ad', label: 'AD' },
  { key: 'pd', label: 'PD' },
  { key: 'dd', label: 'DD' },
];

const getPeriodColor = (p: string) => {
  if (p === 'bn') return 'rgb(249,115,22)';
  return `hsl(var(--${p}-color))`;
};

const getPeriodBgColor = (p: string, opacity: string) => {
  if (p === 'bn') return `rgba(249,115,22, ${opacity})`;
  return `hsl(var(--${p}-color) / ${opacity})`;
};

const VedicGrid = ({ dob, mahadashas, antardashas, customNumbers, small, currentStatus: externalStatus }: VedicGridProps) => {
  const numbers = customNumbers ?? (dob ? collectGridNumbers(dob) : []);
  const counts: Record<number, number> = {};
  for (const n of numbers) {
    if (n >= 1 && n <= 9) counts[n] = (counts[n] || 0) + 1;
  }

  // Current period numbers
  let mdNum: number | undefined;
  let adNum: number | undefined;
  let pdNum: number | undefined;
  let ddNum: number | undefined;

  if (externalStatus) {
    mdNum = externalStatus.md?.number;
    adNum = externalStatus.ad?.number;
    pdNum = externalStatus.pd?.number;
    ddNum = externalStatus.todayDD;
  } else if (dob && mahadashas && antardashas) {
    const cur = findCurrentStatus(dob, mahadashas, antardashas);
    mdNum = cur.md?.number;
    adNum = cur.ad?.number;
    pdNum = cur.pd?.number;
    if (pdNum != null) {
      ddNum = reduceToSingle(pdNum + getWeekdayValue(new Date()));
    }
  }

  const periodMap: Record<number, ('md' | 'ad' | 'pd' | 'dd')[]> = {};
  const push = (n: number | undefined, key: 'md' | 'ad' | 'pd' | 'dd') => {
    if (n == null) return;
    (periodMap[n] = periodMap[n] || []).push(key);
  };
  push(mdNum, 'md');
  push(adNum, 'ad');
  push(pdNum, 'pd');
  push(ddNum, 'dd');

  return (
    <div>
      <div className={`grid grid-cols-3 ${small ? 'gap-1' : 'gap-1.5'}`}>
        {GRID.flat().map((digit, i) => {
          const count = counts[digit] || 0;
          const active = count > 0;
          const periods = periodMap[digit] || [];

          const displayPeriods: string[] = [];
          if (active) displayPeriods.push('bn');
          displayPeriods.push(...periods);

          const hasDisplay = displayPeriods.length > 0;
          let cellStyle: React.CSSProperties = {};
          if (hasDisplay) {
            if (displayPeriods.length === 1) {
              const p = displayPeriods[0];
              const c = getPeriodColor(p);
              cellStyle = {
                background: getPeriodBgColor(p, small ? '0.38' : '0.42'),
                borderColor: c,
                color: p === 'bn' ? '#fb923c' : c,
                boxShadow: small ? undefined : `0 0 12px ${p === 'bn' ? 'rgba(249,115,22,0.35)' : `hsl(var(--${p}-color) / 0.35)`}`,
              };
            } else {
              const stops = displayPeriods
                .map((p, idx) => {
                  const start = (idx * 100) / displayPeriods.length;
                  const end = ((idx + 1) * 100) / displayPeriods.length;
                  const bg = getPeriodBgColor(p, '0.52');
                  return `${bg} ${start}%, ${bg} ${end}%`;
                })
                .join(', ');
              cellStyle = {
                background: `linear-gradient(135deg, ${stops})`,
                borderColor: getPeriodColor(displayPeriods[0]),
                color: '#ffffff',
                boxShadow: small ? undefined : `0 0 12px ${displayPeriods[0] === 'bn' ? 'rgba(249,115,22,0.4)' : `hsl(var(--${displayPeriods[0]}-color) / 0.4)`}`,
              };
            }
          }

          return (
            <div
              key={i}
              className={`relative ${small ? 'w-10 h-10' : 'w-16 h-16'} flex items-center justify-center rounded-md border border-border bg-card/60 backdrop-blur-sm`}
            >
              {hasDisplay ? (
                <div
                  style={cellStyle}
                  className={`flex items-center justify-center rounded-full font-mono font-bold transition-all border ${
                    small ? 'w-7 h-7 text-[9px]' : 'w-12 h-12 text-sm'
                  }`}
                >
                  {active ? Array(count).fill(digit).join(',') : digit}
                </div>
              ) : (
                <span className={`font-mono font-bold text-muted-foreground/30 ${small ? 'text-[10px]' : 'text-sm'}`}>
                  {digit}
                </span>
              )}

              {/* Period badges */}
              {displayPeriods.filter(p => p !== 'bn').length > 0 && (
                <div className={`absolute ${small ? '-top-1 -right-1' : '-top-1.5 -right-1.5'} flex flex-col gap-0.5 z-10`}>
                  {displayPeriods.filter(p => p !== 'bn').map(p => (
                    <span
                      key={p}
                      title={`${p.toUpperCase()} ${digit} • ${PLANET_MAP[digit]}`}
                      className={`${small ? 'min-w-[12px] h-[10px] px-0.5 text-[6px]' : 'min-w-[20px] h-[14px] px-1 text-[8px]'} rounded-full font-extrabold text-black flex items-center justify-center shadow`}
                      style={{ backgroundColor: getPeriodColor(p) }}
                    >
                      {p.toUpperCase()}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend - Only show if not small */}
      {!small && (
        <div className="mt-3 flex flex-wrap gap-2 text-[10px]">
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-black font-extrabold bg-orange-500 shadow-sm">
            Birth Number
          </span>
          {(mdNum || adNum || pdNum || ddNum) && BADGES.map(b => {
            const n = { md: mdNum, ad: adNum, pd: pdNum, dd: ddNum }[b.key];
            if (n == null) return null;
            return (
              <span
                key={b.key}
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-black font-extrabold shadow-sm"
                style={{ backgroundColor: `hsl(var(--${b.key}-color))` }}
              >
                {b.label} {n} • {PLANET_MAP[n]}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default VedicGrid;
