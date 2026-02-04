
import React, { useState, useMemo } from 'react';
import { 
  Droplets, 
  Settings, 
  Trash2, 
  Zap, 
  Beaker, 
  ChevronRight, 
  Activity,
  ClipboardList, 
  FlaskConical,
  Waves,
  ArrowDownToLine,
  CheckCircle2,
  Info,
  Thermometer,
  CloudRain,
  ShieldCheck,
  TrendingDown,
  Coins,
  Sparkles,
  Repeat,
  Lightbulb,
  ArrowUpDown,
  BookOpen,
  DollarSign,
  PieChart as PieChartIcon,
  Receipt,
  Flame,
  Snowflake,
  SlidersHorizontal,
  ArrowRight,
  Wind
} from 'lucide-react';
import { 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { WaterQuality, SofteningTargets, CalculationResults } from './types';
import { calculateSoftening } from './utils/calculations';
import { getGeminiAdvice } from './services/geminiService';

const ProcessFlowDiagram: React.FC<{ water: WaterQuality; results: CalculationResults; targets: SofteningTargets }> = ({ water, results, targets }) => {
  return (
    <div className="w-full bg-white rounded-[2.5rem] shadow-xl border border-slate-200/60 p-8 overflow-hidden relative">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-blue-500/10 p-3 rounded-2xl shadow-inner"><Wind className="w-6 h-6 text-blue-600" /></div>
        <h2 className="font-black text-sm tracking-[0.2em] text-slate-400 uppercase leading-none">Process Flow Architecture</h2>
      </div>

      <div className="relative h-[450px] w-full flex items-center justify-center">
        {/* SVG Diagram Layer */}
        <svg viewBox="0 0 800 450" className="w-full h-full drop-shadow-sm">
          {/* Defined Gradients and Markers */}
          <defs>
            <linearGradient id="vesselBodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f8fafc" />
              <stop offset="70%" stopColor="#f1f5f9" />
              <stop offset="100%" stopColor="#e2e8f0" />
            </linearGradient>
            <linearGradient id="sludgeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#64748b" stopOpacity="0.6" />
            </linearGradient>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#cbd5e1" />
            </marker>
          </defs>

          {/* Flow Lines */}
          {/* Raw Water In (Entering center draft tube) */}
          <path d="M 50 225 L 340 225" stroke="#cbd5e1" strokeWidth="3" fill="none" markerEnd="url(#arrowhead)" />
          
          {/* Chemical Injection Lines */}
          <path d="M 320 50 L 320 100" stroke="#3b82f6" strokeWidth="2" strokeDasharray="5,5" fill="none" markerEnd="url(#arrowhead)" />
          <path d="M 430 50 L 430 100" stroke="#6366f1" strokeWidth="2" strokeDasharray="5,5" fill="none" markerEnd="url(#arrowhead)" />

          {/* Treated Water Out (Launders at top) */}
          <path d="M 480 135 L 750 135" stroke="#10b981" strokeWidth="3" fill="none" markerEnd="url(#arrowhead)" />
          
          {/* Sludge Blowdown (From conical bottom) */}
          <path d="M 375 380 L 375 420 L 550 420" stroke="#94a3b8" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)" />

          {/* Realistic Clarifier Vessel Shape (Solids Contact Style) */}
          {/* Main Body: Cylindrical top + Conical bottom */}
          <path 
            d="M 275 100 L 475 100 L 475 250 L 375 380 L 275 250 Z" 
            fill="url(#vesselBodyGrad)" 
            stroke="#cbd5e1" 
            strokeWidth="2" 
          />
          
          {/* Internal Reaction Well / Draft Tube */}
          <rect x="340" y="100" width="70" height="180" fill="#cbd5e1" fillOpacity="0.1" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="2,2" />
          
          {/* Sludge Blanket Representation */}
          <path 
            d="M 275 250 L 475 250 L 375 380 Z" 
            fill="url(#sludgeGrad)" 
          />

          {/* Internal Mixer Turbine */}
          <g transform="translate(375, 260)">
            <circle r="12" fill="#3b82f6" fillOpacity="0.2" className="animate-pulse" />
            <path d="M -15 0 L 15 0 M 0 -15 L 0 15" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" className="animate-[spin_3s_linear_infinite]" />
          </g>

          {/* Animated Floc Particles */}
          <circle cx="360" cy="220" r="2" fill="#94a3b8" className="animate-bounce" />
          <circle cx="390" cy="240" r="2" fill="#94a3b8" className="animate-bounce" style={{ animationDelay: '0.5s' }} />
          <circle cx="375" cy="300" r="3" fill="#64748b" className="animate-pulse" />

          {/* Dynamic Labels */}
          {/* Intake Label */}
          <foreignObject x="20" y="180" width="160" height="70">
            <div className="bg-white/90 backdrop-blur-sm border border-slate-100 p-2 rounded-xl shadow-sm">
              <span className="block text-[7px] font-black text-slate-400 uppercase tracking-widest mb-1">Raw Intake</span>
              <div className="flex items-baseline gap-1">
                <span className="text-xs font-black text-slate-800">{water.flowRate.toFixed(1)} <span className="text-[8px] font-bold text-slate-400">ML/d</span></span>
              </div>
              <span className="block text-[7px] font-bold text-slate-400">pH {water.ph.toFixed(1)}</span>
            </div>
          </foreignObject>

          {/* Lime/Soda Labels */}
          <foreignObject x="260" y="10" width="100" height="40">
            <div className="text-center">
              <span className="block text-[7px] font-black text-blue-600 uppercase tracking-widest">Lime</span>
              <span className="text-[10px] font-black text-blue-900">{results.limeDose.toFixed(1)} <span className="text-[7px]">mg/L</span></span>
            </div>
          </foreignObject>
          <foreignObject x="390" y="10" width="100" height="40">
            <div className="text-center">
              <span className="block text-[7px] font-black text-indigo-600 uppercase tracking-widest">Soda Ash</span>
              <span className="text-[10px] font-black text-indigo-900">{results.sodaAshDose.toFixed(1)} <span className="text-[7px]">mg/L</span></span>
            </div>
          </foreignObject>

          {/* Reactor Zone Label */}
          <foreignObject x="275" y="280" width="200" height="40">
            <div className="text-center">
              <span className="block text-[8px] font-black text-slate-500 uppercase tracking-widest">Reaction Well</span>
              <span className="block text-[7px] font-bold text-slate-400 italic">Mixing & Flocculation</span>
            </div>
          </foreignObject>

          {/* Effluent Label */}
          <foreignObject x="580" y="95" width="180" height="70">
            <div className="bg-emerald-50 border border-emerald-100 p-2 rounded-xl shadow-sm text-right">
              <span className="block text-[7px] font-black text-emerald-600 uppercase tracking-widest mb-1">Clarified Effluent</span>
              <div className="flex items-baseline justify-end gap-1">
                <span className="text-xs font-black text-emerald-900">{(results.achievedCa + results.achievedMg).toFixed(0)} <span className="text-[8px] font-bold text-emerald-400">mg/L TH</span></span>
              </div>
              <span className="block text-[7px] font-bold text-emerald-500">pH {results.theoreticalPh.toFixed(2)}</span>
            </div>
          </foreignObject>

          {/* Sludge Label */}
          <foreignObject x="560" y="395" width="160" height="50">
            <div className="bg-slate-50 border border-slate-200 p-2 rounded-xl flex items-center justify-between">
              <div>
                <span className="block text-[7px] font-black text-slate-400 uppercase tracking-widest">Waste Sludge</span>
                <span className="text-[10px] font-black text-slate-800">{results.sludgeProduction.toFixed(0)} <span className="text-[7px] text-slate-400">kg/d</span></span>
              </div>
              <Trash2 className="w-3 h-3 text-slate-300" />
            </div>
          </foreignObject>
        </svg>

        {/* Component Descriptions Overlay */}
        <div className="absolute bottom-4 left-8 text-[8px] font-bold text-slate-400 uppercase tracking-widest space-y-1">
           <div className="flex items-center gap-2">
              <div className="w-2 h-0.5 bg-slate-300 border-t border-dashed" />
              <span>Draft Tube / Reaction Well</span>
           </div>
           <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-slate-300 opacity-40 rounded-sm" />
              <span>Sludge Blanket Zone</span>
           </div>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [water, setWater] = useState<WaterQuality>({
    ph: 7.8,
    conductivity: 450,
    ca: 180.0,
    mg: 60.0,
    totalHardness: 240,
    alkalinity: 210.0,
    temperature: 20.0,
    sulphate: 45,
    chloride: 30,
    flowRate: 120,
    limeCostPerTonne: 350,
    sodaAshCostPerTonne: 650,
    sludgeDisposalCostPerKg: 0.08,
  });

  const [targets, setTargets] = useState<SofteningTargets>({
    targetCa: 40,
    targetMg: 10,
    dosingMode: 'LIME_SODA',
    adjustmentPh: 0 
  });

  const [isAdjustingPh, setIsAdjustingPh] = useState(false);
  const [advice, setAdvice] = useState<string>('');
  const [isLoadingAdvice, setIsLoadingAdvice] = useState(false);

  const results = useMemo(() => calculateSoftening(water, targets), [water, targets]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const rawValue = value === "" ? 0 : parseFloat(value);
    const numValue = isNaN(rawValue) ? 0 : Math.max(0, rawValue);
    
    if (name === 'adjustmentPh') {
      setTargets(prev => ({ ...prev, adjustmentPh: numValue }));
    } else if (name.startsWith('target')) {
      setTargets(prev => ({ ...prev, [name]: numValue as any }));
    } else {
      setWater(prev => ({ ...prev, [name]: numValue }));
    }
  };

  const togglePhAdjustment = () => {
    const newValue = !isAdjustingPh;
    setIsAdjustingPh(newValue);
    if (newValue) {
      setTargets(prev => ({ ...prev, adjustmentPh: 8.50 }));
    } else {
      setTargets(prev => ({ ...prev, adjustmentPh: 0 }));
    }
  };

  const fetchAdvice = async () => {
    setIsLoadingAdvice(true);
    const text = await getGeminiAdvice(water, targets, results);
    setAdvice(text);
    setIsLoadingAdvice(false);
  };

  const sludgePieData = [
    { name: 'CaCO₃ sludge', value: results.caCO3Sludge, color: '#3b82f6' },
    { name: 'Mg(OH)₂ sludge', value: results.mgOH2Sludge, color: '#a855f7' },
  ].filter(d => d.value > 0);

  const safeLSI = Number.isFinite(results.lsi) ? results.lsi : 0;
  const lsiLabel = safeLSI > 0.5 ? 'Scaling' : safeLSI < -0.5 ? 'Corrosive' : 'Stable';
  const lsiColor = safeLSI > 0.5 ? 'text-amber-500' : safeLSI < -0.5 ? 'text-blue-500' : 'text-emerald-500';

  const effectivePh = targets.adjustmentPh && targets.adjustmentPh > 0 ? targets.adjustmentPh : results.theoreticalPh;

  return (
    <div className="min-h-screen pb-12 bg-slate-50 text-slate-900">
      <header className="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-950 text-white shadow-2xl py-10 px-6 mb-8 relative overflow-hidden text-left">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <Waves className="w-full h-full scale-150 rotate-12" />
        </div>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            <div className="bg-blue-400/20 p-4 rounded-3xl backdrop-blur-xl border border-white/20 shadow-2xl">
              <Droplets className="w-12 h-12 text-blue-300 animate-pulse" />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tight flex items-center gap-3 text-white">
                Aquafix Softening <span className="bg-blue-600 text-[12px] px-3 py-1 rounded-full uppercase tracking-widest font-bold border border-blue-400/30 shadow-lg shadow-blue-500/20">Elite</span>
              </h1>
              <p className="text-blue-200/60 text-sm font-semibold mt-1 flex items-center gap-2 tracking-tighter text-left">
                <FlaskConical className="w-4 h-4" /> Professional process control
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 bg-black/30 p-4 rounded-[2rem] border border-white/5 backdrop-blur-md">
            <div className="flex items-center gap-3 px-5 py-2.5 text-xs font-black text-blue-200">
              <TrendingDown className="w-4 h-4 text-emerald-400" /> OPEX efficiency: {results.chemicalEfficiency.toFixed(1)}%
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6 text-left">
          <section className="bg-white rounded-[2.5rem] shadow-xl border border-slate-200/60 p-8">
            <div className="flex items-center gap-3 mb-8 text-left">
              <div className="bg-blue-500/10 p-3 rounded-2xl shadow-inner"><ClipboardList className="w-6 h-6 text-blue-600" /></div>
              <h2 className="font-black text-sm tracking-[0.2em] text-slate-400 uppercase leading-none">Raw water analytics</h2>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-5">
              <InputField label="pH" name="ph" value={water.ph} onChange={handleInputChange} step={0.1} icon={<Activity className="w-3 h-3"/>} />
              <InputField label="Alkalinity" name="alkalinity" value={water.alkalinity} onChange={handleInputChange} step={0.1} icon={<ArrowDownToLine className="w-3 h-3"/>}/>
              <InputField label="Ca (as CaCO₃)" name="ca" value={water.ca} onChange={handleInputChange} step={0.1} />
              <InputField label="Mg (as CaCO₃)" name="mg" value={water.mg} onChange={handleInputChange} step={0.1} />
              <InputField label="Temp (°C)" name="temperature" value={water.temperature} onChange={handleInputChange} step={0.1} icon={<Thermometer className="w-3 h-3"/>} />
              <InputField label="Flow (ML/d)" name="flowRate" value={water.flowRate} onChange={handleInputChange} step={0.1} icon={<CloudRain className="w-3 h-3"/>} />
            </div>
          </section>

          <section className="bg-white rounded-[2.5rem] shadow-xl border border-slate-200/60 p-8">
            <div className="flex items-center gap-3 mb-8 text-left">
              <div className="bg-indigo-500/10 p-3 rounded-2xl shadow-inner"><Settings className="w-6 h-6 text-indigo-600" /></div>
              <h2 className="font-black text-sm tracking-[0.2em] text-slate-400 uppercase leading-none">Target configuration</h2>
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <InputField label="Target Ca" name="targetCa" value={targets.targetCa} onChange={handleInputChange} step={0.1} />
                <InputField label="Target Mg" name="targetMg" value={targets.targetMg} onChange={handleInputChange} step={0.1} />
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                <button 
                  onClick={() => setTargets(t => ({...t, dosingMode: 'LIME_ONLY'}))}
                  className={`flex items-center justify-between p-5 rounded-[1.8rem] border transition-all ${targets.dosingMode === 'LIME_ONLY' ? 'bg-blue-600 border-blue-500 text-white shadow-lg' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                >
                  <div className="flex items-center gap-4 text-left">
                    <FlaskConical className="w-5 h-5 shrink-0" />
                    <span className="block text-sm font-black tracking-tighter leading-none">Lime only</span>
                  </div>
                  {targets.dosingMode === 'LIME_ONLY' && <CheckCircle2 className="w-5 h-5 shrink-0" />}
                </button>
                <button 
                  onClick={() => setTargets(t => ({...t, dosingMode: 'LIME_SODA'}))}
                  className={`flex items-center justify-between p-5 rounded-[1.8rem] border transition-all ${targets.dosingMode === 'LIME_SODA' ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                >
                  <div className="flex items-center gap-4 text-left">
                    <Beaker className="w-5 h-5 shrink-0" />
                    <span className="block text-sm font-black tracking-tighter leading-none">Lime + soda ash</span>
                  </div>
                  {targets.dosingMode === 'LIME_SODA' && <CheckCircle2 className="w-5 h-5 shrink-0" />}
                </button>
              </div>
            </div>
          </section>
        </div>

        <div className="lg:col-span-8 space-y-8 text-left">
          {/* Enhanced Process Flow Diagram */}
          <ProcessFlowDiagram water={water} results={results} targets={targets} />

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <ResultCard 
              icon={<FlaskConical className="w-5 h-5" />}
              label="Lime dose"
              value={results.limeDose.toFixed(1)}
              unit="mg/L"
              subValue={`${(results.limeDose - (results.hydroxideAlkalinity * 0.74)).toFixed(1)} reactive + ${(results.hydroxideAlkalinity * 0.74).toFixed(1)} surplus`}
              color="blue"
            />
             <ResultCard 
              icon={<Beaker className="w-5 h-5" />}
              label="Soda ash dose"
              value={results.sodaAshDose.toFixed(1)}
              unit="mg/L"
              subValue={targets.dosingMode === 'LIME_ONLY' ? "No NCH removal" : "Final cleanup as Na₂CO₃"}
              color="indigo"
            />
            <ResultCard 
              icon={<Activity className="w-5 h-5" />}
              label="Post Lime pH"
              value={results.theoreticalPh.toFixed(2)}
              unit="pH"
              subValue="Theoretical pH after chemical dose"
              color="green"
            />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            <div className="xl:col-span-7 bg-white rounded-[2.5rem] shadow-xl border border-slate-200/60 p-8 h-[550px] flex flex-col text-left">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="bg-indigo-600 p-3 rounded-2xl shadow-lg shadow-indigo-500/20"><ShieldCheck className="w-6 h-6 text-white" /></div>
                  <div>
                    <h2 className="font-black text-xl text-slate-800 tracking-tighter">Post-Softened Stability</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                       Analysis of Treated Quality at pH {effectivePh.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex-1 space-y-6">
                {/* LSI Visualization */}
                <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 relative overflow-hidden">
                   <div className="flex items-center justify-between mb-4 relative z-10">
                      <div>
                        <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Langelier Index (LSI)</span>
                        <div className="flex items-baseline gap-2">
                           <span className={`text-5xl font-black tracking-tighter ${lsiColor}`}>{safeLSI.toFixed(2)}</span>
                           <span className={`text-xs font-bold uppercase tracking-widest ${lsiColor}`}>{lsiLabel}</span>
                        </div>
                      </div>
                      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                         {safeLSI > 0 ? <Flame className="w-8 h-8 text-amber-500" /> : <Snowflake className="w-8 h-8 text-blue-500" />}
                      </div>
                   </div>
                   
                   <div className="relative h-4 w-full bg-slate-200 rounded-full overflow-hidden flex items-center justify-center">
                      <div className="absolute left-0 top-0 h-full w-1/3 bg-blue-400" />
                      <div className="absolute left-1/3 top-0 h-full w-1/3 bg-emerald-400" />
                      <div className="absolute left-2/3 top-0 h-full w-1/3 bg-amber-400" />
                      <div 
                        className="absolute h-6 w-1 bg-slate-900 shadow-lg z-20 transition-all duration-700" 
                        style={{ left: `${Math.min(100, Math.max(0, (safeLSI + 3) / 6 * 100))}%` }} 
                      />
                   </div>
                   <div className="flex justify-between mt-2 px-1">
                      <span className="text-[8px] font-bold text-slate-400">-3.0</span>
                      <span className="text-[8px] font-bold text-slate-400">0.0 (Equilibrium)</span>
                      <span className="text-[8px] font-bold text-slate-400">+3.0</span>
                   </div>
                </div>

                {/* Secondary Stability Metrics */}
                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-slate-50 rounded-3xl p-5 border border-slate-100">
                      <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">CCPP Potential</span>
                      <div className="flex items-baseline gap-1">
                         <span className="text-3xl font-black tracking-tighter text-slate-800">{(results.ccpp || 0).toFixed(1)}</span>
                         <span className="text-[10px] font-black text-slate-400">mg/L</span>
                      </div>
                      <p className="text-[8px] font-medium text-slate-400 mt-2 italic leading-tight text-left">
                         Precipitation potential for TREATED water (Ca: {(results.achievedCa || 0).toFixed(1)} mg/L).
                      </p>
                   </div>
                   <div className="bg-slate-50 rounded-3xl p-5 border border-slate-100">
                      <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Saturation pH (pHs)</span>
                      <div className="flex items-baseline gap-1">
                         <span className="text-3xl font-black tracking-tighter text-slate-800">{(effectivePh - safeLSI).toFixed(2)}</span>
                      </div>
                      <p className="text-[8px] font-medium text-slate-400 mt-2 italic leading-tight text-left">
                         Target pH for zero scaling tendency at current treated composition.
                      </p>
                   </div>
                </div>

                {/* pH Stabilization Control */}
                <div className="bg-indigo-50/80 rounded-[2rem] p-6 border-2 border-indigo-100/50 shadow-inner">
                   <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                         <div className="p-2 bg-indigo-500 rounded-xl shadow-lg">
                            <SlidersHorizontal className="w-5 h-5 text-white" />
                         </div>
                         <div>
                            <span className="block text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none">Stabilization Simulator</span>
                            <h4 className="text-sm font-black text-indigo-900 tracking-tight">Adjust Final Water pH</h4>
                         </div>
                      </div>
                      <button 
                        onClick={togglePhAdjustment}
                        className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-[10px] font-black uppercase transition-all shadow-sm border ${isAdjustingPh ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-white border-indigo-200 text-indigo-400 hover:bg-indigo-100'}`}
                      >
                         {isAdjustingPh ? <CheckCircle2 className="w-3 h-3" /> : <Repeat className="w-3 h-3" />}
                         {isAdjustingPh ? 'Stabilization Enabled' : 'Simulate Adjustment'}
                      </button>
                   </div>

                   {isAdjustingPh ? (
                     <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="flex items-center gap-6">
                           <div className="flex-1">
                              <label className="text-[9px] font-black text-indigo-400 uppercase tracking-widest ml-1 mb-2 block">Set Stabilized pH Target</label>
                              <div className="relative">
                                 <input 
                                    type="range"
                                    name="adjustmentPh"
                                    min="6.5"
                                    max="11.5"
                                    step="0.01"
                                    value={targets.adjustmentPh || 8.50}
                                    onChange={handleInputChange}
                                    className="w-full h-2 bg-indigo-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                 />
                                 <div className="flex justify-between mt-1 px-1">
                                    <span className="text-[8px] font-bold text-indigo-300">6.50</span>
                                    <span className="text-[8px] font-bold text-indigo-300">Reactor pH: {results.theoreticalPh.toFixed(2)}</span>
                                    <span className="text-[8px] font-bold text-indigo-300">11.50</span>
                                 </div>
                              </div>
                           </div>
                           <div className="bg-white px-5 py-3 rounded-2xl shadow-sm border border-indigo-100 min-w-[100px] text-center">
                              <span className="block text-[8px] font-black text-slate-400 uppercase tracking-tighter mb-1">Target pH</span>
                              <span className="text-2xl font-black text-indigo-600 tracking-tighter">{targets.adjustmentPh?.toFixed(2)}</span>
                           </div>
                        </div>
                     </div>
                   ) : (
                     <div className="flex items-center gap-3 text-indigo-300 py-2">
                        <Info className="w-4 h-4" />
                        <span className="text-[10px] font-bold italic text-left">Simulate effect of recarbonation/acid dosing from the current process pH ({results.theoreticalPh.toFixed(2)}).</span>
                     </div>
                   )}
                </div>
              </div>
            </div>

            <div className="xl:col-span-5 bg-white rounded-[2.5rem] shadow-xl border border-slate-200/60 p-8 flex flex-col items-center justify-between relative overflow-hidden h-[550px] text-left">
               <div className="w-full flex items-center justify-between mb-2">
                 <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                   <Trash2 className="w-4 h-4 text-slate-300" /> Sludge mass balance
                 </h3>
               </div>
               
               <div className="relative w-full h-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sludgePieData}
                      cx="50%"
                      cy="48%"
                      innerRadius={80}
                      outerRadius={120}
                      paddingAngle={8}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {sludgePieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{borderRadius: '24px', border: 'none', fontWeight: 'bold'}} />
                  </PieChart>
                </ResponsiveContainer>
                
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-14 text-center px-6">
                   <span className="text-4xl font-black text-slate-800 tracking-tighter">{(results.sludgeProduction || 0).toFixed(0)}</span>
                   <span className="text-[10px] font-black text-slate-400 tracking-widest block">kg/d dry</span>
                </div>
               </div>

               <div className="w-full grid grid-cols-1 gap-3 mt-4">
                  <div className="flex items-center justify-between px-6 py-3 bg-blue-50/50 rounded-2xl border border-blue-100">
                    <span className="text-[10px] font-black text-blue-600 tracking-widest">CaCO₃ sludge</span>
                    <span className="text-sm font-black text-blue-900">{(results.caCO3Sludge || 0).toFixed(1)} kg</span>
                  </div>
                  <div className="flex items-center justify-between px-6 py-3 bg-purple-50/50 rounded-2xl border border-purple-100">
                    <span className="text-[10px] font-black text-purple-600 tracking-widest">Mg(OH)₂ sludge</span>
                    <span className="text-sm font-black text-purple-900">{(results.mgOH2Sludge || 0).toFixed(1)} kg</span>
                  </div>
               </div>
            </div>
          </div>

          <section className="bg-slate-950 text-slate-100 rounded-[3rem] shadow-2xl overflow-hidden border border-white/5 relative text-left">
            <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none text-blue-500">
              <Activity className="w-64 h-64" />
            </div>
            <div className="p-12 relative z-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 mb-10">
                <div className="flex items-center gap-6">
                  <div className="bg-blue-600/20 p-5 rounded-[2rem] border border-blue-500/30 backdrop-blur-2xl shadow-inner shrink-0 text-left">
                    <Zap className="w-10 h-10 text-blue-400" />
                  </div>
                  <div className="text-left">
                    <h2 className="font-black text-3xl tracking-tighter text-white">Engineering intelligence</h2>
                    <p className="text-blue-400 text-[11px] font-black uppercase tracking-[0.3em] mt-1 text-left">Stoichiometric analysis engine</p>
                  </div>
                </div>
                <button 
                  onClick={fetchAdvice}
                  disabled={isLoadingAdvice}
                  className="group flex items-center gap-4 px-10 py-5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-900 transition-all rounded-[1.8rem] text-sm font-black shadow-[0_20px_40px_rgba(37,99,235,0.3)] border border-blue-400/20 text-white shrink-0 active:scale-95"
                >
                  {isLoadingAdvice ? <Activity className="w-5 h-5 animate-spin" /> : <>Refresh analysis <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>}
                </button>
              </div>

              {advice ? (
                <div className="prose prose-invert prose-sm max-w-none bg-white/5 p-12 rounded-[2.5rem] border border-white/10 backdrop-blur-xl leading-relaxed text-slate-300 text-left">
                   <div dangerouslySetInnerHTML={{ __html: advice.replace(/\n/g, '<br/>') }} />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-24 border-4 border-dashed border-white/5 rounded-[3rem]">
                  <p className="text-xs font-black uppercase tracking-[0.4em] text-slate-600 text-center">Awaiting chemical configuration.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      <footer className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-slate-200">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 pb-12">
          <div className="flex-1 text-left">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <BookOpen className="w-3 h-3" /> Process nomenclature & footnotes
            </h4>
            <div className="flex flex-wrap gap-x-8 gap-y-2">
              <GlossaryItem term="CH" definition="Carbonate hardness" />
              <GlossaryItem term="NCH" definition="Non-carbonate hardness" />
              <GlossaryItem term="TH" definition="Total hardness" />
              <GlossaryItem term="Ca" definition="Calcium (as CaCO₃)" />
              <GlossaryItem term="Mg" definition="Magnesium (as CaCO₃)" />
              <GlossaryItem term="pH" definition="Potential of hydrogen" />
              <GlossaryItem term="LSI" definition="Langelier saturation index" />
              <GlossaryItem term="CCPP" definition="CaCO₃ precipitation potential" />
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-300 tracking-tighter uppercase italic text-right">
              Professional engineering tool — stoichiometric accuracy verified
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

interface GlossaryItemProps {
  term: string;
  definition: string;
}

const GlossaryItem: React.FC<GlossaryItemProps> = ({ term, definition }) => (
  <div className="flex items-center gap-2">
    <span className="text-[10px] font-black text-slate-600 tracking-tight">{term}:</span>
    <span className="text-[10px] font-medium text-slate-400 italic">{definition}</span>
  </div>
);

interface InputFieldProps {
  label: string;
  name: string;
  value: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  step?: number;
  icon?: React.ReactNode;
}

const InputField: React.FC<InputFieldProps> = ({ label, name, value, onChange, step = 1, icon }) => (
  <div className="flex flex-col gap-1.5 text-left">
    <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 tracking-[0.1em] ml-2 leading-none text-left">
      {icon} {label}
    </label>
    <input
      type="number"
      name={name}
      min="0"
      value={value === 0 ? "" : value}
      onChange={onChange}
      step={step}
      placeholder="0"
      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm font-black text-slate-700 outline-none hover:border-slate-300 shadow-sm"
    />
  </div>
);

interface ResultCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit: string;
  subValue: string;
  color: 'blue' | 'indigo' | 'slate' | 'green';
}

const ResultCard: React.FC<ResultCardProps> = ({ icon, label, value, unit, subValue, color }) => {
  const colorClasses = {
    blue: 'text-blue-700 bg-white border-slate-200',
    indigo: 'text-indigo-700 bg-white border-slate-200',
    slate: 'text-slate-700 bg-white border-slate-200',
    green: 'text-emerald-700 bg-white border-slate-200',
  };

  const iconClasses = {
    blue: 'bg-blue-100 text-blue-600',
    indigo: 'bg-indigo-100 text-indigo-600',
    slate: 'bg-slate-100 text-slate-600',
    green: 'bg-emerald-100 text-emerald-600',
  };

  return (
    <div className={`p-8 rounded-[2.5rem] border ${colorClasses[color]} transition-all duration-500 shadow-xl bg-white group relative overflow-hidden text-left hover:-translate-y-2 h-full flex flex-col justify-center`}>
       <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none translate-x-4 -translate-y-4 scale-150 rotate-12 text-slate-400 group-hover:rotate-45 transition-transform duration-700">
        {icon}
      </div>
      <div className="flex items-center gap-4 mb-5 text-left">
        <div className={`p-3.5 rounded-2xl ${iconClasses[color]} transition-all group-hover:scale-110`}>{icon}</div>
        <span className="text-[10px] font-black tracking-[0.1em] text-slate-400 uppercase leading-none">{label}</span>
      </div>
      <div className="flex items-baseline gap-2.5 text-left">
        <span className="text-4xl font-black tracking-tighter text-slate-900 leading-none">{value}</span>
        {unit && <span className="text-[12px] font-black text-slate-300 tracking-widest">{unit}</span>}
      </div>
      <p className="text-[10px] mt-4 font-bold text-slate-400 tracking-tight opacity-70 group-hover:opacity-100 leading-relaxed text-left">{subValue}</p>
    </div>
  );
};

export default App;
