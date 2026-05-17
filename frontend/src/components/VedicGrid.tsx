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

          const hasPeriod = periods.length > 0;
          let cellStyle: React.CSSProperties = {};
          if (hasPeriod) {
            if (periods.length === 1) {
              const c = `hsl(var(--${periods[0]}-color))`;
              cellStyle = {
                background: `hsl(var(--${periods[0]}-color) / ${small ? '0.22' : '0.28'})`,
                borderColor: c,
                color: c,
                boxShadow: small ? undefined : `0 0 12px hsl(var(--${periods[0]}-color) / 0.35)`,
              };
            } else {
              const stops = periods
                .map((p, idx) => {
                  const start = (idx * 100) / periods.length;
                  const end = ((idx + 1) * 100) / periods.length;
                  return `hsl(var(--${p}-color) / 0.32) ${start}%, hsl(var(--${p}-color) / 0.32) ${end}%`;
                })
                .join(', ');
              cellStyle = {
                background: `linear-gradient(135deg, ${stops})`,
                borderColor: `hsl(var(--${periods[0]}-color))`,
                color: 'hsl(var(--foreground))',
                boxShadow: small ? undefined : `0 0 12px hsl(var(--${periods[0]}-color) / 0.3)`,
              };
            }
          }

          return (
            <div
              key={i}
              className={`relative ${small ? 'w-10 h-10' : 'w-16 h-16'} flex items-center justify-center rounded-md border border-border bg-card/60 backdrop-blur-sm`}
            >
              {active || hasPeriod ? (
                <div
                  style={cellStyle}
                  className={`flex items-center justify-center rounded-full font-mono font-bold transition-all ${
                    small ? 'w-7 h-7 text-[9px]' : 'w-12 h-12 text-sm'
                  } ${
                    hasPeriod
                      ? 'border'
                      : 'bg-white/10 border border-white text-white shadow-[0_0_12px_rgba(255,255,255,0.25)]'
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
              {periods.length > 0 && (
                <div className={`absolute ${small ? '-top-1 -right-1' : '-top-1.5 -right-1.5'} flex flex-col gap-0.5 z-10`}>
                  {periods.map(p => (
                    <span
                      key={p}
                      title={`${p.toUpperCase()} ${digit} • ${PLANET_MAP[digit]}`}
                      className={`${small ? 'min-w-[12px] h-[10px] px-0.5 text-[6px]' : 'min-w-[20px] h-[14px] px-1 text-[8px]'} rounded-full font-bold text-white flex items-center justify-center shadow`}
                      style={{ backgroundColor: `hsl(var(--${p}-color))` }}
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
      {!small && (mdNum || adNum || pdNum || ddNum) && (
        <div className="mt-3 flex flex-wrap gap-2 text-[10px]">
          {BADGES.map(b => {
            const n = { md: mdNum, ad: adNum, pd: pdNum, dd: ddNum }[b.key];
            if (n == null) return null;
            return (
              <span
                key={b.key}
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-white font-semibold"
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
