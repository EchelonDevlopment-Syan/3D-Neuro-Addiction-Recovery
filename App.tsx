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
  History,
  FlaskConical,
  Binary
} from 'lucide-react';

const INITIAL_STATE: BrainState = {
  dopamine: { baseline: 0.6, current: 0.6 },
  serotonin: { baseline: 0.7, current: 0.7 },
  adrenaline: { baseline: 0.5, current: 0.5 },
  stage: AddictionStage.NORMAL,
  substance: SubstanceType.ALCOHOL,
  recoveryDay: 0,
};

// Distinct profiles for how substances affect the brain at different stages
const SUBSTANCE_IMPACTS = {
  [SubstanceType.ALCOHOL]: {
    [AddictionStage.NORMAL]: { d: 1.0, s: 1.0, a: 1.0 },
    [AddictionStage.EARLY]: { d: 1.2, s: 1.1, a: 0.9 },
    [AddictionStage.MODERATE]: { d: 0.7, s: 0.6, a: 1.3 },
    [AddictionStage.SEVERE]: { d: 0.3, s: 0.3, a: 1.8 },
  },
  [SubstanceType.OPIOIDS]: {
    [AddictionStage.NORMAL]: { d: 1.0, s: 1.0, a: 1.0 },
    [AddictionStage.EARLY]: { d: 1.8, s: 1.2, a: 0.6 },
    [AddictionStage.MODERATE]: { d: 0.5, s: 0.5, a: 1.2 },
    [AddictionStage.SEVERE]: { d: 0.15, s: 0.2, a: 1.9 },
  },
  [SubstanceType.STIMULANTS]: {
    [AddictionStage.NORMAL]: { d: 1.0, s: 1.0, a: 1.0 },
    [AddictionStage.EARLY]: { d: 2.5, s: 1.1, a: 2.0 },
    [AddictionStage.MODERATE]: { d: 0.4, s: 0.5, a: 1.5 },
    [AddictionStage.SEVERE]: { d: 0.1, s: 0.2, a: 0.4 },
  },
  [SubstanceType.MDMA]: {
    [AddictionStage.NORMAL]: { d: 1.0, s: 1.0, a: 1.0 },
    [AddictionStage.EARLY]: { d: 1.5, s: 3.0, a: 1.4 },
    [AddictionStage.MODERATE]: { d: 0.6, s: 0.4, a: 1.2 },
    [AddictionStage.SEVERE]: { d: 0.3, s: 0.1, a: 1.5 },
  }
};

const RECOVERY_MODIFIERS = {
  [SubstanceType.ALCOHOL]: { d: 1.0, s: 0.8, a: 1.0 },
  [SubstanceType.OPIOIDS]: { d: 0.6, s: 0.9, a: 0.7 },
  [SubstanceType.STIMULANTS]: { d: 0.7, s: 0.9, a: 1.2 },
  [SubstanceType.MDMA]: { d: 0.8, s: 0.6, a: 1.0 },
};

const SnowEffect = () => {
  const [flakes, setFlakes] = useState<any[]>([]);

  useEffect(() => {
    const count = 50;
    const newFlakes = Array.from({ length: count }).map((_, i) => ({
      id: i,
      left: Math.random() * 100 + '%',
      size: Math.random() * 3 + 1 + 'px',
      duration: Math.random() * 5 + 5 + 's',
      delay: Math.random() * 5 + 's',
    }));
    setFlakes(newFlakes);
  }, []);

  return (
    <div className="snow-container">
      {flakes.map((flake) => (
        <div
          key={flake.id}
          className="snowflake"
          style={{
            left: flake.left,
            width: flake.size,
            height: flake.size,
            animationDuration: flake.duration,
            animationDelay: flake.delay,
          }}
        />
      ))}
    </div>
  );
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

  const calculateRecovery = (day: number, substance: SubstanceType) => {
    const mods = RECOVERY_MODIFIERS[substance];
    
    const rawDopamine = 0.3 + (day / 365) * 0.7;
    const rawSerotonin = 0.4 + (day / 180) * 0.6;
    const rawAdrenaline = Math.max(0.5, 1.5 - (day / 120) * 0.5);

    const dProgress = Math.min(1.0, rawDopamine * mods.d);
    const sProgress = Math.min(1.0, rawSerotonin * mods.s);
    const aCurrent = 1.5 - (day / (120 / mods.a)) * 0.5;
    const aProgress = Math.max(0.5, aCurrent);

    return {
        dopamine: dProgress,
        serotonin: sProgress,
        adrenaline: aProgress
    };
  };

  const updateBrainLevels = (updates: Partial<BrainState>) => {
    setBrainState(prev => {
      const next = { ...prev, ...updates };
      
      let dopamine = next.dopamine.baseline;
      let serotonin = next.serotonin.baseline;
      let adrenaline = next.adrenaline.baseline;

      if (next.stage === AddictionStage.RECOVERY) {
        const recoveryLevels = calculateRecovery(next.recoveryDay, next.substance);
        dopamine = next.dopamine.baseline * recoveryLevels.dopamine;
        serotonin = next.serotonin.baseline * recoveryLevels.serotonin;
        adrenaline = next.adrenaline.baseline * recoveryLevels.adrenaline;
      } else {
        const impact = SUBSTANCE_IMPACTS[next.substance][next.stage] || SUBSTANCE_IMPACTS[next.substance][AddictionStage.NORMAL];
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

  const handleSubstanceChange = (substance: SubstanceType) => {
    updateBrainLevels({ substance, recoveryDay: 0, stage: AddictionStage.NORMAL });
    showStatus(`Bio-Profile Loaded: ${substance.toUpperCase()}`, 'info');
  };

  const handleDose = () => {
    setBrainState(prev => {
        let dMult = 1.0, sMult = 1.0, aMult = 1.0;
        if (prev.substance === SubstanceType.ALCOHOL) {
           dMult = 1.5; sMult = 0.8; aMult = 0.9;
        } else if (prev.substance === SubstanceType.OPIOIDS) {
           dMult = 2.5; sMult = 0.5; aMult = 0.4;
        } else if (prev.substance === SubstanceType.STIMULANTS) {
           dMult = 3.0; sMult = 0.6; aMult = 2.5;
        } else if (prev.substance === SubstanceType.MDMA) {
           dMult = 2.0; sMult = 4.0; aMult = 1.5;
        }

        const newState = {
            ...prev,
            dopamine: { ...prev.dopamine, current: Math.min(3.0, prev.dopamine.current * dMult) }, 
            serotonin: { ...prev.serotonin, current: Math.max(0.1, prev.serotonin.current * sMult) }, 
            adrenaline: { ...prev.adrenaline, current: Math.min(3.0, prev.adrenaline.current * aMult) }, 
            recoveryDay: 0,
            stage: AddictionStage.SEVERE
        };
        addHistoryPoint(newState);
        return newState;
    });
    showStatus(`⚠️ Critical Reaction: Acute ${brainState.substance} intake detected.`, 'error');
  };

  const resetSystem = () => {
    setBrainState(INITIAL_STATE);
    addHistoryPoint(INITIAL_STATE);
    setSelectedHistoryDay(undefined);
    showStatus('🔄 Engineering Path Reset to Baseline.', 'info');
  };

  const getGapToNormal = () => {
    const dGap = Math.abs(1.0 - brainState.dopamine.current);
    const sGap = Math.abs(1.0 - brainState.serotonin.current);
    const aGap = Math.abs(0.5 - brainState.adrenaline.current);
    return Math.round(((dGap + sGap + aGap) / 2.5) * 100);
  };

  const selectedPoint = history.find(p => p.day === selectedHistoryDay);

  return (
    <div className="min-h-screen bg-navy-950 text-gray-100 p-4 md:p-6 font-sans selection:bg-copper-500/30 relative overflow-hidden">
      
      <SnowEffect />
      
      {/* HUD Header */}
      <header className="max-w-full mx-auto mb-6 bg-gradient-to-r from-slate-900/60 via-slate-800/60 to-slate-900/60 backdrop-blur-xl rounded-2xl p-6 border border-copper-500/20 shadow-2xl relative overflow-hidden z-10">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-copper-500 to-transparent"></div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-4xl font-black tracking-tighter flex flex-wrap items-center gap-3 text-white">
              <div className="p-2 bg-copper-500/10 rounded-lg border border-copper-500/20">
                <Brain className="w-8 h-8 text-copper-400" />
              </div>
              <span>
                NEUROPATH<span className="text-copper-400">ENGINEER</span>
              </span>
              <span className="text-xs md:text-sm text-gray-500 font-bold tracking-widest border-l-2 border-copper-500/30 pl-3 ml-1">
                by Echelon AI Control
              </span>
            </h1>
            <p className="text-gray-500 text-sm mt-1 uppercase tracking-widest font-bold">
              Controlled Recovery Path Intelligence • System v2.6
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
             <div className="flex items-center gap-3 bg-black/40 px-4 py-2 rounded-lg border border-copper-500/30">
               <div className="text-right">
                 <h2 className="text-xl font-black text-copper-100 tracking-[0.2em]">ECHELON</h2>
                 <p className="text-[10px] text-copper-400 font-bold uppercase tracking-wider text-right">AI Control</p>
               </div>
               <div className="w-8 h-8 rounded-full border-2 border-copper-500 flex items-center justify-center bg-copper-900/50">
                  <Binary className="w-5 h-5 text-copper-400" />
               </div>
             </div>

            <div className="flex gap-4 items-center mt-2">
              <div className="text-right">
                <span className="text-[10px] text-gray-500 uppercase font-bold block">Current Deviation</span>
                <span className={`text-xl font-mono font-bold ${getGapToNormal() > 20 ? 'text-orange-400' : 'text-copper-400'}`}>
                  {getGapToNormal()}% <span className="text-[8px] uppercase opacity-50">Variance</span>
                </span>
              </div>
              <button 
                onClick={() => setShowNormalComparison(!showNormalComparison)}
                className={`px-4 py-2 rounded-full border transition-all text-[10px] font-bold uppercase tracking-wider ${showNormalComparison ? 'bg-copper-500/20 border-copper-500 text-copper-300' : 'bg-white/5 border-white/10 text-gray-400'}`}
              >
                {showNormalComparison ? 'Disable Normal Sync' : 'Sync Normal Overlay'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="grid grid-cols-1 xl:grid-cols-12 gap-6 relative z-10">
        
        {/* Left Control & Tracker */}
        <div className="xl:col-span-3 space-y-6">
          <section className="bg-slate-900/50 border border-white/5 rounded-2xl p-5 backdrop-blur-md">
            <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-4">
              <FlaskConical className="w-5 h-5 text-purple-400" />
              <h2 className="text-sm font-black uppercase tracking-widest text-gray-300">Chemical Profile</h2>
            </div>
            
            <div className="space-y-6">
               <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Target Substance</label>
                <select 
                  value={brainState.substance}
                  onChange={(e) => handleSubstanceChange(e.target.value as SubstanceType)}
                  className="w-full bg-black/60 border border-white/10 rounded-xl p-3 text-sm focus:ring-1 focus:ring-copper-500 appearance-none cursor-pointer text-gray-200"
                >
                  {Object.values(SubstanceType).map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-500 uppercase">Path Stage</label>
                <select 
                  value={brainState.stage}
                  onChange={(e) => updateBrainLevels({ stage: e.target.value as AddictionStage })}
                  className="w-full bg-black/60 border border-white/10 rounded-xl p-3 text-sm focus:ring-1 focus:ring-copper-500 appearance-none cursor-pointer text-gray-200"
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
                  className="w-full accent-copper-400 h-1 bg-white/10 rounded-lg"
                />
              </div>

              <div className="space-y-3 pt-2">
                <button onClick={handleDose} className="w-full py-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 group">
                   <Syringe className="w-4 h-4 group-hover:scale-125 transition-transform" /> Administer {brainState.substance}
                </button>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => updateBrainLevels({ stage: AddictionStage.RECOVERY })} className="py-3 bg-copper-500/10 hover:bg-copper-500/20 border border-copper-500/30 text-copper-400 rounded-xl font-bold text-[10px] uppercase tracking-tighter transition-all">
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
               <div key={i} className="bg-slate-900/50 border border-white/5 p-4 rounded-2xl relative overflow-hidden group">
                 <div className="flex justify-between items-center mb-2">
                   <div className="flex items-center gap-2">
                     <m.icon className={`w-3 h-3 ${m.color}`} />
                     <span className="text-[10px] font-black uppercase text-gray-500">{m.label}</span>
                   </div>
                   <span className={`text-xl font-mono font-bold ${m.color}`}>{Math.round(m.val * 100)}%</span>
                 </div>
                 <div className="w-full bg-white/5 h-1 rounded-full">
                   <div className={`h-full ${m.color.replace('text', 'bg')} transition-all duration-700`} style={{ width: `${Math.min(100, (m.val / 2.0) * 100)}%` }}></div>
                 </div>
               </div>
             ))}
          </section>
          
          {selectedPoint && (
            <section className="bg-copper-500/10 border border-copper-500/30 p-5 rounded-2xl animate-in slide-in-from-left-4 fade-in duration-500">
               <div className="flex items-center gap-2 mb-4">
                  <History className="w-4 h-4 text-copper-400" />
                  <h3 className="text-[10px] font-black uppercase text-copper-400">History Sync (Day {selectedPoint.day})</h3>
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
              ${statusMessage.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-200' : 'bg-copper-500/10 border-copper-500/20 text-copper-200'}`}>
              <AlertCircle className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">{statusMessage.text}</span>
            </div>
          )}
          
          <div className="relative">
             <BrainVisualizer brainState={brainState} comparisonPoint={selectedPoint} />
             {showNormalComparison && (
               <div className="absolute top-4 right-4 bg-black/80 backdrop-blur-md p-3 rounded-lg border border-copper-500/30 text-[10px] font-bold uppercase text-copper-400 animate-pulse pointer-events-none z-50">
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
           <section className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 backdrop-blur-md h-full">
              <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-4">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <h2 className="text-sm font-black uppercase tracking-widest text-yellow-400">Recovery Benefits Profile</h2>
              </div>

              {brainState.stage === AddictionStage.RECOVERY ? (
                <div className="space-y-6">
                  <div className="p-4 bg-copper-500/5 rounded-xl border border-copper-500/10 group hover:bg-copper-500/10 transition-all">
                    <div className="flex items-center gap-3 mb-2">
                      <Shield className="w-5 h-5 text-copper-400" />
                      <span className="text-xs font-black uppercase tracking-wider text-gray-300">Hyper-Resilience</span>
                    </div>
                    <p className="text-[11px] text-gray-500 leading-relaxed group-hover:text-gray-400 transition-colors">
                      Synaptic re-wiring has engineered a brain that is more resistant to external stress factors than the average baseline.
                    </p>
                  </div>

                  <div className="p-4 bg-purple-500/5 rounded-xl border border-purple-500/10 group hover:bg-purple-500/10 transition-all">
                    <div className="flex items-center gap-3 mb-2">
                      <Lightbulb className="w-5 h-5 text-purple-400" />
                      <span className="text-xs font-black uppercase tracking-wider text-gray-300">Meta-Knowledge</span>
                    </div>
                    <p className="text-[11px] text-gray-500 leading-relaxed group-hover:text-gray-400 transition-colors">
                      Profound understanding of one's own neurochemical levers. Mastery over habit loops and behavior modification.
                    </p>
                  </div>

                  <div className="p-4 bg-rose-500/5 rounded-xl border border-rose-500/10 group hover:bg-rose-500/10 transition-all">
                    <div className="flex items-center gap-3 mb-2">
                      <Heart className="w-5 h-5 text-rose-400" />
                      <span className="text-xs font-black uppercase tracking-wider text-gray-300">Internal Beauty</span>
                    </div>
                    <p className="text-[11px] text-gray-500 leading-relaxed group-hover:text-gray-400 transition-colors">
                      The "Broken Bowl" effect: Neural pathways repaired with gold (experience) are more beautiful and valuable than unbroken ones.
                    </p>
                  </div>

                  <div className="p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/10 group hover:bg-emerald-500/10 transition-all">
                    <div className="flex items-center gap-3 mb-2">
                      <Eye className="w-5 h-5 text-emerald-400" />
                      <span className="text-xs font-black uppercase tracking-wider text-gray-300">Self-Awareness</span>
                    </div>
                    <p className="text-[11px] text-gray-500 leading-relaxed group-hover:text-gray-400 transition-colors">
                      Heightened metacognition. The ability to observe internal states without being consumed by them.
                    </p>
                  </div>
                  
                  <div className="mt-8 text-center pt-6 border-t border-white/5">
                    <span className="text-[10px] uppercase font-bold text-gray-600 block mb-2">Engineering Goal Progress</span>
                    <div className="text-3xl font-black text-white">{Math.round((brainState.recoveryDay / 365) * 100)}%</div>
                    <span className="text-[9px] uppercase tracking-tighter text-copper-400">To Engineered Stability</span>
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