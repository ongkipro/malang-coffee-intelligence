/**
 * Menu Engineering Matrix & Bill-of-Materials (BOM) COGS Engine
 */

export interface RawMaterialPrices {
  beansPricePerKgIdr: number;
  freshMilkPricePerLiterIdr: number;
  arenSyrupPricePerKgIdr: number;
  packagingUnitIdr: number;
}

export const DEFAULT_RAW_MATERIALS: RawMaterialPrices = {
  beansPricePerKgIdr: 145000,
  freshMilkPricePerLiterIdr: 18500,
  arenSyrupPricePerKgIdr: 42000,
  packagingUnitIdr: 850,
};

export interface MenuItemCogs {
  skuName: string;
  dineInPriceIdr: number;
  cogsIdr: number;
  grossMarginPct: number;
  dailyCupSharePct: number;
  quadrant: 'STARS' | 'PLOWHORSES' | 'PUZZLES' | 'DOGS';
  actionRecommendation: string;
}

export const calculateKopiSusuCogs = (
  materials: RawMaterialPrices = DEFAULT_RAW_MATERIALS,
  variant: 'GULA_AREN' | 'SALTED_CARAMEL' | 'KLASIK_KRIM' | 'KOPITIAM_BUTTER' = 'GULA_AREN'
): number => {
  // 18g double shot
  const espressoCost = 18 * (materials.beansPricePerKgIdr / 1000);
  // 120ml milk
  const milkCost = 120 * (materials.freshMilkPricePerLiterIdr / 1000);
  // Packaging
  const packaging = materials.packagingUnitIdr;

  let flavorCost = 0;
  if (variant === 'GULA_AREN') {
    // 25g aren
    flavorCost = 25 * (materials.arenSyrupPricePerKgIdr / 1000);
  } else if (variant === 'SALTED_CARAMEL') {
    // Premium syrup 20ml
    flavorCost = 20 * (65000 / 1000);
  } else if (variant === 'KLASIK_KRIM') {
    // Condensed milk + creamer
    flavorCost = 30 * (32000 / 1000);
  } else if (variant === 'KOPITIAM_BUTTER') {
    // Robusta 20g + condensed milk + butter 10g
    const butterCost = 10 * (95000 / 1000);
    return Math.round(15 * (95000 / 1000) + 40 * (28000 / 1000) + butterCost + packaging);
  }

  return Math.round(espressoCost + milkCost + flavorCost + packaging);
};

export const getMenuEngineeringMatrix = (materials: RawMaterialPrices = DEFAULT_RAW_MATERIALS): MenuItemCogs[] => {
  const cogsAren = calculateKopiSusuCogs(materials, 'GULA_AREN');
  const cogsCaramel = calculateKopiSusuCogs(materials, 'SALTED_CARAMEL');
  const cogsKlasik = calculateKopiSusuCogs(materials, 'KLASIK_KRIM');
  const cogsKopitiam = calculateKopiSusuCogs(materials, 'KOPITIAM_BUTTER');

  const skus = [
    {
      skuName: 'Kopi Susu Gula Aren (Signature)',
      dineInPriceIdr: 18000,
      cogsIdr: cogsAren,
      dailyCupSharePct: 64,
    },
    {
      skuName: 'Salted Caramel / Butterscotch',
      dineInPriceIdr: 22000,
      cogsIdr: cogsCaramel,
      dailyCupSharePct: 22,
    },
    {
      skuName: 'Modern Kopitiam Butter Coffee',
      dineInPriceIdr: 16000,
      cogsIdr: cogsKopitiam,
      dailyCupSharePct: 18,
    },
    {
      skuName: 'Kopi Susu Klasik / Krim',
      dineInPriceIdr: 15000,
      cogsIdr: cogsKlasik,
      dailyCupSharePct: 14,
    },
    {
      skuName: 'Matcha / Oat Milk Latte',
      dineInPriceIdr: 24000,
      cogsIdr: 6800,
      dailyCupSharePct: 9,
    },
    {
      skuName: 'Manual Brew V60 / Filter Single Origin',
      dineInPriceIdr: 25000,
      cogsIdr: 4500,
      dailyCupSharePct: 5,
    },
    {
      skuName: '1-Liter Bottled Family Pack',
      dineInPriceIdr: 70000,
      cogsIdr: 32500,
      dailyCupSharePct: 7,
    },
    {
      skuName: 'Seasonal Fruit Syrup Kopi Susu',
      dineInPriceIdr: 19000,
      cogsIdr: 9200,
      dailyCupSharePct: 3,
    },
  ];

  return skus.map((s) => {
    const grossMarginPct = Math.round(((s.dineInPriceIdr - s.cogsIdr) / s.dineInPriceIdr) * 1000) / 10;
    const isHighMargin = grossMarginPct >= 65;
    const isHighVolume = s.dailyCupSharePct >= 15;

    let quadrant: 'STARS' | 'PLOWHORSES' | 'PUZZLES' | 'DOGS' = 'PLOWHORSES';
    let actionRecommendation = '';

    if (isHighMargin && isHighVolume) {
      quadrant = 'STARS';
      actionRecommendation = 'Pertahankan kualitas & jadikan signature hero kampanye.';
    } else if (!isHighMargin && isHighVolume) {
      quadrant = 'PLOWHORSES';
      actionRecommendation = 'Volume traffic driver: efisiensi porsi sirup atau naikkan harga Rp 1.000.';
    } else if (isHighMargin && !isHighVolume) {
      quadrant = 'PUZZLES';
      actionRecommendation = 'Margin tinggi tapi volume rendah: pasang display kasir & bundle promo.';
    } else {
      quadrant = 'DOGS';
      actionRecommendation = 'Margin dan volume rendah: pertimbangkan eliminasi untuk efisiensi inventori.';
    }

    return {
      ...s,
      grossMarginPct,
      quadrant,
      actionRecommendation,
    };
  });
};
