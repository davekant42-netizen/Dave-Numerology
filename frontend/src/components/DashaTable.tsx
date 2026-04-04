import { useMemo, useState } from 'react';
import { Switch } from '@/components/ui/switch';
import {
  MahadashaEntry,
  AntardashaEntry,
  formatDateDMY,
  calculatePratyantars,
  findCurrentStatus,
} from '@/lib/numerology';

interface DashaTableProps {
  dob: Date;
  mahadashas: MahadashaEntry[];
  antardashas: AntardashaEntry[];
}

const DashaTable = ({ dob, mahadashas, antardashas }: DashaTableProps) => {
  const [isCustomRange, setIsCustomRange] = useState(false);
  const [startYear, setStartYear] = useState('');
  const[endYear, setEndYear] = useState('');

  const now = Date.now();

  const current = useMemo(
    () => findCurrentStatus(dob, mahadashas, antardashas),[dob, mahadashas, antardashas]
  );

  // Filter ADs (Years) based on View Mode
  const filteredAD = useMemo(() => {
    if (!isCustomRange) {
      // Current Year Mode: Only show the year block that is currently active
      return antardashas.filter(a => now >= a.startDate.getTime() && now < a.endDate.getTime());
    }
    const sy = Number(startYear);
    const ey = Number(endYear);
    if (!sy || !ey || sy > ey) return antardashas;
    
    // Custom Range Mode: Show all years that start within the given range
    return antardashas.filter(a => {
      const y = a.startDate.getFullYear();
      return y >= sy && y <= ey;
    });
  },[isCustomRange, antardashas, startYear, endYear, now]);

  const handleReset = () => {
    setStartYear('');
    setEndYear('');
  };

  return (
    <div className="space-y-8">
      {/* View Mode Toggle */}
      <div className="flex items-center gap-4 flex-wrap">
        <span className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">View Mode</span>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium ${!isCustomRange ? 'text-primary' : 'text-muted-foreground'}`}>Current Year</span>
          <Switch 
            checked={isCustomRange} 
            onCheckedChange={(v) => { 
              setIsCustomRange(v); 
              if (!v) handleReset();
            }} 
          />
          <span className={`text-xs font-medium ${isCustomRange ? 'text-primary' : 'text-muted-foreground'}`}>Custom Range</span>
        </div>
        {isCustomRange && (
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Start Year"
              value={startYear}
              onChange={e => setStartYear(e.target.value)}
              className="bg-card border border-border rounded-md px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary w-28 font-mono"
            />
            <span className="text-muted-foreground text-sm">to</span>
            <input
              type="number"
              placeholder="End Year"
              value={endYear}
              onChange={e => setEndYear(e.target.value)}
              className="bg-card border border-border rounded-md px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary w-28 font-mono"
            />
            
            {/* NEW RESET BUTTON */}
            {(startYear || endYear) && (
              <button 
                onClick={handleReset}
                className="text-xs bg-secondary text-secondary-foreground px-3 py-1.5 rounded-md hover:bg-secondary/80 transition-colors ml-2"
              >
                Reset
              </button>
            )}
          </div>
        )}
      </div>

      {/* Current Status Block */}
      {current.md && (
        <section className="rounded-lg bg-card border border-border p-5">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Current Status — {formatDateDMY(new Date())}
          </h3>
          {/* Changed grid-cols-3 to grid-cols-2 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {current.md && (
              <div className="rounded-md bg-destructive/10 border border-destructive/30 p-3">
                <p className="text-xs text-muted-foreground">Mahadasha</p>
                <p className="text-xl font-bold text-destructive">
                  {current.md.number} — {current.md.planet}
                </p>
              </div>
            )}
            {current.ad && (
              <div className="rounded-md bg-blue-500/10 border border-blue-500/30 p-3">
                <p className="text-xs text-muted-foreground">Antardasha</p>
                <p className="text-xl font-bold text-blue-400">
                  {current.ad.number} — {current.ad.planet}
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Dasha Report (Grouped by Year) */}
      <section className="space-y-6">
        {filteredAD.length === 0 ? (
          <div className="text-center p-8 border border-border rounded-lg bg-card text-muted-foreground">
            No periods found in this range.
          </div>
        ) : (
          filteredAD.map((ad, idx) => {
            // Find the Mahadasha active at the START of this Antardasha year
            const activeMD = mahadashas.find(
              m => ad.startDate.getTime() >= m.startDate.getTime() && ad.startDate.getTime() < m.endDate.getTime()
            );

            // Calculate the 9 Pratyantar Dashas for this specific Antardasha
            const pds = calculatePratyantars(ad.number, ad.startDate);

            return (
              <div key={idx} className="rounded-lg border border-border overflow-hidden bg-card shadow-sm">
                
                {/* Year Header */}
                <div className="bg-emerald-600/20 border-b border-border px-4 py-2.5">
                  <h4 className="font-semibold text-emerald-500 text-sm">
                    Year: {ad.startDate.getFullYear()} to {ad.endDate.getFullYear()} (DOB to DOB)
                  </h4>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    {/* MD and AD Subheader */}
                    <thead className="bg-secondary/40">
                      <tr>
                        <th colSpan={2} className="px-4 py-3 border-b border-r border-border font-bold text-center text-destructive w-1/2">
                          Mahadasha: {activeMD?.number}
                        </th>
                        <th colSpan={2} className="px-4 py-3 border-b border-border font-bold text-center text-blue-400 w-1/2">
                          Antardasha: {ad.number}
                        </th>
                      </tr>
                      {/* Column Headers */}
                      <tr className="bg-secondary text-muted-foreground text-xs uppercase tracking-wider">
                        <th className="px-4 py-2.5 border-b border-border font-semibold text-center w-1/4">PD No.</th>
                        <th className="px-4 py-2.5 border-b border-border font-semibold text-center w-1/4">Days</th>
                        <th className="px-4 py-2.5 border-b border-border font-semibold text-center w-1/4">Start Date</th>
                        <th className="px-4 py-2.5 border-b border-border font-semibold text-center w-1/4">End Date</th>
                      </tr>
                    </thead>
                    
                    {/* Pratyantar Dasha Rows */}
                    <tbody>
                      {pds.map((pd, pdIdx) => {
                        // Highlight the currently active PD if it's happening right now
                        const isPDActive = now >= pd.startDate.getTime() && now < pd.endDate.getTime();
                        
                        return (
                          <tr 
                            key={pdIdx} 
                            className={`border-b border-border/50 last:border-0 ${isPDActive ? 'bg-emerald-500/10' : 'hover:bg-secondary/30'}`}
                          >
                            <td className="px-4 py-2 text-center font-mono font-bold text-emerald-400">
                              {pd.number}
                            </td>
                            <td className="px-4 py-2 text-center text-muted-foreground font-mono">
                              {pd.days}
                            </td>
                            <td className="px-4 py-2 text-center font-mono text-xs text-foreground">
                              {formatDateDMY(pd.startDate)}
                            </td>
                            <td className="px-4 py-2 text-center font-mono text-xs text-foreground">
                              {formatDateDMY(pd.endDate)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })
        )}
      </section>
    </div>
  );
};

export default DashaTable;