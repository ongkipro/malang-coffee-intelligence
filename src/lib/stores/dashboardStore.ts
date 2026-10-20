import { atom } from 'nanostores';

export interface FilterState {
  search: string;
  kecamatan: string;
  tier: string;
  is24hOnly: boolean;
  maxPrice: number;
  selectedBrandIds: number[];
}

export const initialFilterState: FilterState = {
  search: '',
  kecamatan: 'ALL',
  tier: 'ALL',
  is24hOnly: false,
  maxPrice: 35000,
  selectedBrandIds: [],
};

export const $filterState = atom<FilterState>(initialFilterState);

export const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
  const current = $filterState.get();
  const next = { ...current, [key]: value };
  $filterState.set(next);

  // Sync to URL if in browser
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    if (next.search) params.set('q', next.search);
    else params.delete('q');

    if (next.kecamatan !== 'ALL') params.set('kecamatan', next.kecamatan);
    else params.delete('kecamatan');

    if (next.tier !== 'ALL') params.set('tier', next.tier);
    else params.delete('tier');

    if (next.is24hOnly) params.set('is24h', 'true');
    else params.delete('is24h');

    if (next.maxPrice < 35000) params.set('priceMax', String(next.maxPrice));
    else params.delete('priceMax');

    const newUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`;
    window.history.replaceState({}, '', newUrl);
  }
};

export const resetFilters = () => {
  $filterState.set(initialFilterState);
  if (typeof window !== 'undefined') {
    window.history.replaceState({}, '', window.location.pathname);
  }
};

export const toggleBrandComparison = (brandId: number) => {
  const current = $filterState.get();
  const exists = current.selectedBrandIds.includes(brandId);
  if (exists) {
    updateFilter('selectedBrandIds', current.selectedBrandIds.filter(id => id !== brandId));
  } else {
    if (current.selectedBrandIds.length < 4) {
      updateFilter('selectedBrandIds', [...current.selectedBrandIds, brandId]);
    }
  }
};

export const initFiltersFromUrl = () => {
  if (typeof window === 'undefined') return;
  const params = new URLSearchParams(window.location.search);
  const q = params.get('q') || '';
  const kecamatan = params.get('kecamatan') || 'ALL';
  const tier = params.get('tier') || 'ALL';
  const is24hOnly = params.get('is24h') === 'true';
  const priceMaxParam = Number(params.get('priceMax'));
  const maxPrice = !isNaN(priceMaxParam) && priceMaxParam >= 10000 && priceMaxParam <= 35000 ? priceMaxParam : 35000;

  $filterState.set({
    ...initialFilterState,
    search: q,
    kecamatan,
    tier,
    is24hOnly,
    maxPrice,
  });
};
