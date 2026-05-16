import { useState } from 'react';
import {
  MahadashaEntry,
  AntardashaEntry,
  PratyantarEntry,
  formatDateDMY,
  calculatePratyantars,
  buildDailyDasha
} from '@/lib/numerology';

interface DashaTableProps {
  dob: Date;
  mahadashas: MahadashaEntry[];
  antardashas: AntardashaEntry[];
}

const DashaTable = ({ mahadashas, antardashas }: DashaTableProps) => {
  const now = Date.now();
  const today = new Date();

  const activeMDIndex = mahadashas.findIndex(m => now >= m.startDate.getTime() && now < m.endDate.getTime());
  const activeADIndex = antardashas.findIndex(a => now >= a.startDate.getTime() && now < a.endDate.getTime());

  return (
    <div className="space-y-8">
      {/* MAHADASHA TABLE */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-[2px] text-muted-foreground mb-3">
          Mahadasha — 120-Year Timeline
        </h2>
        <div className="max-h-[420px] overflow-auto border border-border rounded-md bg-card">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-secondary/50 text-[11px] uppercase tracking-widest text-muted-foreground sticky top-0 z-10">
              <tr>
                <th className="px-3 py-2 border-b border-border font-semibold">#</th>
                <th className="px-3 py-2 border-b border-border font-semibold">Planet</th>
                <th className="px-3 py-2 border-b border-border font-semibold">Years</th>
                <th className="px-3 py-2 border-b border-border font-semibold">Start</th>
                <th className="px-3 py-2 border-b border-border font-semibold">End</th>
                <th className="px-3 py-2 border-b border-border font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {mahadashas.map((m, idx) => {
                const isActive = idx === activeMDIndex;
                return (
                  <tr key={idx} className={`border-b border-border/50 hover:bg-secondary/20 transition-colors ${isActive ? 'bg-red-500/10' : ''}`}>
                    <td className="px-3 py-2 font-mono font-bold text-red-500">{m.number}</td>
                    <td className="px-3 py-2 font-bold text-red-500">{m.planet}</td>
                    <td className="px-3 py-2 text-muted-foreground">{m.years}y</td>
                    <td className="px-3 py-2 font-mono text-xs">{formatDateDMY(m.startDate)}</td>
                    <td className="px-3 py-2 font-mono text-xs">{formatDateDMY(m.endDate)}</td>
                    <td className="px-3 py-2">
                      {isActive && <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded-full font-bold">Active</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* ANTARDASHA NESTED LIST */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-[2px] text-muted-foreground mb-1">
          Antardasha → Pratyantar → Daily Dasha
        </h2>
        <p className="text-[11px] text-muted-foreground mb-4">Click any row to expand</p>
        
        <div className="space-y-2">
          {antardashas.map((a, aIdx) => {
            const isADActive = aIdx === activeADIndex;
            return <AntardashaRow key={a.startDate.getTime() + aIdx} a={a} isADActive={isADActive} now={now} today={today} />;
          })}
        </div>
      </section>
    </div>
  );
};

// Component to handle individual Antardasha row expansion
const AntardashaRow = ({ a, isADActive, now, today }: { a: AntardashaEntry; isADActive: boolean; now: number; today: Date }) => {
  const [isOpen, setIsOpen] = useState(isADActive);

  return (
    <details 
      className="group" 
      open={isOpen} 
      onToggle={(e) => setIsOpen((e.target as HTMLDetailsElement).open)}
    >
      <summary className="cursor-pointer list-none flex items-center p-2.5 bg-secondary/30 hover:bg-secondary/50 border border-border rounded-md text-sm transition-colors text-muted-foreground select-none">
        <span className="text-primary mr-2 group-open:rotate-90 transition-transform">▸</span>
        <span className="font-medium mr-2">Age {a.age}:</span>
        <span className="bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold mr-2">{a.number}</span>
        <span className="font-semibold text-foreground mr-3">{a.planet}</span>
        <span className="font-mono text-xs mr-3">• {a.yearLabel}</span>
        {isADActive && <span className="bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold ml-auto">Active</span>}
      </summary>
      
      {isOpen && (
        <div className="ml-4 my-2 pl-3 border-l-2 border-blue-500/50 bg-blue-500/5 py-2 pr-2 rounded-r-md space-y-2">
          {(() => {
            const pds = calculatePratyantars(a.number, a.startDate);
            const activePDIndex = pds.findIndex(p => now >= p.startDate.getTime() && now < p.endDate.getTime());
            
            return pds.map((p, pIdx) => {
              const isPDActive = pIdx === activePDIndex;
              return <PratyantarRow key={p.startDate.getTime() + pIdx} p={p} pIdx={pIdx} isPDActive={isPDActive} today={today} />;
            });
          })()}
        </div>
      )}
    </details>
  );
};

// Component to handle individual Pratyantar row expansion
const PratyantarRow = ({ p, pIdx, isPDActive, today }: { p: PratyantarEntry; pIdx: number; isPDActive: boolean; today: Date }) => {
  const [isOpen, setIsOpen] = useState(isPDActive);

  return (
    <details 
      className="group/pd" 
      open={isOpen}
      onToggle={(e) => setIsOpen((e.target as HTMLDetailsElement).open)}
    >
      <summary className="cursor-pointer list-none flex items-center p-2 hover:bg-secondary/40 rounded-md text-xs transition-colors text-muted-foreground select-none border border-transparent hover:border-border">
        <span className="text-primary mr-2 group-open/pd:rotate-90 transition-transform">▸</span>
        <span className="font-medium mr-2">PD {pIdx + 1}:</span>
        <span className="bg-green-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold mr-2">{p.number}</span>
        <span className="font-semibold text-foreground mr-3">{p.planet}</span>
        <span className="font-mono mr-3">• {formatDateDMY(p.startDate)} – {formatDateDMY(p.endDate)} ({p.days}d)</span>
        {isPDActive && <span className="bg-green-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold ml-auto">Active</span>}
      </summary>

      {isOpen && (
        <div className="ml-4 my-1.5 pl-2 border-l-2 border-green-500/50 bg-green-500/5 py-1.5 pr-1.5 rounded-r-md">
          <div className="max-h-[300px] overflow-auto border border-border rounded bg-card scrollbar-thin">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-secondary/50 text-[10px] uppercase tracking-widest text-muted-foreground sticky top-0">
                <tr>
                  <th className="px-2 py-1.5 border-b border-border font-semibold">Date</th>
                  <th className="px-2 py-1.5 border-b border-border font-semibold">Weekday</th>
                  <th className="px-2 py-1.5 border-b border-border font-semibold">WD#</th>
                  <th className="px-2 py-1.5 border-b border-border font-semibold">Sum</th>
                  <th className="px-2 py-1.5 border-b border-border font-semibold">DD</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const dds = buildDailyDasha(p);
                  return dds.map((d, dIdx) => {
                    const isToday = d.date.toDateString() === today.toDateString();
                    return (
                      <tr key={dIdx} className={`border-b border-border/30 hover:bg-secondary/30 ${isToday ? 'bg-amber-500/20' : ''}`}>
                        <td className="px-2 py-1.5 font-mono">{formatDateDMY(d.date)}</td>
                        <td className="px-2 py-1.5 text-muted-foreground">{d.weekday}</td>
                        <td className="px-2 py-1.5">{d.wn}</td>
                        <td className="px-2 py-1.5">{d.total}</td>
                        <td className="px-2 py-1.5 flex items-center gap-1.5">
                          <span className="bg-amber-500 text-white text-[9px] px-1.5 py-0.5 rounded-full font-bold">{d.dd}</span>
                          <span className="font-semibold">{d.planet}</span>
                        </td>
                      </tr>
                    );
                  });
                })()}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </details>
  );
};

export default DashaTable;