import { useState, useMemo, useContext } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import NumerologySummary from '@/components/NumerologySummary';
import VedicGrid from '@/components/VedicGrid';
import DashaTable from '@/components/DashaTable';
import { calculateMahadashas, calculateAntardashas, formatDateDMY, findCurrentStatus, PLANET_MAP } from '@/lib/numerology';
import { AuthContext } from '@/context/AuthContext';

const STUDENTS: Record<string, { name: string; dob: string }> = {};

const Index = () => {
  const [searchParams] = useSearchParams();
  const studentId = searchParams.get('student');
  const student = studentId ? STUDENTS[studentId] : null;

  const [nameInput, setNameInput] = useState(student?.name ?? '');
  const [dobInput, setDobInput] = useState(student?.dob ?? '');

  const { user, logout } = useContext(AuthContext);

  const dob = useMemo(() => {
    if (!dobInput) return null;
    const d = new Date(dobInput + 'T00:00:00');
    return isNaN(d.getTime()) ? null : d;
  }, [dobInput]);

  const mahadashas = useMemo(() => (dob ? calculateMahadashas(dob) : []),[dob]);
  const antardashas = useMemo(() => (dob ? calculateAntardashas(dob) : []), [dob]);
  const currentStatus = useMemo(() => (dob ? findCurrentStatus(dob, mahadashas, antardashas) : { md: undefined, ad: undefined, pd: undefined, todayDD: undefined }), [dob, mahadashas, antardashas]);

  const today = new Date();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-display font-bold text-primary tracking-tight">
              DAVE Numerology
            </h1>
            <p className="text-xs text-muted-foreground">Precision 120-Year Dasha • Standalone</p>
          </div>
          
          <div className="flex items-center gap-4">
            {student && (
              <div className="text-right border-r border-border pr-4">
                <p className="text-sm font-semibold text-foreground">{student.name}</p>
                <p className="text-xs text-muted-foreground">Student</p>
              </div>
            )}
            
            <div className="text-right flex items-center gap-4">
              <p className="text-sm text-muted-foreground">Welcome, <span className="font-semibold text-foreground">{user?.name}</span></p>
              
              {/* ADMIN DASHBOARD BUTTON */}
              {user?.isAdmin && (
                <Link 
                  to="/admin"
                  className="text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-md hover:opacity-90 transition-colors"
                >
                  Admin Dashboard
                </Link>
              )}

               {/* NEW SETTINGS BUTTON */}
                <Link to="/settings" className="text-xs bg-secondary text-secondary-foreground px-3 py-1.5 rounded-md hover:bg-secondary/80 transition-colors">
                  Settings
                </Link>

              <button 
                onClick={logout}
                className="text-xs bg-secondary text-secondary-foreground px-3 py-1.5 rounded-md hover:bg-secondary/80 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
        {/* Inputs + Summary + Vedic Grid */}
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 space-y-6">
            <div className="flex flex-wrap gap-6 items-start">
              <div>
                <label className="block text-[11px] uppercase tracking-[1.5px] text-muted-foreground mb-1.5">
                  Name
                </label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  placeholder="Enter name"
                  className="bg-card border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary w-56"
                />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-[1.5px] text-muted-foreground mb-1.5">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={dobInput}
                  onChange={e => setDobInput(e.target.value)}
                  className="bg-card border border-border rounded-md px-3 py-2 font-mono text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              {dob && (
                <div className="self-center mt-6">
                  <p className="text-sm text-muted-foreground">
                    {formatDateDMY(dob)} — {dob.toLocaleDateString('en', { weekday: 'long' })}
                  </p>
                </div>
              )}
            </div>

            {dob && (
              <NumerologySummary dob={dob} name={nameInput} />
            )}
          </div>

          {dob && (
            <div className="shrink-0 bg-card border border-border rounded-lg p-4">
              <p className="text-[11px] uppercase tracking-[1.5px] text-muted-foreground mb-2">Vedic Grid</p>
              <VedicGrid dob={dob} currentStatus={currentStatus} />
            </div>
          )}
        </div>

        {dob && (
          <>
            {currentStatus.md && (
              <section>
                <h2 className="text-xs uppercase tracking-[2px] text-muted-foreground mb-3">
                  Current Status — {formatDateDMY(today)}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="rounded-md bg-red-500/10 border border-red-500/40 p-3 text-red-500">
                    <div className="text-[11px] uppercase tracking-widest opacity-80">Mahadasha</div>
                    <div className="text-lg font-bold mt-0.5">{currentStatus.md.number} — {currentStatus.md.planet}</div>
                  </div>
                  {currentStatus.ad && (
                    <div className="rounded-md bg-blue-500/10 border border-blue-500/40 p-3 text-blue-500">
                      <div className="text-[11px] uppercase tracking-widest opacity-80">Antardasha</div>
                      <div className="text-lg font-bold mt-0.5">{currentStatus.ad.number} — {currentStatus.ad.planet}</div>
                    </div>
                  )}
                  {currentStatus.pd && (
                    <div className="rounded-md bg-green-500/10 border border-green-500/40 p-3 text-emerald-500">
                      <div className="text-[11px] uppercase tracking-widest opacity-80">Pratyantar</div>
                      <div className="text-lg font-bold mt-0.5">{currentStatus.pd.number} — {currentStatus.pd.planet}</div>
                    </div>
                  )}
                  {currentStatus.todayDD && (
                    <div className="rounded-md bg-amber-500/10 border border-amber-500/40 p-3 text-amber-500">
                      <div className="text-[11px] uppercase tracking-widest opacity-80">Daily Dasha</div>
                      <div className="text-lg font-bold mt-0.5">{currentStatus.todayDD} — {PLANET_MAP[currentStatus.todayDD]}</div>
                      <div className="text-[10px] opacity-80 mt-0.5">{today.toLocaleDateString('en', { weekday: 'long' })} • {formatDateDMY(today)}</div>
                    </div>
                  )}
                </div>
              </section>
            )}

            <DashaTable dob={dob} mahadashas={mahadashas} antardashas={antardashas} />
          </>
        )}

        {!dob && (
          <div className="flex items-center justify-center py-32">
            <p className="text-muted-foreground text-lg">Enter Name & Date of Birth to begin analysis</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;