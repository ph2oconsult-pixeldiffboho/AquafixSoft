
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

    const byproductCaNCH = actualRemovedMgNCH;
    const potentialTotalCaNCH = rawCaNCH + byproductCaNCH;
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
      // Fix: include actualRemovedMgNCH in return object to resolve property error
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
    alkalinityAfter: 35 + current.hydroxideAlkAsCaCO3,
    pAlkalinity: 17.5 + current.hydroxideAlkAsCaCO3,
    hydroxideAlkalinity: current.hydroxideAlkAsCaCO3,
    chemicalEfficiency: (current.reactiveLimeAsCaCO3 / (current.reactiveLimeAsCaCO3 + current.hydroxideAlkAsCaCO3)) * 100,
    dailyCost: current.cost + dailyDisposalCost,
    dailyLimeCost: current.dailyLimeCost,
    dailySodaAshCost: current.dailySodaAshCost,
    dailyDisposalCost: dailyDisposalCost,
    speciation: {
      raw: { caCH: rawCaCH, caNCH: rawCaNCH, mgCH: rawMgCH, mgNCH: rawMgNCH },
      treated: { 
        caCH: rawCaCH - current.actualRemovedCaCH, 
        // Fix: Use current.actualRemovedMgNCH for byproduct calculation and resolve property error
        caNCH: (rawCaNCH + current.actualRemovedMgNCH) - current.actualRemovedCaNCH, 
        mgCH: rawMgCH - current.actualRemovedMgCH, 
        mgNCH: rawMgNCH - current.actualRemovedMgNCH 
      }
    },
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

function byproductCaNCH(mode: string, mgNCH: number) {
    // This is just a helper used for the speciation logic
    return 0; // The logic is handled inline in the actual calculation above for NCH byproduct
}
