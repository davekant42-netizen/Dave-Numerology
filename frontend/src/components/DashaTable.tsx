import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  MahadashaEntry,
  AntardashaEntry,
  PratyantarEntry,
  formatDateDMY,
  calculatePratyantars,
  findCurrentStatus,
  getWeekdayValue,
  reduceToSingle,
  PLANET_MAP,
} from '@/lib/numerology';

// ===== Reusable subcomponents =====
const StatusBadge = ({ active, color }: { active: boolean; color: string }) =>
  active ? (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${color}`}>
      <span className={`h-2 w-2 rounded-full ${color.replace('text-', 'bg-')} shadow-[0_0_8px_currentColor] animate-pulse`} />
      Active
    </span>
  ) : (
    <span className="text-xs text-muted-foreground">—</span>
  );

const ViewButton = ({
  open,
  onClick,
  label = 'View',
  tone = 'primary',
}: {
  open: boolean;
  onClick: () => void;
  label?: string;
  tone?: 'primary' | 'gold';
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`inline-flex items-center gap-1 text-xs font-medium rounded-md px-2 py-1 border transition-all ${
      tone === 'gold'
        ? 'border-[hsl(var(--dd-color)/0.4)] text-dd hover:bg-[hsl(var(--dd-color)/0.1)] hover:border-[hsl(var(--dd-color)/0.6)]'
        : 'border-primary/40 text-primary hover:bg-primary/10 hover:border-primary/60'
    }`}
  >
    {open ? 'Hide' : label}
    <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
      <ChevronDown className="h-3 w-3" />
    </motion.span>
  </button>
);

// Expand/collapse wrapper
const Expandable = ({ open, children }: { open: boolean; children: React.ReactNode }) => (
  <AnimatePresence initial={false}>
    {open && (
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="overflow-hidden"
      >
        {children}
      </motion.div>
    )}
  </AnimatePresence>
);

// Build day-by-day Daily Dasha within a PD period
interface DailyEntry {
  date: Date;
  weekday: string;
  weekdayNum: number;
  total: number;
  dd: number;
  planet: string;
}
function buildDailyDashas(pd: PratyantarEntry): DailyEntry[] {
  const out: DailyEntry[] = [];
  const cur = new Date(pd.startDate);
  cur.setHours(0, 0, 0, 0);
  const end = new Date(pd.endDate);
  end.setHours(0, 0, 0, 0);
  while (cur < end) {
    const wn = getWeekdayValue(cur);
    const total = pd.number + wn;
    const dd = reduceToSingle(total);
    out.push({
      date: new Date(cur),
      weekday: cur.toLocaleDateString('en', { weekday: 'long' }),
      weekdayNum: wn,
      total,
      dd,
      planet: PLANET_MAP[dd],
    });
    cur.setDate(cur.getDate() + 1);
  }
  return out;
}

interface DashaTableProps {
  dob: Date;
  mahadashas: MahadashaEntry[];
  antardashas: AntardashaEntry[];
}

const DashaTable = ({ dob, mahadashas, antardashas }: DashaTableProps) => {
  const [isCustomRange, setIsCustomRange] = useState(false);
  const [startYear, setStartYear] = useState('');
  const [endYear, setEndYear] = useState('');
  const [selectedAge, setSelectedAge] = useState<number | ''>('');
  const [expandedAds, setExpandedAds] = useState<Set<number>>(new Set());
  const [expandedPds, setExpandedPds] = useState<Set<string>>(new Set());
  const toggleAd = (i: number) =>
    setExpandedAds(prev => {
      const n = new Set(prev);
      n.has(i) ? n.delete(i) : n.add(i);
      return n;
    });
  const togglePd = (key: string) =>
    setExpandedPds(prev => {
      const n = new Set(prev);
      n.has(key) ? n.delete(key) : n.add(key);
      return n;
    });
  const [ddDetail, setDdDetail] = useState<null | {
    pd: number;
    pdPlanet: string;
    weekday: string;
    weekdayNum: number;
    total: number;
    dd: number;
    date: Date;
    context: string;
  }>(null);

  const now = Date.now();

  const current = useMemo(
    () => findCurrentStatus(dob, mahadashas, antardashas),
    [dob, mahadashas, antardashas]
  );

  // Filter MD by mode
  const filteredMD = useMemo(() => {
    if (!isCustomRange) {
      return mahadashas.filter(m => now >= m.startDate.getTime() && now < m.endDate.getTime());
    }
    const sy = Number(startYear);
    const ey = Number(endYear);
    if (!sy || !ey || sy > ey) return mahadashas;
    const rangeStart = new Date(sy, 0, 1).getTime();
    const rangeEnd = new Date(ey + 1, 0, 1).getTime();
    return mahadashas.filter(m => m.endDate.getTime() > rangeStart && m.startDate.getTime() < rangeEnd);
  }, [isCustomRange, mahadashas, startYear, endYear, now]);

  // Filter AD by mode
  const filteredAD = useMemo(() => {
    if (!isCustomRange) {
      if (selectedAge === '') {
        return antardashas.filter(a => now >= a.startDate.getTime() && now < a.endDate.getTime());
      }
      return antardashas.filter(a => a.age === Number(selectedAge));
    }
    const sy = Number(startYear);
    const ey = Number(endYear);
    if (!sy || !ey || sy > ey) return antardashas;
    const rangeStart = new Date(sy, 0, 1).getTime();
    const rangeEnd = new Date(ey + 1, 0, 1).getTime();
    if (selectedAge === '') {
      return antardashas.filter(a => a.endDate.getTime() > rangeStart && a.startDate.getTime() < rangeEnd);
    }
    return antardashas.filter(a => a.age === Number(selectedAge));
  }, [isCustomRange, antardashas, selectedAge, startYear, endYear, now]);

  // PDs cached per AD index
  const pdsForAd = (i: number): PratyantarEntry[] => {
    const ad = filteredAD[i];
    if (!ad) return [];
    return calculatePratyantars(ad.number, ad.startDate);
  };

  const handleDownloadAll = () => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();

    // Cover / header
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Complete Dasha Report', pageW / 2, 40, { align: 'center' });
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Date of Birth: ${formatDateDMY(dob)}`, pageW / 2, 60, { align: 'center' });
    doc.text(`Generated: ${formatDateDMY(new Date())}`, pageW / 2, 76, { align: 'center' });

    const cur = current;
    const todayWN = getWeekdayValue(new Date());
    const todayDD = cur.pd ? reduceToSingle(cur.pd.number + todayWN) : null;
    autoTable(doc, {
      startY: 96,
      head: [['Current Mahadasha', 'Current Antardasha', 'Current Pratyantar', 'Daily Dasha (Today)']],
      body: [[
        cur.md ? `${cur.md.number} — ${cur.md.planet}` : '—',
        cur.ad ? `${cur.ad.number} — ${cur.ad.planet}` : '—',
        cur.pd ? `${cur.pd.number} — ${cur.pd.planet}` : '—',
        todayDD ? `${todayDD} — ${PLANET_MAP[todayDD]}` : '—',
      ]],
      theme: 'grid',
      headStyles: { fillColor: [60, 60, 80], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 10, halign: 'center' },
    });

    const sectionTitle = (title: string) => {
      doc.addPage();
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(title, 40, 40);
    };

    // Mahadasha
    sectionTitle('Mahadasha — 120 Year Timeline');
    autoTable(doc, {
      startY: 56,
      head: [['#', 'Planet', 'Years', 'Start', 'End', 'Age Start', 'Age End']],
      body: mahadashas.map(m => [
        m.number,
        m.planet,
        `${m.years}y`,
        formatDateDMY(m.startDate),
        formatDateDMY(m.endDate),
        Math.floor((m.startDate.getTime() - dob.getTime()) / (365.25 * 86400000)),
        Math.floor((m.endDate.getTime() - dob.getTime()) / (365.25 * 86400000)),
      ]),
      theme: 'striped',
      headStyles: { fillColor: [180, 50, 50], textColor: 255 },
      styles: { fontSize: 9 },
    });

    // Antardasha
    sectionTitle('Antardasha — Yearly Periods');
    autoTable(doc, {
      startY: 56,
      head: [['Age', '#', 'Planet', 'Period', 'Start', 'End']],
      body: antardashas.map(a => [
        a.age, a.number, a.planet, a.yearLabel,
        formatDateDMY(a.startDate), formatDateDMY(a.endDate),
      ]),
      theme: 'striped',
      headStyles: { fillColor: [40, 70, 160], textColor: 255 },
      styles: { fontSize: 8 },
    });

    // Pratyantar Dasha
    sectionTitle('Pratyantar Dasha — Monthly Periods');
    const pdRows: (string | number)[][] = [];
    antardashas.forEach(a => {
      const pds = calculatePratyantars(a.number, a.startDate);
      pds.forEach((p, idx) => {
        pdRows.push([
          a.age, `${a.number} (${a.planet})`, idx + 1,
          p.number, p.planet,
          formatDateDMY(p.startDate), formatDateDMY(p.endDate),
        ]);
      });
    });
    autoTable(doc, {
      startY: 56,
      head: [['Age', 'AD', '#', 'PD #', 'PD Planet', 'Start', 'End']],
      body: pdRows,
      theme: 'striped',
      headStyles: { fillColor: [30, 130, 60], textColor: 255 },
      styles: { fontSize: 7.5 },
    });

    // Daily Dasha
    sectionTitle('Daily Dasha — Day by Day');
    const ddRows: (string | number)[][] = [];
    antardashas.forEach(a => {
      const pds = calculatePratyantars(a.number, a.startDate);
      pds.forEach(p => {
        buildDailyDashas(p).forEach(d => {
          ddRows.push([
            formatDateDMY(d.date), d.weekday, d.weekdayNum,
            `${p.number} (${p.planet})`, d.total, d.dd, d.planet,
          ]);
        });
      });
    });
    autoTable(doc, {
      startY: 56,
      head: [['Date', 'Weekday', 'WD#', 'PD', 'Total', 'DD#', 'DD Planet']],
      body: ddRows,
      theme: 'striped',
      headStyles: { fillColor: [170, 130, 30], textColor: 255 },
      styles: { fontSize: 7 },
      rowPageBreak: 'auto',
    });

    // Page numbers
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `Page ${i} of ${pageCount}`,
        pageW - 40,
        doc.internal.pageSize.getHeight() - 20,
        { align: 'right' }
      );
    }

    const dobLabel = formatDateDMY(dob).replace(/\./g, '-');
    doc.save(`dasha-full-${dobLabel}.pdf`);
  };

  return (
    <div className="space-y-8">
      {/* View Mode Toggle */}
      <div className="flex items-center gap-4 flex-wrap">
        <span className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">View Mode</span>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium ${!isCustomRange ? 'text-primary' : 'text-muted-foreground'}`}>Current Year</span>
          <Switch checked={isCustomRange} onCheckedChange={(v) => { setIsCustomRange(v); setExpandedAds(new Set()); setExpandedPds(new Set()); setSelectedAge(''); }} />
          <span className={`text-xs font-medium ${isCustomRange ? 'text-primary' : 'text-muted-foreground'}`}>Custom Range</span>
        </div>
        <button
          type="button"
          onClick={handleDownloadAll}
          className="ml-auto inline-flex items-center gap-2 rounded-md border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20 hover:border-primary/60 transition-colors"
        >
          <Download className="h-3.5 w-3.5" />
          Download All
        </button>
        {isCustomRange && (
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Start Year"
              value={startYear}
              onChange={e => { setStartYear(e.target.value); setExpandedAds(new Set()); setExpandedPds(new Set()); }}
              className="bg-card border border-border rounded-md px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring w-28 font-mono"
            />
            <span className="text-muted-foreground text-sm">to</span>
            <input
              type="number"
              placeholder="End Year"
              value={endYear}
              onChange={e => { setEndYear(e.target.value); setExpandedAds(new Set()); setExpandedPds(new Set()); }}
              className="bg-card border border-border rounded-md px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring w-28 font-mono"
            />
          </div>
        )}
      </div>

      {/* Current Status */}
      {current.md && (
        <section className="rounded-lg bg-card border border-border p-5">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Current Status — {formatDateDMY(new Date())}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {current.md && (
              <div className="rounded-md bg-[hsl(var(--md-color)/0.1)] border border-[hsl(var(--md-color)/0.3)] p-3">
                <p className="text-xs text-muted-foreground">Mahadasha</p>
                <p className="text-xl font-bold text-md">
                  {current.md.number} — {current.md.planet}
                </p>
              </div>
            )}
            {current.ad && (
              <div className="rounded-md bg-[hsl(var(--ad-color)/0.1)] border border-[hsl(var(--ad-color)/0.3)] p-3">
                <p className="text-xs text-muted-foreground">Antardasha</p>
                <p className="text-xl font-bold text-ad">
                  {current.ad.number} — {current.ad.planet}
                </p>
              </div>
            )}
            {current.pd && (
              <div className="rounded-md bg-[hsl(var(--pd-color)/0.1)] border border-[hsl(var(--pd-color)/0.3)] p-3">
                <p className="text-xs text-muted-foreground">Pratyantar Dasha</p>
                <p className="text-xl font-bold text-pd">
                  {current.pd.number} — {current.pd.planet}
                </p>
              </div>
            )}
            {(() => {
              const today = new Date();
              const dn = getWeekdayValue(today);
              const pdNum = current.pd?.number ?? 0;
              const pdPlanet = current.pd?.planet ?? '—';
              const total = pdNum + dn;
              const finalDd = reduceToSingle(total);
              return (
                <button
                  type="button"
                  onClick={() =>
                    setDdDetail({
                      pd: pdNum,
                      pdPlanet,
                      weekday: today.toLocaleDateString('en', { weekday: 'long' }),
                      weekdayNum: dn,
                      total,
                      dd: finalDd,
                      date: today,
                      context: 'Today',
                    })
                  }
                  className="text-left rounded-md bg-[hsl(var(--dd-color)/0.1)] border border-[hsl(var(--dd-color)/0.3)] p-3 hover:bg-[hsl(var(--dd-color)/0.2)] transition-colors focus:outline-none focus:ring-2 focus:ring-[hsl(var(--dd-color)/0.5)]"
                >
                  <p className="text-xs text-muted-foreground">Daily Dasha</p>
                  <p className="text-xl font-bold text-dd">
                    {finalDd} — {PLANET_MAP[finalDd]}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1 font-mono">
                    {today.toLocaleDateString('en', { weekday: 'long' })} • {formatDateDMY(today)}
                  </p>
                </button>
              );
            })()}
          </div>
        </section>
      )}

      {/* Mahadasha Table */}
      <section>
        <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-3">
          Mahadasha {isCustomRange && startYear && endYear ? `(${startYear}–${endYear})` : '(Current)'}
        </h3>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-secondary">
                <th className="table-header-cell">#</th>
                <th className="table-header-cell">Planet</th>
                <th className="table-header-cell">Years</th>
                <th className="table-header-cell">Start</th>
                <th className="table-header-cell">End</th>
                <th className="table-header-cell">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredMD.map((m, i) => {
                const isActive = now >= m.startDate.getTime() && now < m.endDate.getTime();
                return (
                  <tr key={i} className={isActive ? 'bg-[hsl(var(--md-color)/0.1)]' : 'hover:bg-secondary/50'}>
                    <td className="table-data-cell font-mono font-bold text-md bg-[hsl(var(--md-color)/0.15)]">{m.number}</td>
                    <td className="table-data-cell font-bold text-md bg-[hsl(var(--md-color)/0.15)]">{m.planet}</td>
                    <td className="table-data-cell number-cell">{m.years}y</td>
                    <td className="table-data-cell font-mono text-xs">{formatDateDMY(m.startDate)}</td>
                    <td className="table-data-cell font-mono text-xs">{formatDateDMY(m.endDate)}</td>
                    <td className="table-data-cell">
                      {isActive && <span className="text-xs font-semibold text-md">● Active</span>}
                    </td>
                  </tr>
                );
              })}
              {filteredMD.length === 0 && (
                <tr><td colSpan={6} className="table-data-cell text-center text-muted-foreground">No MD periods in this range</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Antardasha */}
      <section>
        <div className="flex items-center gap-4 mb-3 flex-wrap">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Antardasha {isCustomRange && startYear && endYear ? `(${startYear}–${endYear})` : '(Current Year)'}
          </h3>
          {isCustomRange && (
            <select
              value={selectedAge}
              onChange={e => { setSelectedAge(e.target.value === '' ? '' : Number(e.target.value)); setExpandedAds(new Set()); setExpandedPds(new Set()); }}
              className="bg-card border border-border rounded-md px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">All in Range</option>
              {antardashas
                .filter(a => {
                  if (!startYear || !endYear) return true;
                  const sy = Number(startYear);
                  const ey = Number(endYear);
                  const rangeStart = new Date(sy, 0, 1).getTime();
                  const rangeEnd = new Date(ey + 1, 0, 1).getTime();
                  return a.endDate.getTime() > rangeStart && a.startDate.getTime() < rangeEnd;
                })
                .map((a, i) => (
                  <option key={i} value={a.age}>Age {a.age} ({a.startDate.getFullYear()})</option>
                ))}
            </select>
          )}
        </div>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-secondary">
                <th className="table-header-cell">Age</th>
                <th className="table-header-cell">#</th>
                <th className="table-header-cell">Planet</th>
                <th className="table-header-cell">Period</th>
                <th className="table-header-cell">Status</th>
                <th className="table-header-cell">PD</th>
                <th className="table-header-cell bg-[hsl(var(--dd-color)/0.1)]">Daily Dashaa</th>
              </tr>
            </thead>
            <tbody>
              {filteredAD.map((a, i) => {
                const isActive = now >= a.startDate.getTime() && now < a.endDate.getTime();
                const pds = pdsForAd(i);
                const activePd = pds.find(p => now >= p.startDate.getTime() && now < p.endDate.getTime()) ?? pds[0];
                const dd = reduceToSingle(activePd.number + getWeekdayValue(new Date()));
                const adOpen = expandedAds.has(i);
                return (
                  <>
                    <tr key={`ad-${i}`} className={isActive ? 'bg-[hsl(var(--ad-color)/0.1)]' : 'hover:bg-secondary/50 transition-colors'}>
                      <td className="table-data-cell font-mono">{a.age}</td>
                      <td className="table-data-cell font-mono font-bold text-ad bg-[hsl(var(--ad-color)/0.15)]">{a.number}</td>
                      <td className="table-data-cell font-bold text-ad bg-[hsl(var(--ad-color)/0.15)]">{a.planet}</td>
                      <td className="table-data-cell font-mono text-xs">{a.yearLabel}</td>
                      <td className="table-data-cell"><StatusBadge active={isActive} color="text-ad" /></td>
                      <td className="table-data-cell">
                        <ViewButton open={adOpen} onClick={() => toggleAd(i)} />
                      </td>
                      <td className="table-data-cell bg-[hsl(var(--dd-color)/0.2)] font-mono font-bold text-dd">
                        <button
                          type="button"
                          onClick={() => {
                            const today = new Date();
                            const wn = getWeekdayValue(today);
                            setDdDetail({
                              pd: activePd.number,
                              pdPlanet: activePd.planet,
                              weekday: today.toLocaleDateString('en', { weekday: 'long' }),
                              weekdayNum: wn,
                              total: activePd.number + wn,
                              dd,
                              date: today,
                              context: `AD ${a.number} (${a.planet}), Age ${a.age}`,
                            });
                          }}
                          className="underline-offset-2 hover:underline focus:outline-none focus:ring-2 focus:ring-[hsl(var(--dd-color)/0.5)] rounded"
                        >
                          {dd} — {PLANET_MAP[dd]}
                        </button>
                      </td>
                    </tr>
                    {/* LEVEL 2 — Pratyantar Dasha nested under AD */}
                    <tr key={`ad-exp-${i}`}>
                      <td colSpan={7} className="p-0 border-0">
                        <Expandable open={adOpen}>
                          <div className="pl-3 sm:pl-6 pr-2 sm:pr-3 py-3 bg-gradient-to-r from-[hsl(var(--pd-color)/0.05)] to-transparent border-l-2 border-[hsl(var(--pd-color)/0.4)]">
                            <p className="text-xs uppercase tracking-widest text-pd/80 mb-2 font-semibold">
                              Pratyantar Dasha — AD {a.number} ({a.planet})
                            </p>
                            <div className="overflow-x-auto rounded-lg border border-[hsl(var(--pd-color)/0.2)] backdrop-blur-sm bg-card/40">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="bg-secondary/60">
                                    <th className="table-header-cell">#</th>
                                    <th className="table-header-cell">Planet</th>
                                    <th className="table-header-cell">Period</th>
                                    <th className="table-header-cell">Status</th>
                                    <th className="table-header-cell bg-[hsl(var(--dd-color)/0.1)]">Daily Dashaa</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {pds.map((p, j) => {
                                    const pdActive = now >= p.startDate.getTime() && now < p.endDate.getTime();
                                    const pdKey = `${i}-${j}`;
                                    const pdOpen = expandedPds.has(pdKey);
                                    const dailies = pdOpen ? buildDailyDashas(p) : [];
                                    return (
                                      <>
                                        <tr key={`pd-${pdKey}`} className={pdActive ? 'bg-[hsl(var(--pd-color)/0.1)]' : 'hover:bg-secondary/40 transition-colors'}>
                                          <td className="table-data-cell font-mono font-bold text-pd bg-[hsl(var(--pd-color)/0.15)]">{p.number}</td>
                                          <td className="table-data-cell font-bold text-pd bg-[hsl(var(--pd-color)/0.15)]">{p.planet}</td>
                                          <td className="table-data-cell font-mono text-xs">
                                            {formatDateDMY(p.startDate)} – {formatDateDMY(p.endDate)} <span className="text-muted-foreground">({p.days}d)</span>
                                          </td>
                                          <td className="table-data-cell"><StatusBadge active={pdActive} color="text-pd" /></td>
                                          <td className="table-data-cell bg-[hsl(var(--dd-color)/0.05)]">
                                            <ViewButton open={pdOpen} onClick={() => togglePd(pdKey)} tone="gold" />
                                          </td>
                                        </tr>
                                        {/* LEVEL 3 — Daily / Sookshma Dasha */}
                                        <tr key={`pd-exp-${pdKey}`}>
                                          <td colSpan={5} className="p-0 border-0">
                                            <Expandable open={pdOpen}>
                                              <div className="pl-3 sm:pl-6 pr-2 sm:pr-3 py-3 bg-gradient-to-r from-[hsl(var(--dd-color)/0.05)] to-transparent border-l-2 border-[hsl(var(--dd-color)/0.4)]">
                                                <p className="text-xs uppercase tracking-widest text-dd/80 mb-2 font-semibold">
                                                  Daily / Sookshma Dasha — PD {p.number} ({p.planet})
                                                </p>
                                                <div className="max-h-72 overflow-y-auto rounded-lg border border-[hsl(var(--dd-color)/0.2)] backdrop-blur-sm bg-card/40">
                                                  <table className="w-full text-sm">
                                                    <thead className="sticky top-0 bg-secondary/90 backdrop-blur">
                                                      <tr>
                                                        <th className="table-header-cell">Date</th>
                                                        <th className="table-header-cell">Weekday</th>
                                                        <th className="table-header-cell">PD</th>
                                                        <th className="table-header-cell">Weekday #</th>
                                                        <th className="table-header-cell">Total</th>
                                                        <th className="table-header-cell bg-[hsl(var(--dd-color)/0.1)]">Final Daily Dasha</th>
                                                        <th className="table-header-cell">Status</th>
                                                      </tr>
                                                    </thead>
                                                    <tbody>
                                                      {dailies.map((d, k) => {
                                                        const next = dailies[k + 1]?.date ?? p.endDate;
                                                        const ddActive = now >= d.date.getTime() && now < next.getTime();
                                                        return (
                                                          <tr key={k} className={ddActive ? 'bg-[hsl(var(--dd-color)/0.1)]' : 'hover:bg-secondary/40 transition-colors'}>
                                                            <td className="table-data-cell font-mono text-xs">{formatDateDMY(d.date)}</td>
                                                            <td className="table-data-cell text-xs">{d.weekday}</td>
                                                            <td className="table-data-cell font-mono text-xs text-pd">{p.number} — {p.planet}</td>
                                                            <td className="table-data-cell font-mono text-xs">{d.weekdayNum} — {PLANET_MAP[d.weekdayNum]}</td>
                                                            <td className="table-data-cell font-mono text-xs">{p.number} + {d.weekdayNum} = {d.total}</td>
                                                            <td className="table-data-cell bg-[hsl(var(--dd-color)/0.2)] font-mono font-bold text-dd">{d.dd} — {d.planet}</td>
                                                            <td className="table-data-cell"><StatusBadge active={ddActive} color="text-dd" /></td>
                                                          </tr>
                                                        );
                                                      })}
                                                    </tbody>
                                                  </table>
                                                </div>
                                              </div>
                                            </Expandable>
                                          </td>
                                        </tr>
                                      </>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </Expandable>
                      </td>
                    </tr>
                  </>
                );
              })}
              {filteredAD.length === 0 && (
                <tr><td colSpan={7} className="table-data-cell text-center text-muted-foreground">No AD periods in this range</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Daily Dasha Detail Dialog */}
      <Dialog open={!!ddDetail} onOpenChange={(o) => { if (!o) setDdDetail(null); }}>
        <DialogContent className="sm:max-w-md border-[hsl(var(--dd-color)/0.3)]">
          <DialogHeader>
            <DialogTitle className="text-dd">Daily Dasha Details</DialogTitle>
            {ddDetail && (
              <DialogDescription className="font-mono text-xs">
                {ddDetail.context} • {formatDateDMY(ddDetail.date)}
              </DialogDescription>
            )}
          </DialogHeader>
          {ddDetail && (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between rounded-md bg-[hsl(var(--pd-color)/0.1)] border border-[hsl(var(--pd-color)/0.3)] px-3 py-2">
                <span className="text-muted-foreground">Pratyantar Dasha</span>
                <span className="font-mono font-bold text-pd">{ddDetail.pd} — {ddDetail.pdPlanet}</span>
              </div>
              <div className="flex justify-between rounded-md bg-secondary/60 px-3 py-2">
                <span className="text-muted-foreground">Weekday</span>
                <span className="font-mono font-bold">{ddDetail.weekday}</span>
              </div>
              <div className="flex justify-between rounded-md bg-secondary/60 px-3 py-2">
                <span className="text-muted-foreground">Weekday Number</span>
                <span className="font-mono font-bold">{ddDetail.weekdayNum} — {PLANET_MAP[ddDetail.weekdayNum]}</span>
              </div>
              <div className="flex justify-between rounded-md bg-secondary/60 px-3 py-2">
                <span className="text-muted-foreground">Combined Total</span>
                <span className="font-mono font-bold">{ddDetail.pd} + {ddDetail.weekdayNum} = {ddDetail.total}</span>
              </div>
              <div className="flex justify-between rounded-md bg-[hsl(var(--dd-color)/0.1)] border border-[hsl(var(--dd-color)/0.3)] px-3 py-2">
                <span className="text-muted-foreground">Final Daily Dasha</span>
                <span className="font-mono font-bold text-dd">{ddDetail.dd} — {PLANET_MAP[ddDetail.dd]}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DashaTable;
