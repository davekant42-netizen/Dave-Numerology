import { useMemo, useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  MahadashaEntry,
  AntardashaEntry,
  PratyantarEntry,
  PLANET_MAP,
  formatDateDMY,
  calculatePratyantars,
  getWeekdayValue,
  reduceToSingle,
  findCurrentStatus,
  buildMonths,
} from '@/lib/numerology';

type PeriodKey = 'md' | 'ad' | 'pd' | 'dd';

function useCurrentPeriodNumbers(dob: Date, mahadashas: MahadashaEntry[], antardashas: AntardashaEntry[]) {
  const cur = findCurrentStatus(dob, mahadashas, antardashas);
  const md = cur.md?.number;
  const ad = cur.ad?.number;
  const pd = cur.pd?.number;
  const dd = pd != null ? reduceToSingle(pd + getWeekdayValue(new Date())) : undefined;
  return { md, ad, pd, dd };
}

function matchingPeriodsFor(
  digit: number,
  periods: { md?: number; ad?: number; pd?: number; dd?: number }
): PeriodKey[] {
  const out: PeriodKey[] = [];
  if (periods.md === digit) out.push('md');
  if (periods.ad === digit) out.push('ad');
  if (periods.pd === digit) out.push('pd');
  if (periods.dd === digit) out.push('dd');
  return out;
}

function periodCellStyle(periods: PeriodKey[], active: boolean): React.CSSProperties | undefined {
  if (!periods.length) return undefined;

  const baseOpacity = active ? 0.28 : 0.16;
  const background =
    periods.length === 1
      ? `hsl(var(--${periods[0]}-color) / ${baseOpacity})`
      : `linear-gradient(135deg, ${periods
          .map((p, i) => {
            const start = Math.round((i / periods.length) * 100);
            const end = Math.round(((i + 1) / periods.length) * 100);
            return `hsl(var(--${p}-color) / ${baseOpacity}) ${start}% ${end}%`;
          })
          .join(', ')})`;

  return {
    background,
    borderColor: `hsl(var(--${periods[0]}-color))`,
    color: `hsl(var(--${periods[0]}-color))`,
    boxShadow: `0 0 12px hsl(var(--${periods[0]}-color) / 0.35)`,
  };
}

const PeriodBadgeStack = ({ periods }: { periods: PeriodKey[] }) => {
  if (!periods.length) return null;
  return (
    <div className="absolute -top-1.5 -right-1.5 flex flex-col gap-0.5 z-10">
      {periods.map(p => (
        <span
          key={p}
          className="min-w-[18px] h-[13px] px-1 rounded-full text-[8px] font-bold text-white flex items-center justify-center shadow"
          style={{ backgroundColor: `hsl(var(--${p}-color))` }}
        >
          {p.toUpperCase()}
        </span>
      ))}
    </div>
  );
};

const VEDIC_LAYOUT = [3, 1, 9, 6, 7, 5, 2, 8, 4];

const VedicMiniGrid = ({
  numbers,
  periodNumbers,
  footer,
}: {
  numbers: number[];
  periodNumbers: { md?: number; ad?: number; pd?: number; dd?: number };
  footer?: React.ReactNode;
}) => {
  const counts: Record<number, number> = {};
  for (const n of numbers) {
    if (n >= 1 && n <= 9) counts[n] = (counts[n] || 0) + 1;
  }
  return (
    <div>
      <div className="grid grid-cols-3 gap-1.5">
        {VEDIC_LAYOUT.map((digit, i) => {
          const count = counts[digit] || 0;
          const active = count > 0;
          const badges = matchingPeriodsFor(digit, periodNumbers);
          const hasPeriodColor = badges.length > 0;
          return (
            <div
              key={i}
              className="relative aspect-square flex items-center justify-center rounded-md border border-border bg-card/60 backdrop-blur-sm"
            >
              {active || hasPeriodColor ? (
                <div
                  style={periodCellStyle(badges, active)}
                  className={`flex items-center justify-center rounded-full font-mono font-bold transition-all w-[80%] h-[80%] aspect-square text-xs ${
                    hasPeriodColor
                      ? 'border'
                      : 'bg-white/10 border border-white text-white shadow-[0_0_12px_rgba(255,255,255,0.25)]'
                  }`}
                >
                  {active ? Array(count).fill(digit).join(',') : digit}
                </div>
              ) : (
                <span className="font-mono font-bold text-muted-foreground/30 text-xs">
                  {digit}
                </span>
              )}
              <PeriodBadgeStack periods={badges} />
            </div>
          );
        })}
      </div>
      {footer && <div className="mt-3">{footer}</div>}
    </div>
  );
};

interface Props {
  dob: Date;
  mahadashas: MahadashaEntry[];
  antardashas: AntardashaEntry[];
}

const NOW = () => Date.now();

/* ---------- helpers ---------- */
function ageRange(dob: Date, start: Date, end: Date) {
  const a1 = Math.max(0, Math.floor((start.getTime() - dob.getTime()) / (365.25 * 86400000)));
  const a2 = Math.floor((end.getTime() - dob.getTime()) / (365.25 * 86400000));
  return `${a1} – ${a2} yrs`;
}

function yearRange(start: Date, end: Date) {
  return `${start.getFullYear()} – ${end.getFullYear()}`;
}


/* ---------- Card primitives ---------- */
const Card = ({
  title,
  subtitle,
  active,
  accent,
  children,
}: {
  title: string;
  subtitle?: string;
  active?: boolean;
  accent: 'md' | 'ad' | 'pd' | 'dd';
  children: React.ReactNode;
}) => (
  <div
    className={`rounded-xl border bg-card transition-all overflow-hidden ${
      active
        ? 'border-transparent shadow-lg ring-2'
        : 'border-border hover:shadow-md'
    }`}
    style={
      active
        ? ({
            '--ring-color': `hsl(var(--${accent}-color))`,
            boxShadow: `0 0 0 2px hsl(var(--${accent}-color) / 0.6), 0 10px 25px -5px hsl(var(--${accent}-color) / 0.25)`,
          } as React.CSSProperties)
        : undefined
    }
  >
    <div
      className={`px-4 py-2.5 flex items-center justify-between ${active ? 'text-white' : 'bg-secondary/50 text-foreground'}`}
      style={active ? { backgroundColor: `hsl(var(--${accent}-color))` } : undefined}
    >
      <div className="font-semibold text-sm tracking-tight">{title}</div>
      {subtitle && (
        <div className={`text-[11px] font-mono ${active ? 'text-white/85' : 'text-muted-foreground'}`}>{subtitle}</div>
      )}
    </div>
    <div className="p-4">{children}</div>
  </div>
);

const NumberCell = ({
  num,
  planet,
  emphasize,
  accent = 'md',
  activeLabel,
  matchingPeriods,
}: {
  num: number | null;
  planet?: string;
  emphasize?: boolean;
  accent?: PeriodKey;
  activeLabel?: string;
  matchingPeriods?: PeriodKey[];
}) => (
  <div
    className={`relative aspect-square flex flex-col items-center justify-center rounded-md border text-center transition-colors ${
      num == null ? 'border-dashed border-border/60 text-muted-foreground/40' : ''
    } ${!emphasize && num != null ? 'border-border bg-background/40' : ''}`}
    style={
      emphasize
        ? {
            borderColor: `hsl(var(--${accent}-color))`,
            backgroundColor: `hsl(var(--${accent}-color) / 0.15)`,
            boxShadow: `0 0 0 1px hsl(var(--${accent}-color) / 0.4)`,
          }
        : undefined
    }
  >
    {num != null ? (
      <>
        <span
          className="font-mono font-bold text-lg"
          style={emphasize ? { color: `hsl(var(--${accent}-color))` } : { color: 'hsl(var(--foreground))' }}
        >
          {num}
        </span>
        {planet && <span className="text-[9px] text-muted-foreground leading-none mt-0.5">{planet}</span>}

        {activeLabel && emphasize && (
          <span
            className="absolute -top-1.5 -left-1.5 px-1 h-[14px] rounded-sm text-[8px] font-bold text-white flex items-center justify-center shadow"
            style={{ backgroundColor: `hsl(var(--${accent}-color))` }}
          >
            {activeLabel}
          </span>
        )}
        <PeriodBadgeStack periods={matchingPeriods || []} />
      </>
    ) : (
      <span className="text-muted-foreground/40">—</span>
    )}
  </div>
);

/* Pad a list to a 3x3 grid (length 9) */
function padTo9<T>(arr: T[]): (T | null)[] {
  const out: (T | null)[] = [...arr];
  while (out.length < 9) out.push(null);
  return out.slice(0, 9);
}

/* ---------- Tab content components ---------- */

const PeriodLegend = ({ periods }: { periods: { md?: number; ad?: number; pd?: number; dd?: number } }) => {
  const items: { k: PeriodKey; label: string; n?: number }[] = [
    { k: 'md', label: 'MD', n: periods.md },
    { k: 'ad', label: 'AD', n: periods.ad },
    { k: 'pd', label: 'PD', n: periods.pd },
    { k: 'dd', label: 'DD', n: periods.dd },
  ];
  return (
    <div className="flex flex-wrap gap-1.5 text-[10px]">
      {items.map(it =>
        it.n == null ? null : (
          <span
            key={it.k}
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-white font-semibold"
            style={{ backgroundColor: `hsl(var(--${it.k}-color))` }}
          >
            {it.label} {it.n} • {PLANET_MAP[it.n]}
          </span>
        )
      )}
    </div>
  );
};

const MahadashaGrid = ({ dob, mahadashas, antardashas }: Props) => {
  const now = NOW();
  const periods = useCurrentPeriodNumbers(dob, mahadashas, antardashas);
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {mahadashas.map((m, i) => {
        const isActive = now >= m.startDate.getTime() && now < m.endDate.getTime();
        const ads = antardashas.filter(
          a => a.startDate.getTime() >= m.startDate.getTime() && a.startDate.getTime() < m.endDate.getTime()
        );
        const cardPeriods = periods;
        return (
          <Card
            key={i}
            title={yearRange(m.startDate, m.endDate)}
            subtitle={ageRange(dob, m.startDate, m.endDate)}
            active={isActive}
            accent="md"
          >
            <VedicMiniGrid
              numbers={ads.map(a => a.number)}
              periodNumbers={cardPeriods}
              footer={
                <div className="flex items-center justify-between gap-2">
                  <PeriodLegend periods={{ md: m.number }} />
                  <span className="text-[11px] text-muted-foreground">{m.years}y</span>
                </div>
              }
            />
          </Card>
        );
      })}
    </div>
  );
};

const YearlyGrid = ({ dob, mahadashas, antardashas }: Props) => {
  const now = NOW();
  const periods = useCurrentPeriodNumbers(dob, mahadashas, antardashas);
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {antardashas.map((a, i) => {
        const isActive = now >= a.startDate.getTime() && now < a.endDate.getTime();
        const pds = calculatePratyantars(a.number, a.startDate);
        const cardPeriods = periods;
        return (
          <Card
            key={i}
            title={`Age ${a.age}`}
            subtitle={a.yearLabel}
            active={isActive}
            accent="ad"
          >
            <VedicMiniGrid
              numbers={pds.map(p => p.number)}
              periodNumbers={cardPeriods}
              footer={<PeriodLegend periods={{ ad: a.number }} />}
            />
          </Card>
        );
      })}
    </div>
  );
};

const MonthlyGrid = ({ dob, mahadashas, antardashas }: Props) => {
  const now = NOW();
  const periods = useCurrentPeriodNumbers(dob, mahadashas, antardashas);
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {antardashas.map((a, i) => {
        const isActive = now >= a.startDate.getTime() && now < a.endDate.getTime();
        const months = buildMonths(a);
        const cardPeriods = periods;
        return (
          <Card
            key={i}
            title={`Age ${a.age} — Monthly`}
            subtitle={a.yearLabel}
            active={isActive}
            accent="ad"
          >
            <VedicMiniGrid
              numbers={months.map(m => m.number)}
              periodNumbers={cardPeriods}
              footer={<PeriodLegend periods={{ ad: a.number }} />}
            />
          </Card>
        );
      })}
    </div>
  );
};

const DailyGrid = ({ dob, mahadashas, antardashas }: Props) => {
  const now = NOW();
  const periods = useCurrentPeriodNumbers(dob, mahadashas, antardashas);
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {antardashas.map((a, i) => {
        const isActive = now >= a.startDate.getTime() && now < a.endDate.getTime();
        const pds = calculatePratyantars(a.number, a.startDate);
        const cardPeriods = periods;
        return (
          <Card
            key={i}
            title={`Age ${a.age} — Daily`}
            subtitle={a.yearLabel}
            active={isActive}
            accent="pd"
          >
            <VedicMiniGrid
              numbers={pds.map(p => p.number)}
              periodNumbers={cardPeriods}
              footer={<PeriodLegend periods={{ ad: a.number }} />}
            />
          </Card>
        );
      })}
    </div>
  );
};

const DashaCardView = ({ dob, mahadashas, antardashas }: Props) => {
  const [tab, setTab] = useState('mahadasha');

  // Default scope: current MD only (others can scroll through full timeline)
  const now = NOW();
  const currentMd = mahadashas.find(m => now >= m.startDate.getTime() && now < m.endDate.getTime());

  const adsForCurrentMd = useMemo(
    () =>
      currentMd
        ? antardashas.filter(
            a =>
              a.startDate.getTime() >= currentMd.startDate.getTime() &&
              a.startDate.getTime() < currentMd.endDate.getTime()
          )
        : antardashas.slice(0, 9),
    [antardashas, currentMd]
  );

  return (
    <Tabs value={tab} onValueChange={setTab} className="w-full">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Dasha Charts
        </h2>
        <div className="flex items-center gap-3 flex-wrap">
          <Legend />
          <TabsList>
            <TabsTrigger value="mahadasha">Mahadasha</TabsTrigger>
            <TabsTrigger value="yearly">Yearly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="daily">Daily</TabsTrigger>
          </TabsList>
        </div>
      </div>

      <TabsContent value="mahadasha" className="mt-0">
        <MahadashaGrid dob={dob} mahadashas={mahadashas} antardashas={antardashas} />
      </TabsContent>
      <TabsContent value="yearly" className="mt-0">
        <YearlyGrid dob={dob} mahadashas={mahadashas} antardashas={adsForCurrentMd} />
      </TabsContent>
      <TabsContent value="monthly" className="mt-0">
        <MonthlyGrid dob={dob} mahadashas={mahadashas} antardashas={adsForCurrentMd} />
      </TabsContent>
      <TabsContent value="daily" className="mt-0">
        <DailyGrid dob={dob} mahadashas={mahadashas} antardashas={adsForCurrentMd} />
      </TabsContent>
    </Tabs>
  );
};

const Dot = ({ c, label }: { c: string; label: string }) => (
  <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: `hsl(var(--${c}-color))` }} />
    {label}
  </span>
);

const Legend = () => (
  <div className="hidden md:flex items-center gap-3">
    <Dot c="md" label="MD" />
    <Dot c="ad" label="AD" />
    <Dot c="pd" label="PD" />
    <Dot c="dd" label="DD" />
  </div>
);

export default DashaCardView;
