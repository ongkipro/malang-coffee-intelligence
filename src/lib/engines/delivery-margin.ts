/**
 * GoFood / ShopeeFood / GrabFood Commission & Markup Engine
 */

export interface DeliveryInputs {
  dineInPriceIdr: number;
  cogsIdr: number;
  packagingSealCostIdr?: number;
  appMarkupPct: number;
  platformCommissionPct?: number;
  platformFixedFeeIdr?: number;
  promoCoPayPct: number;
}

export interface DeliveryResult {
  appListedPriceIdr: number;
  platformCutIdr: number;
  promoSubsidyIdr: number;
  netMerchantPayoutIdr: number;
  netContributionIdr: number;
  netContributionPct: number;
  isMarginEroded: boolean;
  recommendedMarkupPct: number;
  dineInContributionIdr: number;
}

export const calculateDeliveryMargin = (inputs: DeliveryInputs): DeliveryResult => {
  const dineInPrice = Math.max(5000, inputs.dineInPriceIdr);
  const cogs = Math.max(1000, inputs.cogsIdr);
  const seal = inputs.packagingSealCostIdr !== undefined ? inputs.packagingSealCostIdr : 800;
  const markup = Math.max(0, Math.min(60, inputs.appMarkupPct));
  const comm = inputs.platformCommissionPct !== undefined ? inputs.platformCommissionPct : 20.0;
  const fixedFee = inputs.platformFixedFeeIdr !== undefined ? inputs.platformFixedFeeIdr : 1000;
  const promo = Math.max(0, Math.min(40, inputs.promoCoPayPct));

  // App listed price rounded to nearest 500
  const rawAppPrice = dineInPrice * (1 + markup / 100);
  const appListedPriceIdr = Math.round(rawAppPrice / 500) * 500;

  // Platform cut: 20% of app listed price + Rp 1,000 fixed fee
  const platformCutIdr = Math.round(appListedPriceIdr * (comm / 100) + fixedFee);

  // Promo co-pay: e.g. 15% discount subsidized by merchant
  const promoSubsidyIdr = Math.round(appListedPriceIdr * (promo / 100));

  // Net payout received into merchant bank account
  const netMerchantPayoutIdr = appListedPriceIdr - platformCutIdr - promoSubsidyIdr;

  // Net contribution after COGS + cup seal
  const netContributionIdr = netMerchantPayoutIdr - (cogs + seal);
  const netContributionPct = netMerchantPayoutIdr > 0
    ? Math.round((netContributionIdr / netMerchantPayoutIdr) * 1000) / 10
    : 0;

  // Dine-in benchmark contribution
  const dineInContributionIdr = dineInPrice - cogs;

  // Margin eroded if net contribution < Rp 4,000 or < 40%
  const isMarginEroded = netContributionIdr < 4000 || netContributionPct < 40;

  // Calculate recommended markup % to fully preserve dine-in gross profit
  // Payout >= DineInContribution + cogs + seal
  // (P * (1 - (comm + promo)/100)) - fixedFee >= targetContribution + cogs + seal
  const targetPayout = dineInContributionIdr + cogs + seal + fixedFee;
  const retentionFactor = 1 - (comm + promo) / 100;
  const requiredAppPrice = retentionFactor > 0 ? targetPayout / retentionFactor : dineInPrice * 1.5;
  const recommendedMarkupPct = Math.max(15, Math.round(((requiredAppPrice - dineInPrice) / dineInPrice) * 100));

  return {
    appListedPriceIdr,
    platformCutIdr,
    promoSubsidyIdr,
    netMerchantPayoutIdr,
    netContributionIdr,
    netContributionPct,
    isMarginEroded,
    recommendedMarkupPct,
    dineInContributionIdr,
  };
};
