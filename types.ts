
export interface WaterQuality {
  ph: number;
  conductivity: number;
  ca: number; // as CaCO₃
  mg: number; // as CaCO₃
  totalHardness: number; // as CaCO₃
  alkalinity: number; // as CaCO₃
  temperature: number; // °C
  sulphate: number; // mg/L
  chloride: number; // mg/L
  flowRate: number; // ML/d
  limeCostPerTonne: number; // $/tonne
  sodaAshCostPerTonne: number; // $/tonne
  sludgeDisposalCostPerKg: number; // $/kg
}

export interface SofteningTargets {
  targetCa: number;
  targetMg: number;
  dosingMode: 'LIME_ONLY' | 'LIME_SODA';
}

export interface CalculationResults {
  limeDose: number; // mg/L as Ca(OH)₂
  sodaAshDose: number; // mg/L as Na₂CO₃
  sludgeProduction: number; // kg/d (total)
  caCO3Sludge: number; // kg/d
  mgOH2Sludge: number; // kg/d
  theoreticalPh: number;
  carbonateHardness: number;
  nonCarbonateHardness: number;
  removedCa: number;
  removedMg: number;
  achievedCa: number;
  achievedMg: number;
  alkalinityAfter: number; // Total alkalinity
  pAlkalinity: number; // Phenolphthalein alkalinity
  hydroxideAlkalinity: number; // Hydroxide surplus (OH⁻)
  chemicalEfficiency: number; // %
  dailyCost: number; // Total daily cost
  dailyLimeCost: number;
  dailySodaAshCost: number;
  dailyDisposalCost: number;
  lsi: number; // Langelier Saturation Index
  ccpp: number; // Calcium Carbonate Precipitation Potential (mg/L as CaCO3)
  optimization?: {
    alternativeCost: number;
    alternativeLimeDose: number;
    alternativeSodaAshDose: number;
    alternativeCa: number;
    alternativeMg: number;
    savingsPotential: number;
    isOptimal: boolean;
  };
}
