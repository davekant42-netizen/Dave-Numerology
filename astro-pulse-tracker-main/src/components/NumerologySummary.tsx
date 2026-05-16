import { getRootNumber, getDestinyNumber, PLANET_MAP, getWeekdayValue } from '@/lib/numerology';

interface NumerologySummaryProps {
  dob: Date;
  name: string;
}

const NumerologySummary = ({ dob, name }: NumerologySummaryProps) => {
  const rootNumber = getRootNumber(dob);
  const destinyNumber = getDestinyNumber(dob);
  const day = dob.getDate();
  const weekdayVal = getWeekdayValue(dob);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="rounded-lg bg-card p-4 gold-glow border border-border">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Name</p>
        <p className="text-lg font-bold text-foreground truncate">{name || '—'}</p>
      </div>
      <div className="rounded-lg bg-card p-4 gold-glow border border-border">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Root Number</p>
        <p className="text-4xl font-mono font-bold text-primary">{rootNumber}</p>
        <p className="text-xs text-muted-foreground mt-1">
          Day {day} → {PLANET_MAP[rootNumber]}
        </p>
      </div>
      <div className="rounded-lg bg-card p-4 gold-glow border border-border">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Destiny Number</p>
        <p className="text-4xl font-mono font-bold text-primary">{destinyNumber}</p>
        <p className="text-xs text-muted-foreground mt-1">{PLANET_MAP[destinyNumber]}</p>
      </div>
      <div className="rounded-lg bg-card p-4 gold-glow border border-border">
        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">DOB Weekday</p>
        <p className="text-4xl font-mono font-bold text-primary">{weekdayVal}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {dob.toLocaleDateString('en', { weekday: 'long' })} → {PLANET_MAP[weekdayVal]}
        </p>
      </div>
    </div>
  );
};

export default NumerologySummary;
