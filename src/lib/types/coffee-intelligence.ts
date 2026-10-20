import { z } from 'zod';

export const CoffeeBrandSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  brand_id: z.number().int().positive(),
  brand_name: z.string().min(1),
  category_tier: z.string().min(1),
  sub_category: z.string().optional().default(''),
  branches_malang: z.number().int().min(1),
  outlets_in_malang: z.number().int().min(1),
  kecamatan: z.string().min(1),
  corridor: z.string().default(''),
  address: z.string().default(''),
  lat: z.number().min(-8.2).max(-7.7),
  lon: z.number().min(112.4).max(112.8),
  nearest_campus: z.string().default(''),
  min_campus_dist_km: z.number().min(0),
  campus_gravity_index: z.number().min(0),
  osm_competitors_500m: z.number().int().min(0),
  osm_competitors_1km: z.number().int().min(0),
  gmaps_rating: z.number().min(1.0).max(5.0),
  gmaps_reviews: z.number().int().min(0),
  gofood_rating: z.number().min(0).max(5.0),
  gofood_tier: z.string().optional().default(''),
  operating_hours: z.string().default(''),
  is_24h: z.boolean(),
  open_hours_per_day: z.number().min(1).max(24).optional().default(16),
  price_kopi_susu_dinein: z.number().int().min(0).optional().default(18000),
  price_kopi_susu_gofood: z.number().int().min(0).optional().default(22000),
  gofood_markup_pct: z.number().optional().default(20.0),
  price_literan_1l: z.number().int().optional().default(70000),
  est_cogs_cup: z.number().int().optional().default(5500),
  gross_margin_pct: z.number().optional().default(68.0),
  seating_capacity: z.number().int().min(0).optional().default(50),
  seating_capacity_est: z.number().int().min(0),
  avg_kopi_susu_price: z.number().int().min(5000).max(100000),
  price_kopi_susu_low: z.number().int().min(0),
  price_kopi_susu_high: z.number().int().min(0),
  gofood_price_kopi_susu: z.number().int().min(0),
  est_total_cups_day_per_outlet: z.number().int().min(0),
  kopi_susu_share_pct: z.number().min(0).max(100),
  est_kopi_susu_cups_day: z.number().int().min(0),
  est_kopi_susu_cups_month: z.number().int().min(0),
  est_brand_total_kopi_susu_month_all_outlets: z.number().int().min(0),
  est_daily_kopi_susu_rev_idr: z.number().int().min(0),
  est_monthly_total_rev_per_outlet_idr: z.number().int().min(0),
  cogs_pct_est: z.number().min(0).max(100),
  revpash_idr: z.number().int().min(0),
  revpash_rp: z.number().int().optional().default(3000),
  signature_kopi_susu: z.string().optional().default(''),
  bestseller_food: z.string().optional().default(''),
  roast_blend_profile: z.string().optional().default(''),
  review_positive_highlight: z.string().optional().default(''),
  review_negative_painpoint: z.string().optional().default(''),
});

export type CoffeeBrand = z.infer<typeof CoffeeBrandSchema>;

export const OsmPoiSchema = z.object({
  id: z.union([z.number(), z.string()]).optional(),
  osm_id: z.union([z.number(), z.string()]),
  osm_type: z.string().default('node'),
  name: z.string().min(1),
  lat: z.number().min(-8.2).max(-7.7),
  lon: z.number().min(112.4).max(112.8),
  street: z.string().default(''),
  opening_hours: z.string().default(''),
  wifi: z.string().default(''),
  cuisine: z.string().default(''),
  nearest_campus: z.string().default(''),
  dist_nearest_campus_km: z.number().min(0),
});

export type OsmPoi = z.infer<typeof OsmPoiSchema>;

export const UniversityAnchorSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  code: z.string().min(1),
  lat: z.number().min(-8.2).max(-7.7),
  lon: z.number().min(112.4).max(112.8),
  active_students: z.number().int().positive(),
  kecamatan: z.string().min(1),
});

export type UniversityAnchor = z.infer<typeof UniversityAnchorSchema>;

export const AnalyticsResultsSchema = z.object({
  dataset_coverage: z.record(z.string(), z.any()),
  ols_multivariate_regression: z.object({
    dependent_variable: z.string(),
    r_squared: z.number(),
    adj_r_squared: z.number(),
    sample_size_n: z.number().int().positive(),
    coefficients: z.record(z.string(), z.object({
      beta: z.number(),
      se: z.number().optional(),
      t_stat: z.number(),
      p_value: z.number().optional(),
      description: z.string().optional(),
    })),
  }),
  monte_carlo_12_month_archetypes: z.record(z.string(), z.object({
    capex_rp: z.number(),
    annual_net_profit_p10_rp: z.number(),
    annual_net_profit_p50_rp: z.number(),
    annual_net_profit_p90_rp: z.number(),
    annual_roi_p50_pct: z.number(),
    payback_months_p50: z.number(),
    payback_months_p90: z.number().optional(),
    prob_monthly_deficit_pct: z.number(),
    monthly_p50_net_profit_curve_rp: z.record(z.string(), z.number()),
  })),
});

export type AnalyticsResults = z.infer<typeof AnalyticsResultsSchema>;
