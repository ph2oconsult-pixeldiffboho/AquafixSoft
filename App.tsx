
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
  Scale,
  FlaskConical,
  Waves,
  ArrowDownToLine,
  CheckCircle2,
  Info,
  Thermometer,
  CloudRain,
  ArrowRight,
  ShieldCheck,
  TrendingDown,
  Coins,
  Sparkles,
  Banknote,
  Repeat,
  AlertCircle,
  Lightbulb,
  ArrowUpDown,
  HelpCircle,
  BookOpen,
  DollarSign,
  TrendingUp,
  Minus,
  PieChart as PieChartIcon,
  Receipt,
  ShieldAlert,
  Flame,
  Snowflake
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { WaterQuality, SofteningTargets, CalculationResults } from './types';
import { calculateSoftening } from './utils/calculations';
import { getGeminiAdvice } from './services/geminiService';

const App: React.FC = () => {
  const [water, setWater] = useState<WaterQuality>({
    ph: 7.8,
    conductivity: 450,
    ca: 180,
    mg: 60,
    totalHardness: 240,
    alkalinity: 210,
    temperature: 20,
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
    dosingMode: 'LIME_SODA'
  });

  const [advice, setAdvice] = useState<string>('');
  const [isLoadingAdvice, setIsLoadingAdvice] = useState(false);

  const results = useMemo(() => calculateSoftening(water, targets), [water, targets]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const rawValue = value === "" ? 0 : parseFloat(value);
    const numValue = isNaN(rawValue) ? 0 : Math.max(0, rawValue);
    
    if (name.startsWith('target')) {
      setTargets(prev => ({ ...prev, [name]: numValue }));
    } else {
      setWater(prev => ({ ...prev, [name]: numValue }));
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

  const costPieData = [
    { name: 'Lime cost', value: results.dailyLimeCost, color: '#3b82f6' },
    { name: 'Soda ash cost', value: results.dailySodaAshCost, color: '#6366f1' },
    { name: 'Disposal cost', value: results.dailyDisposalCost, color: '#10b981' },
  ].filter(d => d.value > 0);

  const lsiLabel = results.lsi > 0.5 ? 'Scaling' : results.lsi < -0.5 ? 'Corrosive' : 'Stable';
  const lsiColor = results.lsi > 0.5 ? 'text-amber-500' : results.lsi < -0.5 ? 'text-blue-500' : 'text-emerald-500';

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
              <h2 className="font-black text-sm tracking-[0.2em] text-slate-400 uppercase">Raw water analytics</h2>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-5">
              <InputField label="pH" name="ph" value={water.ph} onChange={handleInputChange} step={0.1} icon={<Activity className="w-3 h-3"/>} />
              <InputField label="Alkalinity" name="alkalinity" value={water.alkalinity} onChange={handleInputChange} icon={<ArrowDownToLine className="w-3 h-3"/>}/>
              <InputField label="Ca (as CaCO₃)" name="ca" value={water.ca} onChange={handleInputChange} />
              <InputField label="Mg (as CaCO₃)" name="mg" value={water.mg} onChange={handleInputChange} />
              <InputField label="Temp (°C)" name="temperature" value={water.temperature} onChange={handleInputChange} icon={<Thermometer className="w-3 h-3"/>} />
              <InputField label="Flow (ML/d)" name="flowRate" value={water.flowRate} onChange={handleInputChange} step={0.1} icon={<CloudRain className="w-3 h-3"/>} />
            </div>
          </section>

          <section className="bg-white rounded-[2.5rem] shadow-xl border border-slate-200/60 p-8">
            <div className="flex items-center gap-3 mb-8 text-left">
              <div className="bg-indigo-500/10 p-3 rounded-2xl shadow-inner"><Settings className="w-6 h-6 text-indigo-600" /></div>
              <h2 className="font-black text-sm tracking-[0.2em] text-slate-400 uppercase">Target configuration</h2>
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <InputField label="Target Ca" name="targetCa" value={targets.targetCa} onChange={handleInputChange} />
                <InputField label="Target Mg" name="targetMg" value={targets.targetMg} onChange={handleInputChange} />
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <ResultCard 
              icon={<FlaskConical className="w-5 h-5" />}
              label="Lime dose"
              value={results.limeDose.toFixed(1)}
              unit="mg/L"
              subValue={`${(results.limeDose - (results.hydroxideAlkalinity * 0.74)).toFixed(1)} reactive + ${(results.hydroxideAlkalinity * 0.74).toFixed(1)} surplus as Ca(OH)₂`}
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
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            <div className="xl:col-span-7 bg-white rounded-[2.5rem] shadow-xl border border-slate-200/60 p-8 h-[500px] flex flex-col text-left">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="bg-indigo-600 p-3 rounded-2xl shadow-lg shadow-indigo-500/20"><ShieldCheck className="w-6 h-6 text-white" /></div>
                  <div>
                    <h2 className="font-black text-xl text-slate-800 tracking-tighter">Water Stability & Saturation</h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">LSI & CCPP Characterization</p>
                  </div>
                </div>
              </div>
              
              <div className="flex-1 space-y-8 py-4">
                <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 relative overflow-hidden">
                   <div className="flex items-center justify-between mb-6 relative z-10">
                      <div>
                        <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Langelier Index (LSI)</span>
                        <div className="flex items-baseline gap-2">
                           <span className={`text-5xl font-black tracking-tighter ${lsiColor}`}>{results.lsi.toFixed(2)}</span>
                           <span className={`text-xs font-bold uppercase tracking-widest ${lsiColor}`}>{lsiLabel}</span>
                        </div>
                      </div>
                      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                         {results.lsi > 0 ? <Flame className="w-8 h-8 text-amber-500" /> : <Snowflake className="w-8 h-8 text-blue-500" />}
                      </div>
                   </div>
                   
                   <div className="relative h-4 w-full bg-slate-200 rounded-full overflow-hidden flex items-center justify-center">
                      <div className="absolute left-0 top-0 h-full w-1/3 bg-blue-400" />
                      <div className="absolute left-1/3 top-0 h-full w-1/3 bg-emerald-400" />
                      <div className="absolute left-2/3 top-0 h-full w-1/3 bg-amber-400" />
                      <div 
                        className="absolute h-6 w-1 bg-slate-900 shadow-lg z-20 transition-all duration-700" 
                        style={{ left: `${Math.min(100, Math.max(0, (results.lsi + 3) / 6 * 100))}%` }} 
                      />
                   </div>
                   <div className="flex justify-between mt-2 px-1">
                      <span className="text-[8px] font-bold text-slate-400">-3.0</span>
                      <span className="text-[8px] font-bold text-slate-400">0.0 (Equilibrium)</span>
                      <span className="text-[8px] font-bold text-slate-400">+3.0</span>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                   <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                      <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">CCPP Potential</span>
                      <div className="flex items-baseline gap-1">
                         <span className="text-3xl font-black tracking-tighter text-slate-800">{results.ccpp.toFixed(1)}</span>
                         <span className="text-[10px] font-black text-slate-400">mg/L</span>
                      </div>
                      <p className="text-[9px] font-medium text-slate-400 mt-2 italic leading-tight">
                         Mass of CaCO₃ expected to precipitate at equilibrium.
                      </p>
                   </div>
                   <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                      <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Saturation pH (pHs)</span>
                      <div className="flex items-baseline gap-1">
                         <span className="text-3xl font-black tracking-tighter text-slate-800">{(results.theoreticalPh - results.lsi).toFixed(2)}</span>
                      </div>
                      <p className="text-[9px] font-medium text-slate-400 mt-2 italic leading-tight">
                         Calculated pH at which water is in equilibrium with CaCO₃.
                      </p>
                   </div>
                </div>
              </div>
            </div>

            <div className="xl:col-span-5 bg-white rounded-[2.5rem] shadow-xl border border-slate-200/60 p-8 flex flex-col items-center justify-between relative overflow-hidden h-[500px] text-left">
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
                   <span className="text-4xl font-black text-slate-800 tracking-tighter">{results.sludgeProduction.toFixed(0)}</span>
                   <span className="text-[10px] font-black text-slate-400 tracking-widest block">kg/d dry</span>
                </div>
               </div>

               <div className="w-full grid grid-cols-1 gap-3 mt-4">
                  <div className="flex items-center justify-between px-6 py-3 bg-blue-50/50 rounded-2xl border border-blue-100">
                    <span className="text-[10px] font-black text-blue-600 tracking-widest">CaCO₃ sludge</span>
                    <span className="text-sm font-black text-blue-900">{results.caCO3Sludge.toFixed(1)} kg</span>
                  </div>
                  <div className="flex items-center justify-between px-6 py-3 bg-purple-50/50 rounded-2xl border border-purple-100">
                    <span className="text-[10px] font-black text-purple-600 tracking-widest">Mg(OH)₂ sludge</span>
                    <span className="text-sm font-black text-purple-900">{results.mgOH2Sludge.toFixed(1)} kg</span>
                  </div>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            <div className="xl:col-span-4 flex flex-col gap-6 text-left">
              <section className="bg-white rounded-[2.5rem] shadow-xl border border-slate-200/60 p-8 h-full">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-amber-500/10 p-3 rounded-2xl shadow-inner"><Coins className="w-6 h-6 text-amber-600" /></div>
                  <h2 className="font-black text-sm tracking-[0.2em] text-slate-400 uppercase leading-none">Chemical costs</h2>
                </div>
                <div className="space-y-4">
                  <InputField label="Lime ($/t)" name="limeCostPerTonne" value={water.limeCostPerTonne} onChange={handleInputChange} icon={<DollarSign className="w-3 h-3"/>} />
                  <InputField label="Soda ash ($/t)" name="sodaAshCostPerTonne" value={water.sodaAshCostPerTonne} onChange={handleInputChange} icon={<DollarSign className="w-3 h-3"/>} />
                  <InputField label="Sludge disposal ($/kg)" name="sludgeDisposalCostPerKg" value={water.sludgeDisposalCostPerKg} onChange={handleInputChange} step={0.01} icon={<Trash2 className="w-3 h-3"/>} />
                </div>
              </section>
            </div>

            <div className="xl:col-span-8 space-y-6 text-left">
              {/* Strategy Comparison taking full width of the col-span-8 */}
              <section className="bg-emerald-600 text-white rounded-[2.5rem] shadow-2xl p-8 relative overflow-hidden w-full">
                <div className="absolute top-0 right-0 opacity-10 -translate-x-4 translate-y-4 rotate-12"><Lightbulb className="w-24 h-24" /></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <ArrowUpDown className="w-5 h-5 text-emerald-200" />
                      <h3 className="font-black text-sm tracking-widest leading-none uppercase">Economic strategy comparison</h3>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[11px] font-bold">
                      <div className="bg-white/10 p-6 rounded-[2rem] border border-white/5 backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-4 text-emerald-200 border-b border-emerald-400/20 pb-3">
                          <span className="uppercase tracking-tighter text-[10px]">Current Strategy</span>
                          <span className="font-black text-xl">${results.dailyCost.toFixed(0)}</span>
                        </div>
                        <div className="space-y-2 opacity-90">
                          <div className="flex justify-between"><span>Lime Dose:</span> <span>{results.limeDose.toFixed(1)} mg/L</span></div>
                          <div className="flex justify-between"><span>Soda Ash:</span> <span>{results.sodaAshDose.toFixed(1)} mg/L</span></div>
                          <div className="flex flex-col border-t border-white/10 pt-3 mt-3 space-y-1.5">
                            <div className="flex justify-between text-emerald-100/70"><span>Residual Ca:</span> <span>{results.achievedCa.toFixed(1)} mg/L</span></div>
                            <div className="flex justify-between text-emerald-100/70"><span>Residual Mg:</span> <span>{results.achievedMg.toFixed(1)} mg/L</span></div>
                            <div className="flex justify-between text-emerald-100 pt-1 font-black">
                              <span>Final Hardness:</span> <span>{(results.achievedCa + results.achievedMg).toFixed(0)} mg/L</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-emerald-500/30 p-6 rounded-[2rem] border border-emerald-400/20 shadow-inner">
                        <div className="flex items-center justify-between mb-4 text-white border-b border-white/10 pb-3">
                          <span className="uppercase tracking-tighter text-[10px]">Optimized Strategy</span>
                          <span className="font-black text-xl">${results.optimization?.alternativeCost.toFixed(0)}</span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Lime Dose:</span> 
                            <span className={results.optimization && results.optimization.alternativeLimeDose < results.limeDose ? "text-emerald-300" : ""}>
                              {results.optimization?.alternativeLimeDose.toFixed(1)} mg/L
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Soda Ash:</span> 
                            <span className={results.optimization && results.optimization.alternativeSodaAshDose < results.sodaAshDose ? "text-emerald-300" : ""}>
                              {results.optimization?.alternativeSodaAshDose.toFixed(1)} mg/L
                            </span>
                          </div>
                          <div className="flex flex-col border-t border-white/10 pt-3 mt-3 space-y-1.5">
                            <div className="flex justify-between text-white/50"><span>Residual Ca:</span> <span>{results.optimization?.alternativeCa.toFixed(1)} mg/L</span></div>
                            <div className="flex justify-between text-white/50"><span>Residual Mg:</span> <span>{results.optimization?.alternativeMg.toFixed(1)} mg/L</span></div>
                            <div className="flex justify-between text-white pt-1 font-black">
                              <span>Final Hardness:</span> <span>{(results.optimization?.alternativeCa! + results.optimization?.alternativeMg!).toFixed(0)} mg/L</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {results.optimization && results.optimization.savingsPotential > 0 ? (
                      <div className="p-6 bg-amber-400 text-amber-950 rounded-[2rem] flex items-center justify-between shadow-[0_15px_30px_rgba(251,191,36,0.3)]">
                        <div className="flex items-center gap-4 text-left">
                          <div className="bg-amber-500/20 p-3 rounded-xl"><Sparkles className="w-6 h-6 shrink-0" /></div>
                          <div>
                            <span className="block text-[10px] font-black uppercase leading-none mb-1 tracking-tight">Strategy savings potential</span>
                            <span className="block text-xl font-black leading-none tracking-tighter text-left">Save ${results.optimization.savingsPotential.toFixed(0)} per day</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 font-black text-lg bg-white/20 px-4 py-2 rounded-2xl">
                          <TrendingDown className="w-5 h-5" /> -{( (results.optimization.savingsPotential / results.dailyCost) * 100 ).toFixed(1)}%
                        </div>
                      </div>
                    ) : (
                      <div className="p-6 bg-emerald-500/50 rounded-[2rem] flex items-center gap-4 border border-emerald-400/20 text-left">
                        <ShieldCheck className="w-6 h-6 text-emerald-200 shrink-0" />
                        <div>
                          <span className="block text-xs font-black text-emerald-50 uppercase tracking-widest">Thermodynamic optimum achieved</span>
                          <span className="text-[10px] text-emerald-100 opacity-70">Current configuration matches least-cost stoichiometric path.</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* OPEX Breakdown Section */}
              <section className="bg-white rounded-[2.5rem] shadow-xl border border-slate-200/60 p-8 w-full text-left">
                 <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="bg-emerald-100 p-3 rounded-2xl text-emerald-600 shadow-inner"><Receipt className="w-6 h-6" /></div>
                      <div>
                        <h2 className="font-black text-xl text-slate-800 tracking-tighter">Operational Expense (OPEX) Breakdown</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Daily chemical & waste management distribution</p>
                      </div>
                    </div>
                    <div className="bg-emerald-50 px-6 py-3 rounded-2xl border border-emerald-100 flex flex-col items-end">
                       <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest leading-none mb-1">Total Daily Cost</span>
                       <span className="text-2xl font-black text-emerald-600 tracking-tighter leading-none">${results.dailyCost.toFixed(0)}</span>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                    <div className="md:col-span-5 relative h-[300px]">
                       <ResponsiveContainer width="100%" height="100%">
                         <PieChart>
                           <Pie
                             data={costPieData}
                             cx="50%"
                             cy="50%"
                             innerRadius={60}
                             outerRadius={100}
                             paddingAngle={5}
                             dataKey="value"
                             strokeWidth={0}
                           >
                             {costPieData.map((entry, index) => (
                               <Cell key={`cell-${index}`} fill={entry.color} />
                             ))}
                           </Pie>
                           <Tooltip 
                            formatter={(value: number) => [`$${value.toFixed(2)}`, 'Cost']}
                            contentStyle={{borderRadius: '24px', border: 'none', fontWeight: 'bold', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'}} 
                           />
                         </PieChart>
                       </ResponsiveContainer>
                       <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col pt-1">
                          <PieChartIcon className="w-6 h-6 text-slate-200 mb-1" />
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">OPEX Distribution</span>
                       </div>
                    </div>

                    <div className="md:col-span-7 space-y-4">
                       <div className="flex items-center justify-between p-5 bg-blue-50/50 rounded-2xl border border-blue-100 hover:scale-[1.02] transition-transform">
                          <div className="flex items-center gap-4">
                             <div className="w-3 h-3 rounded-full bg-blue-500" />
                             <div>
                                <span className="block text-[10px] font-black text-blue-400 uppercase tracking-widest leading-none mb-1">Lime Consumption</span>
                                <span className="block text-sm font-black text-blue-900 leading-none">Chemical Reagent Cost</span>
                             </div>
                          </div>
                          <span className="text-xl font-black text-blue-600 tracking-tighter">${results.dailyLimeCost.toFixed(0)}</span>
                       </div>

                       <div className="flex items-center justify-between p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100 hover:scale-[1.02] transition-transform">
                          <div className="flex items-center gap-4">
                             <div className="w-3 h-3 rounded-full bg-indigo-500" />
                             <div>
                                <span className="block text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none mb-1">Soda Ash Requirement</span>
                                <span className="block text-sm font-black text-indigo-900 leading-none">Polishing reagent (Na₂CO₃)</span>
                             </div>
                          </div>
                          <span className="text-xl font-black text-indigo-600 tracking-tighter">${results.dailySodaAshCost.toFixed(0)}</span>
                       </div>

                       <div className="flex items-center justify-between p-5 bg-emerald-50/50 rounded-2xl border border-emerald-100 hover:scale-[1.02] transition-transform">
                          <div className="flex items-center gap-4">
                             <div className="w-3 h-3 rounded-full bg-emerald-500" />
                             <div>
                                <span className="block text-[10px] font-black text-emerald-400 uppercase tracking-widest leading-none mb-1">Waste Management</span>
                                <span className="block text-sm font-black text-emerald-900 leading-none">Solid Waste Disposal</span>
                             </div>
                          </div>
                          <span className="text-xl font-black text-emerald-600 tracking-tighter">${results.dailyDisposalCost.toFixed(0)}</span>
                       </div>
                    </div>
                 </div>
              </section>
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
            <p className="text-[10px] font-bold text-slate-300 tracking-tighter uppercase italic">
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
        <span className="text-[10px] font-black tracking-[0.1em] text-slate-400 uppercase">{label}</span>
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
