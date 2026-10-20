/**
 * OLS Multivariate Demand Regression & RevPASH Calculator
 * Verified Model Fit: R² = 0.7407, Adj R² = 0.7258 (N = 93)
 */

export interface OlsInputs {
  seatingCapacity: number;
  is24h: boolean;
  priceIdr: number;
  gmapsReviews: number;
  campusGravityScore: number;
  openHoursPerDay?: number;
}

export interface OlsWaterfallItem {
  factor: string;
  contributionCups: number;
  description: string;
}

export interface OlsResult {
  predictedCupsDay: number;
  waterfall: OlsWaterfallItem[];
  revpashIdr: number;
  revpashStatus: 'danger' | 'healthy' | 'high_velocity';
  revpashLabel: string;
}

export const OLS_COEFFICIENTS = {
  intercept: -238.767,
  seatsPerUnit: 0.331,
  is24hBonus: 56.703,
  pricePer1k: -2.889,
  lnReviews: 63.25,
  gravityPer100: 16.599,
};

export const predictOlsDemand = (inputs: OlsInputs): OlsResult => {
  const seats = Math.max(10, Math.min(500, inputs.seatingCapacity));
  const price = Math.max(8000, Math.min(50000, inputs.priceIdr));
  const reviews = Math.max(10, Math.min(25000, inputs.gmapsReviews));
  const gravity = Math.max(0, Math.min(200, inputs.campusGravityScore));
  const hours = inputs.openHoursPerDay || (inputs.is24h ? 24 : 16);

  const cIntercept = OLS_COEFFICIENTS.intercept;
  const cReviews = OLS_COEFFICIENTS.lnReviews * Math.log(reviews);
  const c24h = inputs.is24h ? OLS_COEFFICIENTS.is24hBonus : 0;
  const cSeats = OLS_COEFFICIENTS.seatsPerUnit * seats;
  const cPrice = OLS_COEFFICIENTS.pricePer1k * (price / 1000);
  const cGravity = OLS_COEFFICIENTS.gravityPer100 * (gravity / 100);

  const rawSum = cIntercept + cReviews + c24h + cSeats + cPrice + cGravity;
  const predictedCupsDay = Math.max(15, Math.round(rawSum));

  const waterfall: OlsWaterfallItem[] = [
    { factor: 'Intercept (Konstanta)', contributionCups: Math.round(cIntercept), description: 'Baseline model' },
    { factor: 'Google Reviews Social Proof', contributionCups: Math.round(cReviews), description: `ln(${reviews}) × +63.25` },
    { factor: '24-Jam Operasional', contributionCups: Math.round(c24h), description: inputs.is24h ? '+56.7 cups bonus' : 'Non-24 jam (0 cup)' },
    { factor: 'Kapasitas Kursi', contributionCups: Math.round(cSeats), description: `${seats} kursi × +0.331` },
    { factor: 'Elastisitas Harga', contributionCups: Math.round(cPrice), description: `Rp ${(price / 1000).toFixed(0)}k × -2.889` },
    { factor: 'Gravitasi Kampus', contributionCups: Math.round(cGravity), description: `Skor ${gravity.toFixed(1)} × +16.60` },
  ];

  // Daily gross revenue estimate: predicted Kopi Susu / 65% share * price
  const dailyTotalRev = Math.round((predictedCupsDay / 0.65) * price);
  const revpashIdr = Math.round(dailyTotalRev / (seats * hours));

  let revpashStatus: 'danger' | 'healthy' | 'high_velocity' = 'healthy';
  let revpashLabel = 'HEALTHY: Turnover & WFC Seimbang';

  if (revpashIdr < 2500) {
    revpashStatus = 'danger';
    revpashLabel = 'DANGER: Risiko Wi-Fi Squatting / Kursi Menganggur';
  } else if (revpashIdr >= 4500) {
    revpashStatus = 'high_velocity';
    revpashLabel = 'HIGH VELOCITY: Rapid Turn Kopitiam / Grab-and-Go';
  }

  return {
    predictedCupsDay,
    waterfall,
    revpashIdr,
    revpashStatus,
    revpashLabel,
  };
};
