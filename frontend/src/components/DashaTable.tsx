import React, { useState } from 'react';
import { MahadashaEntry, AntardashaEntry, PratyantarEntry, calculatePratyantars, buildDailyDasha, PLANET_MAP } from '@/lib/numerology';
import { ChevronRight, ChevronDown } from 'lucide-react';

interface DashaTableProps {
  mahadashas: MahadashaEntry[];
  antardashas: AntardashaEntry[];
  currentStatus: {
    md?: MahadashaEntry;
    ad?: AntardashaEntry;
    pd?: PratyantarEntry;
    todayDD?: number;
  };
}

const formatDate = (date: Date) => {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}.${mm}.${yyyy}`;
};

const DailyDashaTable = ({ pd }: { pd: PratyantarEntry }) => {
  const dds = buildDailyDasha(pd);
  const today = new Date().toDateString();

  return (
    <div className="pl-8 pr-4 pb-3">
      <div className="max-h-[320px] overflow-y-auto rounded-md border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 sticky top-0 z-10">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date</th>
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Weekday</th>
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">WD#</th>
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Sum</th>
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Daily Dasha</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {dds.map((d, i) => {
              const isToday = d.date.toDateString() === today;
              return (
                <tr key={i} className={`hover:bg-muted/50 ${isToday ? 'bg-primary/5' : ''}`}>
                  <td className="px-3 py-2 font-mono text-xs">{formatDate(d.date)}</td>
                  <td className="px-3 py-2 text-muted-foreground">{d.weekday}</td>
                  <td className="px-3 py-2 font-mono">{d.wn}</td>
                  <td className="px-3 py-2 font-mono">{d.total}</td>
                  <td className="px-3 py-2 font-medium">
                    <span className="inline-flex items-center justify-center min-w-[1.25rem] h-5 rounded bg-[hsl(var(--dd-color))] text-white text-[10px] font-bold mr-2">{d.dd}</span>
                    {d.planet}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const PratyantarRow = ({ pd, index, isActive }: { pd: PratyantarEntry, index: number, isActive: boolean }) => {
  const [expanded, setExpanded] = useState(isActive);

  return (
    <>
      <tr className="hover:bg-muted/50 cursor-pointer border-t border-border" onClick={() => setExpanded(!expanded)}>
        <td colSpan={5} className="p-2">
          <div className="flex items-center gap-2">
            {expanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
            <span className="text-xs font-medium">
              PD {index + 1}: <span className="inline-flex items-center justify-center min-w-[1.25rem] h-5 rounded bg-[hsl(var(--pd-color))] text-white font-bold ml-1 mr-1">{pd.number}</span>
              {pd.planet} <span className="text-muted-foreground mx-1">•</span> <span className="font-mono text-muted-foreground">{formatDate(pd.startDate)} – {formatDate(pd.endDate)}</span>
              <span className="text-muted-foreground ml-1">({pd.days}d)</span>
            </span>
            {isActive && <span className="ml-auto inline-flex items-center rounded-full bg-[hsl(var(--pd-color))] px-2 py-0.5 text-[10px] font-bold text-white uppercase">Active</span>}
          </div>
        </td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={5} className="p-0 border-b border-border bg-muted/10">
            <DailyDashaTable pd={pd} />
          </td>
        </tr>
      )}
    </>
  );
};

const DashaTable = ({ mahadashas, antardashas, currentStatus }: DashaTableProps) => {
  const now = Date.now();
  const mdActive = mahadashas.filter(m => now >= m.startDate.getTime() && now < m.endDate.getTime());
  const adActive = antardashas.filter(a => now >= a.startDate.getTime() && now < a.endDate.getTime());
  const today = new Date();

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {currentStatus.md && (
        <section className="bg-card border border-border rounded-xl p-5 shadow-sm">
          <h3 className="text-lg font-bold mb-4">Current Status — {formatDate(today)}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[hsl(var(--md-color))]/10 border border-[hsl(var(--md-color))]/30 rounded-lg p-3">
              <div className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-1">Mahadasha</div>
              <div className="font-bold" style={{ color: 'hsl(var(--md-color))' }}>{currentStatus.md.number} — {currentStatus.md.planet}</div>
            </div>
            {currentStatus.ad && (
              <div className="bg-[hsl(var(--ad-color))]/10 border border-[hsl(var(--ad-color))]/30 rounded-lg p-3">
                <div className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-1">Antardasha</div>
                <div className="font-bold" style={{ color: 'hsl(var(--ad-color))' }}>{currentStatus.ad.number} — {currentStatus.ad.planet}</div>
              </div>
            )}
            {currentStatus.pd && (
              <div className="bg-[hsl(var(--pd-color))]/10 border border-[hsl(var(--pd-color))]/30 rounded-lg p-3">
                <div className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-1">Pratyantar Dasha</div>
                <div className="font-bold" style={{ color: 'hsl(var(--pd-color))' }}>{currentStatus.pd.number} — {currentStatus.pd.planet}</div>
              </div>
            )}
            {currentStatus.todayDD && (
              <div className="bg-[hsl(var(--dd-color))]/10 border border-[hsl(var(--dd-color))]/30 rounded-lg p-3">
                <div className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-1">Daily Dasha</div>
                <div className="font-bold" style={{ color: 'hsl(var(--dd-color))' }}>{currentStatus.todayDD} — {PLANET_MAP[currentStatus.todayDD]}</div>
                <div className="text-[10px] text-muted-foreground mt-1">{today.toLocaleDateString('en', { weekday: 'long' })} • {formatDate(today)}</div>
              </div>
            )}
          </div>
        </section>
      )}

      <section>
        <h3 className="text-lg font-bold mb-3">Mahadasha (Current)</h3>
        <div className="rounded-md border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">#</th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Planet</th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Years</th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Start</th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">End</th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {mdActive.length === 0 ? (
                <tr><td colSpan={6} className="p-4 text-center text-muted-foreground">No active MD</td></tr>
              ) : mdActive.map(m => (
                <tr key={m.number} className="bg-[hsl(var(--md-color))]/10">
                  <td className="px-3 py-2 font-mono font-bold" style={{ color: 'hsl(var(--md-color))' }}>{m.number}</td>
                  <td className="px-3 py-2 font-bold" style={{ color: 'hsl(var(--md-color))' }}>{m.planet}</td>
                  <td className="px-3 py-2 font-mono">{m.years}y</td>
                  <td className="px-3 py-2 font-mono text-xs">{formatDate(m.startDate)}</td>
                  <td className="px-3 py-2 font-mono text-xs">{formatDate(m.endDate)}</td>
                  <td className="px-3 py-2">
                    <span className="inline-flex items-center rounded-full bg-[hsl(var(--md-color))] px-2 py-0.5 text-[10px] font-bold text-white uppercase">Active</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-bold mb-3">Antardasha → Pratyantar → Daily Dasha</h3>
        <div className="rounded-md border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Age</th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">#</th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Planet</th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Period</th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody className="bg-card">
              {adActive.length === 0 ? (
                <tr><td colSpan={5} className="p-4 text-center text-muted-foreground border-t border-border">No active AD</td></tr>
              ) : adActive.map((a, i) => {
                const pds = calculatePratyantars(a.number, a.startDate);
                return (
                  <React.Fragment key={i}>
                    <tr className="bg-[hsl(var(--ad-color))]/10 border-t border-border">
                      <td className="px-3 py-2">Age {a.age}</td>
                      <td className="px-3 py-2"><span className="inline-flex items-center justify-center min-w-[1.5rem] h-6 rounded bg-[hsl(var(--ad-color))] text-white font-bold">{a.number}</span></td>
                      <td className="px-3 py-2 font-bold" style={{ color: 'hsl(var(--ad-color))' }}>{a.planet}</td>
                      <td className="px-3 py-2 font-mono text-xs">{a.yearLabel}</td>
                      <td className="px-3 py-2">
                        <span className="inline-flex items-center rounded-full bg-[hsl(var(--ad-color))] px-2 py-0.5 text-[10px] font-bold text-white uppercase">Active</span>
                      </td>
                    </tr>
                    {pds.map((p, pi) => {
                      const pAct = now >= p.startDate.getTime() && now < p.endDate.getTime();
                      return <PratyantarRow key={pi} pd={p} index={pi} isActive={pAct} />;
                    })}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  );
};

export default DashaTable;