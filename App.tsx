import React, { useState, useEffect, useCallback } from 'react';
import { BrainState, AddictionStage, SubstanceType, HistoryPoint } from './types';
import NeuroChart from './components/NeuroChart';
import BrainVisualizer from './components/BrainVisualizer';
import { 
  Activity, 
  Zap, 
  Smile, 
  Brain, 
  RefreshCcw, 
  AlertCircle, 
  CheckCircle2,
  Syringe,
  Clock,
  Shield,
  Lightbulb,
  Heart,
  Eye,
  Trophy,
  History
} from 'lucide-react';

const INITIAL_STATE: BrainState = {
  dopamine: { baseline: 0.6, current: 0.6 },
  serotonin: { baseline: 0.7, current: 0.7 },
  adrenaline: { baseline: 0.5, current: 0.5 },
  stage: AddictionStage.NORMAL,
  substance: SubstanceType.ALCOHOL,
  recoveryDay: 0,
};

const App: React.FC = () => {
  const [brainState, setBrainState] = useState<BrainState>(INITIAL_STATE);
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'info' | 'success' | 'warning' | 'error' } | null>(null);
  const [showNormalComparison, setShowNormalComparison] = useState(false);
  const [selectedHistoryDay, setSelectedHistoryDay] = useState<number | undefined>(undefined);

  const addHistoryPoint = useCallback((currentState: BrainState) => {
    setHistory(prev => {
      const newPoint: HistoryPoint = {
        day: prev.length,
        dopamine: parseFloat(currentState.dopamine.current.toFixed(2)),
        serotonin: parseFloat(currentState.serotonin.current.toFixed(2)),
        adrenaline: parseFloat(currentState.adrenaline.current.toFixed(2)),
      };
      const newHistory = [...prev, newPoint];
      if (newHistory.length > 100) newHistory.shift();
      return newHistory;
    });
  }, []);

  useEffect(() => {
    addHistoryPoint(INITIAL_STATE);
  }, [addHistoryPoint]);

  const showStatus = (text: string, type: 'info' | 'success' | 'warning' | 'error') => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const calculateRecovery = (day: number) => {
    const dopamineRecovery = 0.3 + (day / 365) * 0.7;
    const serotoninRecovery = 0.4 + (day / 180) * 0.6;
    const adrenalineRecovery = Math.max(0.5, 1.5 - (day / 120) * 0.5);
    
    return {
        dopamine: Math.min(1.0, dopamineRecovery),
        serotonin: Math.min(1.0, serotoninRecovery),
        adrenaline: adrenalineRecovery
    };
  };

  const updateBrainLevels = (updates: Partial<BrainState>) => {
    setBrainState(prev => {
      const next = { ...prev, ...updates };
      
      let dopamine = next.dopamine.baseline;
      let serotonin = next.serotonin.baseline;
      let adrenaline = next.adrenaline.baseline;

      if (next.stage === AddictionStage.RECOVERY) {
        const recoveryLevels = calculateRecovery(next.recoveryDay);
        dopamine = next.dopamine.baseline * recoveryLevels.dopamine;
        serotonin = next.serotonin.baseline * recoveryLevels.serotonin;
        adrenaline = next.adrenaline.baseline * recoveryLevels.adrenaline;
      } else {
         const impacts: Record<string, {d: number, s: number, a: number}> = {
            [AddictionStage.NORMAL]: { d: 1.0, s: 1.0, a: 1.0 },
            [AddictionStage.EARLY]: { d: 1.3, s: 0.9, a: 1.2 },
            [AddictionStage.MODERATE]: { d: 0.6, s: 0.6, a: 1.4 },
            [AddictionStage.SEVERE]: { d: 0.2, s: 0.3, a: 1.7 },
        };
        const impact = impacts[next.stage] || impacts[AddictionStage.NORMAL];
        dopamine = next.dopamine.baseline * impact.d;
        serotonin = next.serotonin.baseline * impact.s;
        adrenaline = next.adrenaline.baseline * impact.a;
      }

      const newState = {
        ...next,
        dopamine: { ...next.dopamine, current: dopamine },
        serotonin: { ...next.serotonin, current: serotonin },
        adrenaline: { ...next.adrenaline, current: adrenaline },
      };
      
      addHistoryPoint(newState);
      return newState;
    });
  };

  const handleDose = () => {
    setBrainState(prev => {
        const newState = {
            ...prev,
            dopamine: { ...prev.dopamine, current: Math.min(2.0, prev.dopamine.current * 1.8) }, 
            serotonin: { ...prev.serotonin, current: Math.max(0.1, prev.serotonin.current * 0.3) }, 
            adrenaline: { ...prev.adrenaline, current: Math.min(2.0, prev.adrenaline.current * 1.6) }, 
            recoveryDay: 0,
            stage: AddictionStage.SEVERE
        };
        addHistoryPoint(newState);
        return newState;
    });
    showStatus(`⚠️ Critical Reaction: Acute chemical imbalance engineered by substance intake. Recovery Path Reset.`, 'error');
  };

  const resetSystem = () => {
    setBrainState(INITIAL_STATE);
    addHistoryPoint(INITIAL_STATE);
    setSelectedHistoryDay(undefined);
    showStatus('🔄 Engineering Path Reset to Baseline.', 'info');
  };

  const getWellnessScore = () => {
    const d = brainState.dopamine.current;
    const s = brainState.serotonin.current;
    const a = brainState.adrenaline.current;
    return Math.round((d * 0.3 + s * 0.4 + (1.0 - Math.abs(a - 0.5)) * 0.3) * 100);
  };

  const getGapToNormal = () => {
    const dGap = Math.abs(1.0 - brainState.dopamine.current);
    const sGap = Math.abs(1.0 - brainState.serotonin.current);
    const aGap = Math.abs(0.5 - brainState.adrenaline.current);
    return Math.round(((dGap + sGap + aGap) / 2.5) * 100);
  };

  const selectedPoint = history.find(p => p.day === selectedHistoryDay);

  return (
    <div className="min-h-screen bg-[#06090f] text-gray-100 p-4 md:p-6 font-sans selection:bg-cyan-500/30">
      
      {/* HUD Header */}
      <header className="max-w-full mx-auto mb-6 bg-gradient-to-r from-cyan-900/20 via-blue-900/20 to-indigo-900/20 backdrop-blur-xl rounded-2xl p-6 border border-white/5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-4xl font-black tracking-tighter flex items-center gap-3 text-white">
              <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                <Brain className="w-8 h-8 text-cyan-400" />
              </div>
              NEUROPATH<span className="text-cyan-400">ENGINEER</span>
            </h1>
            <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">
              Controlled Recovery Path Intelligence • System v2.5
            </p>
          </div>
          <div className="flex gap-4 items-center">
            <div className="text-right">
              <span className="text-xs text-gray-500 uppercase font-bold block">Current Deviation</span>
              <span className={`text-2xl font-mono font-bold ${getGapToNormal() > 20 ? 'text-orange-400' : 'text-cyan-400'}`}>
                {getGapToNormal()}% <span className="text-xs uppercase opacity-50">Variance</span>
              </span>
            </div>
            <button 
              onClick={() => setShowNormalComparison(!showNormalComparison)}
              className={`px-4 py-2 rounded-full border transition-all text-xs font-bold uppercase tracking-wider ${showNormalComparison ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300' : 'bg-white/5 border-white/10 text-gray-400'}`}
            >
              {showNormalComparison ? 'Disable Normal Sync' : 'Sync Normal Overlay'}
            </button>
          </div>
        </div>
      </header>

      <main className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Left Control & Tracker */}
        <div className="xl:col-span-3 space-y-6">
          <section className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md">
            <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-4">
              <Activity className="w-5 h-5 text-cyan-400" />
              <h2 className="text-sm font-black uppercase tracking-widest">Chemical Controller</h2>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Path Stage</label>
                <select 
                  value={brainState.stage}
                  onChange={(e) => updateBrainLevels({ stage: e.target.value as AddictionStage })}
                  className="w-full bg-black/60 border border-white/10 rounded-xl p-3 text-sm focus:ring-1 focus:ring-cyan-500 appearance-none cursor-pointer"
                >
                  {Object.values(AddictionStage).map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Recovery Duration: {brainState.recoveryDay} Days</label>
                <input 
                  type="range" min="0" max="365" step="1"
                  value={brainState.recoveryDay}
                  onChange={(e) => updateBrainLevels({ recoveryDay: parseInt(e.target.value), stage: AddictionStage.RECOVERY })}
                  className="w-full accent-cyan-400 h-1 bg-white/10 rounded-lg"
                />
              </div>

              <div className="space-y-3 pt-2">
                <button onClick={handleDose} className="w-full py-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 group">
                   <Syringe className="w-4 h-4 group-hover:scale-125 transition-transform" /> Administer Disruptive Dose
                </button>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => updateBrainLevels({ stage: AddictionStage.RECOVERY })} className="py-3 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 rounded-xl font-bold text-[10px] uppercase tracking-tighter transition-all">
                    Initiate Recovery
                  </button>
                  <button onClick={resetSystem} className="py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 rounded-xl font-bold text-[10px] uppercase tracking-tighter transition-all">
                    Reset Baseline
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Real-time Chemical Monitors */}
          <section className="space-y-4">
             {[
               { label: 'Dopamine (Reward)', color: 'text-rose-400', val: brainState.dopamine.current, icon: Zap },
               { label: 'Serotonin (Mood)', color: 'text-cyan-400', val: brainState.serotonin.current, icon: Smile },
               { label: 'Adrenaline (Stress)', color: 'text-amber-400', val: brainState.adrenaline.current, icon: Activity }
             ].map((m, i) => (
               <div key={i} className="bg-white/5 border border-white/5 p-4 rounded-2xl relative overflow-hidden group">
                 <div className="flex justify-between items-center mb-2">
                   <div className="flex items-center gap-2">
                     <m.icon className={`w-3 h-3 ${m.color}`} />
                     <span className="text-[10px] font-black uppercase text-gray-500">{m.label}</span>
                   </div>
                   <span className={`text-xl font-mono font-bold ${m.color}`}>{Math.round(m.val * 100)}%</span>
                 </div>
                 <div className="w-full bg-white/5 h-1 rounded-full">
                   <div className={`h-full ${m.color.replace('text', 'bg')} transition-all duration-700`} style={{ width: `${Math.min(100, m.val * 100)}%` }}></div>
                 </div>
               </div>
             ))}
          </section>
          
          {selectedPoint && (
            <section className="bg-cyan-500/10 border border-cyan-500/30 p-5 rounded-2xl animate-in slide-in-from-left-4 fade-in duration-500">
               <div className="flex items-center gap-2 mb-4">
                  <History className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-[10px] font-black uppercase text-cyan-400">History Sync (Day {selectedPoint.day})</h3>
               </div>
               <div className="space-y-3">
                  <div className="flex justify-between text-[10px] font-bold">
                    <span className="text-gray-500 uppercase tracking-tighter">Dopamine Delta</span>
                    <span className={`${brainState.dopamine.current >= selectedPoint.dopamine ? 'text-green-400' : 'text-rose-400'}`}>
                      {Math.round((brainState.dopamine.current - selectedPoint.dopamine) * 100)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-[10px] font-bold">
                    <span className="text-gray-500 uppercase tracking-tighter">Serotonin Delta</span>
                    <span className={`${brainState.serotonin.current >= selectedPoint.serotonin ? 'text-green-400' : 'text-rose-400'}`}>
                      {Math.round((brainState.serotonin.current - selectedPoint.serotonin) * 100)}%
                    </span>
                  </div>
                  <button 
                    onClick={() => setSelectedHistoryDay(undefined)}
                    className="w-full mt-2 py-1 bg-white/5 hover:bg-white/10 text-[8px] font-black uppercase tracking-widest text-gray-500 rounded"
                  >
                    Clear Comparison
                  </button>
               </div>
            </section>
          )}
        </div>

        {/* Center: Intelligence Visualization */}
        <div className="xl:col-span-6 space-y-6">
          {statusMessage && (
            <div className={`p-4 rounded-2xl border flex items-center gap-3 animate-pulse
              ${statusMessage.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-200' : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-200'}`}>
              <AlertCircle className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">{statusMessage.text}</span>
            </div>
          )}
          
          <div className="relative">
             <BrainVisualizer brainState={brainState} comparisonPoint={selectedPoint} />
             {showNormalComparison && (
               <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-md p-3 rounded-lg border border-cyan-500/30 text-[10px] font-bold uppercase text-cyan-400 animate-pulse pointer-events-none">
                 Normal Brain Baseline Sync Active
               </div>
             )}
          </div>

          <NeuroChart 
            data={history} 
            selectedDay={selectedHistoryDay}
            onSelectPoint={(day) => setSelectedHistoryDay(day)}
          />
        </div>

        {/* Right: Recovery Path Benefits & Analytics */}
        <div className="xl:col-span-3 space-y-6">
           <section className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md h-full">
              <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-4">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <h2 className="text-sm font-black uppercase tracking-widest text-yellow-400">Recovery Benefits Profile</h2>
              </div>

              {brainState.stage === AddictionStage.RECOVERY ? (
                <div className="space-y-6">
                  <div className="p-4 bg-cyan-500/5 rounded-xl border border-cyan-500/10 group hover:bg-cyan-500/10 transition-all">
                    <div className="flex items-center gap-3 mb-2">
                      <Shield className="w-5 h-5 text-cyan-400" />
                      <span className="text-xs font-black uppercase tracking-wider">Hyper-Resilience</span>
                    </div>
                    <p className="text-[11px] text-gray-400 leading-relaxed">
                      Synaptic re-wiring has engineered a brain that is more resistant to external stress factors than the average baseline.
                    </p>
                  </div>

                  <div className="p-4 bg-purple-500/5 rounded-xl border border-purple-500/10 group hover:bg-purple-500/10 transition-all">
                    <div className="flex items-center gap-3 mb-2">
                      <Lightbulb className="w-5 h-5 text-purple-400" />
                      <span className="text-xs font-black uppercase tracking-wider">Meta-Knowledge</span>
                    </div>
                    <p className="text-[11px] text-gray-400 leading-relaxed">
                      Profound understanding of one's own neurochemical levers. Mastery over habit loops and behavior modification.
                    </p>
                  </div>

                  <div className="p-4 bg-rose-500/5 rounded-xl border border-rose-500/10 group hover:bg-rose-500/10 transition-all">
                    <div className="flex items-center gap-3 mb-2">
                      <Heart className="w-5 h-5 text-rose-400" />
                      <span className="text-xs font-black uppercase tracking-wider">Internal Beauty</span>
                    </div>
                    <p className="text-[11px] text-gray-400 leading-relaxed">
                      The "Broken Bowl" effect: Neural pathways repaired with gold (experience) are more beautiful and valuable than unbroken ones.
                    </p>
                  </div>

                  <div className="p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/10 group hover:bg-emerald-500/10 transition-all">
                    <div className="flex items-center gap-3 mb-2">
                      <Eye className="w-5 h-5 text-emerald-400" />
                      <span className="text-xs font-black uppercase tracking-wider">Self-Awareness</span>
                    </div>
                    <p className="text-[11px] text-gray-400 leading-relaxed">
                      Heightened metacognition. The ability to observe internal states without being consumed by them.
                    </p>
                  </div>
                  
                  <div className="mt-8 text-center pt-6 border-t border-white/5">
                    <span className="text-[10px] uppercase font-bold text-gray-600 block mb-2">Engineering Goal Progress</span>
                    <div className="text-3xl font-black text-white">{Math.round((brainState.recoveryDay / 365) * 100)}%</div>
                    <span className="text-[9px] uppercase tracking-tighter text-cyan-400">To Engineered Stability</span>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4 opacity-40">
                   <Brain className="w-12 h-12 text-gray-600" />
                   <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
                     Initiate Recovery Mode to View engineered benefits profile.
                   </p>
                </div>
              )}
           </section>
        </div>
      </main>
    </div>
  );
};

export default App;