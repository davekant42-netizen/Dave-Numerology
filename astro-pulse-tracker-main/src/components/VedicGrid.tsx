import { collectGridNumbers, findCurrentStatus, getWeekdayValue, reduceToSingle, MahadashaEntry, AntardashaEntry, PLANET_MAP } from '@/lib/numerology';

interface VedicGridProps {
  dob: Date;
  mahadashas?: MahadashaEntry[];
  antardashas?: AntardashaEntry[];
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

const VedicGrid = ({ dob, mahadashas, antardashas }: VedicGridProps) => {
  const numbers = collectGridNumbers(dob);
  const counts: Record<number, number> = {};
  for (const n of numbers) {
    if (n >= 1 && n <= 9) counts[n] = (counts[n] || 0) + 1;
  }

  // Current period numbers (only when MD/AD provided)
  let mdNum: number | undefined;
  let adNum: number | undefined;
  let pdNum: number | undefined;
  let ddNum: number | undefined;
  if (mahadashas && antardashas) {
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
      <div className="grid grid-cols-3 gap-1.5">
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
                background: `hsl(var(--${periods[0]}-color) / 0.28)`,
                borderColor: c,
                color: c,
                boxShadow: `0 0 12px hsl(var(--${periods[0]}-color) / 0.35)`,
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
                boxShadow: `0 0 12px hsl(var(--${periods[0]}-color) / 0.3)`,
              };
            }
          }

          return (
            <div
              key={i}
              style={cellStyle}
              className={`relative w-16 h-16 flex items-center justify-center rounded-md border text-center font-mono text-sm font-bold transition-colors ${
                hasPeriod
                  ? ''
                  : active
                    ? 'bg-primary/20 border-primary text-primary shadow-[0_0_12px_hsl(var(--primary)/0.3)]'
                    : 'bg-card border-border text-muted-foreground/40'
              }`}
            >
              {active ? Array(count).fill(digit).join(',') : digit}

              {/* Period badges */}
              {periods.length > 0 && (
                <div className="absolute -top-1.5 -right-1.5 flex flex-col gap-0.5">
                  {periods.map(p => (
                    <span
                      key={p}
                      title={`${p.toUpperCase()} ${digit} • ${PLANET_MAP[digit]}`}
                      className="min-w-[20px] h-[14px] px-1 rounded-full text-[8px] font-bold text-white flex items-center justify-center shadow"
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

      {/* Legend */}
      {(mdNum || adNum || pdNum || ddNum) && (
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
