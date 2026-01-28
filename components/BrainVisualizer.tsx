import React, { useState, useEffect, useRef } from 'react';
import { generateBrainStateImage, editBrainImage } from '../services/geminiService';
import { BrainState, HistoryPoint } from '../types';
import { Target, X, Zap, Activity, Smile, ScanLine, RefreshCcw, ArrowRight, Terminal } from 'lucide-react';

interface BrainVisualizerProps {
  brainState: BrainState;
  comparisonPoint?: HistoryPoint;
}

type RegionType = 'dopamine' | 'serotonin' | 'adrenaline' | null;

const BrainVisualizer: React.FC<BrainVisualizerProps> = ({ brainState, comparisonPoint }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [activeRegion, setActiveRegion] = useState<RegionType>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const logEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Log generation loop when image is active
  useEffect(() => {
    if (!imageUrl) return;

    const generateLog = () => {
      const actions = [
        "Tracing synaptic pathways...",
        "Measuring receptor density...",
        "Analyzing neurochemical gradients...",
        "Mapping cortex activity...",
        "Verifying amygdala response...",
        "Calculating plasticity index...",
        `Monitoring ${brainState.substance} metabolites...`,
        "Engineered pathway convergence check..."
      ];
      
      const specific = [];
      if (brainState.dopamine.current > 1.2) specific.push("ALERT: High Dopaminergic Flux detected.");
      if (brainState.serotonin.current < 0.6) specific.push("WARN: Serotonin uptake inhibited.");
      if (brainState.adrenaline.current > 1.2) specific.push("ALERT: Adrenal cortex overactive.");
      
      const pool = [...actions, ...specific];
      const newLog = `[${new Date().toISOString().split('T')[1].slice(0,8)}] > ${pool[Math.floor(Math.random() * pool.length)]}`;
      
      setLogs(prev => [...prev.slice(-6), newLog]);
    };

    const interval = setInterval(generateLog, 2500);
    return () => clearInterval(interval);
  }, [imageUrl, brainState]);

  const handleGenerateInitial = async () => {
    setIsLoading(true);
    setError(null);
    setLogs(prev => [...prev, ">>> INITIALIZING NEURO-SCAN SEQUENCE..."]);
    try {
      const result = await generateBrainStateImage(
        brainState.dopamine.current,
        brainState.serotonin.current,
        brainState.substance
      );
      setImageUrl(result);
      setLogs(prev => [...prev, ">>> MODEL GENERATED. SYNAPTIC LINK ESTABLISHED."]);
    } catch (err) {
      setError("Failed to generate initial neural scan.");
      setLogs(prev => [...prev, ">>> ERROR: SCAN FAILED."]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditImage = async () => {
    if (!imageUrl || !prompt.trim()) return;
    
    setIsLoading(true);
    setError(null);
    setLogs(prev => [...prev, `>>> INJECTING MODIFIER: "${prompt.toUpperCase()}"...`]);
    try {
      const result = await editBrainImage(imageUrl, prompt);
      setImageUrl(result);
      setPrompt(''); 
      setLogs(prev => [...prev, ">>> MODEL UPDATED."]);
    } catch (err) {
      setError("Failed to modify visual model.");
    } finally {
      setIsLoading(false);
    }
  };

  const getRegionInfo = (type: RegionType) => {
    if (!type) return null;
    const currentLvl = (brainState as any)[type].current;
    const historicalLvl = comparisonPoint ? (comparisonPoint as any)[type] : null;

    const infoMap = {
      dopamine: {
        title: "Reward Pathway (Nucleus Accumbens)",
        chem: "Dopamine",
        level: currentLvl,
        historical: historicalLvl,
        desc: currentLvl > 1.2 
          ? "CRITICAL: Excessive flooding detected. Receptors downregulating to prevent permanent excitotoxicity. High probability of addictive reinforcement." 
          : currentLvl < 0.6 
          ? "DEFICIT: Neural reward centers unresponsive. Anhedonia detected. Subject may struggle with basic motivation and joy." 
          : "STABLE: Healthy reward feedback loop engineered.",
        icon: Zap,
        color: "text-rose-400"
      },
      serotonin: {
        title: "Mood & Satiety (Raphe Nuclei)",
        chem: "Serotonin",
        level: currentLvl,
        historical: historicalLvl,
        desc: currentLvl < 0.6
          ? "DEPLETED: Emotional regulation failure. Heightened risk of impulsive behavior and persistent low-affect states."
          : "STABLE: Emotional baseline achieved. Neuroplastic recovery pathways active.",
        icon: Smile,
        color: "text-cyan-400"
      },
      adrenaline: {
        title: "Stress & Vigilance (Locus Coeruleus)",
        chem: "Adrenaline",
        level: currentLvl,
        historical: historicalLvl,
        desc: currentLvl > 1.5
          ? "ALARM: Sustained high-cortisol/adrenaline loop. Subject in constant fight/flight. Accelerated aging of neural tissue."
          : "CALM: Parasympathetic nervous system dominant. Recovery environment optimal.",
        icon: Activity,
        color: "text-amber-400"
      }
    };
    return infoMap[type];
  };

  const regionData = getRegionInfo(activeRegion);

  return (
    <div className="flex flex-col bg-black/40 backdrop-blur-3xl rounded-3xl p-6 shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/5 relative overflow-hidden h-[600px]">
      <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-500/40 rounded-tl-3xl"></div>
      <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-500/40 rounded-tr-3xl"></div>
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan-500/40 rounded-bl-3xl"></div>
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-500/40 rounded-br-3xl"></div>

      <div className="flex justify-between items-center mb-4 z-10">
        <div className="flex items-center gap-2">
          <ScanLine className="w-4 h-4 text-cyan-500" />
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Neural Topology Analysis</h3>
        </div>
        {comparisonPoint && (
           <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] font-black text-cyan-400 animate-pulse">
             COMPARING TO DAY {comparisonPoint.day}
           </div>
        )}
        {imageUrl && (
          <div className="flex gap-4">
             <button onClick={handleGenerateInitial} className="text-[10px] font-bold text-gray-500 hover:text-cyan-400 uppercase tracking-tighter flex items-center gap-1 transition-colors">
               <RefreshCcw size={10} /> Recalibrate Scan
             </button>
          </div>
        )}
      </div>

      <div className="relative flex-grow bg-black/20 rounded-2xl overflow-hidden flex items-center justify-center border border-white/5 group select-none shadow-inner">
        {isLoading ? (
          <div className="flex flex-col items-center">
             <div className="relative">
               <div className="absolute inset-0 bg-cyan-500/20 blur-xl animate-pulse"></div>
               <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-500 mb-6 relative z-10"></div>
             </div>
             <p className="text-cyan-500 text-[10px] font-black uppercase tracking-[0.3em] animate-pulse">Calculating Synaptic Density...</p>
          </div>
        ) : imageUrl ? (
          <>
            <img 
              src={imageUrl} 
              alt="Neural Model" 
              className="w-full h-full object-cover mix-blend-lighten opacity-80"
            />
            
            {/* Neural Flow Animation Layer */}
            <div className="absolute inset-0 z-10 animate-neural-flow"></div>
            
            <div className="absolute inset-0 z-20 pointer-events-none opacity-50">
               <div className="w-full h-full bg-[radial-gradient(circle_at_center,transparent_0%,rgba(6,9,15,1)_100%)]"></div>
            </div>

            <div className="absolute inset-0 z-30">
               <div className="absolute top-[25%] left-[35%] pointer-events-auto" onClick={() => setActiveRegion('dopamine')}>
                 <div className="relative cursor-pointer group/node p-4">
                    <span className="absolute inset-0 w-full h-full bg-rose-500/20 rounded-full animate-ping"></span>
                    <div className="w-3 h-3 bg-rose-500 rounded-full border border-white shadow-[0_0_15px_rgba(244,63,94,0.8)] group-hover/node:scale-150 transition-transform"></div>
                 </div>
               </div>

               <div className="absolute top-[48%] left-[52%] pointer-events-auto" onClick={() => setActiveRegion('serotonin')}>
                 <div className="relative cursor-pointer group/node p-4">
                    <span className="absolute inset-0 w-full h-full bg-cyan-500/20 rounded-full animate-ping delay-500"></span>
                    <div className="w-3 h-3 bg-cyan-500 rounded-full border border-white shadow-[0_0_15px_rgba(6,182,212,0.8)] group-hover/node:scale-150 transition-transform"></div>
                 </div>
               </div>

               <div className="absolute bottom-[35%] right-[40%] pointer-events-auto" onClick={() => setActiveRegion('adrenaline')}>
                 <div className="relative cursor-pointer group/node p-4">
                    <span className="absolute inset-0 w-full h-full bg-amber-500/20 rounded-full animate-ping delay-1000"></span>
                    <div className="w-3 h-3 bg-amber-500 rounded-full border border-white shadow-[0_0_15px_rgba(245,158,11,0.8)] group-hover/node:scale-150 transition-transform"></div>
                 </div>
               </div>
            </div>

            {activeRegion && regionData && (
              <div className="absolute top-6 left-6 right-6 bg-black/80 backdrop-blur-2xl border border-white/10 p-5 rounded-2xl z-40 animate-in fade-in zoom-in duration-300 shadow-2xl">
                 <button 
                   onClick={(e) => { e.stopPropagation(); setActiveRegion(null); }}
                   className="absolute top-4 right-4 text-gray-500 hover:text-white"
                 >
                   <X size={14} />
                 </button>
                 <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl bg-white/5 ${regionData.color}`}>
                      <regionData.icon size={28} />
                    </div>
                    <div className="flex-1">
                      <h4 className={`text-sm font-black uppercase tracking-widest ${regionData.color} flex items-center gap-2 mb-1`}>
                        {regionData.title}
                      </h4>
                      <div className="flex items-center gap-4 mb-3">
                         <div className="flex items-center gap-1">
                           <div className="text-[10px] font-bold text-gray-500 uppercase">CURRENT:</div>
                           <div className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-mono font-bold">
                              {Math.round(regionData.level * 100)}%
                           </div>
                         </div>
                         {regionData.historical !== null && (
                            <div className="flex items-center gap-1">
                               <ArrowRight size={10} className="text-gray-600" />
                               <div className="text-[10px] font-bold text-gray-500 uppercase">HISTORY (DAY {comparisonPoint?.day}):</div>
                               <div className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-[10px] font-mono font-bold text-cyan-400">
                                  {Math.round(regionData.historical * 100)}%
                               </div>
                               <div className={`ml-1 text-[9px] font-bold ${regionData.level > regionData.historical ? 'text-green-400' : 'text-rose-400'}`}>
                                  {regionData.level > regionData.historical ? '+' : ''}{Math.round((regionData.level - regionData.historical) * 100)}%
                               </div>
                            </div>
                         )}
                      </div>
                      <p className="text-[11px] text-gray-300 leading-relaxed font-medium">
                        {regionData.desc}
                      </p>
                    </div>
                 </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center p-8 max-w-sm">
            <Target className="w-16 h-16 text-gray-700 mx-auto mb-6 opacity-40" />
            <h4 className="text-gray-400 font-bold uppercase tracking-widest text-sm mb-2">Neural Link Inactive</h4>
            <p className="text-gray-600 text-xs mb-8">Initialize the high-fidelity 3D path engine to visualize recovery engineering in real-time.</p>
            <button
              onClick={handleGenerateInitial}
              className="px-8 py-3 bg-cyan-500 text-black font-black text-xs uppercase tracking-widest rounded-full hover:bg-cyan-400 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)]"
            >
              Boot Neural Scan
            </button>
          </div>
        )}
      </div>

      {/* System Logs */}
      {imageUrl && (
        <div className="mt-4 bg-black/60 rounded-xl border border-white/10 h-24 overflow-hidden relative scanline">
          <div className="p-2 space-y-1 font-mono text-[9px] text-cyan-500/80">
            {logs.map((log, i) => (
              <div key={i} className="animate-in fade-in slide-in-from-left-2 duration-300">
                {log}
              </div>
            ))}
            <div ref={logEndRef} />
          </div>
          <div className="absolute bottom-2 right-2 text-[8px] uppercase font-bold text-cyan-700 animate-pulse">
             Neural I/O Active
          </div>
        </div>
      )}

      <div className="mt-4 flex gap-2">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={!imageUrl || isLoading}
          placeholder={imageUrl ? "Describe path modifications (e.g., 'Visualize resilience', 'Add neural glitches')" : "Initialize scan first"}
          className="flex-1 bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-xs font-bold text-cyan-300 placeholder-gray-700 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
          onKeyDown={(e) => e.key === 'Enter' && handleEditImage()}
        />
        <button
          onClick={handleEditImage}
          disabled={!imageUrl || !prompt.trim() || isLoading}
          className="px-6 py-3 bg-white/5 border border-white/10 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-white transition-all disabled:opacity-20"
        >
          Inject
        </button>
      </div>
    </div>
  );
};

export default BrainVisualizer;