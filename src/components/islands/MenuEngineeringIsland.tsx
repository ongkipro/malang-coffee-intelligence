import { useState, useMemo } from 'react';
import {
  DEFAULT_RAW_MATERIALS,
  getMenuEngineeringMatrix,
  type RawMaterialPrices,
} from '../../lib/engines/menu-engineering';
import { formatIdr, formatPercent } from '../../lib/formatters';

export default function MenuEngineeringIsland() {
  const [materials, setMaterials] = useState<RawMaterialPrices>(DEFAULT_RAW_MATERIALS);

  const menuItems = useMemo(() => {
    return getMenuEngineeringMatrix(materials);
  }, [materials]);

  const handleResetMaterials = () => {
    setMaterials(DEFAULT_RAW_MATERIALS);
  };

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl p-5 shadow-[0_1px_3px_0_rgba(15,23,42,0.03)] space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-sm font-bold text-[var(--text-primary)]">
            Menu Engineering Matrix &amp; Bill-of-Materials (BOM) COGS
          </h3>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Klasifikasi SKU berdasarkan Margin Kotor (%) vs Pangsa Penjualan (%) beserta Rekomendasi Kasir
          </p>
        </div>

        <button
          type="button"
          onClick={handleResetMaterials}
          className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 self-start sm:self-auto transition-colors cursor-pointer"
        >
          Reset ke Harga Suplai Malang 2026
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 4-Column: Adjustable Ingredient Prices */}
        <div className="lg:col-span-4 space-y-3.5 bg-slate-50/80 p-5 rounded-xl text-xs">
          <h4 className="font-bold text-[11px] uppercase tracking-wider text-slate-600 mb-2">
            Harga Bahan Baku Suplai
          </h4>

          <div>
            <label className="text-slate-700 font-medium block mb-1">
              Biji Kopi House Blend (Rp/kg)
            </label>
            <input
              type="number"
              step="5000"
              value={materials.beansPricePerKgIdr}
              onChange={(e) => setMaterials({ ...materials, beansPricePerKgIdr: Number(e.target.value) })}
              className="w-full h-8 px-2.5 bg-white border border-slate-200 rounded-lg font-mono num-tabular focus:border-[var(--accent-base)] focus:outline-none transition-all"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">Standard Malang: Rp 135k - 160k / kg (70:30 Robusta Dampit)</span>
          </div>

          <div>
            <label className="text-slate-700 font-medium block mb-1">
              Susu Segar Pasteurised (Rp/Liter)
            </label>
            <input
              type="number"
              step="1000"
              value={materials.freshMilkPricePerLiterIdr}
              onChange={(e) => setMaterials({ ...materials, freshMilkPricePerLiterIdr: Number(e.target.value) })}
              className="w-full h-8 px-2.5 bg-white border border-slate-200 rounded-lg font-mono num-tabular focus:border-[var(--accent-base)] focus:outline-none transition-all"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">Standard Greenfields / Hometown: Rp 17.500 - 19.500 / L</span>
          </div>

          <div>
            <label className="text-slate-700 font-medium block mb-1">
              Sirup Gula Aren Organik (Rp/kg)
            </label>
            <input
              type="number"
              step="2000"
              value={materials.arenSyrupPricePerKgIdr}
              onChange={(e) => setMaterials({ ...materials, arenSyrupPricePerKgIdr: Number(e.target.value) })}
              className="w-full h-8 px-2.5 bg-white border border-slate-200 rounded-lg font-mono num-tabular focus:border-[var(--accent-base)] focus:outline-none transition-all"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">Standard Aren Cair: Rp 38.000 - 45.000 / kg</span>
          </div>

          <div>
            <label className="text-slate-700 font-medium block mb-1">
              Cup PP + Seal Lid + Sedotan (Rp/unit)
            </label>
            <input
              type="number"
              step="50"
              value={materials.packagingUnitIdr}
              onChange={(e) => setMaterials({ ...materials, packagingUnitIdr: Number(e.target.value) })}
              className="w-full h-8 px-2.5 bg-white border border-slate-200 rounded-lg font-mono num-tabular focus:border-[var(--accent-base)] focus:outline-none transition-all"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">Cup 14oz/16oz tebal + sealer logo: Rp 750 - 1.000</span>
          </div>
        </div>

        {/* Right 8-Column: SKU Menu Table & Quadrants */}
        <div className="lg:col-span-8 space-y-4">
          <div className="overflow-x-auto border border-slate-200/80 rounded-xl shadow-xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="p-3">Varian Menu</th>
                  <th className="p-3 text-right">Harga Jual</th>
                  <th className="p-3 text-right">HPP (COGS)</th>
                  <th className="p-3 text-right">Margin (%)</th>
                  <th className="p-3 text-right">Pangsa (%)</th>
                  <th className="p-3 text-center">Kuadran</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {menuItems.map((item) => {
                  const badgeColor = {
                    STARS: 'bg-[var(--status-success-bg)] text-[var(--status-success-text)]',
                    PLOWHORSES: 'bg-[var(--status-info-bg)] text-[var(--status-info-text)]',
                    PUZZLES: 'bg-[var(--status-warning-bg)] text-[var(--status-warning-text)]',
                    DOGS: 'bg-[var(--status-danger-bg)] text-[var(--status-danger-text)]',
                  }[item.quadrant];

                  return (
                    <tr key={item.skuName} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-3">
                        <strong className="text-[var(--text-primary)] block font-semibold">{item.skuName}</strong>
                        <span className="text-[10px] text-slate-500">{item.actionRecommendation}</span>
                      </td>
                      <td className="p-3 text-right font-mono num-tabular">
                        {formatIdr(item.dineInPriceIdr)}
                      </td>
                      <td className="p-3 text-right font-mono font-medium num-tabular">
                        {formatIdr(item.cogsIdr)}
                      </td>
                      <td className="p-3 text-right font-mono font-bold num-tabular">
                        {formatPercent(item.grossMarginPct, 1)}
                      </td>
                      <td className="p-3 text-right font-mono num-tabular">
                        {item.dailyCupSharePct}%
                      </td>
                      <td className="p-3 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${badgeColor}`}>
                          {item.quadrant}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-[11px]">
            <div className="p-3 rounded-xl bg-slate-50/80 space-y-1">
              <strong className="text-[var(--status-success-text)] block font-bold">★ STARS</strong>
              <span className="text-slate-500">Margin &gt;65%, Volume &gt;15%. Menu hero utama.</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50/80 space-y-1">
              <strong className="text-[var(--status-info-text)] block font-bold">🐎 PLOWHORSES</strong>
              <span className="text-slate-500">Volume &gt;15%, Margin &lt;65%. Traffic generator.</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50/80 space-y-1">
              <strong className="text-[var(--status-warning-text)] block font-bold">🧩 PUZZLES</strong>
              <span className="text-slate-500">Margin &gt;65%, Volume &lt;15%. Butuh promo bundle.</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50/80 space-y-1">
              <strong className="text-[var(--status-danger-text)] block font-bold">🐕 DOGS</strong>
              <span className="text-slate-500">Margin &lt;65%, Volume &lt;15%. Evaluasi hapus SKU.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
