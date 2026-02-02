
import { WaterQuality, SofteningTargets, CalculationResults } from '../types';

export const calculateSoftening = (
  water: WaterQuality,
  targets: SofteningTargets
): CalculationResults => {
  const flowM3Day = (water.flowRate || 0) * 1000;
  
  const rawCa = water.ca || 0;
  const rawMg = water.mg || 0;
  const rawAlk = water.alkalinity || 0;
  const rawPh = water.ph || 7.0;
  const rawTemp = water.temperature || 20;

  const limeCostPerKg = (water.limeCostPerTonne || 0) / 1000;
  const sodaAshCostPerKg = (water.sodaAshCostPerTonne || 0) / 1000;
  const sludgeCostPerKg = water.sludgeDisposalCostPerKg || 0;

  // 1. Derive Free CO2 (as CaCO3)
  const pK1 = 6.35 + 0.01 * (25 - rawTemp);
  const derivedCO2 = rawAlk * Math.pow(10, pK1 - rawPh);

  // 2. Initial Speciation (Influent)
  const rawCaCH = Math.min(rawCa, rawAlk);
  const rawCaNCH = Math.max(0, rawCa - rawCaCH);
  const remainingAlkAfterCa = Math.max(0, rawAlk - rawCaCH);
  const rawMgCH = Math.min(rawMg, remainingAlkAfterCa);
  const rawMgNCH = Math.max(0, rawMg - rawMgCH);

  const performCalc = (tCa: number, tMg: number, mode: 'LIME_ONLY' | 'LIME_SODA') => {
    let actualRemovedMgCH = 0;
    let actualRemovedMgNCH = 0;

    if (mode === 'LIME_ONLY') {
      actualRemovedMgCH = Math.max(0, rawMgCH - Math.min(rawMgCH, tMg));
      actualRemovedMgNCH = 0; 
    } else {
      const totalMgToRemove = Math.max(0, rawMg - tMg);
      actualRemovedMgCH = Math.min(totalMgToRemove, rawMgCH);
      actualRemovedMgNCH = Math.max(0, totalMgToRemove - rawMgCH);
    }

    const actualRemovedMg = actualRemovedMgCH + actualRemovedMgNCH;
    const residualMg = rawMg - actualRemovedMg;
    const targetMgMgL = Math.max(0.1, residualMg);
    const mgMolar = (targetMgMgL / 100.1) * 0.001;
    const Ksp = 1.8e-11; 
    const requiredOhMolar = Math.sqrt(Ksp / (mgMolar || 1e-10));
    const requiredPOH = -Math.log10(requiredOhMolar || 1e-7);
    
    let theoreticalPh = Math.max(10.3, 14 - requiredPOH);
    const finalPh = Math.min(11.6, theoreticalPh + 0.3);
    const finalOhMolar = Math.pow(10, -(14 - finalPh));
    const hydroxideAlkAsCaCO3 = finalOhMolar * 1000 * 50; 

    const potentialTotalCaNCH = rawCaNCH + actualRemovedMgNCH;
    const actualRemovedCaCH = Math.max(0, rawCaCH - Math.min(rawCaCH, tCa));
    
    let actualRemovedCaNCH = 0;
    if (mode === 'LIME_SODA') {
      const desiredCaNCHRemoval = Math.max(0, potentialTotalCaNCH - (tCa - (rawCaCH - actualRemovedCaCH)));
      actualRemovedCaNCH = Math.min(potentialTotalCaNCH, desiredCaNCHRemoval);
    }

    const reactiveLimeAsCaCO3 = derivedCO2 + actualRemovedCaCH + (actualRemovedMgCH * 2) + actualRemovedMgNCH;
    const totalLimeAsCaCO3 = reactiveLimeAsCaCO3 + hydroxideAlkAsCaCO3;
    const lDose = totalLimeAsCaCO3 * (74.1 / 100.1);
    const sDose = actualRemovedCaNCH * (106.0 / 100.1);
    
    const dailyLimeCost = (lDose * flowM3Day / 1000) * limeCostPerKg;
    const dailySodaAshCost = (sDose * flowM3Day / 1000) * sodaAshCostPerKg;
    const chemicalCost = dailyLimeCost + dailySodaAshCost;

    const achievedCa = (rawCaCH - actualRemovedCaCH) + (potentialTotalCaNCH - actualRemovedCaNCH);
    const achievedMg = rawMg - actualRemovedMg;

    return { 
      lDose, 
      sDose, 
      dailyLimeCost,
      dailySodaAshCost,
      cost: chemicalCost, 
      finalPh, 
      hydroxideAlkAsCaCO3, 
      reactiveLimeAsCaCO3,
      actualRemovedMg, 
      actualRemovedMgCH, 
      actualRemovedMgNCH,
      actualRemovedCaCH, 
      actualRemovedCaNCH, 
      achievedCa, 
      achievedMg 
    };
  };

  const current = performCalc(targets.targetCa, targets.targetMg, targets.dosingMode);
  
  const sameTH_CaTarget = Math.max(20, targets.targetCa - 10);
  const sameTH_MgTarget = targets.targetMg + 10;
  const alternative = performCalc(sameTH_CaTarget, sameTH_MgTarget, targets.dosingMode);

  const currentCaCO3SludgeKg = (derivedCO2 + (current.actualRemovedCaCH * 2) + (current.actualRemovedMgCH * 2) + current.actualRemovedCaNCH + current.hydroxideAlkAsCaCO3) * flowM3Day / 1000;
  const currentMgOH2SludgeKg = (current.actualRemovedMg * (58.3 / 100.1) * flowM3Day / 1000);
  const totalSludge = currentCaCO3SludgeKg + currentMgOH2SludgeKg;

  const altCaCO3SludgeKg = (derivedCO2 + (alternative.actualRemovedCaCH * 2) + (alternative.actualRemovedMgCH * 2) + alternative.actualRemovedCaNCH + alternative.hydroxideAlkAsCaCO3) * flowM3Day / 1000;
  const altMgOH2SludgeKg = (alternative.actualRemovedMg * (58.3 / 100.1) * flowM3Day / 1000);
  const totalAltSludge = altCaCO3SludgeKg + altMgOH2SludgeKg;

  const dailyDisposalCost = totalSludge * sludgeCostPerKg;
  const altDailyDisposalCost = totalAltSludge * sludgeCostPerKg;

  const savingsPotential = (current.cost + dailyDisposalCost) - (alternative.cost + altDailyDisposalCost);

  // LSI/CCPP Calculation for Treated Water
  const TDS = water.conductivity * 0.65;
  const A_const = (Math.log10(TDS) - 1) / 10;
  const B_const = -13.12 * Math.log10(rawTemp + 273.15) + 34.55;
  
  // Calcium as CaCO3 to Ca+2 mg/L: [CaCO3] * 0.4008
  const Ca2plus = current.achievedCa * 0.4008;
  const C_const = Math.log10(Ca2plus) - 0.4;
  
  const Alkalinity_mgL = 35 + current.hydroxideAlkAsCaCO3; // Residual softening alk approx
  const D_const = Math.log10(Alkalinity_mgL);

  const pHs = (9.3 + A_const + B_const) - (C_const + D_const);
  const lsi = current.finalPh - pHs;
  
  // CCPP Approximation: mg/L as CaCO3
  // Simplified form based on alkalinity and LSI for high-pH softened water
  const ccpp = Alkalinity_mgL * (1 - Math.pow(10, -lsi));

  return {
    limeDose: current.lDose,
    sodaAshDose: current.sDose,
    sludgeProduction: totalSludge,
    caCO3Sludge: currentCaCO3SludgeKg,
    mgOH2Sludge: currentMgOH2SludgeKg,
    theoreticalPh: current.finalPh,
    carbonateHardness: rawCaCH + rawMgCH,
    nonCarbonateHardness: rawCaNCH + rawMgNCH,
    removedCa: current.actualRemovedCaCH + current.actualRemovedCaNCH,
    removedMg: current.actualRemovedMg,
    achievedCa: current.achievedCa,
    achievedMg: current.achievedMg,
    alkalinityAfter: Alkalinity_mgL,
    pAlkalinity: (Alkalinity_mgL / 2) + current.hydroxideAlkAsCaCO3,
    hydroxideAlkalinity: current.hydroxideAlkAsCaCO3,
    chemicalEfficiency: (current.reactiveLimeAsCaCO3 / (current.reactiveLimeAsCaCO3 + current.hydroxideAlkAsCaCO3)) * 100,
    dailyCost: current.cost + dailyDisposalCost,
    dailyLimeCost: current.dailyLimeCost,
    dailySodaAshCost: current.dailySodaAshCost,
    dailyDisposalCost: dailyDisposalCost,
    lsi: lsi,
    ccpp: ccpp,
    optimization: {
      alternativeCost: alternative.cost + altDailyDisposalCost,
      alternativeLimeDose: alternative.lDose,
      alternativeSodaAshDose: alternative.sDose,
      alternativeCa: alternative.achievedCa,
      alternativeMg: alternative.achievedMg,
      savingsPotential,
      isOptimal: savingsPotential <= 0
    }
  };
};
