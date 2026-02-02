
import { GoogleGenAI } from "@google/genai";
import { WaterQuality, SofteningTargets, CalculationResults } from "../types";

export const getGeminiAdvice = async (
  water: WaterQuality,
  targets: SofteningTargets,
  results: CalculationResults
): Promise<string> => {
  // Use gemini-3-pro-preview for complex technical reasoning tasks.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    As a water treatment process engineer, analyze the following lime-soda softening scenario:
    
    RAW WATER:
    - pH: ${water.ph}
    - Conductivity: ${water.conductivity} µS/cm
    - Ca: ${water.ca} mg/L as CaCO₃
    - Mg: ${water.mg} mg/L as CaCO₃
    - Alkalinity: ${water.alkalinity} mg/L as CaCO₃
    - Temp: ${water.temperature} °C
    
    TARGETS:
    - Target Ca: ${targets.targetCa} mg/L as CaCO₃
    - Target Mg: ${targets.targetMg} mg/L as CaCO₃
    - Soda ash enabled: ${targets.dosingMode === 'LIME_SODA'}
    
    CALCULATED RESULTS:
    - Lime dose: ${results.limeDose.toFixed(2)} mg/L (as Ca(OH)₂)
    - Soda ash dose: ${results.sodaAshDose.toFixed(2)} mg/L (as Na₂CO₃)
    - Sludge: ${results.sludgeProduction.toFixed(2)} kg/d
    - Target pH: ${results.theoreticalPh.toFixed(1)}
    
    Please provide:
    1. A brief validation of whether these targets are efficient.
    2. Comments on potential scaling issues or stability (LSI/RSI index hints).
    3. Advice on whether "Split Treatment" might be more cost-effective.
    4. Safety or handling tips for the chemicals involved (Lime, Soda Ash).
    
    Keep the tone professional, technical, and concise. Use markdown for formatting.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
    });
    return response.text || "Unable to retrieve advice at this time.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error connecting to the Process Advisor. Please check your inputs.";
  }
};
