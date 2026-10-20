import { useState, useMemo } from 'react';
import {
  ARCHETYPES,
  simulateAcademicPnl,
  type ArchetypeConfig,
} from '../../lib/engines/monte-carlo-pnl';
import { formatIdr, formatNumber, formatPercent } from '../../lib/formatters';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
} from 'recharts';

export default function FinancialSimIsland() {
  const [selectedArchetypeKey, setSelectedArchetypeKey] = useState<string>('FORMAT_B');
  const [isCommuter, setIsCommuter] = useState<boolean>(false);
  const [customRent, setCustomRent] = useState<number>(ARCHETYPES.FORMAT_B.fixedOpexMonthIdr);
  const [customCups, setCustomCups] = useState<number>(ARCHETYPES.FORMAT_B.baseDailyCups);

  const activeArchetype: ArchetypeConfig = ARCHETYPES[selectedArchetypeKey] || ARCHETYPES.FORMAT_B;

  const handleSelectArchetype = (key: string) => {
    setSelectedArchetypeKey(key);
    const arch = ARCHETYPES[key];
    setCustomRent(arch.fixedOpexMonthIdr);
    setCustomCups(arch.baseDailyCups);
  };

  const simResult = useMemo(() => {
    return simulateAcademicPnl(activeArchetype, {
      fixedOpexMonthIdr: customRent,
      baseDailyCups: customCups,
      isCommuterCorridor: isCommuter,
    });
  }, [activeArchetype, customRent, customCups, isCommuter]);

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl p-5 shadow-[0_1px_3px_0_rgba(15,23,42,0.03)] space-y-5">
      {/* Header & Archetype Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-sm font-bold text-[var(--text-primary)]">
            12-Month Academic Calendar Cashflow &amp; Capex Payback Simulator
          </h3>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Uji ketahanan cashflow terhadap siklus libur mahasiswa (Jul-Agu &amp; Jan-Feb) di 4 Arketipe Bisnis Malang
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(ARCHETYPES).map(([key, arch]) => (
            <button
              key={key}
              type="button"
              onClick={() => handleSelectArchetype(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                selectedArchetypeKey === key
                  ? 'bg-[var(--accent-base)] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {arch.name.split(':')[0]} ({formatIdr(arch.capexIdr).replace(',00', '').replace('Rp', '').trim()})
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 4-Column: Controls */}
        <div className="lg:col-span-4 space-y-4 bg-slate-50/80 p-5 rounded-xl text-xs">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Format Aktif</span>
            <strong className="text-sm text-slate-900 block mt-1">{activeArchetype.name}</strong>
            <span className="font-mono text-xs text-[var(--accent-base)] font-bold block mt-0.5">
              Capex: {formatIdr(activeArchetype.capexIdr)}
            </span>
          </div>

          {/* Corridor Mode Switch */}
          <div className="border-t border-slate-200/60 pt-3">
            <span className="font-semibold text-slate-700 block mb-1.5">Profil Koridor Lokasi</span>
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="corridor-profile"
                  checked={!isCommuter}
                  onChange={() => setIsCommuter(false)}
                  className="accent-[var(--accent-base)]"
                />
                <span><strong>Kluster Kampus</strong> (Drop liburan penuh -28%)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="corridor-profile"
                  checked={isCommuter}
                  onChange={() => setIsCommuter(true)}
                  className="accent-[var(--accent-base)]"
                />
                <span><strong>Koridor Komuter Warga</strong> (Sawojajar/Sulfat -14%)</span>
              </label>
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">
              *Koridor komuter keluarga menahan omzet saat mahasiswa mudik.
            </p>
          </div>

          {/* Fixed Opex Slider */}
          <div className="border-t border-slate-200/60 pt-3">
            <div className="flex justify-between items-center mb-1.5">
              <span className="font-semibold text-slate-700">Biaya Tetap (Sewa + Gaji/Bln)</span>
              <strong className="font-mono font-bold text-slate-900 num-tabular">{formatIdr(customRent)}</strong>
            </div>
            <input
              type="range"
              min={Math.round(activeArchetype.fixedOpexMonthIdr * 0.6)}
              max={Math.round(activeArchetype.fixedOpexMonthIdr * 1.6)}
              step="1000000"
              value={customRent}
              onChange={(e) => setCustomRent(Number(e.target.value))}
              className="w-full accent-[var(--accent-base)] cursor-pointer"
            />
          </div>

          {/* Base Daily Cups */}
          <div className="border-t border-slate-200/60 pt-3">
            <div className="flex justify-between items-center mb-1.5">
              <span className="font-semibold text-slate-700">Target Cup Normal / Hari</span>
              <strong className="font-mono font-bold text-slate-900 num-tabular">{customCups} cups</strong>
            </div>
            <input
              type="range"
              min={Math.round(activeArchetype.baseDailyCups * 0.5)}
              max={Math.round(activeArchetype.baseDailyCups * 1.8)}
              step="10"
              value={customCups}
              onChange={(e) => setCustomCups(Number(e.target.value))}
              className="w-full accent-[var(--accent-base)] cursor-pointer"
            />
          </div>

          {/* Break-even KPI */}
          <div className="border-t border-slate-200/60 pt-3 text-[11px] text-slate-500">
            <span>Titik Impas Operasional (Break-even):</span>
            <strong className="font-mono text-slate-900 block text-xs mt-0.5">
              {simResult.breakEvenCupsDay} cup/hari ({formatIdr(simResult.breakEvenCupsDay * activeArchetype.avgPriceIdr)}/hari)
            </strong>
          </div>
        </div>

        {/* Right 8-Column: KPIs & Monthly Cashflow Chart */}
        <div className="lg:col-span-8 space-y-4">
          {/* Summary Financial Metric Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-slate-50/80 p-4 rounded-xl space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 block uppercase tracking-wider">Proyeksi Laba Bersih / Thn</span>
              <strong className="text-xl font-bold font-mono text-[var(--status-success-text)] num-tabular block">
                {formatIdr(simResult.annualNetProfitIdr)}
              </strong>
              <span className="text-[11px] text-slate-500 block">Setelah sewa &amp; gaji barista</span>
            </div>

            <div className="bg-slate-50/80 p-4 rounded-xl space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 block uppercase tracking-wider">ROI Tahunan (P50)</span>
              <strong className="text-xl font-bold font-mono text-[var(--accent-base)] num-tabular block">
                {formatPercent(simResult.annualRoiPct, 1)}
              </strong>
              <span className="text-[11px] text-slate-500 block">Rasio laba terhadap Capex</span>
            </div>

            <div className="bg-slate-50/80 p-4 rounded-xl space-y-1 col-span-2 sm:col-span-1">
              <span className="text-[11px] font-semibold text-slate-500 block uppercase tracking-wider">Balik Modal (Payback)</span>
              <strong className="text-xl font-bold font-mono text-slate-900 num-tabular block">
                Bulan ke-{simResult.paybackMonth}
              </strong>
              <span className="text-[11px] text-emerald-700 font-medium block">
                {simResult.paybackMonth <= 6 ? '✓ Sangat Cepat (< 6 bln)' : 'Wajar (6-12 bln)'}
              </span>
            </div>
          </div>

          {/* 12-Month Seasonal EBITDA Bar Chart */}
          <div className="border border-slate-200/80 p-4 rounded-xl bg-white shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Laba Bersih Bulanan vs Kumulatif Payback (Jan–Des)
              </h4>
              <span className="text-[10px] text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full font-medium">
                Area Kuning: Libur Semester (Jul-Agu &amp; Jan-Feb)
              </span>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={simResult.monthlyCashflows} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} axisLine={{ stroke: 'var(--border-default)' }} tickLine={false} />
                  <YAxis
                    yAxisId="left"
                    tick={{ fontSize: 10, fill: 'var(--text-secondary)' }}
                    tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 10, fill: 'var(--text-muted)' }}
                    tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`}
                    axisLine={false}
                    tickLine={false}
                  />
                  <ReferenceLine yAxisId="right" y={0} stroke="#cbd5e1" strokeDasharray="3 3" />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload as any;
                        return (
                          <div className="bg-white border border-slate-200/80 p-3 rounded-lg shadow-xl text-xs space-y-1">
                            <p className="font-bold text-slate-900">{data.name} ({data.note})</p>
                            <p className="text-slate-600">
                              Volume: <strong className="num-tabular font-mono">{formatNumber(data.monthlyCups)} cup</strong> (Mult {data.multiplier}x)
                            </p>
                            <p className="text-emerald-700 font-bold">
                              Laba Bersih Bulan Ini: {formatIdr(data.monthlyNetProfitIdr)}
                            </p>
                            <p className="text-[var(--accent-base)] font-medium pt-1 border-t border-slate-100">
                              Arus Kas Kumulatif: {formatIdr(data.cumulativeCashflowIdr)}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar yAxisId="left" dataKey="monthlyNetProfitIdr" fill="var(--accent-base)" radius={[4, 4, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="cumulativeCashflowIdr" stroke="#047857" strokeWidth={2.5} dot={{ r: 3 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-3 mt-2">
              <span>*Bar Biru: Laba Bersih Bulanan (kiri) | Garis Hijau: Kumulatif Cashflow (kanan)</span>
              <span>Baseline Capex: -{formatIdr(activeArchetype.capexIdr)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
