import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import {
  CoffeeBrandSchema,
  OsmPoiSchema,
  UniversityAnchorSchema,
  AnalyticsResultsSchema,
} from '../src/lib/types/coffee-intelligence';

describe('Astro Content Layer Schema Validation', () => {
  const dataDir = path.resolve(__dirname, '../src/data');

  it('validates all 93 coffee brands against CoffeeBrandSchema', () => {
    const raw = fs.readFileSync(path.join(dataDir, 'malang_coffee_master_93_brands.json'), 'utf-8');
    const brands = JSON.parse(raw);
    expect(brands).toHaveLength(93);

    brands.forEach((brand: unknown, idx: number) => {
      const result = CoffeeBrandSchema.safeParse(brand);
      if (!result.success) {
        console.error(`Validation failed at index ${idx}:`, result.error.format());
      }
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.gmaps_review_summary.length).toBeGreaterThan(20);
        expect(result.data.gofood_comment_summary.length).toBeGreaterThan(20);
        expect(result.data.gofood_packaging_type.length).toBeGreaterThan(5);
        expect(result.data.gmaps_aspect_scores).toBeDefined();
        expect(result.data.sku_price_basket).toBeDefined();
        expect(result.data.sensory_profile).toBeDefined();
        expect(result.data.hourly_occupancy_pct).toBeDefined();
        expect(result.data.corridor_annual_rent_est_rp).toBeGreaterThan(10000000);
      }
    });

    const kopiJaya = brands.find((b: { name?: string }) => (b.name || '').toLowerCase().includes('kopi jaya'));
    expect(kopiJaya).toBeDefined();
    expect(kopiJaya.outlets_in_malang).toBe(7);
  });

  it('validates all 157 OSM cafe POIs against OsmPoiSchema', () => {
    const raw = fs.readFileSync(path.join(dataDir, 'malang_osm_157_named_pois.json'), 'utf-8');
    const pois = JSON.parse(raw);
    expect(pois).toHaveLength(157);

    pois.forEach((poi: unknown) => {
      const result = OsmPoiSchema.safeParse(poi);
      expect(result.success).toBe(true);
    });
  });

  it('validates 9 university gravity anchors against UniversityAnchorSchema', () => {
    const raw = fs.readFileSync(path.join(dataDir, 'malang_universities_9_anchors.json'), 'utf-8');
    const anchors = JSON.parse(raw);
    expect(anchors).toHaveLength(9);

    anchors.forEach((anchor: unknown) => {
      const result = UniversityAnchorSchema.safeParse(anchor);
      expect(result.success).toBe(true);
    });
  });

  it('validates econometric analytics results against AnalyticsResultsSchema', () => {
    const raw = fs.readFileSync(path.join(dataDir, 'malang_analytics_results.json'), 'utf-8');
    const analytics = JSON.parse(raw);
    const result = AnalyticsResultsSchema.safeParse(analytics);
    expect(result.success).toBe(true);
  });

  it('negative test: rejects records with negative cup count or invalid rating', () => {
    const invalidBrand = {
      brand_id: 999,
      brand_name: 'Invalid Coffee',
      category_tier: 'Tier 1',
      outlets_in_malang: 1,
      kecamatan: 'Lowokwaru',
      lat: -7.95,
      lon: 112.61,
      min_campus_dist_km: 0.5,
      campus_gravity_index: 10,
      osm_competitors_500m: 5,
      osm_competitors_1km: 10,
      gmaps_rating: 6.5, // INVALID: > 5.0
      gmaps_reviews: 100,
      gofood_rating: 4.5,
      is_24h: false,
      seating_capacity_est: 50,
      price_kopi_susu_low: 15000,
      price_kopi_susu_high: 20000,
      avg_kopi_susu_price: 18000,
      gofood_price_kopi_susu: 22000,
      gofood_markup_pct: 22.2,
      est_total_cups_day_per_outlet: 200,
      kopi_susu_share_pct: 60,
      est_kopi_susu_cups_day: -25, // INVALID: negative
      est_kopi_susu_cups_month: 3000,
      est_brand_total_kopi_susu_month_all_outlets: 3000,
      est_daily_kopi_susu_rev_idr: 1800000,
      est_monthly_total_rev_per_outlet_idr: 54000000,
      cogs_pct_est: 28.5,
      revpash_idr: 3500,
    };

    const parseResult = CoffeeBrandSchema.safeParse(invalidBrand);
    expect(parseResult.success).toBe(false);
    if (!parseResult.success) {
      const issuePaths = parseResult.error.issues.map((i) => i.path.join('.'));
      expect(issuePaths).toContain('gmaps_rating');
      expect(issuePaths).toContain('est_kopi_susu_cups_day');
    }
  });
});
