import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Sparkles, Sun, Moon } from 'lucide-react';
import NumerologySummary from '@/components/NumerologySummary';
import VedicGrid from '@/components/VedicGrid';
import DashaCardView from '@/components/DashaCardView';
import DashaTable from '@/components/DashaTable';
import PredictionPanel from '@/components/PredictionPanel';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useTheme } from '@/hooks/useTheme';
import { calculateMahadashas, calculateAntardashas, formatDateDMY } from '@/lib/numerology';

const STUDENTS: Record<string, { name: string; dob: string }> = {};

const Index = () => {
  const [searchParams] = useSearchParams();
  const studentId = searchParams.get('student');
  const student = studentId ? STUDENTS[studentId] : null;

  const [nameInput, setNameInput] = useState(student?.name ?? '');
  const [dobInput, setDobInput] = useState(student?.dob ?? '');
  const [showPrediction, setShowPrediction] = useState(false);
  const [dashaView, setDashaView] = useState<'grid' | 'table'>('grid');
  const { theme, toggle } = useTheme();

  const dob = useMemo(() => {
    if (!dobInput) return null;
    const d = new Date(dobInput + 'T00:00:00');
    return isNaN(d.getTime()) ? null : d;
  }, [dobInput]);

  const mahadashas = useMemo(() => (dob ? calculateMahadashas(dob) : []), [dob]);
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
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggle}
              aria-label="Toggle theme"
              className="inline-flex items-center justify-center h-8 w-8 rounded-md border border-border bg-card text-foreground hover:bg-secondary transition-colors"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            {dob && (
              <ToggleGroup
                type="single"
                value={dashaView}
                onValueChange={(v) => v && setDashaView(v as 'grid' | 'table')}
                className="border border-border rounded-md p-0.5 bg-card"
              >
                <ToggleGroupItem value="grid" size="sm" className="text-xs px-3 h-7 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                  Grid
                </ToggleGroupItem>
                <ToggleGroupItem value="table" size="sm" className="text-xs px-3 h-7 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                  Table
                </ToggleGroupItem>
              </ToggleGroup>
            )}
            {dob && (
              <button
                type="button"
                onClick={() => setShowPrediction(v => !v)}
                className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${
                  showPrediction
                    ? 'bg-primary/20 text-primary border border-primary/50'
                    : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25'
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" />
                {showPrediction ? 'Hide Prediction' : 'View Prediction'}
              </button>
            )}
            {student && (
              <div className="text-right">
                <p className="text-sm font-semibold text-foreground">{student.name}</p>
                <p className="text-xs text-muted-foreground">Student</p>
              </div>
            )}
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
                className="bg-card border border-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring w-56"
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
                className="bg-card border border-border rounded-md px-3 py-2 font-mono text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
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

            {dashaView === 'grid' ? (
              <DashaCardView dob={dob} mahadashas={mahadashas} antardashas={antardashas} />
            ) : (
              <DashaTable dob={dob} mahadashas={mahadashas} antardashas={antardashas} />
            )}
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
