import { useState, useMemo, useEffect, useContext } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Moon, Sun, LayoutGrid, List } from "lucide-react";
import {
  getRootNumber,
  getDestinyNumber,
  getWeekdayValue,
  calculateMahadashas,
  calculateAntardashas,
  findCurrentStatus,
  PLANET_MAP,
} from "@/lib/numerology";
import VedicGrid from "@/components/VedicGrid";
import DashaTable from "@/components/DashaTable";
import DashaGrid from "@/components/DashaGrid";
import { AuthContext } from "@/context/AuthContext";

// Example static mapping for student IDs if applicable, or logic can be dynamic
const STUDENTS: Record<string, { name: string; dob: string }> = {};

const Index = () => {
  const [searchParams] = useSearchParams();
  const studentId = searchParams.get('student');
  const student = studentId ? STUDENTS[studentId] : null;

  const { user, logout } = useContext(AuthContext);

  const [dobInput, setDobInput] = useState(student?.dob ?? "");
  const [nameInput, setNameInput] = useState(student?.name ?? "");
  const [dateObj, setDateObj] = useState<Date | null>(null);
  
  const [view, setView] = useState<'grid' | 'table'>('grid');
  const [tab, setTab] = useState<'mahadasha' | 'yearly' | 'monthly' | 'daily'>('mahadasha');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Set dateObj if dobInput is provided on load
  useEffect(() => {
    if (dobInput) {
      const parsed = new Date(dobInput);
      if (!isNaN(parsed.getTime())) {
        const localDate = new Date(parsed.getTime() + parsed.getTimezoneOffset() * 60000);
        setDateObj(localDate);
      }
    }
  }, [dobInput]);

  // Load theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light';
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('light', savedTheme === 'light');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('light', newTheme === 'light');
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDobInput(val);
    if (val) {
      const parsed = new Date(val);
      if (!isNaN(parsed.getTime())) {
        const localDate = new Date(parsed.getTime() + parsed.getTimezoneOffset() * 60000);
        setDateObj(localDate);
      } else {
        setDateObj(null);
      }
    } else {
      setDateObj(null);
    }
  };

  const calculations = useMemo(() => {
    if (!dateObj) return null;
    const rn = getRootNumber(dateObj);
    const dn = getDestinyNumber(dateObj);
    const wv = getWeekdayValue(dateObj);
    
    const mahadashas = calculateMahadashas(dateObj);
    const antardashas = calculateAntardashas(dateObj);
    const currentStatus = findCurrentStatus(dateObj, mahadashas, antardashas);

    return { rn, dn, wv, mahadashas, antardashas, currentStatus };
  }, [dateObj]);

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <header className="flex flex-col sm:flex-row justify-between items-center px-6 py-4 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50 gap-4">
        <div>
          <h1 className="text-xl font-bold text-primary tracking-wide">DAVE NUMEROLOGY</h1>
          <p className="text-[10px] text-muted-foreground uppercase tracking-[1px] mt-0.5">Precision 120-Year Dasha • Standalone</p>
        </div>
        
        <div className="flex flex-wrap items-center justify-center gap-4">
          {user && (
            <div className="flex items-center gap-3 pr-4 border-r border-border">
              <div className="text-right hidden xs:block">
                <p className="text-sm font-semibold text-foreground">Welcome, {user.name}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{user.isAdmin ? 'Administrator' : 'Student'}</p>
              </div>
              <div className="flex gap-2">
                {user.isAdmin && (
                  <Link to="/admin" className="text-[11px] font-bold uppercase tracking-wider bg-primary text-primary-foreground px-3 py-1.5 rounded-md hover:opacity-90 transition-all">
                    Admin
                  </Link>
                )}
                <Link to="/settings" className="text-[11px] font-bold uppercase tracking-wider bg-secondary text-secondary-foreground px-3 py-1.5 rounded-md hover:bg-secondary/80 transition-all">
                  Settings
                </Link>
                <button onClick={logout} className="text-[11px] font-bold uppercase tracking-wider bg-secondary text-secondary-foreground px-3 py-1.5 rounded-md hover:bg-secondary/80 transition-all">
                  Logout
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center gap-4">
            <div className="flex bg-muted/50 rounded-lg p-1 border border-border">
              <button 
                onClick={() => setView('grid')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${view === 'grid' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <LayoutGrid className="w-4 h-4" /> Grid
              </button>
              <button 
                onClick={() => setView('table')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${view === 'table' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <List className="w-4 h-4" /> Table
              </button>
            </div>
            
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full">
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-8 pb-20">
        
        {/* INPUT SECTION */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          <div className="md:col-span-5 bg-card border border-border rounded-xl p-6 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-[2px] text-muted-foreground mb-6 flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" /> Enter Details
            </h2>
            
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Full Name (Optional)</label>
                <Input 
                  type="text" 
                  placeholder="John Doe" 
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="bg-background border-border text-lg h-12"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Date of Birth</label>
                <Input 
                  type="date" 
                  value={dobInput}
                  onChange={handleDateChange}
                  className="bg-background border-border text-lg h-12 [color-scheme:dark]"
                  style={theme === 'light' ? { colorScheme: 'light' } : {}}
                />
              </div>
            </div>
          </div>
          
          {/* VEDIC GRID PREVIEW */}
          <div className="md:col-span-7 bg-card border border-border rounded-xl p-6 shadow-sm flex items-center justify-center min-h-[250px]">
            {!dateObj ? (
              <div className="text-center text-muted-foreground">
                <div className="w-16 h-16 mx-auto mb-4 border-2 border-dashed border-muted rounded-full flex items-center justify-center">
                  <LayoutGrid className="w-6 h-6 text-muted" />
                </div>
                <p>Enter your Date of Birth to generate the Vedic Grid.</p>
              </div>
            ) : calculations && (
              <div className="flex flex-col md:flex-row gap-8 items-center justify-center w-full animate-in fade-in zoom-in-95 duration-500">
                <VedicGrid dob={dateObj} currentStatus={calculations.currentStatus} />
                
                <div className="flex flex-col gap-3 min-w-[200px]">
                  {calculations.currentStatus.md && (
                    <div className="flex justify-between items-center px-3 py-2 rounded-md border" style={{ backgroundColor: 'hsl(var(--md-color)/0.1)', borderColor: 'hsl(var(--md-color)/0.2)' }}>
                      <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'hsl(var(--md-color))' }}>MD</span>
                      <span className="font-mono text-sm font-bold" style={{ color: 'hsl(var(--md-color))' }}>{calculations.currentStatus.md.number} • {PLANET_MAP[calculations.currentStatus.md.number]}</span>
                    </div>
                  )}
                  {calculations.currentStatus.ad && (
                    <div className="flex justify-between items-center px-3 py-2 rounded-md border" style={{ backgroundColor: 'hsl(var(--ad-color)/0.1)', borderColor: 'hsl(var(--ad-color)/0.2)' }}>
                      <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'hsl(var(--ad-color))' }}>AD</span>
                      <span className="font-mono text-sm font-bold" style={{ color: 'hsl(var(--ad-color))' }}>{calculations.currentStatus.ad.number} • {PLANET_MAP[calculations.currentStatus.ad.number]}</span>
                    </div>
                  )}
                  {calculations.currentStatus.pd && (
                    <div className="flex justify-between items-center px-3 py-2 rounded-md border" style={{ backgroundColor: 'hsl(var(--pd-color)/0.1)', borderColor: 'hsl(var(--pd-color)/0.2)' }}>
                      <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'hsl(var(--pd-color))' }}>PD</span>
                      <span className="font-mono text-sm font-bold" style={{ color: 'hsl(var(--pd-color))' }}>{calculations.currentStatus.pd.number} • {PLANET_MAP[calculations.currentStatus.pd.number]}</span>
                    </div>
                  )}
                  {calculations.currentStatus.todayDD && (
                    <div className="flex justify-between items-center px-3 py-2 rounded-md border" style={{ backgroundColor: 'hsl(var(--dd-color)/0.1)', borderColor: 'hsl(var(--dd-color)/0.2)' }}>
                      <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'hsl(var(--dd-color))' }}>DD</span>
                      <span className="font-mono text-sm font-bold" style={{ color: 'hsl(var(--dd-color))' }}>{calculations.currentStatus.todayDD} • {PLANET_MAP[calculations.currentStatus.todayDD]}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        {dateObj && calculations && (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
            
            {/* CORE NUMBERS */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-card border border-border rounded-xl p-5 shadow-sm relative overflow-hidden group">
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Name</div>
                <div className="text-2xl font-bold truncate">{nameInput || '—'}</div>
              </div>
              <div className="bg-card border border-border rounded-xl p-5 shadow-[0_0_20px_-5px_hsl(var(--gold-glow)/0.3)] relative overflow-hidden group">
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Root Number</div>
                <div className="flex items-baseline gap-2">
                  <div className="text-4xl font-bold text-primary">{calculations.rn}</div>
                  <div className="text-sm text-muted-foreground">Day {dateObj.getDate()} → {PLANET_MAP[calculations.rn]}</div>
                </div>
              </div>
              <div className="bg-card border border-border rounded-xl p-5 shadow-[0_0_20px_-5px_hsl(var(--gold-glow)/0.3)] relative overflow-hidden group">
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Destiny Number</div>
                <div className="flex items-baseline gap-2">
                  <div className="text-4xl font-bold text-primary">{calculations.dn}</div>
                  <div className="text-sm text-muted-foreground">{PLANET_MAP[calculations.dn]}</div>
                </div>
              </div>
              <div className="bg-card border border-border rounded-xl p-5 shadow-[0_0_20px_-5px_hsl(var(--gold-glow)/0.3)] relative overflow-hidden group">
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">DOB Weekday</div>
                <div className="flex items-baseline gap-2">
                  <div className="text-4xl font-bold text-primary">{calculations.wv}</div>
                  <div className="text-sm text-muted-foreground">{dateObj.toLocaleDateString('en',{weekday:'long'})} → {PLANET_MAP[calculations.wv]}</div>
                </div>
              </div>
            </section>

            {/* VIEWS */}
            {view === 'grid' ? (
              <section className="space-y-6">
                <div className="flex items-center gap-2 border-b border-border pb-2 overflow-x-auto no-scrollbar">
                  {['mahadasha', 'yearly', 'monthly', 'daily'].map((t) => (
                    <button
                      key={t}
                      onClick={() => setTab(t as any)}
                      className={`px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${tab === t ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                
                <DashaGrid 
                  dob={dateObj}
                  tab={tab}
                  mahadashas={calculations.mahadashas}
                  antardashas={calculations.antardashas}
                  currentStatus={calculations.currentStatus}
                />
              </section>
            ) : (
              <DashaTable 
                mahadashas={calculations.mahadashas}
                antardashas={calculations.antardashas}
                currentStatus={calculations.currentStatus}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;