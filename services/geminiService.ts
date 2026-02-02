
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
    - Ca: ${water.ca} mg/L as CaCO₃
    - Mg: ${water.mg} mg/L as CaCO₃
    - Alkalinity: ${water.alkalinity} mg/L as CaCO₃
    - Temp: ${water.temperature} °C
    
    TARGETS:
    - Target Ca: ${targets.targetCa} mg/L as CaCO₃
    - Target Mg: ${targets.targetMg} mg/L as CaCO₃
    
    CALCULATED RESULTS & STABILITY:
    - Lime dose: ${results.limeDose.toFixed(2)} mg/L (as Ca(OH)₂)
    - Soda ash dose: ${results.sodaAshDose.toFixed(2)} mg/L (as Na₂CO₃)
    - Target pH: ${results.theoreticalPh.toFixed(1)}
    - Langelier Saturation Index (LSI): ${results.lsi.toFixed(2)}
    - CCPP (Precipitation Potential): ${results.ccpp.toFixed(1)} mg/L as CaCO₃
    
    Please provide:
    1. A brief validation of whether these targets are efficient.
    2. Deep insights on the post-softening stability (scaling vs corrosive) based on LSI/CCPP.
    3. Advice on whether "Split Treatment" or stabilization (recarbonation/acid) is needed.
    4. Safety or handling tips for the chemicals involved.
    
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
