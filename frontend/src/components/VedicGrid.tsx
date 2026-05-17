import { collectGridNumbers, findCurrentStatus, getWeekdayValue, reduceToSingle, MahadashaEntry, AntardashaEntry, PratyantarEntry, PLANET_MAP, getRootNumber, getDestinyNumber } from '@/lib/numerology';

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
    <div className={`flex ${small ? 'flex-col' : 'items-stretch gap-6 flex-wrap md:flex-nowrap'}`}>
      <div className="flex-shrink-0">
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

            let cellText = active ? Array(count).fill(digit).join(',') : String(digit);
            if (!small && dob) {
              const rootNumber = getRootNumber(dob);
              const destinyNumber = getDestinyNumber(dob);
              if (digit === rootNumber) cellText += 'R';
              if (digit === destinyNumber) cellText += 'D';
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
                    {cellText}
                  </div>
                ) : (
                  <span className={`font-mono font-bold text-muted-foreground/30 ${small ? 'text-[10px]' : 'text-sm'}`}>
                    {cellText}
                  </span>
                )}

                {/* Period badges */}
                {displayPeriods.filter(p => p !== 'bn').length > 0 && (
                  <div className={`absolute ${small ? '-top-1 -right-1' : '-top-1.5 -right-1.5'} flex flex-col gap-1 z-10`}>
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
            <span
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-black font-extrabold shadow-sm bg-red-500"
              style={{ backgroundColor: 'hsl(var(--md-color))' }}
            >
              Maha Dasha
            </span>
            <span
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-black font-extrabold shadow-sm bg-purple-500"
              style={{ backgroundColor: 'hsl(var(--ad-color))' }}
            >
              Antar Dasha
            </span>
            <span
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-black font-extrabold shadow-sm bg-green-500"
              style={{ backgroundColor: 'hsl(var(--pd-color))' }}
            >
              Pratyantar Dasha
            </span>
            <span
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-black font-extrabold shadow-sm bg-yellow-500"
              style={{ backgroundColor: 'hsl(var(--dd-color))' }}
            >
              Daily Dasha
            </span>
          </div>
        )}
      </div>

      {/* Showcase on the right side of the main grid (if not small) */}
      {!small && (
        <div className="flex-grow min-w-[220px] bg-card/40 border border-border/80 rounded-xl p-4 flex flex-col justify-center gap-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80 border-b border-border/50 pb-1.5">
            Active Dasha Periods
          </h3>
          <div className="space-y-3">
            {dob && (() => {
              const bnNum = getRootNumber(dob);
              return (
                <div className="flex items-center justify-between text-xs py-2 border-b border-border/30">
                  <span className="font-semibold text-muted-foreground flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'rgb(249,115,22)' }} />
                    Birth Number (BN)
                  </span>
                  <span className="font-mono font-bold text-foreground">
                    {bnNum} - {PLANET_MAP[bnNum]}
                  </span>
                </div>
              );
            })()}
            {mdNum != null && (
              <div className="flex items-center justify-between text-xs py-2 border-b border-border/30">
                <span className="font-semibold text-muted-foreground flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'hsl(var(--md-color))' }} />
                  Maha Dasha (MD)
                </span>
                <span className="font-mono font-bold text-foreground">
                  {mdNum} - {PLANET_MAP[mdNum]}
                </span>
              </div>
            )}
            {adNum != null && (
              <div className="flex items-center justify-between text-xs py-2 border-b border-border/30">
                <span className="font-semibold text-muted-foreground flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'hsl(var(--ad-color))' }} />
                  Antar Dasha (AD)
                </span>
                <span className="font-mono font-bold text-foreground">
                  {adNum} - {PLANET_MAP[adNum]}
                </span>
              </div>
            )}
            {pdNum != null && (
              <div className="flex items-center justify-between text-xs py-2 border-b border-border/30">
                <span className="font-semibold text-muted-foreground flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'hsl(var(--pd-color))' }} />
                  Pratyantar Dasha (PD)
                </span>
                <span className="font-mono font-bold text-foreground">
                  {pdNum} - {PLANET_MAP[pdNum]}
                </span>
              </div>
            )}
            {ddNum != null && (
              <div className="flex items-center justify-between text-xs py-2 border-b border-border/30">
                <span className="font-semibold text-muted-foreground flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'hsl(var(--dd-color))' }} />
                  Daily Dasha (DD)
                </span>
                <span className="font-mono font-bold text-foreground">
                  {ddNum} - {PLANET_MAP[ddNum]}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

};

export default VedicGrid;
