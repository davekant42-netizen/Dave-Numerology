import React from 'react';
import { MahadashaEntry, AntardashaEntry, PratyantarEntry, PLANET_MAP, calculatePratyantars, buildMonths } from '@/lib/numerology';
import VedicGrid from './VedicGrid';

interface DashaGridProps {
  dob: Date;
  tab: 'mahadasha' | 'yearly' | 'monthly' | 'daily';
  mahadashas: MahadashaEntry[];
  antardashas: AntardashaEntry[];
  currentStatus: {
    md?: MahadashaEntry;
    ad?: AntardashaEntry;
    pd?: PratyantarEntry;
    todayDD?: number;
  };
}

export const formatDate = (d: Date) => {
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
};

export const DashaGrid: React.FC<DashaGridProps> = ({ dob, tab, mahadashas, antardashas, currentStatus }) => {
  const now = Date.now();

  const LegendPills = ({ periodNums }: { periodNums: { md?: number, ad?: number, pd?: number, dd?: number } }) => {
    const items = [];
    if (periodNums.md != null) items.push({ k: 'md', l: 'MD', n: periodNums.md });
    if (periodNums.ad != null) items.push({ k: 'ad', l: 'AD', n: periodNums.ad });
    if (periodNums.pd != null) items.push({ k: 'pd', l: 'PD', n: periodNums.pd });
    if (periodNums.dd != null) items.push({ k: 'dd', l: 'DD', n: periodNums.dd });
    
    if (!items.length) return null;
    
    return (
      <div className="flex flex-wrap gap-2 items-center">
        {items.map(i => (
          <span key={i.k} className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full shadow-sm text-white" style={{ background: `hsl(var(--${i.k}-color))` }}>
            {i.l} {i.n} • {PLANET_MAP[i.n]}
          </span>
        ))}
      </div>
    );
  };

  if (tab === 'mahadasha') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {mahadashas.map(m => {
          const isActive = now >= m.startDate.getTime() && now < m.endDate.getTime();
          const adsIn = antardashas.filter(a => a.startDate.getTime() >= m.startDate.getTime() && a.startDate.getTime() < m.endDate.getTime());
          
          return (
            <div key={m.number} className={`flex flex-col bg-card rounded-xl border border-border overflow-hidden transition-all duration-300 ${isActive ? 'ring-1 shadow-[0_0_20px_hsl(var(--md-color)/0.1)]' : ''}`} style={isActive ? { borderColor: 'hsl(var(--md-color)/0.4)', '--tw-ring-color': 'hsl(var(--md-color))' } as React.CSSProperties : {}}>
              <div className="p-4 border-b border-border" style={isActive ? { background: 'hsl(var(--md-color)/0.15)' } : {}}>
                <div className="text-lg font-bold" style={isActive ? { color: 'hsl(var(--md-color))' } : {}}>{m.years}y • {PLANET_MAP[m.number]}</div>
                <div className="text-sm text-muted-foreground mt-1">{formatDate(m.startDate)} – {formatDate(m.endDate)}</div>
              </div>
              <div className="p-4 flex flex-col gap-4">
                <div className="flex justify-center">
                  <VedicGrid customNumbers={adsIn.map(a => a.number)} small currentStatus={currentStatus} />
                </div>
                <div className="flex justify-between items-center mt-2 border-t border-border pt-3">
                  <LegendPills periodNums={{ md: m.number }} />
                  <span className="text-xs text-muted-foreground">{m.years}y</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  const currentMd = currentStatus.md;
  const adsForCurrentMd = currentMd 
    ? antardashas.filter(a => a.startDate.getTime() >= currentMd.startDate.getTime() && a.startDate.getTime() < currentMd.endDate.getTime())
    : [];

  if (tab === 'yearly') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {adsForCurrentMd.map((a, i) => {
          const isActive = now >= a.startDate.getTime() && now < a.endDate.getTime();
          const pds = calculatePratyantars(a.number, a.startDate);
          return (
            <div key={i} className={`flex flex-col bg-card rounded-xl border border-border overflow-hidden transition-all duration-300 ${isActive ? 'ring-1 shadow-[0_0_20px_hsl(var(--ad-color)/0.1)]' : ''}`} style={isActive ? { borderColor: 'hsl(var(--ad-color)/0.4)', '--tw-ring-color': 'hsl(var(--ad-color))' } as React.CSSProperties : {}}>
              <div className="p-4 border-b border-border" style={isActive ? { background: 'hsl(var(--ad-color)/0.15)' } : {}}>
                <div className="text-lg font-bold" style={isActive ? { color: 'hsl(var(--ad-color))' } : {}}>Age {a.age}</div>
                <div className="text-sm text-muted-foreground mt-1">{a.yearLabel}</div>
              </div>
              <div className="p-4 flex flex-col gap-4">
                <div className="flex justify-center">
                  <VedicGrid customNumbers={pds.map(p => p.number)} small currentStatus={currentStatus} />
                </div>
                <div className="flex justify-between items-center mt-2 border-t border-border pt-3">
                  <LegendPills periodNums={{ ad: a.number }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  if (tab === 'monthly') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {adsForCurrentMd.map((a, i) => {
          const isActive = now >= a.startDate.getTime() && now < a.endDate.getTime();
          const months = buildMonths(a);
          return (
            <div key={i} className={`flex flex-col bg-card rounded-xl border border-border overflow-hidden transition-all duration-300 ${isActive ? 'ring-1 shadow-[0_0_20px_hsl(var(--ad-color)/0.1)]' : ''}`} style={isActive ? { borderColor: 'hsl(var(--ad-color)/0.4)', '--tw-ring-color': 'hsl(var(--ad-color))' } as React.CSSProperties : {}}>
              <div className="p-4 border-b border-border" style={isActive ? { background: 'hsl(var(--ad-color)/0.15)' } : {}}>
                <div className="text-lg font-bold" style={isActive ? { color: 'hsl(var(--ad-color))' } : {}}>Age {a.age} — Monthly</div>
                <div className="text-sm text-muted-foreground mt-1">{a.yearLabel}</div>
              </div>
              <div className="p-4 flex flex-col gap-4">
                <div className="flex justify-center">
                  <VedicGrid customNumbers={months.map(m => m.number)} small currentStatus={currentStatus} />
                </div>
                <div className="flex justify-between items-center mt-2 border-t border-border pt-3">
                  <LegendPills periodNums={{ ad: a.number }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // daily
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {adsForCurrentMd.map((a, i) => {
        const isActive = now >= a.startDate.getTime() && now < a.endDate.getTime();
        const pds = calculatePratyantars(a.number, a.startDate);
        return (
          <div key={i} className={`flex flex-col bg-card rounded-xl border border-border overflow-hidden transition-all duration-300 ${isActive ? 'ring-1 shadow-[0_0_20px_hsl(var(--pd-color)/0.1)]' : ''}`} style={isActive ? { borderColor: 'hsl(var(--pd-color)/0.4)', '--tw-ring-color': 'hsl(var(--pd-color))' } as React.CSSProperties : {}}>
            <div className="p-4 border-b border-border" style={isActive ? { background: 'hsl(var(--pd-color)/0.15)' } : {}}>
              <div className="text-lg font-bold" style={isActive ? { color: 'hsl(var(--pd-color))' } : {}}>Age {a.age} — Daily</div>
              <div className="text-sm text-muted-foreground mt-1">{a.yearLabel}</div>
            </div>
            <div className="p-4 flex flex-col gap-4">
              <div className="flex justify-center">
                <VedicGrid customNumbers={pds.map(p => p.number)} small currentStatus={currentStatus} />
              </div>
              <div className="flex justify-between items-center mt-2 border-t border-border pt-3">
                <LegendPills periodNums={{ ad: a.number }} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DashaGrid;
