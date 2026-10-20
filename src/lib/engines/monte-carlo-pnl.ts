/**
 * 12-Month Academic Calendar Cashflow & Monte Carlo P&L Engine
 */

export interface ArchetypeConfig {
  id: string;
  name: string;
  capexIdr: number;
  fixedOpexMonthIdr: number;
  baseDailyCups: number;
  avgPriceIdr: number;
  cogsPct: number;
  p50AnnualProfitIdr: number;
  p50RoiPct: number;
  paybackMonths: number;
}

export const ARCHETYPES: Record<string, ArchetypeConfig> = {
  FORMAT_A: {
    id: 'FORMAT_A',
    name: 'Format A: Grab & Go Booth (Stasiun / Ruko Mini)',
    capexIdr: 65000000,
    fixedOpexMonthIdr: 11000000,
    baseDailyCups: 210,
    avgPriceIdr: 14000,
    cogsPct: 31,
    p50AnnualProfitIdr: 217973978,
    p50RoiPct: 335.3,
    paybackMonths: 5,
  },
  FORMAT_B: {
    id: 'FORMAT_B',
    name: 'Format B: Modern Heritage Kopitiam (Kayutangan / Pusat)',
    capexIdr: 160000000,
    fixedOpexMonthIdr: 24000000,
    baseDailyCups: 310,
    avgPriceIdr: 16500,
    cogsPct: 26,
    p50AnnualProfitIdr: 670168430,
    p50RoiPct: 418.9,
    paybackMonths: 4,
  },
  FORMAT_C: {
    id: 'FORMAT_C',
    name: 'Format C: Mid-Size Nugas & WFC (Suhat / Sigura-gura)',
    capexIdr: 265000000,
    fixedOpexMonthIdr: 38000000,
    baseDailyCups: 320,
    avgPriceIdr: 21000,
    cogsPct: 30,
    p50AnnualProfitIdr: 604018240,
    p50RoiPct: 227.9,
    paybackMonths: 6,
  },
  FORMAT_D: {
    id: 'FORMAT_D',
    name: 'Format D: Mega 24H Hub (Watugong / Sudimoro)',
    capexIdr: 680000000,
    fixedOpexMonthIdr: 95000000,
    baseDailyCups: 680,
    avgPriceIdr: 22500,
    cogsPct: 32,
    p50AnnualProfitIdr: 1497220500,
    p50RoiPct: 220.2,
    paybackMonths: 6,
  },
};

export const BASE_ACADEMIC_MULTIPLIERS = [
  { month: 'Jan', name: 'Januari', mult: 0.78, note: 'Libur Semester Ganjil (-22%)' },
  { month: 'Feb', name: 'Februari', mult: 0.74, note: 'Libur Semester Ganjil (-26%)' },
  { month: 'Mar', name: 'Maret', mult: 1.05, note: 'Awal Kuliah Semester Genap' },
  { month: 'Apr', name: 'April', mult: 1.08, note: 'Puncak UTS Genap' },
  { month: 'Mei', name: 'Mei', mult: 1.12, note: 'Bulan Aktif Kuliah' },
  { month: 'Jun', name: 'Juni', mult: 1.04, note: 'UAS Genap' },
  { month: 'Jul', name: 'Juli', mult: 0.72, note: 'Libur Panjang Akhir Tahun Ajaran (-28%)' },
  { month: 'Agu', name: 'Agustus', mult: 0.76, note: 'Libur + Maba datang akhir bulan' },
  { month: 'Sep', name: 'September', mult: 1.18, note: 'Puncak Maba + Awal Kuliah Baru (+18%)' },
  { month: 'Okt', name: 'Oktober', mult: 1.15, note: 'Aktivitas Mahasiswa Penuh' },
  { month: 'Nov', name: 'November', mult: 1.14, note: 'Puncak Tugas Akhir & Nugas' },
  { month: 'Des', name: 'Desember', mult: 0.96, note: 'UAS + Libur Nataru' },
];

export interface CashflowMonth {
  month: string;
  name: string;
  multiplier: number;
  monthlyCups: number;
  monthlyRevenueIdr: number;
  monthlyCogsIdr: number;
  monthlyOpexIdr: number;
  monthlyNetProfitIdr: number;
  cumulativeCashflowIdr: number;
  note: string;
}

export interface SimulationResult {
  monthlyCashflows: CashflowMonth[];
  annualNetProfitIdr: number;
  annualRoiPct: number;
  paybackMonth: number;
  breakEvenCupsDay: number;
}

export const simulateAcademicPnl = (
  archetype: ArchetypeConfig,
  overrides: {
    capexIdr?: number;
    fixedOpexMonthIdr?: number;
    baseDailyCups?: number;
    avgPriceIdr?: number;
    isCommuterCorridor?: boolean;
  } = {}
): SimulationResult => {
  const capex = overrides.capexIdr !== undefined ? overrides.capexIdr : archetype.capexIdr;
  const opex = overrides.fixedOpexMonthIdr !== undefined ? overrides.fixedOpexMonthIdr : archetype.fixedOpexMonthIdr;
  const baseCups = overrides.baseDailyCups !== undefined ? overrides.baseDailyCups : archetype.baseDailyCups;
  const price = overrides.avgPriceIdr !== undefined ? overrides.avgPriceIdr : archetype.avgPriceIdr;
  const isCommuter = !!overrides.isCommuterCorridor;

  let cumulative = -capex;
  let paybackMonth = 12;
  let foundPayback = false;
  let totalNetProfit = 0;

  const monthlyCashflows: CashflowMonth[] = BASE_ACADEMIC_MULTIPLIERS.map((m, idx) => {
    // If commuter corridor, dampen the holiday dips by 50%
    let effMult = m.mult;
    if (isCommuter && m.mult < 1.0) {
      effMult = 1.0 - (1.0 - m.mult) * 0.5;
    }

    const monthlyCups = Math.round(baseCups * 30 * effMult);
    const monthlyRevenueIdr = monthlyCups * price;
    const monthlyCogsIdr = Math.round(monthlyRevenueIdr * (archetype.cogsPct / 100));
    const monthlyNetProfitIdr = monthlyRevenueIdr - monthlyCogsIdr - opex;

    cumulative += monthlyNetProfitIdr;
    totalNetProfit += monthlyNetProfitIdr;

    if (!foundPayback && cumulative >= 0) {
      paybackMonth = idx + 1;
      foundPayback = true;
    }

    return {
      month: m.month,
      name: m.name,
      multiplier: Math.round(effMult * 100) / 100,
      monthlyCups,
      monthlyRevenueIdr,
      monthlyCogsIdr,
      monthlyOpexIdr: opex,
      monthlyNetProfitIdr,
      cumulativeCashflowIdr: cumulative,
      note: m.note,
    };
  });

  const annualRoiPct = capex > 0 ? Math.round((totalNetProfit / capex) * 1000) / 10 : 0;
  // Break-even cups per day: Opex / (Price * (1 - cogsPct)) / 30
  const grossMarginPerCup = price * (1 - archetype.cogsPct / 100);
  const breakEvenCupsDay = grossMarginPerCup > 0 ? Math.round(opex / grossMarginPerCup / 30) : 0;

  return {
    monthlyCashflows,
    annualNetProfitIdr: totalNetProfit,
    annualRoiPct,
    paybackMonth: foundPayback ? paybackMonth : 99,
    breakEvenCupsDay,
  };
};
