import type { CoffeeBrand } from '../../lib/types/coffee-intelligence';
import { formatIdr, formatNumber, formatPercent } from '../../lib/formatters';

interface BrandCompareDrawerProps {
  brands: CoffeeBrand[];
  onClose: () => void;
  onClear: () => void;
  onRemoveBrand: (id: number) => void;
}

export default function BrandCompareDrawer({
  brands,
  onClose,
  onClear,
  onRemoveBrand,
}: BrandCompareDrawerProps) {
  if (!brands.length) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-2xs z-40 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-full sm:max-w-2xl bg-[var(--bg-surface)] border-l border-slate-200 shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-100 bg-white flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[var(--text-primary)]">
              Side-by-Side Brand Benchmark ({brands.length}/4)
            </h3>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Perbandingan Metrik Kunci &amp; Unit Economics Langsung
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClear}
              className="text-xs text-rose-600 hover:text-rose-800 font-medium px-2 py-1 cursor-pointer"
            >
              Clear All
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              Close (Esc)
            </button>
          </div>
        </div>

      {/* Comparison Grid Table */}
      <div className="flex-1 overflow-y-auto p-6 text-xs space-y-4">
        <div className="overflow-x-auto rounded-xl border border-slate-200/80 shadow-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                <th className="p-3 font-semibold text-slate-600 w-36 uppercase tracking-wider text-[11px]">Metric</th>
                {brands.map((b) => (
                  <th key={b.id} className="p-3 font-bold text-[var(--text-primary)] min-w-[140px] border-l border-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="truncate">{b.name}</span>
                      <button
                        type="button"
                        onClick={() => onRemoveBrand(b.id)}
                        className="text-slate-400 hover:text-rose-600 ml-1 text-sm font-bold cursor-pointer"
                        title="Remove"
                      >
                        ×
                      </button>
                    </div>
                    <span className="text-[10px] font-normal text-[var(--text-muted)] block truncate mt-0.5">{b.kecamatan}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {/* Category Tier */}
              <tr>
                <td className="p-2.5 font-medium text-[var(--text-secondary)]">Category Tier</td>
                {brands.map((b) => (
                  <td key={b.id} className="p-2.5 border-l border-[var(--divider-subtle)]">
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-[var(--bg-muted)] truncate block">
                      {b.category_tier.split(':')[1]?.trim() || b.category_tier}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Price Dine-In */}
              <tr className="bg-[var(--bg-subtle)]/50">
                <td className="p-2.5 font-medium text-[var(--text-secondary)]">Harga Kopi Susu</td>
                {brands.map((b) => (
                  <td key={b.id} className="p-2.5 font-semibold font-mono num-tabular border-l border-[var(--divider-subtle)]">
                    {formatIdr(b.price_kopi_susu_dinein || b.avg_kopi_susu_price)}
                  </td>
                ))}
              </tr>

              {/* GoFood Price & Markup */}
              <tr>
                <td className="p-2.5 font-medium text-[var(--text-secondary)]">Harga GoFood (Markup)</td>
                {brands.map((b) => (
                  <td key={b.id} className="p-2.5 font-mono num-tabular border-l border-[var(--divider-subtle)]">
                    {formatIdr(b.price_kopi_susu_gofood || b.gofood_price_kopi_susu)}{' '}
                    <span className="text-[10px] text-[var(--status-warning-text)]">
                      (+{formatPercent(b.gofood_markup_pct || 20, 0)})
                    </span>
                  </td>
                ))}
              </tr>

              {/* Kopi Susu Cups/Day */}
              <tr className="bg-[var(--bg-subtle)]/50">
                <td className="p-2.5 font-medium text-[var(--text-secondary)]">Kopi Susu / Hari</td>
                {brands.map((b) => (
                  <td key={b.id} className="p-2.5 font-bold font-mono text-[var(--accent-base)] num-tabular border-l border-[var(--divider-subtle)]">
                    {formatNumber(b.est_kopi_susu_cups_day)} cups
                    <span className="text-[10px] font-normal text-[var(--text-muted)] block">
                      ({formatNumber(b.est_kopi_susu_cups_month)} / bln)
                    </span>
                  </td>
                ))}
              </tr>

              {/* RevPASH */}
              <tr>
                <td className="p-2.5 font-medium text-[var(--text-secondary)]">RevPASH (Seat/Hr)</td>
                {brands.map((b) => {
                  const val = b.revpash_idr || b.revpash_rp;
                  const isHealthy = val >= 2500;
                  return (
                    <td key={b.id} className="p-2.5 font-mono num-tabular border-l border-[var(--divider-subtle)]">
                      <span className={`inline-block px-1.5 py-0.5 rounded text-[11px] font-semibold ${
                        isHealthy ? 'bg-[var(--status-success-bg)] text-[var(--status-success-text)]' : 'bg-[var(--status-danger-bg)] text-[var(--status-danger-text)]'
                      }`}>
                        {formatIdr(val)}/hr
                      </span>
                    </td>
                  );
                })}
              </tr>

              {/* Seating Capacity & 24H */}
              <tr className="bg-[var(--bg-subtle)]/50">
                <td className="p-2.5 font-medium text-[var(--text-secondary)]">Kapasitas &amp; 24H</td>
                {brands.map((b) => (
                  <td key={b.id} className="p-2.5 font-mono num-tabular border-l border-[var(--divider-subtle)]">
                    {b.seating_capacity_est || b.seating_capacity} kursi ·{' '}
                    <span className={b.is_24h ? 'text-[var(--status-success-text)] font-semibold' : 'text-[var(--text-muted)]'}>
                      {b.is_24h ? '24 Jam' : 'Non-24H'}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Google Rating & Reviews */}
              <tr>
                <td className="p-2.5 font-medium text-[var(--text-secondary)]">Google Maps</td>
                {brands.map((b) => (
                  <td key={b.id} className="p-2.5 font-mono num-tabular border-l border-[var(--divider-subtle)]">
                    {b.gmaps_rating.toFixed(1)} / 5.0 ({formatNumber(b.gmaps_reviews)} rev)
                  </td>
                ))}
              </tr>

              {/* Campus Proximity */}
              <tr className="bg-[var(--bg-subtle)]/50">
                <td className="p-2.5 font-medium text-[var(--text-secondary)]">Kampus Terdekat</td>
                {brands.map((b) => (
                  <td key={b.id} className="p-2.5 border-l border-[var(--divider-subtle)]">
                    <span className="font-medium text-[var(--text-primary)] block truncate">{b.nearest_campus}</span>
                    <span className="text-[10px] text-[var(--text-muted)] font-mono">
                      {b.min_campus_dist_km} km (Gravity {b.campus_gravity_index})
                    </span>
                  </td>
                ))}
              </tr>

              {/* Signature Menu */}
              <tr>
                <td className="p-2.5 font-medium text-[var(--text-secondary)]">Menu Signature</td>
                {brands.map((b) => (
                  <td key={b.id} className="p-2.5 border-l border-[var(--divider-subtle)] text-[11px] italic text-[var(--text-secondary)]">
                    {b.signature_kopi_susu || 'Kopi Susu Gula Aren'}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-[var(--border-default)] bg-[var(--bg-subtle)] flex items-center justify-between">
        <span className="text-xs text-[var(--text-muted)]">
          Maksimal 4 brand dapat dibandingkan secara bersamaan.
        </span>
        <button
          type="button"
          onClick={onClose}
          className="px-3 py-1.5 rounded bg-[var(--accent-base)] text-white text-xs font-semibold hover:bg-[var(--accent-hover)] cursor-pointer"
        >
          Selesai
        </button>
      </div>
    </div>
    </>
  );
}
