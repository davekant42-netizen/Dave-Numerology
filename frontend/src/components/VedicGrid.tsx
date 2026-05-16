import { collectGridNumbers, MahadashaEntry, AntardashaEntry, PratyantarEntry } from '@/lib/numerology';

interface VedicGridProps {
  dob?: Date;
  customNumbers?: number[];
  small?: boolean;
  currentStatus?: {
    md?: MahadashaEntry | { number: number; planet: string };
    ad?: AntardashaEntry | { number: number; planet: string };
    pd?: PratyantarEntry | { number: number; planet: string };
    todayDD?: number;
  };
}

const GRID = [
  [3, 1, 9],
  [6, 7, 5],
  [2, 8, 4],
];

const VedicGrid = ({ dob, customNumbers, small = false, currentStatus }: VedicGridProps) => {
  const numbers = customNumbers || (dob ? collectGridNumbers(dob) : []);

  const counts: Record<number, number> = {};
  for (const n of numbers) {
    if (n >= 1 && n <= 9) counts[n] = (counts[n] || 0) + 1;
  }

  // Create a mapping of number -> array of periods it's active for
  const periodMap: Record<number, string[]> = {};
  const pushPeriod = (n: number | undefined, key: string) => {
    if (n != null) {
      if (!periodMap[n]) periodMap[n] = [];
      periodMap[n].push(key);
    }
  };

  pushPeriod(currentStatus?.md?.number, 'md');
  pushPeriod(currentStatus?.ad?.number, 'ad');
  pushPeriod(currentStatus?.pd?.number, 'pd');
  pushPeriod(currentStatus?.todayDD, 'dd');

  // Helper for color styles based on periods
  const getPeriodStyle = (periods: string[]) => {
    if (!periods.length) return {};
    
    if (periods.length === 1) {
      const p = periods[0];
      return { 
        background: `hsl(var(--${p}-color) / 0.15)`,
        borderColor: `hsl(var(--${p}-color) / 0.5)`,
        color: `hsl(var(--${p}-color))`,
        boxShadow: `0 0 10px hsl(var(--${p}-color) / 0.3)`
      };
    } else {
      // Multiple periods: Create a gradient for the background
      const stops = periods.map((p, i) => `hsl(var(--${p}-color) / 0.28) ${(i / (periods.length - 1)) * 100}%`).join(', ');
      return {
        background: `linear-gradient(135deg, ${stops})`,
        borderColor: `hsl(var(--${periods[0]}-color) / 0.6)`,
        color: `hsl(var(--${periods[0]}-color))`,
        boxShadow: `0 0 10px hsl(var(--${periods[0]}-color) / 0.4)`
      };
    }
  };

  const getBadgeStyle = (p: string) => {
    return {
      background: `hsl(var(--${p}-color))`,
      color: '#fff'
    };
  };

  return (
    <div className={`grid grid-cols-3 ${small ? 'gap-[2px]' : 'gap-1.5'}`}>
      {GRID.flat().map((digit, i) => {
        const count = counts[digit] || 0;
        const active = count > 0;
        const periods = periodMap[digit] || [];
        
        let containerClass = `relative flex items-center justify-center rounded-md border text-center font-mono font-bold transition-colors `;
        
        if (small) {
          containerClass += 'w-8 h-8 text-[11px] ';
        } else {
          containerClass += 'w-16 h-16 text-sm ';
        }
        
        let inlineStyle = {};
        if (periods.length > 0) {
          inlineStyle = getPeriodStyle(periods);
        } else if (active) {
          containerClass += 'bg-primary/10 border-primary/50 text-primary';
        } else {
          containerClass += 'bg-card border-border text-muted-foreground/40';
        }

        return (
          <div key={i} className={containerClass} style={inlineStyle}>
            {active ? Array(count).fill(digit).join(small ? '' : ', ') : digit}
            
            {periods.length > 0 && !small && (
              <div className="absolute -top-1.5 -right-1.5 flex flex-col gap-0.5 items-end">
                {periods.map(p => (
                  <span key={p} className="text-[8px] font-extrabold px-1 py-0.5 rounded-full min-w-[20px] text-center leading-none shadow-sm" style={getBadgeStyle(p)}>
                    {p.toUpperCase()}
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default VedicGrid;
