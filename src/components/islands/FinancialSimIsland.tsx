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

type ScenarioMode = 'BASELINE' | 'OPTIMISTIC' | 'RECESSION';

export default function FinancialSimIsland() {
  const [selectedArchetypeKey, setSelectedArchetypeKey] = useState<string>('FORMAT_B');
  const [isCommuter, setIsCommuter] = useState<boolean>(false);
  const [customRent, setCustomRent] = useState<number>(ARCHETYPES.FORMAT_B.fixedOpexMonthIdr);
  const [customCups, setCustomCups] = useState<number>(ARCHETYPES.FORMAT_B.baseDailyCups);
  const [scenario, setScenario] = useState<ScenarioMode>('BASELINE');

  const activeArchetype: ArchetypeConfig = ARCHETYPES[selectedArchetypeKey] || ARCHETYPES.FORMAT_B;

  const handleSelectArchetype = (key: string) => {
    setSelectedArchetypeKey(key);
    const arch = ARCHETYPES[key];
    setCustomRent(arch.fixedOpexMonthIdr);
    setCustomCups(arch.baseDailyCups);
  };

  // Adjust inputs based on scenario
  const effectiveCups = useMemo(() => {
    if (scenario === 'OPTIMISTIC') return Math.round(customCups * 1.20);
    if (scenario === 'RECESSION') return Math.round(customCups * 0.88);
    return customCups;
  }, [customCups, scenario]);

  const effectiveCogsPct = useMemo(() => {
    if (scenario === 'RECESSION') return activeArchetype.cogsPct + 4; // Dairy price inflation +15%
    return activeArchetype.cogsPct;
  }, [activeArchetype.cogsPct, scenario]);

  const simResult = useMemo(() => {
    // Custom simulated result
    const customArchetype = { ...activeArchetype, cogsPct: effectiveCogsPct };
    return simulateAcademicPnl(customArchetype, {
      fixedOpexMonthIdr: customRent,
      baseDailyCups: effectiveCups,
      isCommuterCorridor: isCommuter,
    });
  }, [activeArchetype, effectiveCogsPct, customRent, effectiveCups, isCommuter]);

  // Derive granular P&L breakdown for Normal Month (Oct), Holiday Month (Jul), and Full Year
  const normalMonthData = simResult.monthlyCashflows.find((m) => m.month === 'Okt') || simResult.monthlyCashflows[0];
  const holidayMonthData = simResult.monthlyCashflows.find((m) => m.month === 'Jul') || simResult.monthlyCashflows[6];

  const calculatePnlLineItems = (monthlyRev: number, monthlyCups: number, opex: number, cogsPct: number) => {
    const rawCoffeeBeans = Math.round(monthlyRev * 0.08); // 8% beans
    const freshMilk = Math.round(monthlyRev * 0.13); // 13% milk
    const sugarSyrup = Math.round(monthlyRev * 0.04); // 4% syrup/aren
    const packagingCups = Math.round(monthlyRev * 0.04); // 4% cup + seal + straw
    const spoilageReserve = Math.round(monthlyRev * (cogsPct / 100) - (rawCoffeeBeans + freshMilk + sugarSyrup + packagingCups));
    const totalCogs = rawCoffeeBeans + freshMilk + sugarSyrup + packagingCups + Math.max(0, spoilageReserve);
    const grossProfit = monthlyRev - totalCogs;

    // Granular Opex breakdown
    const labor = Math.round(opex * 0.44); // 44% barista & head bar
    const rent = Math.round(opex * 0.32); // 32% rent amortization
    const electricity = Math.round(opex * 0.12); // 12% PLN 11k VA commercial
    const wifiSoftware = Math.round(opex * 0.05); // 5% Biznet 100Mbps + POS Moka
    const maintenanceWater = Math.round(opex * 0.04); // 4% Espresso machine maintenance & water filter
    const garbageSecurity = opex - (labor + rent + electricity + wifiSoftware + maintenanceWater);

    const netProfit = grossProfit - opex;
    const netMarginPct = monthlyRev > 0 ? (netProfit / monthlyRev) * 100 : 0;

    return {
      monthlyRev,
      monthlyCups,
      rawCoffeeBeans,
      freshMilk,
      sugarSyrup,
      packagingCups,
      spoilageReserve: Math.max(0, spoilageReserve),
      totalCogs,
      grossProfit,
      grossMarginPct: monthlyRev > 0 ? (grossProfit / monthlyRev) * 100 : 0,
      labor,
      rent,
      electricity,
      wifiSoftware,
      maintenanceWater,
      garbageSecurity,
      totalOpex: opex,
      netProfit,
      netMarginPct,
    };
  };

  const normalPnl = calculatePnlLineItems(normalMonthData.monthlyRevenueIdr, normalMonthData.monthlyCups, customRent, effectiveCogsPct);
  const holidayPnl = calculatePnlLineItems(holidayMonthData.monthlyRevenueIdr, holidayMonthData.monthlyCups, customRent, effectiveCogsPct);

  // Annual Totals
  const annualRev = simResult.monthlyCashflows.reduce((acc, m) => acc + m.monthlyRevenueIdr, 0);
  const annualCups = simResult.monthlyCashflows.reduce((acc, m) => acc + m.monthlyCups, 0);
  const annualTotalOpex = customRent * 12;
  const annualPnl = calculatePnlLineItems(annualRev, annualCups, annualTotalOpex, effectiveCogsPct);

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl p-5 shadow-[0_1px_3px_0_rgba(15,23,42,0.03)] space-y-6">
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

      {/* Scenario Stress-Test Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50/80 p-3 rounded-xl border border-slate-200/60 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Mode Skenario:</span>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => setScenario('BASELINE')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                scenario === 'BASELINE'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Baseline Normal
            </button>
            <button
              type="button"
              onClick={() => setScenario('OPTIMISTIC')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                scenario === 'OPTIMISTIC'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Optimis (+20% Vol)
            </button>
            <button
              type="button"
              onClick={() => setScenario('RECESSION')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                scenario === 'RECESSION'
                  ? 'bg-rose-700 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Inflasi Susu (+15%) &amp; Lesu (-12%)
            </button>
          </div>
        </div>
        <span className="text-[11px] text-slate-500">
          {scenario === 'BASELINE' && 'Parameter standar historis kalender akademik UB/UM/Polinema.'}
          {scenario === 'OPTIMISTIC' && 'Asumsi viral social media & program bundling komunitas nugas.'}
          {scenario === 'RECESSION' && 'Tekanan kenaikan bahan baku dairy fresh milk & penurunan daya beli kos.'}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 4-Column: Controls */}
        <div className="lg:col-span-4 space-y-4 bg-slate-50/80 p-5 rounded-xl text-xs">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Format Aktif</span>
            <strong className="text-sm text-slate-900 block mt-1">{activeArchetype.name}</strong>
            <span className="font-mono text-xs text-[var(--accent-base)] font-bold block mt-0.5">
              Capex Investasi Awal: {formatIdr(activeArchetype.capexIdr)}
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
            <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
              *Koridor komuter keluarga menahan omzet saat 180.000+ mahasiswa mudik ke kota asal.
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
              <strong className="font-mono font-bold text-slate-900 num-tabular">{effectiveCups} cups</strong>
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
          <div className="border-t border-slate-200/60 pt-3 text-[11px] text-slate-500 space-y-1">
            <span>Titik Impas Operasional (Break-even):</span>
            <strong className="font-mono text-slate-900 block text-xs">
              {simResult.breakEvenCupsDay} cup/hari ({formatIdr(simResult.breakEvenCupsDay * activeArchetype.avgPriceIdr)}/hari)
            </strong>
            <span className="text-[10px] text-slate-500 block">
              Safety margin saat ini: +{Math.round(((effectiveCups - simResult.breakEvenCupsDay) / effectiveCups) * 100)}% di atas BEP
            </span>
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
                {simResult.paybackMonth <= 6 ? 'Sangat Cepat (< 6 bln)' : 'Wajar (6-12 bln)'}
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

      {/* Itemized P&L Financial Statement Table */}
      <div className="border border-slate-200/80 rounded-xl overflow-hidden bg-white shadow-xs">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Pernyataan Laba Rugi Operasional Terperinci (Itemized Monthly &amp; Annual P&amp;L)
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Perbandingan struktur biaya riil antara Bulan Puncak Kuliah (Oktober), Bulan Libur Panjang (Juli), dan Total 1 Tahun
            </p>
          </div>
          <span className="text-[11px] font-mono font-medium text-slate-600 bg-white px-2.5 py-1 rounded-md border border-slate-200">
            HPP Rate: {effectiveCogsPct}% | Rata-rata: {formatIdr(activeArchetype.avgPriceIdr)}/cup
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-700 font-semibold">
              <tr>
                <th className="py-2.5 px-4">Komponen Keuangan (P&amp;L Line Item)</th>
                <th className="py-2.5 px-4 text-right">Bulan Aktif (Okt)</th>
                <th className="py-2.5 px-4 text-right">Bulan Libur (Jul)</th>
                <th className="py-2.5 px-4 text-right bg-slate-100 font-bold">Proyeksi 1 Tahun Penuh</th>
                <th className="py-2.5 px-4 text-slate-500 font-normal hidden md:table-cell">Catatan Vendor &amp; Standar F&amp;B Malang</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {/* Revenue */}
              <tr className="bg-slate-50/50 font-semibold text-slate-900">
                <td className="py-2.5 px-4">Penjualan Kotor (Gross Revenue)</td>
                <td className="py-2.5 px-4 text-right font-mono">{formatIdr(normalPnl.monthlyRev)}</td>
                <td className="py-2.5 px-4 text-right font-mono">{formatIdr(holidayPnl.monthlyRev)}</td>
                <td className="py-2.5 px-4 text-right font-mono bg-slate-50 font-bold">{formatIdr(annualPnl.monthlyRev)}</td>
                <td className="py-2.5 px-4 text-slate-500 font-normal hidden md:table-cell">
                  {formatNumber(normalPnl.monthlyCups)} cups (Okt) vs {formatNumber(holidayPnl.monthlyCups)} cups (Jul)
                </td>
              </tr>

              {/* COGS breakdown */}
              <tr className="text-slate-600">
                <td className="py-1.5 px-4 pl-8">· Biji Kopi (House Blend Dampit &amp; Gayo)</td>
                <td className="py-1.5 px-4 text-right font-mono text-rose-700">({formatIdr(normalPnl.rawCoffeeBeans)})</td>
                <td className="py-1.5 px-4 text-right font-mono text-rose-700">({formatIdr(holidayPnl.rawCoffeeBeans)})</td>
                <td className="py-1.5 px-4 text-right font-mono text-rose-700 bg-slate-50">({formatIdr(annualPnl.rawCoffeeBeans)})</td>
                <td className="py-1.5 px-4 text-slate-500 hidden md:table-cell">18g / double shot (~Rp 1.100 - Rp 1.500)</td>
              </tr>
              <tr className="text-slate-600">
                <td className="py-1.5 px-4 pl-8">· Susu Fresh Milk (Greenfields Kawi / Diamond)</td>
                <td className="py-1.5 px-4 text-right font-mono text-rose-700">({formatIdr(normalPnl.freshMilk)})</td>
                <td className="py-1.5 px-4 text-right font-mono text-rose-700">({formatIdr(holidayPnl.freshMilk)})</td>
                <td className="py-1.5 px-4 text-right font-mono text-rose-700 bg-slate-50">({formatIdr(annualPnl.freshMilk)})</td>
                <td className="py-1.5 px-4 text-slate-500 hidden md:table-cell">120ml per cup (~Rp 2.400 - Rp 2.800)</td>
              </tr>
              <tr className="text-slate-600">
                <td className="py-1.5 px-4 pl-8">· Gula Aren Tirtoyudo &amp; Flavouring</td>
                <td className="py-1.5 px-4 text-right font-mono text-rose-700">({formatIdr(normalPnl.sugarSyrup)})</td>
                <td className="py-1.5 px-4 text-right font-mono text-rose-700">({formatIdr(holidayPnl.sugarSyrup)})</td>
                <td className="py-1.5 px-4 text-right font-mono text-rose-700 bg-slate-50">({formatIdr(annualPnl.sugarSyrup)})</td>
                <td className="py-1.5 px-4 text-slate-500 hidden md:table-cell">25ml aren cair asli kental (~Rp 550)</td>
              </tr>
              <tr className="text-slate-600">
                <td className="py-1.5 px-4 pl-8">· Cup PP 16oz + Sealer Film + Sedotan + Es</td>
                <td className="py-1.5 px-4 text-right font-mono text-rose-700">({formatIdr(normalPnl.packagingCups)})</td>
                <td className="py-1.5 px-4 text-right font-mono text-rose-700">({formatIdr(holidayPnl.packagingCups)})</td>
                <td className="py-1.5 px-4 text-right font-mono text-rose-700 bg-slate-50">({formatIdr(annualPnl.packagingCups)})</td>
                <td className="py-1.5 px-4 text-slate-500 hidden md:table-cell">Supplier sablon kemasan Gadang (~Rp 850)</td>
              </tr>
              <tr className="text-slate-600">
                <td className="py-1.5 px-4 pl-8">· Cadangan Spoilage &amp; Waste Susu (2.5%)</td>
                <td className="py-1.5 px-4 text-right font-mono text-rose-700">({formatIdr(normalPnl.spoilageReserve)})</td>
                <td className="py-1.5 px-4 text-right font-mono text-rose-700">({formatIdr(holidayPnl.spoilageReserve)})</td>
                <td className="py-1.5 px-4 text-right font-mono text-rose-700 bg-slate-50">({formatIdr(annualPnl.spoilageReserve)})</td>
                <td className="py-1.5 px-4 text-slate-500 hidden md:table-cell">Basi / purging kalibrasi grinder tiap shift</td>
              </tr>

              {/* Total COGS & Gross Profit */}
              <tr className="bg-slate-50/80 font-semibold text-slate-800 border-t border-slate-200">
                <td className="py-2 px-4">Total Biaya Bahan Baku (Total HPP)</td>
                <td className="py-2 px-4 text-right font-mono text-rose-800">({formatIdr(normalPnl.totalCogs)})</td>
                <td className="py-2 px-4 text-right font-mono text-rose-800">({formatIdr(holidayPnl.totalCogs)})</td>
                <td className="py-2 px-4 text-right font-mono text-rose-800 bg-slate-100 font-bold">({formatIdr(annualPnl.totalCogs)})</td>
                <td className="py-2 px-4 text-slate-600 hidden md:table-cell">{effectiveCogsPct}% dari omzet</td>
              </tr>
              <tr className="bg-emerald-50/40 font-bold text-emerald-900 border-b border-emerald-100">
                <td className="py-2.5 px-4">Laba Kotor (Gross Profit)</td>
                <td className="py-2.5 px-4 text-right font-mono">{formatIdr(normalPnl.grossProfit)}</td>
                <td className="py-2.5 px-4 text-right font-mono">{formatIdr(holidayPnl.grossProfit)}</td>
                <td className="py-2.5 px-4 text-right font-mono bg-emerald-50">{formatIdr(annualPnl.grossProfit)}</td>
                <td className="py-2.5 px-4 text-emerald-700 hidden md:table-cell">Margin Kotor: {formatPercent(normalPnl.grossMarginPct, 1)}</td>
              </tr>

              {/* Fixed Operating Expenses Breakdown */}
              <tr className="text-slate-600">
                <td className="py-1.5 px-4 pl-8">· Gaji Barista &amp; Staff (Standar UMK Malang Kota)</td>
                <td className="py-1.5 px-4 text-right font-mono text-slate-700">({formatIdr(normalPnl.labor)})</td>
                <td className="py-1.5 px-4 text-right font-mono text-slate-700">({formatIdr(holidayPnl.labor)})</td>
                <td className="py-1.5 px-4 text-right font-mono text-slate-700 bg-slate-50">({formatIdr(annualPnl.labor)})</td>
                <td className="py-1.5 px-4 text-slate-500 hidden md:table-cell">Termasuk insentif cup sales &amp; BPJS TK</td>
              </tr>
              <tr className="text-slate-600">
                <td className="py-1.5 px-4 pl-8">· Sewa Ruko / Space Lokasi Outlet</td>
                <td className="py-1.5 px-4 text-right font-mono text-slate-700">({formatIdr(normalPnl.rent)})</td>
                <td className="py-1.5 px-4 text-right font-mono text-slate-700">({formatIdr(holidayPnl.rent)})</td>
                <td className="py-1.5 px-4 text-right font-mono text-slate-700 bg-slate-50">({formatIdr(annualPnl.rent)})</td>
                <td className="py-1.5 px-4 text-slate-500 hidden md:table-cell">Amortisasi sewa tahunan per bulan</td>
              </tr>
              <tr className="text-slate-600">
                <td className="py-1.5 px-4 pl-8">· Listrik PLN Komersial (11.000 VA B-1)</td>
                <td className="py-1.5 px-4 text-right font-mono text-slate-700">({formatIdr(normalPnl.electricity)})</td>
                <td className="py-1.5 px-4 text-right font-mono text-slate-700">({formatIdr(holidayPnl.electricity)})</td>
                <td className="py-1.5 px-4 text-right font-mono text-slate-700 bg-slate-50">({formatIdr(annualPnl.electricity)})</td>
                <td className="py-1.5 px-4 text-slate-500 hidden md:table-cell">Mesin 2-Group (3.2 kW) + Chiller + AC</td>
              </tr>
              <tr className="text-slate-600">
                <td className="py-1.5 px-4 pl-8">· Internet Fiber Dedicated (100 Mbps) &amp; POS Cloud</td>
                <td className="py-1.5 px-4 text-right font-mono text-slate-700">({formatIdr(normalPnl.wifiSoftware)})</td>
                <td className="py-1.5 px-4 text-right font-mono text-slate-700">({formatIdr(holidayPnl.wifiSoftware)})</td>
                <td className="py-1.5 px-4 text-right font-mono text-slate-700 bg-slate-50">({formatIdr(annualPnl.wifiSoftware)})</td>
                <td className="py-1.5 px-4 text-slate-500 hidden md:table-cell">Biznet Dedicated + Moka POS subscription</td>
              </tr>
              <tr className="text-slate-600">
                <td className="py-1.5 px-4 pl-8">· Preventive Maintenance &amp; Filter Air RO</td>
                <td className="py-1.5 px-4 text-right font-mono text-slate-700">({formatIdr(normalPnl.maintenanceWater)})</td>
                <td className="py-1.5 px-4 text-right font-mono text-slate-700">({formatIdr(holidayPnl.maintenanceWater)})</td>
                <td className="py-1.5 px-4 text-right font-mono text-slate-700 bg-slate-50">({formatIdr(annualPnl.maintenanceWater)})</td>
                <td className="py-1.5 px-4 text-slate-500 hidden md:table-cell">Pembersihan boiler descaling &amp; ganti filter</td>
              </tr>
              <tr className="text-slate-600">
                <td className="py-1.5 px-4 pl-8">· Retribusi Sampah, Keamanan &amp; Iuran RT</td>
                <td className="py-1.5 px-4 text-right font-mono text-slate-700">({formatIdr(normalPnl.garbageSecurity)})</td>
                <td className="py-1.5 px-4 text-right font-mono text-slate-700">({formatIdr(holidayPnl.garbageSecurity)})</td>
                <td className="py-1.5 px-4 text-right font-mono text-slate-700 bg-slate-50">({formatIdr(annualPnl.garbageSecurity)})</td>
                <td className="py-1.5 px-4 text-slate-500 hidden md:table-cell">Kelurahan &amp; warga lingkungan sekitar</td>
              </tr>

              {/* Total OPEX */}
              <tr className="bg-slate-50 font-semibold text-slate-800">
                <td className="py-2 px-4">Total Biaya Operasional Tetap (OPEX)</td>
                <td className="py-2 px-4 text-right font-mono text-rose-800">({formatIdr(normalPnl.totalOpex)})</td>
                <td className="py-2 px-4 text-right font-mono text-rose-800">({formatIdr(holidayPnl.totalOpex)})</td>
                <td className="py-2 px-4 text-right font-mono text-rose-800 bg-slate-100 font-bold">({formatIdr(annualPnl.totalOpex)})</td>
                <td className="py-2 px-4 text-slate-600 hidden md:table-cell">Biaya tetap per bulan</td>
              </tr>

              {/* Net Profit EBITDA */}
              <tr className="bg-slate-900 text-white font-bold">
                <td className="py-3 px-4 text-sm">Laba Bersih Operasional (EBITDA)</td>
                <td className="py-3 px-4 text-right font-mono text-emerald-400 text-sm">{formatIdr(normalPnl.netProfit)}</td>
                <td className="py-3 px-4 text-right font-mono text-sm text-amber-300">{formatIdr(holidayPnl.netProfit)}</td>
                <td className="py-3 px-4 text-right font-mono text-emerald-300 text-sm bg-slate-800">{formatIdr(annualPnl.netProfit)}</td>
                <td className="py-3 px-4 text-slate-300 text-xs font-normal hidden md:table-cell">
                  Margin Bersih: {formatPercent(annualPnl.netMarginPct, 1)} | Capex Payback: Bulan ke-{simResult.paybackMonth}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
