import React, { useState, useMemo, useContext } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Sparkles, Sun, Moon } from 'lucide-react';
import NumerologySummary from '@/components/NumerologySummary';
import VedicGrid from '@/components/VedicGrid';
import DashaCharts from '@/components/DashaCharts';
import DashaTable from '@/components/DashaTable';
import PredictionPanel from '@/components/PredictionPanel';
import { useTheme } from '@/hooks/useTheme';
import { calculateMahadashas, calculateAntardashas, formatDateDMY } from '@/lib/numerology';
import { AuthContext } from '@/context/AuthContext';

const STUDENTS: Record<string, { name: string; dob: string }> = {};

const Index = () => {
  const [searchParams] = useSearchParams();
  const studentId = searchParams.get('student');
  const student = studentId ? STUDENTS[studentId] : null;

  const { user, logout } = useContext(AuthContext);

  const [nameInput, setNameInput] = useState(student?.name ?? '');
  const [dobInput, setDobInput] = useState(student?.dob ?? '');
  const [showPrediction, setShowPrediction] = useState(false);
  const [dashaView, setDashaView] = useState<'charts' | 'table'>('charts');
  const { theme, toggle } = useTheme();

  const dob = useMemo(() => {
    if (!dobInput) return null;
    const d = new Date(dobInput + 'T00:00:00');
    return isNaN(d.getTime()) ? null : d;
  }, [dobInput]);

  const mahadashas = useMemo(() => (dob ? calculateMahadashas(dob) : []), [dob]);
  const antardashas = useMemo(() => (dob ? calculateAntardashas(dob) : []), [dob]);

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <header className="border-b border-border px-4 sm:px-6 py-4 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
          <div>
            <h1 className="text-xl font-display font-bold text-primary tracking-tight">
              Dave Numerology [N]
            </h1>
            <p className="text-xs text-muted-foreground">Precision calculations • 120-Year Dasha</p>
          </div>
          
          <div className="flex items-center gap-4 flex-wrap sm:flex-nowrap justify-end flex-1">
            {student && (
              <div className="text-right border-r border-border pr-4 hidden xs:block">
                <p className="text-sm font-semibold text-foreground">{student.name}</p>
                <p className="text-xs text-muted-foreground">Student</p>
              </div>
            )}
            
            <div className="text-right flex items-center gap-3">
              <p className="text-sm text-muted-foreground hidden md:block">Welcome, <span className="font-semibold text-foreground">{user?.name}</span></p>
              
              <div className="flex gap-2">
                {user?.isAdmin && (
                  <Link 
                    to="/admin"
                    className="text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-md hover:opacity-90 transition-colors font-semibold"
                  >
                    Admin Dashboard
                  </Link>
                )}

                <Link to="/settings" className="text-xs bg-secondary text-secondary-foreground px-3 py-1.5 rounded-md hover:bg-secondary/80 transition-colors font-semibold">
                  Settings
                </Link>

                <button 
                  onClick={logout}
                  className="text-xs bg-secondary text-secondary-foreground px-3 py-1.5 rounded-md hover:bg-secondary/80 transition-colors font-semibold"
                >
                  Logout
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 border-l border-border pl-4">
              {dob && (
                <div className="hidden sm:flex border border-border rounded-md p-0.5 bg-card">
                  {(['charts', 'table'] as const).map(v => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setDashaView(v)}
                      className={`px-3 h-7 rounded text-[11px] font-bold uppercase tracking-wider transition-colors ${
                        dashaView === v
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {v === 'charts' ? 'Charts' : 'Table'}
                    </button>
                  ))}
                </div>
              )}

              {dob && (
                <button
                  type="button"
                  disabled
                  className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-semibold transition-all bg-primary/20 text-primary/50 border border-primary/30 cursor-not-allowed opacity-60"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">View Prediction</span>
                </button>
              )}
              
              <button 
                type="button"
                onClick={toggle} 
                className="inline-flex items-center justify-center h-8 w-8 rounded-full border border-border bg-card text-foreground hover:bg-secondary transition-colors"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
        {/* Inputs + Vedic Grid */}
        <div style={{
          background: theme === 'dark'
            ? 'linear-gradient(135deg,#1a1827 0%,#1e1c35 50%,#1a1827 100%)'
            : 'linear-gradient(135deg,#f5f3ff 0%,#fdfcff 50%,#fff5fb 100%)',
          border: `1px solid ${theme === 'dark' ? '#2e2b45' : '#e8e4f0'}`,
          borderRadius: 20,
          padding: '28px 32px',
          boxShadow: theme === 'dark'
            ? '0 4px 24px rgba(0,0,0,.4)'
            : '0 4px 24px rgba(99,102,241,.08), 0 1px 4px rgba(99,102,241,.04)',
          display: 'flex', alignItems: 'flex-start', gap: 36, flexWrap: 'wrap',
        }}>
          {/* ── inputs ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: 210 }}>

            {/* section label */}
            <span style={{
              fontSize: '0.58rem', fontWeight: 800, textTransform: 'uppercase',
              letterSpacing: '2.5px', color: theme === 'dark' ? '#6b6888' : '#b0a8c0',
            }}>
              Profile
            </span>

            <div>
              <label style={{
                display: 'block', fontSize: '0.62rem', fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '1.8px', marginBottom: 5,
                color: theme === 'dark' ? '#6b6888' : '#a09590',
              }}>
                Name
              </label>
              <input
                type="text"
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                placeholder="Enter name"
                style={{
                  width: '100%',
                  background: theme === 'dark' ? '#1e1c35' : '#fff',
                  border: `1.5px solid ${theme === 'dark' ? '#3d3a5c' : '#e2ddf5'}`,
                  borderRadius: 10,
                  padding: '9px 13px', fontSize: '0.88rem',
                  color: theme === 'dark' ? '#e2e0f0' : '#1c1917',
                  outline: 'none', transition: 'border-color .15s, box-shadow .15s',
                  boxSizing: 'border-box',
                } as React.CSSProperties}
                onFocus={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,.18)'; }}
                onBlur={e  => { e.currentTarget.style.borderColor = theme === 'dark' ? '#3d3a5c' : '#e2ddf5'; e.currentTarget.style.boxShadow = 'none'; }}
              />
            </div>

            <div>
              <label style={{
                display: 'block', fontSize: '0.62rem', fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '1.8px', marginBottom: 5,
                color: theme === 'dark' ? '#6b6888' : '#a09590',
              }}>
                Date of Birth
              </label>
              <input
                type="date"
                value={dobInput}
                onChange={e => setDobInput(e.target.value)}
                style={{
                  width: '100%',
                  background: theme === 'dark' ? '#1e1c35' : '#fff',
                  border: `1.5px solid ${theme === 'dark' ? '#3d3a5c' : '#e2ddf5'}`,
                  borderRadius: 10,
                  padding: '9px 13px', fontSize: '0.88rem',
                  color: theme === 'dark' ? '#e2e0f0' : '#1c1917',
                  outline: 'none', transition: 'border-color .15s, box-shadow .15s',
                  colorScheme: theme === 'light' ? 'light' : 'dark',
                  boxSizing: 'border-box',
                } as React.CSSProperties}
                onFocus={e => { e.currentTarget.style.borderColor = '#6366f1'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,.18)'; }}
                onBlur={e  => { e.currentTarget.style.borderColor = theme === 'dark' ? '#3d3a5c' : '#e2ddf5'; e.currentTarget.style.boxShadow = 'none'; }}
              />
            </div>

            {dob && (
              <div style={{
                background: theme === 'dark' ? '#1e1c35' : 'linear-gradient(135deg,#f0edff,#f9f7ff)',
                border: `1.5px solid ${theme === 'dark' ? '#3d3a5c' : '#ddd6fe'}`,
                borderRadius: 12, padding: '10px 14px',
              }}>
                <p style={{ fontWeight: 800, fontSize: '1.05rem', lineHeight: 1.3,
                  color: theme === 'dark' ? '#a5b4fc' : '#3730a3' }}>
                  {formatDateDMY(dob)}
                </p>
                <p style={{ fontSize: '0.72rem', marginTop: 3, fontWeight: 600,
                  color: theme === 'dark' ? '#6b6888' : '#7c6fb0' }}>
                  {dob.toLocaleDateString('en', { weekday: 'long' })}
                </p>
              </div>
            )}

            {nameInput && (
              <div style={{
                background: theme === 'dark' ? '#1e1c35' : '#fff',
                border: `1.5px solid ${theme === 'dark' ? '#3d3a5c' : '#e8e3f5'}`,
                borderRadius: 12, padding: '10px 14px',
              }}>
                <p style={{ fontSize: '0.58rem', fontWeight: 800, textTransform: 'uppercase',
                  letterSpacing: '1.8px', marginBottom: 3,
                  color: theme === 'dark' ? '#6b6888' : '#b0a8c0' }}>
                  Name
                </p>
                <p style={{ fontWeight: 700, fontSize: '1rem', letterSpacing: '-.2px',
                  color: theme === 'dark' ? '#e2e0f0' : '#1c1917' }}>
                  {nameInput}
                </p>
              </div>
            )}
          </div>

          {/* ── divider ── */}
          <div style={{
            width: 1, alignSelf: 'stretch', flexShrink: 0,
            background: theme === 'dark'
              ? 'linear-gradient(180deg,transparent,#3d3a5c 30%,#3d3a5c 70%,transparent)'
              : 'linear-gradient(180deg,transparent,#ddd6fe 30%,#ddd6fe 70%,transparent)',
          }} />

          {/* ── vedic grid ── */}
          {dob && (
            <div style={{ flex: 1 }}>
              <span style={{
                display: 'block', fontSize: '0.58rem', fontWeight: 800,
                textTransform: 'uppercase', letterSpacing: '2.5px',
                color: theme === 'dark' ? '#6b6888' : '#b0a8c0', marginBottom: 14,
              }}>
                Vedic Grid
              </span>
              <VedicGrid dob={dob} mahadashas={mahadashas} antardashas={antardashas} />
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

            <PredictionPanel dob={dob} name={nameInput} open={showPrediction} onOpenChange={setShowPrediction} />

            {dashaView === 'charts'
              ? <DashaCharts dob={dob} mahadashas={mahadashas} antardashas={antardashas} />
              : <DashaTable  dob={dob} mahadashas={mahadashas} antardashas={antardashas} />
            }
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