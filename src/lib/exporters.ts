import type { CoffeeBrand } from './types/coffee-intelligence';

export const exportBrandsToCsv = (brands: CoffeeBrand[], filename: string = 'malang-coffee-brands.csv') => {
  if (!brands.length) return;

  const headers = [
    'id',
    'name',
    'category_tier',
    'kecamatan',
    'corridor',
    'branches_malang',
    'price_kopi_susu_dinein',
    'price_kopi_susu_gofood',
    'gofood_markup_pct',
    'est_daily_kopi_susu_cups',
    'est_daily_cups_blended',
    'revpash_rp',
    'gmaps_rating',
    'gmaps_reviews',
    'is_24h',
    'nearest_campus',
    'min_campus_dist_km',
    'campus_gravity_index',
    'lat',
    'lon',
    'signature_kopi_susu',
  ];

  const csvRows: string[] = [];
  csvRows.push(headers.join(','));

  for (const b of brands) {
    const row = [
      b.id,
      `"${(b.name || '').replace(/"/g, '""')}"`,
      `"${(b.category_tier || '').replace(/"/g, '""')}"`,
      `"${(b.kecamatan || '').replace(/"/g, '""')}"`,
      `"${(b.corridor || '').replace(/"/g, '""')}"`,
      b.branches_malang || b.outlets_in_malang || 1,
      b.price_kopi_susu_dinein || b.avg_kopi_susu_price,
      b.price_kopi_susu_gofood || b.gofood_price_kopi_susu,
      b.gofood_markup_pct,
      b.est_kopi_susu_cups_day,
      b.est_total_cups_day_per_outlet,
      b.revpash_idr,
      b.gmaps_rating,
      b.gmaps_reviews,
      b.is_24h ? 'Yes' : 'No',
      `"${(b.nearest_campus || '').replace(/"/g, '""')}"`,
      b.min_campus_dist_km,
      b.campus_gravity_index,
      b.lat,
      b.lon,
      `"${(b.signature_kopi_susu || '').replace(/"/g, '""')}"`,
    ];
    csvRows.push(row.join(','));
  }

  const blob = new Blob(['\uFEFF' + csvRows.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportBrandsToJson = (brands: CoffeeBrand[], filename: string = 'malang-coffee-brands.json') => {
  const blob = new Blob([JSON.stringify(brands, null, 2)], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
