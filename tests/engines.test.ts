import { describe, it, expect } from 'vitest';
import { predictOlsDemand } from '../src/lib/engines/ols-demand';
import { calculateKopiSusuCogs, getMenuEngineeringMatrix } from '../src/lib/engines/menu-engineering';
import { simulateAcademicPnl, ARCHETYPES } from '../src/lib/engines/monte-carlo-pnl';
import { calculateDeliveryMargin } from '../src/lib/engines/delivery-margin';

describe('Analytical & Financial Engines Unit Tests', () => {
  it('OLS Demand Regression predicts realistic Kopi Susu volume & RevPASH', () => {
    // Test with Haya Espresso Bar profile
    const result = predictOlsDemand({
      seatingCapacity: 85,
      is24h: false,
      priceIdr: 18000,
      gmapsReviews: 740,
      campusGravityScore: 15.2,
      openHoursPerDay: 15,
    });

    expect(result.predictedCupsDay).toBeGreaterThan(100);
    expect(result.predictedCupsDay).toBeLessThan(350);
    expect(result.revpashIdr).toBeGreaterThan(2000);
    expect(result.waterfall).toHaveLength(6);
    expect(result.waterfall[1].factor).toContain('Google Reviews');
  });

  it('BOM COGS Engine calculates per-cup cost and classifies Menu Engineering SKUs', () => {
    const cogsAren = calculateKopiSusuCogs(undefined, 'GULA_AREN');
    expect(cogsAren).toBeGreaterThan(4000);
    expect(cogsAren).toBeLessThan(7500);

    const matrix = getMenuEngineeringMatrix();
    expect(matrix).toHaveLength(8);

    const arenItem = matrix.find((s) => s.skuName.includes('Gula Aren'));
    expect(arenItem).toBeDefined();
    expect(arenItem?.grossMarginPct).toBeGreaterThan(60);
  });

  it('12-Month Academic Calendar Monte Carlo simulates Format B (Kopitiam)', () => {
    const result = simulateAcademicPnl(ARCHETYPES.FORMAT_B);
    expect(result.monthlyCashflows).toHaveLength(12);
    expect(result.paybackMonth).toBeLessThanOrEqual(5);
    expect(result.annualNetProfitIdr).toBeGreaterThan(300_000_000);
    expect(result.annualRoiPct).toBeGreaterThan(200);

    // Test Commuter Corridor dampening
    const commuterResult = simulateAcademicPnl(ARCHETYPES.FORMAT_B, { isCommuterCorridor: true });
    // July cashflow in commuter should be higher than campus cluster
    const campusJuly = result.monthlyCashflows[6].monthlyNetProfitIdr;
    const commuterJuly = commuterResult.monthlyCashflows[6].monthlyNetProfitIdr;
    expect(commuterJuly).toBeGreaterThan(campusJuly);
  });

  it('Delivery Margin Engine calculates GoFood 20%+1k commission and warns on margin erosion', () => {
    // Safe scenario: Rp 15,000 dine in, Rp 5,050 COGS, 25% markup (Rp 18,750), 15% promo
    const safe = calculateDeliveryMargin({
      dineInPriceIdr: 15000,
      cogsIdr: 5050,
      appMarkupPct: 25,
      promoCoPayPct: 15,
    });

    expect(safe.appListedPriceIdr).toBe(19000); // 18,750 rounded to nearest 500
    expect(safe.netMerchantPayoutIdr).toBeGreaterThan(11000);
    expect(safe.netContributionIdr).toBeGreaterThan(5000);
    expect(safe.recommendedMarkupPct).toBeGreaterThanOrEqual(20);

    // Dangerous scenario: 0% markup, high promo 25%
    const danger = calculateDeliveryMargin({
      dineInPriceIdr: 15000,
      cogsIdr: 5050,
      appMarkupPct: 0,
      promoCoPayPct: 25,
    });
    expect(danger.isMarginEroded).toBe(true);
  });
});
