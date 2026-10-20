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
    'grabfood_price_kopi_susu',
    'shopeefood_price_kopi_susu',
    'gofood_markup_pct',
    'est_daily_kopi_susu_cups',
    'est_daily_cups_blended',
    'revpash_rp',
    'gmaps_rating',
    'gmaps_reviews',
    'gofood_rating',
    'gofood_tier',
    'is_24h',
    'wifi_mbps',
    'plug_ratio',
    'seating_capacity',
    'parking_motor_capacity',
    'parking_car_capacity',
    'corridor_annual_rent_est_rp',
    'nearest_campus',
    'min_campus_dist_km',
    'campus_gravity_index',
    'lat',
    'lon',
    'signature_kopi_susu',
    'bestseller_food',
    'roast_blend_profile',
    'gmaps_review_summary',
    'gofood_comment_summary',
    'gofood_packaging_type',
    'gofood_bestseller_bundle',
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
      b.grabfood_price_kopi_susu || 23000,
      b.shopeefood_price_kopi_susu || 22000,
      b.gofood_markup_pct,
      b.est_kopi_susu_cups_day,
      b.est_total_cups_day_per_outlet,
      b.revpash_idr,
      b.gmaps_rating,
      b.gmaps_reviews,
      b.gofood_rating,
      `"${(b.gofood_tier || '').replace(/"/g, '""')}"`,
      b.is_24h ? 'Yes' : 'No',
      b.wifi_mbps ?? 75,
      b.plug_ratio ?? 0.75,
      b.seating_capacity || b.seating_capacity_est || 50,
      b.parking_motor_capacity ?? 30,
      b.parking_car_capacity ?? 4,
      b.corridor_annual_rent_est_rp ?? 85000000,
      `"${(b.nearest_campus || '').replace(/"/g, '""')}"`,
      b.min_campus_dist_km,
      b.campus_gravity_index,
      b.lat,
      b.lon,
      `"${(b.signature_kopi_susu || '').replace(/"/g, '""')}"`,
      `"${(b.bestseller_food || '').replace(/"/g, '""')}"`,
      `"${(b.roast_blend_profile || '').replace(/"/g, '""')}"`,
      `"${(b.gmaps_review_summary || b.review_positive_highlight || '').replace(/"/g, '""')}"`,
      `"${(b.gofood_comment_summary || '').replace(/"/g, '""')}"`,
      `"${(b.gofood_packaging_type || '').replace(/"/g, '""')}"`,
      `"${(b.gofood_bestseller_bundle || '').replace(/"/g, '""')}"`,
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
