import { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
} from 'recharts';

interface KecamatanData {
  name: string;
  shortName: string;
  brands: number;
  kopiSusuCupsDay: number;
  sharePct: number;
}

interface TierData {
  name: string;
  sharePct: number;
  cupsDay: number;
  color: string;
  [key: string]: string | number;
}

const KECAMATAN_BREAKDOWN: KecamatanData[] = [
  { name: 'Lowokwaru', shortName: 'Lowokwaru', brands: 50, kopiSusuCupsDay: 13750, sharePct: 53.8 },
  { name: 'Klojen (Heritage)', shortName: 'Klojen', brands: 26, kopiSusuCupsDay: 7160, sharePct: 28.0 },
  { name: 'Kedungkandang (Sawojajar)', shortName: 'Sawojajar', brands: 6, kopiSusuCupsDay: 1660, sharePct: 6.5 },
  { name: 'Blimbing (Sulfat/Araya)', shortName: 'Blimbing', brands: 4, kopiSusuCupsDay: 1100, sharePct: 4.3 },
  { name: 'Sukun (Unikama)', shortName: 'Sukun', brands: 4, kopiSusuCupsDay: 1100, sharePct: 4.3 },
  { name: 'Border (Dau/Karangploso)', shortName: 'Borders', brands: 3, kopiSusuCupsDay: 800, sharePct: 3.1 },
];

const TIER_BREAKDOWN: TierData[] = [
  { name: 'Tier 1: National Grab-and-Go', sharePct: 28.4, cupsDay: 7262, color: '#0072B2' },
  { name: 'Tier 2: Local Scale Champions', sharePct: 24.1, cupsDay: 6162, color: '#D55E00' },
  { name: 'Tier 3: Modern Kopitiam', sharePct: 18.6, cupsDay: 4756, color: '#E69F00' },
  { name: 'Tier 4: 24H Student Mega-Hubs', sharePct: 14.2, cupsDay: 3631, color: '#009E73' },
  { name: 'Tier 5: Specialty Roasteries', sharePct: 8.5, cupsDay: 2173, color: '#CC79A7' },
  { name: 'Tier 6: Destination & Heritage', sharePct: 6.2, cupsDay: 1585, color: '#56B4E9' },
];

export default function MacroChartsIsland() {
  const [activeKecamatan, setActiveKecamatan] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* 8-Column Kecamatan Volume vs Saturation Chart */}
      <div className="lg:col-span-8 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl p-5 shadow-[0_1px_3px_0_rgba(15,23,42,0.03)] flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-bold text-[var(--text-primary)]">Kecamatan Saturation vs Daily Kopi Susu Velocity</h3>
            <p className="text-xs text-[var(--text-muted)]">5 Kecamatan Kota Malang + Koridor Perbatasan (Klik bar untuk filter ke Explorer)</p>
          </div>
          <span className="text-[11px] font-mono font-semibold text-[var(--accent-base)] bg-[var(--accent-subtle)] px-2.5 py-1 rounded-full">
            Sample N = 93
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={KECAMATAN_BREAKDOWN}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              onClick={(e: any) => {
                if (e && e.activePayload && e.activePayload[0]) {
                  const data = e.activePayload[0].payload as KecamatanData;
                  setActiveKecamatan(data.name);
                  window.location.href = `/explorer?kecamatan=${encodeURIComponent(data.name)}`;
                }
              }}
            >
              <XAxis dataKey="shortName" tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} axisLine={{ stroke: 'var(--border-default)' }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as KecamatanData;
                    return (
                      <div className="bg-white border border-slate-200/80 p-3 rounded-lg shadow-xl text-xs space-y-1">
                        <p className="font-bold text-[var(--text-primary)]">{data.name}</p>
                        <p className="text-[var(--text-secondary)]">
                          Volume Kopi Susu: <strong className="num-tabular font-mono text-[var(--text-primary)]">{data.kopiSusuCupsDay.toLocaleString('id-ID')} cup/hari</strong> ({data.sharePct}%)
                        </p>
                        <p className="text-[var(--text-secondary)]">
                          Saturasi Brand: <strong className="num-tabular font-mono">{data.brands} brand komersial</strong>
                        </p>
                        <p className="text-[10px] text-[var(--accent-base)] mt-1 font-medium">Klik untuk lihat daftar brand di koridor ini →</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="kopiSusuCupsDay" radius={[6, 6, 0, 0]}>
                {KECAMATAN_BREAKDOWN.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.name === activeKecamatan ? 'var(--accent-base)' : '#0072B2'}
                    cursor="pointer"
                  />
                ))}
              </Bar>
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="text-[11px] text-[var(--text-muted)] flex items-center justify-between border-t border-[var(--divider-subtle)] pt-3 mt-2">
          <span>*Lowokwaru menguasai 53.8% pangsa volume mahasiswa, Sawojajar tumbuh sebagai koridor komuter utama.</span>
          <a href="/explorer" className="text-[var(--accent-base)] hover:underline font-medium">
            Buka Explorer Detail →
          </a>
        </div>
      </div>

      {/* 4-Column Category Tier Share */}
      <div className="lg:col-span-4 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl p-5 shadow-[0_1px_3px_0_rgba(15,23,42,0.03)] flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-bold text-[var(--text-primary)]">Category Tier Market Share</h3>
          <p className="text-xs text-[var(--text-muted)]">Proporsi Penjualan Kopi Susu per Format Bisnis</p>
        </div>

        <div className="h-48 w-full flex items-center justify-center my-1">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={TIER_BREAKDOWN}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={78}
                paddingAngle={3}
                dataKey="sharePct"
              >
                {TIER_BREAKDOWN.map((entry, index) => (
                  <Cell key={`tier-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as TierData;
                    return (
                      <div className="bg-white border border-slate-200/80 p-2.5 rounded-lg shadow-xl text-xs">
                        <p className="font-bold text-[var(--text-primary)]">{data.name}</p>
                        <p className="text-[var(--text-secondary)]">Pangsa: <strong className="num-tabular font-mono">{data.sharePct}%</strong> ({data.cupsDay.toLocaleString('id-ID')} cup/hari)</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-1.5 text-xs border-t border-[var(--divider-subtle)] pt-3">
          {TIER_BREAKDOWN.slice(0, 4).map((t) => (
            <div key={t.name} className="flex items-center justify-between">
              <span className="flex items-center gap-2 truncate">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: t.color }}></span>
                <span className="truncate text-[var(--text-secondary)]">{t.name.split(':')[1]?.trim() || t.name}</span>
              </span>
              <span className="font-mono font-semibold text-[var(--text-primary)] num-tabular">{t.sharePct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
