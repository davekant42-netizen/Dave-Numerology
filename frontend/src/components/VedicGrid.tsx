import { collectGridNumbers, MahadashaEntry, AntardashaEntry, PratyantarEntry } from '@/lib/numerology';

interface VedicGridProps {
  dob: Date;
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

const VedicGrid = ({ dob, currentStatus }: VedicGridProps) => {
  const numbers = collectGridNumbers(dob);

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
    if (!periods.length) return '';
    const topPeriod = periods[0];
    
    switch(topPeriod) {
      case 'md': return 'bg-red-500/20 border-red-500 text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]';
      case 'ad': return 'bg-blue-500/20 border-blue-500 text-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]';
      case 'pd': return 'bg-green-500/20 border-green-500 text-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]';
      case 'dd': return 'bg-amber-500/20 border-amber-500 text-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]';
      default: return '';
    }
  };

  const getBadgeClass = (p: string) => {
    switch(p) {
      case 'md': return 'bg-red-500 text-white';
      case 'ad': return 'bg-blue-500 text-white';
      case 'pd': return 'bg-green-500 text-white';
      case 'dd': return 'bg-amber-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="grid grid-cols-3 gap-1.5">
      {GRID.flat().map((digit, i) => {
        const count = counts[digit] || 0;
        const active = count > 0;
        const periods = periodMap[digit] || [];
        
        let containerClass = 'relative w-16 h-16 flex items-center justify-center rounded-md border text-center font-mono text-sm font-bold transition-colors ';
        
        if (periods.length > 0) {
          containerClass += getPeriodStyle(periods);
        } else if (active) {
          containerClass += 'bg-primary/10 border-primary/50 text-primary';
        } else {
          containerClass += 'bg-card border-border text-muted-foreground/40';
        }

        return (
          <div key={i} className={containerClass}>
            {active ? Array(count).fill(digit).join(', ') : digit}
            
            {periods.length > 0 && (
              <div className="absolute -top-1.5 -right-1.5 flex flex-col gap-0.5 items-end">
                {periods.map(p => (
                  <span key={p} className={`text-[8px] font-extrabold px-1 py-0.5 rounded-full min-w-[20px] text-center leading-none shadow-sm ${getBadgeClass(p)}`}>
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
