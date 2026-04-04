import { collectGridNumbers } from '@/lib/numerology';

interface VedicGridProps {
  dob: Date;
}

const GRID = [
  [3, 1, 9],
  [6, 7, 5],
  [2, 8, 4],
];

const VedicGrid = ({ dob }: VedicGridProps) => {
  const numbers = collectGridNumbers(dob);

  const counts: Record<number, number> = {};
  for (const n of numbers) {
    if (n >= 1 && n <= 9) counts[n] = (counts[n] || 0) + 1;
  }

  return (
    <div className="grid grid-cols-3 gap-1">
      {GRID.flat().map((digit, i) => {
        const count = counts[digit] || 0;
        const active = count > 0;

        return (
          <div
            key={i}
            className={`w-16 h-16 flex items-center justify-center rounded-md border text-center font-mono text-sm font-bold transition-colors ${
              active
                ? 'bg-primary/20 border-primary text-primary shadow-[0_0_12px_hsl(var(--primary)/0.3)]'
                : 'bg-card border-border text-muted-foreground/40'
            }`}
          >
            {active ? Array(count).fill(digit).join(', ') : digit}
          </div>
        );
      })}
    </div>
  );
};

export default VedicGrid;
