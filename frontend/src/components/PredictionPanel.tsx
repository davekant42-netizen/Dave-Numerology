import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getRootNumber, getDestinyNumber, PLANET_MAP } from '@/lib/numerology';
import { getComboPrediction } from '@/lib/predictionCombinations';

interface Props {
  dob: Date | null;
  name: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PredictionPanel = ({ dob, name, open, onOpenChange }: Props) => {
  const [lang, setLang] = useState<'hi' | 'en'>('hi');

  const rn = dob ? getRootNumber(dob) : 0;
  const dn = dob ? getDestinyNumber(dob) : 0;
  const combo = dob ? getComboPrediction(rn, dn) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <div className="flex items-center justify-between gap-3 flex-wrap pr-6">
            <DialogTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="font-semibold uppercase tracking-widest text-muted-foreground text-sm">
                Personalised Prediction
              </span>
            </DialogTitle>
            <div className="inline-flex rounded-md border border-border overflow-hidden text-xs font-semibold">
              <button
                type="button"
                onClick={() => setLang('hi')}
                className={`px-3 py-1.5 transition-colors ${
                  lang === 'hi' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary'
                }`}
              >
                हिंदी
              </button>
              <button
                type="button"
                onClick={() => setLang('en')}
                className={`px-3 py-1.5 transition-colors ${
                  lang === 'en' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary'
                }`}
              >
                English
              </button>
            </div>
          </div>
        </DialogHeader>

        {!dob ? (
          <p className="text-sm text-muted-foreground">
            {lang === 'hi'
              ? 'कृपया अपना नाम और जन्मतिथि दर्ज करें ताकि भविष्यवाणी देखी जा सके।'
              : 'Please enter your Name and Date of Birth to view your prediction.'}
          </p>
        ) : (
          <div className="space-y-4">
            {name && (
              <p className="text-sm text-muted-foreground">
                {lang === 'hi' ? 'के लिए' : 'For'}{' '}
                <span className="font-semibold text-foreground">{name}</span>
              </p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-md bg-primary/5 border border-primary/30 p-4">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  {lang === 'hi' ? 'मूलांक (Root)' : 'Root Number'}
                </p>
                <p className="text-3xl font-bold text-primary mt-1">
                  {rn} <span className="text-base font-medium text-foreground">— {PLANET_MAP[rn]}</span>
                </p>
              </div>
              <div className="rounded-md bg-emerald-500/5 border border-emerald-500/30 p-4">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  {lang === 'hi' ? 'भाग्यांक (Destiny)' : 'Destiny Number'}
                </p>
                <p className="text-3xl font-bold text-emerald-400 mt-1">
                  {dn} <span className="text-base font-medium text-foreground">— {PLANET_MAP[dn]}</span>
                </p>
              </div>
            </div>

            <div className="rounded-md bg-yellow-500/5 border border-yellow-500/30 p-4">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
                {lang === 'hi'
                  ? `संयुक्त भविष्यवाणी — मूलांक ${rn} × भाग्यांक ${dn}`
                  : `Combined Prediction — Root ${rn} × Destiny ${dn}`}
              </p>
              {combo ? (
                <ul className="space-y-2">
                  {combo[lang].map((line, i) => (
                    <li key={i} className="flex gap-2 text-sm text-foreground leading-relaxed">
                      <span className="text-yellow-500 font-bold mt-0.5">•</span>
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  {lang === 'hi'
                    ? `मूलांक ${rn} × भाग्यांक ${dn} का डेटा जल्द ही जोड़ा जाएगा।`
                    : `Prediction data for Root ${rn} × Destiny ${dn} will be added soon.`}
                </p>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PredictionPanel;
