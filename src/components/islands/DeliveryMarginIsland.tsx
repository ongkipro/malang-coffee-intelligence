import { useState, useMemo } from 'react';
import {
  calculateDeliveryMargin,
  type DeliveryInputs,
} from '../../lib/engines/delivery-margin';
import { formatIdr, formatPercent } from '../../lib/formatters';

export default function DeliveryMarginIsland() {
  const [inputs, setInputs] = useState<DeliveryInputs>({
    dineInPriceIdr: 15000,
    cogsIdr: 5050,
    packagingSealCostIdr: 800,
    appMarkupPct: 25,
    platformCommissionPct: 20,
    platformFixedFeeIdr: 1000,
    promoCoPayPct: 15,
  });

  const result = useMemo(() => {
    return calculateDeliveryMargin(inputs);
  }, [inputs]);

  const handleApplyRecommended = () => {
    setInputs({
      ...inputs,
      appMarkupPct: result.recommendedMarkupPct,
    });
  };

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl p-5 shadow-[0_1px_3px_0_rgba(15,23,42,0.03)] space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-sm font-bold text-[var(--text-primary)]">
            GoFood / ShopeeFood / GrabFood Commission &amp; Markup Simulator
          </h3>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Hitung dampak komisi 20% + Rp 1.000 dan subsidi promo merchant terhadap margin bersih per cup
          </p>
        </div>

        {result.isMarginEroded ? (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 flex items-center gap-1.5 self-start sm:self-auto">
            <span>⚠️</span> Erosi Margin Terdeteksi (&lt; Rp 4.000/cup)
          </span>
        ) : (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 flex items-center gap-1.5 self-start sm:self-auto">
            <span>✓</span> Margin Aman ({formatPercent(result.netContributionPct, 1)})
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 5-Column: Controls */}
        <div className="lg:col-span-5 space-y-4 bg-slate-50/80 p-5 rounded-xl text-xs">
          {/* Dine-in Price */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-slate-700 font-semibold">Harga Dine-In Base</span>
              <strong className="font-mono font-bold text-slate-900 num-tabular">{formatIdr(inputs.dineInPriceIdr)}</strong>
            </div>
            <input
              type="range"
              min="10000"
              max="28000"
              step="1000"
              value={inputs.dineInPriceIdr}
              onChange={(e) => setInputs({ ...inputs, dineInPriceIdr: Number(e.target.value) })}
              className="w-full accent-[var(--accent-base)] cursor-pointer"
            />
          </div>

          {/* App Markup Slider */}
          <div className="border-t border-slate-200/60 pt-3">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-slate-700 font-semibold">Markup Harga Aplikasi (%)</span>
              <strong className="font-mono text-[var(--accent-base)] font-bold num-tabular">+{inputs.appMarkupPct}%</strong>
            </div>
            <input
              type="range"
              min="0"
              max="45"
              step="5"
              value={inputs.appMarkupPct}
              onChange={(e) => setInputs({ ...inputs, appMarkupPct: Number(e.target.value) })}
              className="w-full accent-[var(--accent-base)] cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-500 mt-1">
              <span>Harga Tayang di App:</span>
              <strong className="font-mono text-slate-900 font-semibold">{formatIdr(result.appListedPriceIdr)}</strong>
            </div>
          </div>

          {/* Merchant Promo Co-Pay */}
          <div className="border-t border-slate-200/60 pt-3">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-slate-700 font-semibold">Subsidi Promo Co-Pay Merchant (%)</span>
              <strong className="font-mono text-amber-700 font-bold num-tabular">{inputs.promoCoPayPct}%</strong>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              step="5"
              value={inputs.promoCoPayPct}
              onChange={(e) => setInputs({ ...inputs, promoCoPayPct: Number(e.target.value) })}
              className="w-full accent-[var(--accent-base)] cursor-pointer"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">Diskon kampanye yang ditanggung resto (misal Diskon Kilat / Cuan Barista)</span>
          </div>

          {/* Fixed Params Readout */}
          <div className="border-t border-slate-200/60 pt-3 text-[11px] text-slate-500 space-y-1.5">
            <div className="flex justify-between">
              <span>Komisi Agregator:</span>
              <span className="font-mono font-medium text-slate-700">20% + Rp 1.000 / transaksi</span>
            </div>
            <div className="flex justify-between">
              <span>Biaya Kemasan Sealer + Kantong:</span>
              <span className="font-mono font-medium text-slate-700">Rp 800 / cup</span>
            </div>
          </div>
        </div>

        {/* Right 7-Column: Stacked Breakdown & Recommendation */}
        <div className="lg:col-span-7 space-y-4">
          {/* Result Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50/80 p-4 rounded-xl space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Pencairan Bersih (Net Payout)</span>
              <strong className="text-xl font-bold font-mono text-slate-900 num-tabular block">
                {formatIdr(result.netMerchantPayoutIdr)}
              </strong>
              <span className="text-[11px] text-slate-500 block">Masuk ke rekening resto</span>
            </div>

            <div className="bg-slate-50/80 p-4 rounded-xl space-y-1">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">Laba Bersih per Cup</span>
              <strong className={`text-xl font-bold font-mono num-tabular block ${
                result.isMarginEroded ? 'text-rose-700' : 'text-emerald-700'
              }`}>
                {formatIdr(result.netContributionIdr)}
              </strong>
              <span className="text-[11px] text-slate-500 block">
                {formatPercent(result.netContributionPct, 1)} dari pencairan
              </span>
            </div>
          </div>

          {/* Stacked Breakdown Visualization */}
          <div className="border border-slate-200/80 p-4 rounded-xl bg-white shadow-xs space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
              Alokasi Pendapatan per Cup ({formatIdr(result.appListedPriceIdr)})
            </span>

            {/* Visual Stack Bar */}
            <div className="h-6 w-full rounded-lg flex overflow-hidden text-[10px] text-white font-mono font-bold select-none">
              <div
                style={{ width: `${Math.max(10, ((inputs.cogsIdr + 800) / result.appListedPriceIdr) * 100)}%` }}
                className="bg-slate-500 flex items-center justify-center truncate px-1"
                title={`COGS + Sealer: ${formatIdr(inputs.cogsIdr + 800)}`}
              >
                HPP
              </div>
              <div
                style={{ width: `${Math.max(10, (result.platformCutIdr / result.appListedPriceIdr) * 100)}%` }}
                className="bg-[#D55E00] flex items-center justify-center truncate px-1"
                title={`Komisi Agregator: ${formatIdr(result.platformCutIdr)}`}
              >
                Agregator
              </div>
              <div
                style={{ width: `${Math.max(5, (result.promoSubsidyIdr / result.appListedPriceIdr) * 100)}%` }}
                className="bg-[#B45309] flex items-center justify-center truncate px-1"
                title={`Subsidi Promo: ${formatIdr(result.promoSubsidyIdr)}`}
              >
                Promo
              </div>
              <div
                style={{ width: `${Math.max(15, (result.netContributionIdr / result.appListedPriceIdr) * 100)}%` }}
                className={`flex items-center justify-center truncate px-1 ${
                  result.isMarginEroded ? 'bg-rose-700' : 'bg-emerald-700'
                }`}
                title={`Net Resto: ${formatIdr(result.netContributionIdr)}`}
              >
                Laba Resto
              </div>
            </div>

            {/* Breakdown Legend */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1 text-slate-600">
              <div>
                <span className="text-slate-400 block">HPP + Sealer:</span>
                <span className="font-mono font-medium">{formatIdr(inputs.cogsIdr + 800)}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Potongan GoFood:</span>
                <span className="font-mono font-medium text-[#D55E00]">{formatIdr(result.platformCutIdr)}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Subsidi Promo:</span>
                <span className="font-mono font-medium text-[#B45309]">{formatIdr(result.promoSubsidyIdr)}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Laba Kantong Resto:</span>
                <strong className={`font-mono ${result.isMarginEroded ? 'text-rose-700' : 'text-emerald-700'}`}>
                  {formatIdr(result.netContributionIdr)}
                </strong>
              </div>
            </div>
          </div>

          {/* Recommendation Banner */}
          <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
            <div>
              <strong className="text-blue-900 block font-bold">Rekomendasi Markup Optimal:</strong>
              <p className="text-blue-700 mt-0.5">
                Naikkan markup ke <strong>+{result.recommendedMarkupPct}%</strong> agar laba bersih per cup delivery sama dengan laba kotor <em>dine-in</em> ({formatIdr(result.dineInContributionIdr)}).
              </p>
            </div>
            <button
              type="button"
              onClick={handleApplyRecommended}
              className="px-3.5 py-1.5 rounded-lg bg-[var(--accent-base)] text-white font-semibold hover:bg-[var(--accent-hover)] transition-colors shrink-0 shadow-xs cursor-pointer"
            >
              Terapkan Markup +{result.recommendedMarkupPct}%
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
