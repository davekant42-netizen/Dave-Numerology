import { useState, useMemo, useContext } from 'react';
import { useSearchParams, Link } from 'react-router-dom'; // <-- Make sure Link is imported
import NumerologySummary from '@/components/NumerologySummary';
import VedicGrid from '@/components/VedicGrid';
import DashaTable from '@/components/DashaTable';
import { calculateMahadashas, calculateAntardashas, formatDateDMY } from '@/lib/numerology';
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

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-display font-bold text-primary tracking-tight">
              DAVE Numerology
            </h1>
            <p className="text-xs text-muted-foreground">Precision calculations • 120-Year Dasha</p>
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
        {/* Inputs + Vedic Grid */}
        <div className="flex items-start gap-6 flex-wrap">
          <div className="flex flex-col gap-3">
            <div>
              <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-1.5">
                Name
              </label>
              <input
                type="text"
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                placeholder="Enter name"
                className="bg-card border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary w-56"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-1.5">
                Date of Birth
              </label>
              <input
                type="date"
                value={dobInput}
                onChange={e => setDobInput(e.target.value)}
                className="bg-card border border-border rounded-md px-3 py-2 font-mono text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            {dob && (
              <p className="text-sm text-muted-foreground">
                {formatDateDMY(dob)} — {dob.toLocaleDateString('en', { weekday: 'long' })}
              </p>
            )}
          </div>
          {dob && (
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1.5">Vedic Grid</p>
              <VedicGrid dob={dob} />
            </div>
          )}
        </div>

        {dob && (
          <>
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                Core Numbers
              </h2>
              <NumerologySummary dob={dob} name={nameInput} />
            </section>

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