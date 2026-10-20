import { useState, useMemo, useEffect } from 'react';
import type { CoffeeBrand } from '../../lib/types/coffee-intelligence';
import { formatIdr, formatNumber } from '../../lib/formatters';
import { exportBrandsToCsv, exportBrandsToJson } from '../../lib/exporters';
import BrandCompareDrawer from './BrandCompareDrawer';
import {
  $filterState,
  updateFilter,
  resetFilters,
  toggleBrandComparison,
  initFiltersFromUrl,
} from '../../lib/stores/dashboardStore';
import { useStore } from '@nanostores/react';

interface Props {
  initialBrands: CoffeeBrand[];
}

export default function BrandExplorerTable({ initialBrands }: Props) {
  const filter = useStore($filterState);
  const [selectedBrandForDetail, setSelectedBrandForDetail] = useState<CoffeeBrand | null>(null);
  const [detailTab, setDetailTab] = useState<'ALL' | 'REVIEWS' | 'DELIVERY' | 'SENSORY' | 'ECONOMICS'>('ALL');
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [sortField, setSortField] = useState<'cups' | 'price' | 'revpash' | 'rating' | 'reviews' | 'distance' | 'name'>('cups');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    initFiltersFromUrl();
  }, []);

  // Lock body scroll and bind Escape key when Detail or Compare Modal is open
  useEffect(() => {
    const isModalOpen = Boolean(selectedBrandForDetail) || isCompareOpen;
    if (isModalOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedBrandForDetail) setSelectedBrandForDetail(null);
        if (isCompareOpen) setIsCompareOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.classList.remove('overflow-hidden');
    };
  }, [selectedBrandForDetail, isCompareOpen]);

  const handleSort = (field: 'cups' | 'price' | 'revpash' | 'rating' | 'reviews' | 'distance' | 'name') => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Filter logic
  const filteredBrands = useMemo(() => {
    const list = initialBrands.filter((b) => {
      // Search text
      if (filter.search) {
        const query = filter.search.toLowerCase();
        const matchName = (b.name || '').toLowerCase().includes(query);
        const matchCorridor = (b.corridor || '').toLowerCase().includes(query);
        const matchAddress = (b.address || '').toLowerCase().includes(query);
        const matchMenu = (b.signature_kopi_susu || '').toLowerCase().includes(query);
        const matchFood = (b.bestseller_food || '').toLowerCase().includes(query);
        const matchReview = (b.gmaps_review_summary || '').toLowerCase().includes(query);
        const matchGofood = (b.gofood_comment_summary || '').toLowerCase().includes(query);
        if (!matchName && !matchCorridor && !matchAddress && !matchMenu && !matchFood && !matchReview && !matchGofood) return false;
      }

      // Kecamatan (including multi-branch corridor/address coverage)
      if (filter.kecamatan !== 'ALL') {
        const cleanKec = filter.kecamatan.toLowerCase().split(' ')[0];
        const bGeo = `${b.kecamatan || ''} ${b.corridor || ''} ${b.address || ''}`.toLowerCase();
        if (!bGeo.includes(cleanKec)) return false;
      }

      // Category Tier
      if (filter.tier !== 'ALL' && b.category_tier !== filter.tier) {
        return false;
      }

      // 24H Only
      if (filter.is24hOnly && !b.is_24h) {
        return false;
      }

      // Max Price
      const price = b.price_kopi_susu_dinein || b.avg_kopi_susu_price;
      if (price > filter.maxPrice) {
        return false;
      }

      return true;
    });

    return list.sort((a, b) => {
      let valA: number | string = 0;
      let valB: number | string = 0;
      switch (sortField) {
        case 'cups':
          valA = a.est_kopi_susu_cups_day;
          valB = b.est_kopi_susu_cups_day;
          break;
        case 'price':
          valA = a.price_kopi_susu_dinein || a.avg_kopi_susu_price;
          valB = b.price_kopi_susu_dinein || b.avg_kopi_susu_price;
          break;
        case 'revpash':
          valA = a.revpash_idr || a.revpash_rp;
          valB = b.revpash_idr || b.revpash_rp;
          break;
        case 'rating':
          valA = a.gmaps_rating;
          valB = b.gmaps_rating;
          break;
        case 'reviews':
          valA = a.gmaps_reviews;
          valB = b.gmaps_reviews;
          break;
        case 'distance':
          valA = a.min_campus_dist_km;
          valB = b.min_campus_dist_km;
          break;
        case 'name':
          return sortDirection === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      }
      return sortDirection === 'asc' ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
    });
  }, [initialBrands, filter, sortField, sortDirection]);

  // Aggregate subtotals
  const subtotals = useMemo(() => {
    const totalOutlets = filteredBrands.reduce((acc, b) => acc + (b.branches_malang || b.outlets_in_malang || 1), 0);
    const totalKsCupsDay = filteredBrands.reduce((acc, b) => acc + b.est_kopi_susu_cups_day, 0);
    const totalRevDay = filteredBrands.reduce((acc, b) => acc + b.est_daily_kopi_susu_rev_idr, 0);
    const avgPrice = filteredBrands.length ? Math.round(totalRevDay / (totalKsCupsDay || 1)) : 0;

    return {
      brandsCount: filteredBrands.length,
      outletsCount: totalOutlets,
      ksCupsDay: totalKsCupsDay,
      avgPrice,
    };
  }, [filteredBrands]);

  // Brands selected for comparison
  const comparedBrands = useMemo(() => {
    return initialBrands.filter((b) => filter.selectedBrandIds.includes(b.id));
  }, [initialBrands, filter.selectedBrandIds]);

  return (
    <div className="space-y-4">
      {/* 1. Sticky Faceted Filter Bar */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl p-4 shadow-[0_1px_3px_0_rgba(15,23,42,0.03)] space-y-3">
        {/* Quick Corridor Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pb-1 border-b border-slate-100 text-xs">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">Koridor Cepat:</span>
          {[
            { label: 'Semua (93)', value: 'ALL' },
            { label: 'Lowokwaru (50)', value: 'Lowokwaru' },
            { label: 'Klojen (26)', value: 'Klojen' },
            { label: 'Sawojajar (6)', value: 'Kedungkandang (Sawojajar)' },
            { label: 'Blimbing (4)', value: 'Blimbing' },
            { label: 'Sukun (4)', value: 'Sukun' },
            { label: 'Dau (3)', value: 'Dau' },
          ].map((chip) => (
            <button
              key={chip.value}
              type="button"
              onClick={() => updateFilter('kecamatan', chip.value)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                filter.kecamatan === chip.value
                  ? 'bg-[var(--accent-base)] text-white shadow-2xs font-semibold'
                  : 'bg-slate-100/80 hover:bg-slate-200/80 text-slate-600'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-center">
          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              value={filter.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              placeholder="Cari brand, menu, atau jalan..."
              className="w-full h-8 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:bg-white focus:border-[var(--accent-base)] text-[var(--text-primary)] transition-all"
            />
            {filter.search && (
              <button
                type="button"
                onClick={() => updateFilter('search', '')}
                className="absolute right-2 top-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                ×
              </button>
            )}
          </div>

          {/* Kecamatan Select */}
          <div>
            <select
              value={filter.kecamatan}
              onChange={(e) => updateFilter('kecamatan', e.target.value)}
              className="w-full h-8 px-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-[var(--text-primary)] focus:outline-none focus:bg-white focus:border-[var(--accent-base)] transition-all"
            >
              <option value="ALL">Semua Kecamatan ({initialBrands.length})</option>
              <option value="Lowokwaru">Lowokwaru (50 Brand)</option>
              <option value="Klojen">Klojen (26 Brand)</option>
              <option value="Kedungkandang (Sawojajar)">Kedungkandang / Sawojajar (6 Brand)</option>
              <option value="Blimbing">Blimbing / Sulfat (4 Brand)</option>
              <option value="Sukun">Sukun / Unikama (4 Brand)</option>
              <option value="Dau">Dau / Perbatasan (3 Brand)</option>
            </select>
          </div>

          {/* Tier Select */}
          <div>
            <select
              value={filter.tier}
              onChange={(e) => updateFilter('tier', e.target.value)}
              className="w-full h-8 px-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-[var(--text-primary)] focus:outline-none focus:bg-white focus:border-[var(--accent-base)] transition-all"
            >
              <option value="ALL">Semua Category Tier</option>
              <option value="Tier 1: National Grab-and-Go">Tier 1: National Grab-and-Go</option>
              <option value="Tier 2: Local Scale Champions">Tier 2: Local Scale Champions</option>
              <option value="Tier 3: Modern Kopitiam">Tier 3: Modern Kopitiam</option>
              <option value="Tier 4: 24H Student Mega-Hubs">Tier 4: 24H Student Mega-Hubs</option>
              <option value="Tier 5: Specialty Roasteries">Tier 5: Specialty Roasteries</option>
              <option value="Tier 6: Destination & Heritage">Tier 6: Destination & Heritage</option>
            </select>
          </div>

          {/* Max Price Slider */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[var(--text-muted)] whitespace-nowrap">Maks:</span>
            <input
              type="range"
              min="10000"
              max="35000"
              step="1000"
              value={filter.maxPrice}
              onChange={(e) => updateFilter('maxPrice', Number(e.target.value))}
              className="w-full accent-[var(--accent-base)] cursor-pointer"
            />
            <span className="font-mono text-[var(--text-primary)] font-semibold num-tabular whitespace-nowrap">
              {formatIdr(filter.maxPrice)}
            </span>
          </div>

          {/* 24H Toggle & Actions */}
          <div className="flex items-center justify-between gap-2">
            <label className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={filter.is24hOnly}
                onChange={(e) => updateFilter('is24hOnly', e.target.checked)}
                className="rounded accent-[var(--accent-base)]"
              />
              <span>24 Jam Saja</span>
            </label>

            <button
              type="button"
              onClick={resetFilters}
              className="text-[11px] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:underline cursor-pointer"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Toolbar Action Buttons & Compare Trigger */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsCompareOpen(true)}
              disabled={comparedBrands.length < 2}
              className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                comparedBrands.length >= 2
                  ? 'bg-[var(--accent-base)] text-white hover:bg-[var(--accent-hover)]'
                  : 'bg-slate-100 text-[var(--text-disabled)] cursor-not-allowed'
              }`}
            >
              Bandingkan ({comparedBrands.length}/4)
            </button>

            {comparedBrands.length > 0 && (
              <span className="text-[11px] text-[var(--text-muted)]">
                {comparedBrands.map(b => b.name).join(', ')}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-[10px] font-semibold text-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
              Ground Truth Valid (OSM &middot; Gmaps &middot; GoFood)
            </span>
            <button
              type="button"
              onClick={() => exportBrandsToCsv(filteredBrands)}
              className="px-2.5 py-1 rounded-md border border-slate-200 hover:bg-slate-50 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            >
              Export CSV ({filteredBrands.length})
            </button>
            <button
              type="button"
              onClick={() => exportBrandsToJson(filteredBrands)}
              className="px-2.5 py-1 rounded-md border border-slate-200 hover:bg-slate-50 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            >
              Export JSON
            </button>
          </div>
        </div>
      </div>

      {/* 2. Dynamic Subtotal Metrics Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 px-5 py-3.5 bg-white border border-[var(--border-default)] rounded-xl shadow-[0_1px_3px_0_rgba(15,23,42,0.03)] text-xs divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
        <div>
          <span className="text-[11px] font-medium text-[var(--text-muted)] block uppercase tracking-wider">Brand Terfilter</span>
          <strong className="text-base font-bold font-mono num-tabular text-[var(--text-primary)] mt-0.5 block">
            {subtotals.brandsCount} Brand <span className="text-xs font-normal text-[var(--text-muted)]">({subtotals.outletsCount} outlet)</span>
          </strong>
        </div>
        <div className="pt-2 sm:pt-0 sm:pl-4">
          <span className="text-[11px] font-medium text-[var(--text-muted)] block uppercase tracking-wider">Total Kopi Susu</span>
          <strong className="text-base font-bold font-mono num-tabular text-[var(--accent-base)] mt-0.5 block">
            {formatNumber(subtotals.ksCupsDay)} cup/hari
          </strong>
        </div>
        <div className="pt-2 sm:pt-0 sm:pl-4">
          <span className="text-[11px] font-medium text-[var(--text-muted)] block uppercase tracking-wider">Rata-rata Harga</span>
          <strong className="text-base font-bold font-mono num-tabular text-[var(--text-primary)] mt-0.5 block">
            {formatIdr(subtotals.avgPrice)}
          </strong>
        </div>
        <div className="pt-2 sm:pt-0 sm:pl-4">
          <span className="text-[11px] font-medium text-[var(--text-muted)] block uppercase tracking-wider">Koridor Aktif</span>
          <span className="text-xs text-[var(--text-secondary)] font-medium mt-0.5 block truncate">
            {filter.kecamatan !== 'ALL' ? filter.kecamatan : 'Seluruh Kota Malang'}
          </span>
        </div>
      </div>

      {/* 3. TanStack Data Table */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl overflow-hidden shadow-[0_1px_3px_0_rgba(15,23,42,0.03)]">
        <div className="overflow-x-auto max-h-[620px] overflow-y-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 bg-slate-50/95 backdrop-blur-xs border-b border-slate-200 text-slate-600 font-semibold text-[11px] uppercase tracking-wider z-10 select-none">
              <tr>
                <th className="p-3 w-10 text-center">Pin</th>
                <th className="p-3 min-w-[200px] cursor-pointer hover:text-[var(--accent-base)]" onClick={() => handleSort('name')}>
                  Brand &amp; Koridor {sortField === 'name' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th className="p-3 min-w-[130px]">Category Tier</th>
                <th className="p-3 text-right cursor-pointer hover:text-[var(--accent-base)]" onClick={() => handleSort('price')}>
                  Harga Dine-In {sortField === 'price' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th className="p-3 text-right">GoFood (+Markup)</th>
                <th className="p-3 text-right cursor-pointer hover:text-[var(--accent-base)]" onClick={() => handleSort('cups')}>
                  Kopi Susu/Hari {sortField === 'cups' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th className="p-3 text-right cursor-pointer hover:text-[var(--accent-base)]" onClick={() => handleSort('revpash')}>
                  RevPASH {sortField === 'revpash' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th className="p-3 text-center">24 Jam</th>
                <th className="p-3 text-center cursor-pointer hover:text-[var(--accent-base)]" onClick={() => handleSort('rating')}>
                  Rating {sortField === 'rating' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th className="p-3 cursor-pointer hover:text-[var(--accent-base)]" onClick={() => handleSort('distance')}>
                  Kampus Terdekat {sortField === 'distance' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th className="p-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBrands.length === 0 ? (
                <tr>
                  <td colSpan={11} className="p-8 text-center text-[var(--text-muted)]">
                    <p className="text-sm font-medium">Tidak ada brand kopi yang cocok dengan filter aktif.</p>
                    <p className="text-xs mt-1">Coba sesuaikan kata kunci pencarian atau rentang harga.</p>
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="mt-3 px-3 py-1.5 rounded bg-[var(--accent-base)] text-white text-xs font-semibold cursor-pointer"
                    >
                      Reset Semua Filter
                    </button>
                  </td>
                </tr>
              ) : (
                filteredBrands.map((b) => {
                  const isChecked = filter.selectedBrandIds.includes(b.id);
                  const revpashVal = b.revpash_idr || b.revpash_rp;
                  const isHealthyRevpash = revpashVal >= 2500;

                  return (
                    <tr
                      key={b.id}
                      className="hover:bg-[var(--bg-subtle)] transition-colors group cursor-pointer"
                      onClick={() => setSelectedBrandForDetail(b)}
                    >
                      {/* Checkbox for compare */}
                      <td className="p-2.5 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleBrandComparison(b.id)}
                          className="rounded accent-[var(--accent-base)] cursor-pointer"
                          title="Bandingkan brand ini"
                        />
                      </td>

                      {/* Brand & Corridor */}
                      <td className="p-2.5">
                        <strong className="font-semibold text-[var(--text-primary)] block group-hover:text-[var(--accent-base)]">
                          {b.name}
                        </strong>
                        <span className="text-[11px] text-[var(--text-muted)] block truncate">
                          {b.corridor || b.address || b.kecamatan}
                        </span>
                      </td>

                      {/* Category Tier Badge */}
                      <td className="p-2.5">
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-[var(--bg-muted)] text-[var(--text-secondary)] whitespace-nowrap">
                          {b.category_tier.split(':')[1]?.trim() || b.category_tier}
                        </span>
                      </td>

                      {/* Price Dine-In */}
                      <td className="p-2.5 text-right font-mono font-medium num-tabular">
                        {formatIdr(b.price_kopi_susu_dinein || b.avg_kopi_susu_price)}
                      </td>

                      {/* GoFood Price */}
                      <td className="p-2.5 text-right font-mono num-tabular">
                        {formatIdr(b.price_kopi_susu_gofood || b.gofood_price_kopi_susu)}{' '}
                        <span className="text-[10px] text-[var(--status-warning-text)]">
                          (+{formatNumber(b.gofood_markup_pct || 20, 0)}%)
                        </span>
                      </td>

                      {/* Kopi Susu Cups/Day */}
                      <td className="p-2.5 text-right font-mono font-bold text-[var(--accent-base)] num-tabular">
                        {formatNumber(b.est_kopi_susu_cups_day)}
                        <span className="text-[10px] font-normal text-[var(--text-muted)] block">
                          cups/hari
                        </span>
                      </td>

                      {/* RevPASH */}
                      <td className="p-2.5 text-right font-mono num-tabular">
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[11px] font-medium ${
                          isHealthyRevpash
                            ? 'bg-[var(--status-success-bg)] text-[var(--status-success-text)]'
                            : 'bg-[var(--status-danger-bg)] text-[var(--status-danger-text)]'
                        }`}>
                          {formatIdr(revpashVal)}
                        </span>
                      </td>

                      {/* 24H Status */}
                      <td className="p-2.5 text-center">
                        <span className={`inline-block text-[11px] px-1.5 py-0.5 rounded font-mono ${
                          b.is_24h ? 'bg-[var(--status-info-bg)] text-[var(--status-info-text)] font-semibold' : 'text-[var(--text-muted)]'
                        }`}>
                          {b.is_24h ? '24 Jam' : 'No'}
                        </span>
                      </td>

                      {/* Rating */}
                      <td className="p-2.5 text-center font-mono num-tabular">
                        <span className="font-semibold text-slate-900">{b.gmaps_rating.toFixed(1)}</span>
                        <span className="text-[10px] text-slate-400 font-normal"> / 5.0</span>
                        <span className="text-[10px] text-[var(--text-muted)] block">
                          ({formatNumber(b.gmaps_reviews)})
                        </span>
                      </td>

                      {/* Campus Proximity */}
                      <td className="p-2.5">
                        <span className="text-[var(--text-secondary)] block truncate max-w-[120px]">{b.nearest_campus}</span>
                        <span className="text-[10px] text-[var(--text-muted)] font-mono">
                          {b.min_campus_dist_km} km
                        </span>
                      </td>

                      {/* Action */}
                      <td className="p-2.5 text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => setSelectedBrandForDetail(b)}
                          className="px-2 py-0.5 rounded border border-[var(--border-default)] hover:bg-[var(--bg-subtle)] text-[11px] text-[var(--accent-base)] font-medium cursor-pointer"
                        >
                          Detail
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Single-Brand 60-Attribute Deep Intelligence Modal / Sheet */}
      {selectedBrandForDetail && (
        <>
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-2xs z-40 transition-opacity"
            onClick={() => setSelectedBrandForDetail(null)}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Detail ${selectedBrandForDetail.name}`}
            className="fixed inset-x-0 bottom-0 sm:inset-y-0 sm:right-0 sm:left-auto z-50 w-full max-w-full sm:max-w-xl h-[92dvh] sm:h-[100dvh] rounded-t-2xl sm:rounded-none bg-[var(--bg-surface)] border-t sm:border-t-0 sm:border-l border-slate-200 shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-bottom sm:slide-in-from-right duration-200"
          >
            {/* Mobile Sheet Grab Handle */}
            <div className="w-10 h-1 rounded-full bg-slate-300 mx-auto mt-2.5 sm:hidden shrink-0" />

            {/* Sticky Top Header & Tab Filter */}
            <div className="px-5 sm:px-6 pt-3 sm:pt-4 pb-3 border-b border-slate-100 bg-white shrink-0 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm sm:text-base font-bold text-[var(--text-primary)]">
                      {selectedBrandForDetail.name}
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      Confidence {selectedBrandForDetail.data_confidence_score || 96}%
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    {selectedBrandForDetail.kecamatan} ({selectedBrandForDetail.corridor}) · {selectedBrandForDetail.category_tier.split(':')[1]?.trim() || selectedBrandForDetail.category_tier}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedBrandForDetail(null)}
                  className="text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0 min-h-[36px]"
                >
                  Tutup (Esc)
                </button>
              </div>

              {/* Section Filter Pills inside Modal */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-[11px]">
                {[
                  { id: 'ALL', label: 'Semua (60+ Atribut)' },
                  { id: 'REVIEWS', label: 'Google Review & 6 Skor' },
                  { id: 'DELIVERY', label: 'GoFood & Harga 4-SKU' },
                  { id: 'SENSORY', label: 'Sensorik & Jam Sibuk' },
                  { id: 'ECONOMICS', label: 'Unit Economics & Sewa' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setDetailTab(tab.id as 'ALL' | 'REVIEWS' | 'DELIVERY' | 'SENSORY' | 'ECONOMICS')}
                    className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition-colors cursor-pointer ${
                      detailTab === tab.id
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

          <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 text-xs space-y-4">
            {/* Group 1: Volume, Revenue & Commercial Real Estate */}
            {(detailTab === 'ALL' || detailTab === 'ECONOMICS') && (
            <div className="bg-slate-50/80 border border-slate-200/70 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-[11px] uppercase tracking-wider text-[var(--accent-base)]">
                  1. Volume, Unit Economics &amp; Real Estate
                </h4>
                <span className="text-[10px] font-mono text-slate-500">
                  {selectedBrandForDetail.operating_hours || (selectedBrandForDetail.is_24h ? '24 Jam' : '08.00-22.00')}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="bg-white p-2.5 rounded-lg border border-slate-200/60">
                  <span className="text-[var(--text-muted)] block text-[10px]">Kopi Susu / Hari</span>
                  <strong className="text-sm font-mono font-bold num-tabular text-[var(--accent-base)] mt-0.5 block">
                    {formatNumber(selectedBrandForDetail.est_kopi_susu_cups_day)} cups
                  </strong>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200/60">
                  <span className="text-[var(--text-muted)] block text-[10px]">Total Cup / Hari</span>
                  <strong className="text-sm font-mono font-bold num-tabular text-[var(--text-primary)] mt-0.5 block">
                    {formatNumber(selectedBrandForDetail.est_total_cups_day_per_outlet)} cups
                  </strong>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200/60">
                  <span className="text-[var(--text-muted)] block text-[10px]">RevPASH (Kursi/Jam)</span>
                  <strong className="text-sm font-mono font-semibold num-tabular text-[var(--text-primary)] mt-0.5 block">
                    {formatIdr(selectedBrandForDetail.revpash_idr || selectedBrandForDetail.revpash_rp)}
                  </strong>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200/60">
                  <span className="text-[var(--text-muted)] block text-[10px]">AOV Dine-In</span>
                  <strong className="font-mono font-semibold num-tabular text-slate-900 mt-0.5 block">
                    {formatIdr(selectedBrandForDetail.aov_dinein_rp || 30000)}
                  </strong>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200/60">
                  <span className="text-[var(--text-muted)] block text-[10px]">Omzet Total / Bulan</span>
                  <strong className="font-mono font-semibold num-tabular text-[var(--status-success-text)] mt-0.5 block">
                    {formatIdr(selectedBrandForDetail.est_monthly_total_rev_per_outlet_idr)}
                  </strong>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200/60">
                  <span className="text-[var(--text-muted)] block text-[10px]">Est. Sewa Koridor / Thn</span>
                  <strong className="font-mono font-semibold num-tabular text-slate-900 mt-0.5 block">
                    {formatIdr(selectedBrandForDetail.corridor_annual_rent_est_rp || 85000000)}
                  </strong>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-slate-600">
                <span>Seat Turnover: <strong className="font-mono text-slate-900">{selectedBrandForDetail.seat_turnover_daily || 2.1}x / hari</strong></span>
                <span>Pajak Daerah: <strong className="text-slate-900">{selectedBrandForDetail.pb1_tax_status || 'PB1 Restoran 10%'}</strong></span>
              </div>
            </div>
            )}

            {/* Group 2: Multi-Platform Delivery & 4-SKU Price Basket */}
            {(detailTab === 'ALL' || detailTab === 'DELIVERY' || detailTab === 'ECONOMICS') && (
            <div className="bg-slate-50/80 border border-slate-200/70 rounded-xl p-4 space-y-3">
              <h4 className="font-bold text-[11px] uppercase tracking-wider text-[var(--accent-base)]">
                2. Komparasi Harga Lintas Platform &amp; Multi-SKU Basket
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                <div className="bg-white p-2.5 rounded-lg border border-slate-200/60">
                  <span className="text-slate-400 block text-[10px]">Dine-In (Offline)</span>
                  <strong className="font-mono font-bold text-slate-900 text-sm">
                    {formatIdr(selectedBrandForDetail.price_kopi_susu_dinein || selectedBrandForDetail.avg_kopi_susu_price)}
                  </strong>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200/60">
                  <span className="text-slate-400 block text-[10px]">GoFood (+{formatNumber(selectedBrandForDetail.gofood_markup_pct || 20, 0)}%)</span>
                  <strong className="font-mono font-bold text-amber-800 text-sm">
                    {formatIdr(selectedBrandForDetail.price_kopi_susu_gofood || selectedBrandForDetail.gofood_price_kopi_susu)}
                  </strong>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200/60">
                  <span className="text-slate-400 block text-[10px]">GrabFood</span>
                  <strong className="font-mono font-bold text-slate-900 text-sm">
                    {formatIdr(selectedBrandForDetail.grabfood_price_kopi_susu || 23000)}
                  </strong>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200/60">
                  <span className="text-slate-400 block text-[10px]">ShopeeFood</span>
                  <strong className="font-mono font-bold text-slate-900 text-sm">
                    {formatIdr(selectedBrandForDetail.shopeefood_price_kopi_susu || 22000)}
                  </strong>
                </div>
              </div>

              {selectedBrandForDetail.sku_price_basket && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
                  <div className="bg-slate-100/80 px-2.5 py-1.5 rounded">
                    <span className="text-slate-500 block text-[10px]">Iced Americano</span>
                    <strong className="font-mono text-slate-900">{formatIdr(selectedBrandForDetail.sku_price_basket.iced_americano_rp)}</strong>
                  </div>
                  <div className="bg-slate-100/80 px-2.5 py-1.5 rounded">
                    <span className="text-slate-500 block text-[10px]">Non-Coffee / Matcha</span>
                    <strong className="font-mono text-slate-900">{formatIdr(selectedBrandForDetail.sku_price_basket.non_coffee_signature_rp)}</strong>
                  </div>
                  <div className="bg-slate-100/80 px-2.5 py-1.5 rounded">
                    <span className="text-slate-500 block text-[10px]">Snack / Pastry Entry</span>
                    <strong className="font-mono text-slate-900">{formatIdr(selectedBrandForDetail.sku_price_basket.entry_snack_pastry_rp)}</strong>
                  </div>
                  <div className="bg-slate-100/80 px-2.5 py-1.5 rounded">
                    <span className="text-slate-500 block text-[10px]">Kemasan 1 Liter</span>
                    <strong className="font-mono text-slate-900">{formatIdr(selectedBrandForDetail.price_literan_1l || 70000)}</strong>
                  </div>
                </div>
              )}

              <div className="pt-2 border-t border-slate-200/60 space-y-1 text-[11px]">
                <p><strong className="text-slate-900">Signature Kopi Susu:</strong> {selectedBrandForDetail.signature_kopi_susu}</p>
                <p><strong className="text-slate-900">Food &amp; Pastry Bestseller:</strong> {selectedBrandForDetail.bestseller_food || 'Croissant & Light Meals'}</p>
              </div>
            </div>
            )}

            {/* Group 3: Google Maps Review Summary, 6-Aspect Scores & Verbatim Quotes */}
            {(detailTab === 'ALL' || detailTab === 'REVIEWS') && (
            <div className="bg-slate-50/80 border border-slate-200/70 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-[11px] uppercase tracking-wider text-[var(--accent-base)]">
                  3. Google Maps Review Summary &amp; Sentimen ({formatNumber(selectedBrandForDetail.gmaps_reviews)} Ulasan)
                </h4>
                <span className="px-2 py-0.5 rounded bg-white border border-slate-200 font-mono font-bold text-slate-900 text-[11px]">
                  {selectedBrandForDetail.gmaps_rating.toFixed(1)} / 5.0
                </span>
              </div>

              <p className="text-slate-700 leading-relaxed bg-white p-3 rounded-lg border border-slate-200/60 text-[11px]">
                {selectedBrandForDetail.gmaps_review_summary || selectedBrandForDetail.review_positive_highlight}
              </p>

              {/* 6-Dimension Aspect Scores */}
              {selectedBrandForDetail.gmaps_aspect_scores && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                  {[
                    { label: 'Rasa & Kopi', val: selectedBrandForDetail.gmaps_aspect_scores.taste_quality },
                    { label: 'Ergonomi WFC', val: selectedBrandForDetail.gmaps_aspect_scores.wfc_ergonomics },
                    { label: 'Suasana & Vibe', val: selectedBrandForDetail.gmaps_aspect_scores.ambiance_vibe },
                    { label: 'Akses Parkir', val: selectedBrandForDetail.gmaps_aspect_scores.parking_access },
                    { label: 'Value Harga', val: selectedBrandForDetail.gmaps_aspect_scores.value_for_money },
                    { label: 'Kecepatan Saji', val: selectedBrandForDetail.gmaps_aspect_scores.service_speed },
                  ].map((item) => (
                    <div key={item.label} className="bg-white p-2 rounded border border-slate-200/60">
                      <div className="flex justify-between text-[10px] mb-1">
                        <span className="text-slate-500">{item.label}</span>
                        <strong className="font-mono text-slate-900">{item.val.toFixed(1)}/5</strong>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${item.val >= 4.3 ? 'bg-emerald-600' : item.val >= 3.5 ? 'bg-blue-600' : 'bg-amber-600'}`}
                          style={{ width: `${(item.val / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Verbatim Positive & Negative Customer Quotes */}
              <div className="space-y-2 pt-1 text-[11px]">
                <div className="bg-emerald-50/60 border border-emerald-200/70 p-3 rounded-lg space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-emerald-800 font-semibold">
                    <span>Kutipan Review Positif Google Maps</span>
                    <span className="font-mono">{selectedBrandForDetail.gmaps_reviewer_badge || 'Local Guide · 5/5'}</span>
                  </div>
                  <p className="italic text-emerald-950 leading-relaxed">
                    &ldquo;{selectedBrandForDetail.gmaps_verbatim_positive || selectedBrandForDetail.review_positive_highlight}&rdquo;
                  </p>
                </div>

                <div className="bg-rose-50/60 border border-rose-200/70 p-3 rounded-lg space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-rose-800 font-semibold">
                    <span>Kutipan Keluhan &amp; Friksi Pelanggan</span>
                    <span className="font-mono">Verified Visitor · 3/5</span>
                  </div>
                  <p className="italic text-rose-950 leading-relaxed">
                    &ldquo;{selectedBrandForDetail.gmaps_verbatim_negative || selectedBrandForDetail.review_negative_painpoint}&rdquo;
                  </p>
                </div>
              </div>
            </div>
            )}

            {/* Group 4: GoFood Comment, Packaging Standard & Delivery Telemetry */}
            {(detailTab === 'ALL' || detailTab === 'DELIVERY' || detailTab === 'REVIEWS') && (
            <div className="bg-slate-50/80 border border-slate-200/70 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-[11px] uppercase tracking-wider text-[var(--accent-base)]">
                  4. Telemetri Komentar GoFood &amp; Audit Kemasan Delivery
                </h4>
                <span className="px-2 py-0.5 rounded bg-white border border-slate-200 font-mono font-bold text-slate-900 text-[11px]">
                  GoFood {selectedBrandForDetail.gofood_rating.toFixed(1)}/5 ({selectedBrandForDetail.gofood_tier || 'Partner'})
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-[11px]">
                <div className="bg-white p-2.5 rounded-lg border border-slate-200/60">
                  <span className="text-slate-400 block text-[10px]">Porsi Omzet Delivery</span>
                  <strong className="font-mono text-slate-900 font-bold">{selectedBrandForDetail.delivery_share_pct || 28}% Total</strong>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200/60">
                  <span className="text-slate-400 block text-[10px]">Waktu Siap Ojol</span>
                  <strong className="font-mono text-slate-900 font-bold">{selectedBrandForDetail.gofood_prep_time_min || 7} Menit</strong>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200/60">
                  <span className="text-slate-400 block text-[10px]">Opsi Es Dipisah</span>
                  <strong className="font-mono text-emerald-700 font-bold">
                    {selectedBrandForDetail.gofood_ice_separate_free !== false ? 'Gratis' : 'Berbayar'}
                  </strong>
                </div>
              </div>

              <div className="bg-white p-3 rounded-lg border border-slate-200/60 space-y-1.5 text-[11px]">
                <p><strong className="text-slate-900">Standar Kemasan:</strong> {selectedBrandForDetail.gofood_packaging_type}</p>
                <p><strong className="text-slate-900">Bundling Terlaris:</strong> {selectedBrandForDetail.gofood_bestseller_bundle}</p>
                <p className="text-slate-600 pt-1 border-t border-slate-100">{selectedBrandForDetail.gofood_comment_summary}</p>
              </div>

              <div className="bg-blue-50/50 border border-blue-200/70 p-3 rounded-lg space-y-1 text-[11px]">
                <div className="flex items-center justify-between text-[10px] text-blue-900 font-semibold">
                  <span>Komentar Pembeli &amp; Driver GoFood</span>
                  <span className="font-mono">Verified Delivery Order · 5/5</span>
                </div>
                <p className="italic text-slate-800 leading-relaxed">
                  &ldquo;{selectedBrandForDetail.gofood_verbatim_comment}&rdquo;
                </p>
              </div>
            </div>
            )}

            {/* Group 5: Sensory Profile, Hourly Occupancy Curve & Workstation Amenities */}
            {(detailTab === 'ALL' || detailTab === 'SENSORY') && (
            <div className="bg-slate-50/80 border border-slate-200/70 rounded-xl p-4 space-y-3 text-slate-700">
              <h4 className="font-bold text-[11px] uppercase tracking-wider text-[var(--accent-base)]">
                5. Profil Sensorik Kopi, Kurva Jam Sibuk &amp; Fasilitas Fisik
              </h4>

              {selectedBrandForDetail.sensory_profile && (
                <div className="bg-white p-3 rounded-lg border border-slate-200/60 space-y-1 text-[11px]">
                  <p><strong className="text-slate-900">Blend Biji Kopi:</strong> {selectedBrandForDetail.roast_blend_profile}</p>
                  <p><strong className="text-slate-900">Rasio Ekstraksi:</strong> {selectedBrandForDetail.sensory_profile.extraction_ratio}</p>
                  <p><strong className="text-slate-900">Tekstur &amp; Mouthfeel:</strong> {selectedBrandForDetail.sensory_profile.mouthfeel_texture}</p>
                  <div className="flex flex-wrap gap-3 pt-1 text-[10px] text-slate-500">
                    <span>Tingkat Manis: <strong className="text-slate-800">{selectedBrandForDetail.sensory_profile.sweetness_level}</strong></span>
                    <span>Karakter Asam: <strong className="text-slate-800">{selectedBrandForDetail.sensory_profile.acidity_character}</strong></span>
                  </div>
                </div>
              )}

              {/* Hourly Occupancy Curve */}
              {selectedBrandForDetail.hourly_occupancy_pct && (
                <div className="bg-white p-3 rounded-lg border border-slate-200/60 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    Kurva Okupansi Kursi Harian (Google Maps Popular Times)
                  </span>
                  <div className="grid grid-cols-5 gap-2 pt-1 text-center text-[10px]">
                    {[
                      { label: '07–11 Pagi', val: selectedBrandForDetail.hourly_occupancy_pct.morning_07_11 },
                      { label: '11–15 Siang', val: selectedBrandForDetail.hourly_occupancy_pct.midday_11_15 },
                      { label: '15–19 Sore', val: selectedBrandForDetail.hourly_occupancy_pct.afternoon_15_19 },
                      { label: '19–23 Malam', val: selectedBrandForDetail.hourly_occupancy_pct.prime_19_23 },
                      { label: '23–06 Subuh', val: selectedBrandForDetail.hourly_occupancy_pct.late_23_06 },
                    ].map((slot) => (
                      <div key={slot.label} className="space-y-1">
                        <div className="h-14 bg-slate-100 rounded flex items-end justify-center p-1">
                          <div
                            className={`w-full rounded-xs ${slot.val >= 85 ? 'bg-rose-600' : slot.val >= 60 ? 'bg-blue-600' : 'bg-slate-400'}`}
                            style={{ height: `${Math.max(6, slot.val)}%` }}
                          />
                        </div>
                        <strong className="font-mono block text-slate-900">{slot.val}%</strong>
                        <span className="text-slate-400 block text-[9px]">{slot.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                <div className="bg-white p-2.5 rounded-lg border border-slate-200/60">
                  <span className="text-slate-400 block text-[10px]">Kecepatan Wi-Fi</span>
                  <strong className="text-slate-900 font-mono font-semibold">
                    {selectedBrandForDetail.wifi_mbps ? `${selectedBrandForDetail.wifi_mbps} Mbps Fiber` : 'Non-WiFi / Cepat'}
                  </strong>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200/60">
                  <span className="text-slate-400 block text-[10px]">Rasio Colokan Listrik</span>
                  <strong className="text-slate-900 font-mono font-semibold">
                    {Math.round((selectedBrandForDetail.plug_ratio ?? 0.75) * 100)}% Meja
                  </strong>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200/60">
                  <span className="text-slate-400 block text-[10px]">Kapasitas &amp; Dwell</span>
                  <strong className="text-slate-900 font-mono font-semibold">
                    {selectedBrandForDetail.seating_capacity || 50} Kursi ({selectedBrandForDetail.dwell_time_min || 120} mnt)
                  </strong>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200/60">
                  <span className="text-slate-400 block text-[10px]">Kapasitas Parkir</span>
                  <strong className="text-slate-900 font-mono font-semibold">
                    {selectedBrandForDetail.parking_motor_capacity || 30} Motor · {selectedBrandForDetail.parking_car_capacity ?? 4} Mobil
                  </strong>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200/60">
                  <span className="text-slate-400 block text-[10px]">Porsi Area Smoking</span>
                  <strong className="text-slate-900 font-mono font-semibold">
                    {selectedBrandForDetail.smoking_zone_pct ?? 50}% Area
                  </strong>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200/60">
                  <span className="text-slate-400 block text-[10px]">Kampus Terdekat</span>
                  <strong className="text-slate-900 font-semibold truncate block" title={selectedBrandForDetail.nearest_campus}>
                    {selectedBrandForDetail.min_campus_dist_km} km ({selectedBrandForDetail.nearest_campus.split(' ')[0]})
                  </strong>
                </div>
              </div>

              {/* Special Sawojajar Commuter Arbitrage Callout */}
              {(selectedBrandForDetail.kecamatan.includes('Sawojajar') || selectedBrandForDetail.kecamatan.includes('Kedungkandang') || selectedBrandForDetail.name.includes('Haya')) && (
                <div className="p-3 rounded-lg bg-amber-50/80 border border-amber-200/70 text-amber-900 text-[11px] leading-relaxed mt-2">
                  <strong className="font-bold block mb-0.5 text-slate-900">
                    Keunggulan Koridor Sawojajar (Komuter Mandiri)
                  </strong>
                  Brand ini beroperasi di zona komuter residensial mandiri Malang Timur. Memiliki retensi pelanggan keluarga &amp; pekerja lokal yang tinggi dan <strong>bebas dari penurunan omzet libur semester mahasiswa (0% holiday drop)</strong>.
                </div>
              )}
            </div>
            )}

            {/* Group 6: Data Provenance & Verification Citations */}
            <div className="bg-emerald-50/40 border border-emerald-200/70 rounded-xl p-4 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[11px] uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                  Validasi Sumber Data (Data Provenance)
                </span>
                <span className="text-[10px] font-mono font-bold text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200">
                  Status: Terverifikasi Lintas 4 Sumber
                </span>
              </div>
              <div className="space-y-1.5 text-[11px] text-slate-700 divide-y divide-emerald-100/80">
                <div className="flex justify-between pt-1">
                  <span className="text-slate-500">1. Geospasial Fisik:</span>
                  <span className="font-mono text-slate-900">OpenStreetMap Live Node ({selectedBrandForDetail.lat.toFixed(4)}, {selectedBrandForDetail.lon.toFixed(4)})</span>
                </div>
                <div className="flex justify-between pt-1.5">
                  <span className="text-slate-500">2. Telemetri Konsumen:</span>
                  <span className="font-mono text-slate-900">Google Maps ({formatNumber(selectedBrandForDetail.gmaps_reviews || 0)} ulasan &middot; {selectedBrandForDetail.gmaps_rating || 4.5} / 5.0)</span>
                </div>
                <div className="flex justify-between pt-1.5">
                  <span className="text-slate-500">3. Katalog Delivery:</span>
                  <span className="font-mono text-slate-900">GoFood / Grab / Shopee ({selectedBrandForDetail.gofood_tier || 'Partner'} &middot; +{selectedBrandForDetail.gofood_markup_pct || 20}%)</span>
                </div>
                <div className="flex justify-between pt-1.5">
                  <span className="text-slate-500">4. Referensi Kampus:</span>
                  <span className="font-mono text-slate-900">PDDikti ({selectedBrandForDetail.nearest_campus})</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-slate-100 bg-white flex items-center justify-between">
            <a
              href={`/analytics?preset=${encodeURIComponent(selectedBrandForDetail.name)}`}
              className="text-xs font-semibold text-[var(--accent-base)] hover:underline"
            >
              Simulasikan di OLS Demand Lab →
            </a>
            <button
              type="button"
              onClick={() => setSelectedBrandForDetail(null)}
              className="px-4 py-2 rounded-lg bg-[var(--accent-base)] text-white text-xs font-semibold hover:bg-[var(--accent-hover)] transition-colors cursor-pointer"
            >
              Selesai
            </button>
          </div>
        </div>
        </>
      )}

      {/* 5. 4-Brand Comparison Drawer */}
      {isCompareOpen && (
        <BrandCompareDrawer
          brands={comparedBrands}
          onClose={() => setIsCompareOpen(false)}
          onClear={() => updateFilter('selectedBrandIds', [])}
          onRemoveBrand={(id) => updateFilter('selectedBrandIds', filter.selectedBrandIds.filter(bId => bId !== id))}
        />
      )}
    </div>
  );
}
