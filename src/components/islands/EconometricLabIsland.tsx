import { useState, useMemo } from 'react';
import { predictOlsDemand, type OlsInputs } from '../../lib/engines/ols-demand';
import { formatIdr, formatNumber } from '../../lib/formatters';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ReferenceLine } from 'recharts';

interface Preset {
  name: string;
  inputs: OlsInputs;
}

const PRESETS: Preset[] = [
  {
    name: 'Haya Espresso Bar (Sawojajar)',
    inputs: { seatingCapacity: 85, is24h: false, priceIdr: 18000, gmapsReviews: 740, campusGravityScore: 15.2, openHoursPerDay: 15 },
  },
  {
    name: 'Pesenkopi Plus (Suhat)',
    inputs: { seatingCapacity: 120, is24h: false, priceIdr: 16000, gmapsReviews: 2450, campusGravityScore: 85.0, openHoursPerDay: 16 },
  },
  {
    name: 'Kopitiam Jokolet (Kayutangan)',
    inputs: { seatingCapacity: 65, is24h: false, priceIdr: 14000, gmapsReviews: 1820, campusGravityScore: 42.0, openHoursPerDay: 14 },
  },
  {
    name: 'Nakoa Watugong (24 Jam)',
    inputs: { seatingCapacity: 240, is24h: true, priceIdr: 18000, gmapsReviews: 4250, campusGravityScore: 111.9, openHoursPerDay: 24 },
  },
];

export default function EconometricLabIsland() {
  const [inputs, setInputs] = useState<OlsInputs>(PRESETS[0].inputs);
  const [activePreset, setActivePreset] = useState<string>(PRESETS[0].name);

  const olsResult = useMemo(() => {
    return predictOlsDemand(inputs);
  }, [inputs]);

  const handleApplyPreset = (p: Preset) => {
    setInputs(p.inputs);
    setActivePreset(p.name);
  };

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl p-5 shadow-[0_1px_3px_0_rgba(15,23,42,0.03)] space-y-5">
      {/* Header & Preset Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-sm font-bold text-[var(--text-primary)]">
            OLS Econometric Demand &amp; RevPASH Predictor (R² = 0.7407)
          </h3>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Persamaan: Y = -238.77 + 0.331(Seats) + 56.70(24H) - 2.889(Harga/1k) + 63.25 ln(Reviews) + 16.60(Gravity/100)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs text-[var(--text-muted)] mr-1">Preset:</span>
          {PRESETS.map((p) => (
            <button
              key={p.name}
              type="button"
              onClick={() => handleApplyPreset(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activePreset === p.name
                  ? 'bg-[var(--accent-base)] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {p.name.split('(')[0].trim()}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 5-Column: Interactive Input Sliders */}
        <div className="lg:col-span-5 space-y-4 bg-slate-50/80 p-5 rounded-xl text-xs">
          {/* Seating Capacity */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label htmlFor="seats-input" className="font-semibold text-slate-700">Kapasitas Kursi</label>
              <span className="font-mono font-bold text-slate-900 num-tabular">{inputs.seatingCapacity} kursi</span>
            </div>
            <input
              id="seats-input"
              type="range"
              min="15"
              max="350"
              step="5"
              value={inputs.seatingCapacity}
              onChange={(e) => {
                setInputs({ ...inputs, seatingCapacity: Number(e.target.value) });
                setActivePreset('');
              }}
              className="w-full accent-[var(--accent-base)] cursor-pointer"
            />
            <span className="text-[11px] text-slate-500 block mt-1">Pengaruh: +0.331 cup/hari per kursi</span>
          </div>

          {/* 24 Hours Operation Toggle */}
          <div className="flex items-center justify-between py-2 border-t border-slate-200/60 pt-3">
            <div>
              <span className="font-semibold text-slate-700 block">Operasional 24 Jam</span>
              <span className="text-[11px] text-slate-500">Bonus malam hari: +56.7 cup/hari</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={inputs.is24h}
                onChange={(e) => {
                  setInputs({ ...inputs, is24h: e.target.checked });
                  setActivePreset('');
                }}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--accent-base)]"></div>
            </label>
          </div>

          {/* Kopi Susu Price */}
          <div className="border-t border-slate-200/60 pt-3">
            <div className="flex justify-between items-center mb-1.5">
              <label htmlFor="price-input" className="font-semibold text-slate-700">Harga Kopi Susu Dine-In</label>
              <span className="font-mono font-bold text-slate-900 num-tabular">{formatIdr(inputs.priceIdr)}</span>
            </div>
            <input
              id="price-input"
              type="range"
              min="10000"
              max="35000"
              step="1000"
              value={inputs.priceIdr}
              onChange={(e) => {
                setInputs({ ...inputs, priceIdr: Number(e.target.value) });
                setActivePreset('');
              }}
              className="w-full accent-[var(--accent-base)] cursor-pointer"
            />
            <span className="text-[11px] text-slate-500 block mt-1">Elastisitas: -2.889 cup per kenaikan Rp 1.000</span>
          </div>

          {/* Google Maps Reviews */}
          <div className="border-t border-slate-200/60 pt-3">
            <div className="flex justify-between items-center mb-1.5">
              <label htmlFor="reviews-input" className="font-semibold text-slate-700">Target Google Reviews</label>
              <span className="font-mono font-bold text-slate-900 num-tabular">{formatNumber(inputs.gmapsReviews)} review</span>
            </div>
            <input
              id="reviews-input"
              type="range"
              min="50"
              max="8000"
              step="50"
              value={inputs.gmapsReviews}
              onChange={(e) => {
                setInputs({ ...inputs, gmapsReviews: Number(e.target.value) });
                setActivePreset('');
              }}
              className="w-full accent-[var(--accent-base)] cursor-pointer"
            />
            <span className="text-[11px] text-slate-500 block mt-1">Social Proof: +63.25 cup per ln(reviews) (Driver #1)</span>
          </div>

          {/* Campus Gravity Score */}
          <div className="border-t border-slate-200/60 pt-3">
            <div className="flex justify-between items-center mb-1.5">
              <label htmlFor="gravity-input" className="font-semibold text-slate-700">Skor Gravitasi Kampus</label>
              <span className="font-mono font-bold text-slate-900 num-tabular">{inputs.campusGravityScore.toFixed(1)}</span>
            </div>
            <input
              id="gravity-input"
              type="range"
              min="0"
              max="150"
              step="5"
              value={inputs.campusGravityScore}
              onChange={(e) => {
                setInputs({ ...inputs, campusGravityScore: Number(e.target.value) });
                setActivePreset('');
              }}
              className="w-full accent-[var(--accent-base)] cursor-pointer"
            />
            <span className="text-[11px] text-slate-500 block mt-1">Suhat/Watugong ~110, Klojen ~40, Sawojajar ~15</span>
          </div>
        </div>

        {/* Right 7-Column: Output KPIs & Waterfall Chart */}
        <div className="lg:col-span-7 space-y-4">
          {/* Predicted Result Strip */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50/80 p-4 rounded-xl space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 block uppercase tracking-wider">Prediksi Volume Kopi Susu</span>
              <div className="text-2xl font-bold font-mono text-[var(--accent-base)] num-tabular">
                {formatNumber(olsResult.predictedCupsDay)} <span className="text-xs font-normal text-slate-600">cup/hari</span>
              </div>
              <span className="text-[11px] text-slate-500 block">
                Estimasi {(olsResult.predictedCupsDay * 30).toLocaleString('id-ID')} cup/bulan
              </span>
            </div>

            <div className="bg-slate-50/80 p-4 rounded-xl space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 block uppercase tracking-wider">RevPASH (Seat-Hour Turnover)</span>
              <div className="text-2xl font-bold font-mono num-tabular text-slate-900">
                {formatIdr(olsResult.revpashIdr)} <span className="text-xs font-normal text-slate-600">/ jam</span>
              </div>
              <span className={`inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                olsResult.revpashStatus === 'danger'
                  ? 'bg-[var(--status-danger-bg)] text-[var(--status-danger-text)]'
                  : olsResult.revpashStatus === 'high_velocity'
                  ? 'bg-[var(--status-success-bg)] text-[var(--status-success-text)]'
                  : 'bg-[var(--status-info-bg)] text-[var(--status-info-text)]'
              }`}>
                {olsResult.revpashLabel}
              </span>
            </div>
          </div>

          {/* Factor Attribution Waterfall Chart */}
          <div className="border border-slate-200/80 p-4 rounded-xl bg-white shadow-xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Waterfall Kontribusi Variabel (Cup/Hari)
            </h4>

            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={olsResult.waterfall} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <XAxis
                    dataKey="factor"
                    tick={{ fontSize: 10, fill: 'var(--text-secondary)' }}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                    axisLine={{ stroke: 'var(--border-default)' }}
                    tickLine={false}
                  />
                  <YAxis tick={{ fontSize: 10, fill: 'var(--text-secondary)' }} axisLine={false} tickLine={false} />
                  <ReferenceLine y={0} stroke="#cbd5e1" />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload as any;
                        const val = data.contributionCups;
                        return (
                          <div className="bg-white border border-slate-200/80 p-2.5 rounded-lg shadow-xl text-xs space-y-1">
                            <p className="font-bold text-slate-900">{data.factor}</p>
                            <p className="text-slate-600">
                              Kontribusi: <strong className={`num-tabular font-mono ${val >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                                {val >= 0 ? `+${val}` : val} cup/hari
                              </strong>
                            </p>
                            <p className="text-[10px] text-slate-500 mt-0.5">{data.description}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="contributionCups" radius={[4, 4, 0, 0]}>
                    {olsResult.waterfall.map((entry, index) => (
                      <Cell
                        key={`wf-${index}`}
                        fill={entry.contributionCups >= 0 ? '#10b981' : '#ef4444'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
