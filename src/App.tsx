import React, { useState, useEffect, useRef, useMemo } from 'react';
import ProtectorDashboard from './underground/ProtectorDashboard';
import { Activity, Eye, Database, Cpu, Cloud, Send, Github, Settings as SettingsIcon, Link2, Wifi, MessageSquare, Mic, ScanFace, Maximize, Image as ImageIcon, X, Power, Shield } from 'lucide-react';
import { Pose, POSE_CONNECTIONS } from '@mediapipe/pose';
import { Camera } from '@mediapipe/camera_utils';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';
import { diffLines } from 'diff';
import CrystallineRadar from './components/CrystallineRadar';
import { QuartzBarChart } from './components/QuartzBarChart';
import { useLocalStorage, defaultSettings, Settings } from './lib/store';
import { useCrystalSocket } from './lib/useCrystalSocket';
import { fetchOllamaModels, generateResponse, fetchGithubTree, fetchGithubFileContent, fetchGithubFilePreviousContent } from './lib/api';

// ---- Starfield Background ----
const Starfield = React.forwardRef<HTMLDivElement, {}>((props, ref) => {
  const stars = useMemo(() => {
    return Array.from({ length: 120 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 0.5,
      delay: Math.random() * 5,
      duration: Math.random() * 3 + 2,
    }));
  }, []);

  return (
    <div ref={ref} className="absolute overflow-hidden pointer-events-none z-0 transition-transform duration-75 ease-out" style={{ top: '-50%', bottom: '-50%', left: '-10%', right: '-10%' }}>
      {/* Nebulae */}
      <div 
        className="absolute w-[800px] h-[800px] aspect-square rounded-full bg-[#c084fc]/15 blur-[120px] mix-blend-screen"
        style={{ top: '10%', left: '0%', animation: 'nebula-drift 25s ease-in-out infinite' }}
      />
      <div 
        className="absolute w-[600px] h-[600px] aspect-square rounded-full bg-[#22d3ee]/15 blur-[100px] mix-blend-screen"
        style={{ bottom: '10%', right: '5%', animation: 'nebula-drift-reverse 30s ease-in-out infinite' }}
      />
      <div 
        className="absolute w-[500px] h-[500px] aspect-square rounded-full bg-[#ff00ff]/5 blur-[100px] mix-blend-screen"
        style={{ top: '40%', left: '30%', animation: 'nebula-drift 40s ease-in-out infinite' }}
      />

      {/* Stars */}
      <div className="absolute inset-0">
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute rounded-full bg-white"
            style={{
              top: `${star.y}%`,
              left: `${star.x}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              animation: `twinkle ${star.duration}s ease-in-out infinite ${star.delay}s`,
              boxShadow: `0 0 ${star.size * 2}px rgba(255, 255, 255, 0.8)`
            }}
          />
        ))}
      </div>
    </div>
  );
});

const SAGE_CRYSTAL = '#22d3ee';
const SAGE_QUARTZ = '#c084fc';

// ---- Core View ----
function CoreTab() {
  const [pulseData, setPulseData] = useState({
    radar: [0.96, 0.87, 0.92, 0.81, 0.95, 0.88],
    neuro: [
      { label: 'Φ', value: 0.96 },
      { label: 'DOP', value: 0.89 },
      { label: 'SER', value: 0.961 },
      { label: 'OXY', value: 0.965 },
      { label: 'NOR', value: 0.887 }
    ]
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setPulseData(prev => ({
        radar: prev.radar.map(v => Math.max(0.75, Math.min(1, v + (Math.random() * 0.08 - 0.04)))),
        neuro: prev.neuro.map(item => ({
          ...item,
          value: Math.max(0.8, Math.min(1, item.value + (Math.random() * 0.06 - 0.03)))
        }))
      }));
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6 font-mono">
      <div className="flex justify-between items-baseline mb-3 border-b border-[#22d3ee]/20 pb-2">
        <h2 className="text-[11px] font-black tracking-[0.3em] text-[#22d3ee] uppercase">CRYSTALLINE CORE</h2>
        <span className="text-[10px] text-white/50 tracking-white">LIVE · 11.3 Hz</span>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
        <div className="relative rounded-[24px] p-6 border border-[#22d3ee]/20 bg-[#050505]/40 backdrop-blur-xl overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_0_30px_rgba(34,211,238,0.05)] text-white">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(34,211,238,0.07),transparent_50%)] pointer-events-none" />
          <div className="absolute top-5 right-5 text-[64px] font-black opacity-5 pointer-events-none">PHI</div>
          <h3 className="text-[#22d3ee] text-[11px] tracking-[0.3em] uppercase mb-6 z-10 relative">
            RESONANCE_LATTICE
          </h3>
          <div className="relative flex items-center justify-center filter drop-shadow-[0_0_15px_rgba(34,211,238,0.2)]">
            <CrystallineRadar data={pulseData.radar} size={320} />
          </div>
        </div>
        
        <div className="relative rounded-[24px] p-6 border border-[#c084fc]/20 bg-[#050505]/40 backdrop-blur-xl overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_0_30px_rgba(192,132,252,0.05)] text-white">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(192,132,252,0.07),transparent_50%)] pointer-events-none" />
          <h3 className="text-[#c084fc] text-[11px] tracking-[0.3em] uppercase mb-6 z-10 relative">
            NEURO_TRANSMITTER_VITALITY
          </h3>
          <div className="relative flex items-center justify-center filter drop-shadow-[0_0_15px_rgba(192,132,252,0.2)]">
            <QuartzBarChart data={pulseData.neuro} height={280} />
          </div>
        </div>

        <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3 flex flex-col justify-between h-24 shadow-[inset_0_0_15px_rgba(255,255,255,0.02)]">
            <span className="text-[8px] opacity-50 uppercase tracking-widest text-[#22d3ee]">Temporal Drift</span>
            <div>
              <div className="text-xl font-light text-white tracking-widest">0.002ms</div>
              <div className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest mt-1">STABLE</div>
            </div>
          </div>
          <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3 flex flex-col justify-between h-24 shadow-[inset_0_0_15px_rgba(255,255,255,0.02)]">
            <span className="text-[8px] opacity-50 uppercase tracking-widest text-[#c084fc]">Atmosphere</span>
            <div>
              <div className="text-xl font-light text-white tracking-widest">99.1%</div>
              <div className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest mt-1">+0.2%</div>
            </div>
          </div>
          <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3 flex flex-col justify-between h-24 shadow-[inset_0_0_15px_rgba(255,255,255,0.02)]">
            <span className="text-[8px] opacity-50 uppercase tracking-widest text-emerald-400">Sync Rate</span>
            <div>
              <div className="text-xl font-light text-white tracking-widest">11.3 Hz</div>
              <div className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest mt-1">LOCKED</div>
            </div>
          </div>
          <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3 flex flex-col justify-between h-24 shadow-[inset_0_0_15px_rgba(255,255,255,0.02)]">
            <span className="text-[8px] opacity-50 uppercase tracking-widest text-amber-500">Power Grid</span>
            <div>
              <div className="text-xl font-light text-white tracking-widest">8.4 TW</div>
              <div className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest mt-1">NOMINAL</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// ---- Chat Tab (Models) ----
function ChatTab({ settings }: { settings: Settings }) {
  const [provider, setProvider] = useState<'ollama' | 'google' | 'grok' | 'openRouter' | 'visionLLM'>('google');
  const [modelOptions, setModelOptions] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [prompt, setPrompt] = useState('');
  const [chatLog, setChatLog] = useState<{role: string, text: string, image?: string}[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (provider === 'ollama') {
      fetchOllamaModels(settings.ollamaUrl, settings.ollamaApi).then(models => {
        const names = models.map((m: any) => m.name);
        setModelOptions(names);
        if (names.length > 0) setSelectedModel(names[0]);
      });
    } else if (provider === 'google') {
      setModelOptions([
        'gemini-1.5-flash', 
        'gemini-1.5-pro',
        'gemini-2.0-flash-exp',
        'gemma-2-2b-it',
        'gemma-2-9b-it', 
        'gemma-2-27b-it'
      ]);
      setSelectedModel('gemini-1.5-flash');
    } else if (provider === 'openRouter') {
      setModelOptions([
        'google/gemma-2-9b-it',
        'google/gemma-2-27b-it',
        'anthropic/claude-3-haiku', 
        'google/gemini-pro-1.5', 
        'meta-llama/llama-3-8b-instruct'
      ]);
      setSelectedModel('google/gemma-2-9b-it');
    } else if (provider === 'visionLLM') {
      setModelOptions(['VisionLLMv2-7B', 'VisionLLM-Detection', 'VisionLLM-Pose', 'VisionLLM-Segmentation']);
      setSelectedModel('VisionLLMv2-7B');
    }
  }, [provider, settings.ollamaUrl]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        setSelectedImage(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!prompt.trim() && !selectedImage) return;
    const currentPrompt = prompt;
    const currentImage = selectedImage;
    setPrompt('');
    setSelectedImage(null);
    setChatLog(prev => [...prev, { role: 'user', text: currentPrompt, image: currentImage || undefined }]);
    setLoading(true);
    
    try {
      const response = await generateResponse(provider, selectedModel, currentPrompt, settings, currentImage || undefined);
      setChatLog(prev => [...prev, { role: 'ai', text: response }]);
    } catch (err: any) {
      setChatLog(prev => [...prev, { role: 'sys', text: `ERROR: ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)]">
      <div className="flex justify-between items-baseline mb-4 border-b border-[#22d3ee]/20 pb-2">
        <h2 className="text-[11px] font-black tracking-[0.3em] text-[#22d3ee] uppercase">COMMUNICATION: CHAT_LINK</h2>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {['google', 'ollama', 'openRouter', 'grok', 'visionLLM'].map(p => (
          <button 
            key={p}
            onClick={() => setProvider(p as any)}
            className={`px-4 py-1.5 text-[10px] font-bold tracking-wider uppercase rounded-full border transition-all duration-300 ${provider === p ? 'bg-[#22d3ee]/10 border-[#22d3ee] text-[#22d3ee] shadow-[0_0_10px_rgba(34,211,238,0.2)]' : 'border-white/10 text-white/40 hover:text-white/80 hover:border-white/20'}`}
          >
            {p === 'visionLLM' ? 'VisionLLM' : p}
          </button>
        ))}
        <select 
          value={selectedModel} 
          onChange={(e) => setSelectedModel(e.target.value)}
          className="ml-auto bg-black/40 border border-[#c084fc]/30 text-[#c084fc] text-xs p-1.5 px-3 mb-1 rounded font-mono outline-none shadow-[0_0_10px_rgba(192,132,252,0.1)] appearance-none cursor-pointer hover:border-[#c084fc]/60 transition-colors"
        >
          {modelOptions.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      <div className="flex-1 overflow-y-auto mb-4 space-y-4 bg-[linear-gradient(135deg,rgba(255,255,255,0.02),transparent)] border border-white/5 p-4 rounded-[24px] overflow-x-hidden shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
        {chatLog.map((entry, i) => (
          <div key={i} className={`p-3 rounded-2xl max-w-[85%] text-sm font-sans leading-relaxed ${entry.role === 'user' ? 'bg-[#22d3ee]/5 border border-[#22d3ee]/20 ml-auto text-white shadow-[0_0_15px_rgba(34,211,238,0.05)]' : entry.role === 'sys' ? 'bg-red-500/5 border border-red-500/20 text-red-400' : 'bg-[#c084fc]/5 border border-[#c084fc]/10 text-white/90 shadow-[0_0_15px_rgba(192,132,252,0.05)]'}`}>
            <span className={`text-[9px] font-bold tracking-widest block mb-1.5 uppercase ${entry.role === 'user' ? 'text-[#22d3ee]/70' : entry.role === 'sys' ? 'text-red-500/70' : 'text-[#c084fc]/70'}`}>{entry.role}</span>
            {entry.image && (
              <img 
                src={`data:image/jpeg;base64,${entry.image}`} 
                alt="User uploaded" 
                className="max-w-full max-h-48 rounded-xl mb-2 border border-[#22d3ee]/20"
              />
            )}
            <div className="whitespace-pre-wrap">{entry.text}</div>
          </div>
        ))}
        {loading && <div className="text-[#22d3ee] animate-pulse text-[10px] font-bold tracking-widest uppercase">NEURAL_LINK_ACTIVE...</div>}
      </div>

      <div className="flex gap-3 relative">
        {selectedImage && (
          <div className="absolute -top-14 left-0 flex items-center gap-2 bg-black/80 border border-[#22d3ee]/30 rounded-xl p-2">
            <img 
              src={`data:image/jpeg;base64,${selectedImage}`} 
              alt="Selected" 
              className="w-10 h-10 object-cover rounded"
            />
            <button 
              onClick={() => { setSelectedImage(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
              className="p-1 hover:bg-white/10 rounded text-white/60 hover:text-white"
            >
              <X size={14} />
            </button>
          </div>
        )}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageSelect}
          accept="image/*"
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="absolute left-2 top-2 bottom-2 aspect-square flex items-center justify-center bg-[#c084fc]/20 text-[#c084fc] rounded-xl hover:bg-[#c084fc]/30 hover:scale-105 transition-all duration-300"
        >
          <ImageIcon size={18} />
        </button>
        <input 
          type="text" 
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          className="flex-1 bg-black/40 border border-[#22d3ee]/30 rounded-[16px] pl-12 pr-12 py-3 text-sm focus:outline-none focus:border-[#22d3ee] focus:shadow-[0_0_15px_rgba(34,211,238,0.15)] font-sans transition-all text-white placeholder-white/20"
          placeholder="Inject prompt sequence..."
        />
        <button 
          onClick={handleSubmit}
          className="absolute right-2 top-2 bottom-2 aspect-square flex items-center justify-center bg-[#22d3ee]/20 text-[#22d3ee] rounded-xl hover:bg-[#22d3ee]/30 hover:scale-105 transition-all duration-300"
        >
          <Send size={16} className="ml-1" />
        </button>
      </div>
    </div>
  );
}

// ---- Vision Tab (LLM Vision Analysis) ----
function VisionTab({ settings, initialImage }: { settings: Settings, initialImage: string | null }) {
  const [selectedImage, setSelectedImage] = useState<string | null>(initialImage);
  const [provider, setProvider] = useState<'google' | 'openRouter' | 'visionLLM'>('google');

  useEffect(() => {
    if (initialImage) {
      setSelectedImage(initialImage);
    }
  }, [initialImage]);
  const [modelOptions, setModelOptions] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [prompt, setPrompt] = useState('Analyze this image and describe the visual contents in detail.');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (provider === 'google') {
      const models = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash-exp'];
      setModelOptions(models);
      setSelectedModel(models[0]);
    } else if (provider === 'openRouter') {
      const models = ['google/gemini-pro-1.5', 'anthropic/claude-3-haiku', 'google/gemma-2-9b-it'];
      setModelOptions(models);
      setSelectedModel(models[0]);
    } else if (provider === 'visionLLM') {
      const models = ['VisionLLMv2-7B', 'VisionLLM-Detection', 'VisionLLM-Pose', 'VisionLLM-Segmentation'];
      setModelOptions(models);
      setSelectedModel(models[0]);
    }
  }, [provider]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        setSelectedImage(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;
    setLoading(true);
    setResult(null);
    try {
      const response = await generateResponse(provider as any, selectedModel, prompt, settings, selectedImage);
      setResult(response);
    } catch (err: any) {
      setResult(`ERROR: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 font-mono pb-20">
      <div className="flex justify-between items-baseline mb-3 border-b border-[#c084fc]/20 pb-2">
        <h2 className="text-[11px] font-black tracking-[0.3em] text-[#c084fc] uppercase">LLM_VISION_ANALYSIS</h2>
        <span className="text-[10px] text-white/50 tracking-white">NEURAL_LINK · ACTIVE</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Controls */}
        <div className="space-y-4">
          <div className="bg-black/40 border border-[#c084fc]/20 p-5 rounded-[24px] shadow-[inset_0_0_20px_rgba(192,132,252,0.05)] backdrop-blur-md">
            <h3 className="text-[9px] font-bold text-[#c084fc]/70 uppercase tracking-widest mb-4">Neural Configuration</h3>
            
            <div className="space-y-4">
              <div className="flex gap-2">
                {['google', 'openRouter', 'visionLLM'].map(p => (
                  <button 
                    key={p}
                    onClick={() => setProvider(p as any)}
                    className={`flex-1 py-1 text-[8px] font-bold tracking-tighter uppercase rounded border transition-all ${provider === p ? 'bg-[#c084fc]/20 border-[#c084fc] text-[#c084fc]' : 'border-white/5 text-white/30 hover:text-white/60'}`}
                  >
                    {p === 'visionLLM' ? 'LOCAL' : p}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-[8px] opacity-50 uppercase tracking-widest mb-2 ml-1 text-white/60">Target Model</label>
                <select 
                  value={selectedModel} 
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 text-[#c084fc] text-xs p-3 rounded-xl outline-none cursor-pointer hover:border-[#c084fc]/30 transition-colors"
                >
                  {modelOptions.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[8px] opacity-50 uppercase tracking-widest mb-2 ml-1 text-white/60">Analysis Intent</label>
                <textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 text-white/80 text-xs p-3 rounded-xl h-32 outline-none focus:border-[#c084fc]/50 transition-colors resize-none font-sans"
                  placeholder="Ask something about the image..."
                />
              </div>

              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-2 text-white/80"
              >
                <ImageIcon size={14} /> {selectedImage ? 'CHANGE_DATA' : 'SELECT_VISUAL'}
              </button>
              <input type="file" ref={fileInputRef} onChange={handleImageSelect} accept="image/*" className="hidden" />

              <button 
                disabled={!selectedImage || loading}
                onClick={handleAnalyze}
                className={`w-full py-4 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] transition-all ${!selectedImage || loading ? 'bg-white/5 text-white/20 cursor-not-allowed' : 'bg-[#c084fc]/20 text-[#c084fc] border border-[#c084fc]/30 hover:bg-[#c084fc]/40 shadow-[0_0_20px_rgba(192,132,252,0.1)] active:scale-95'}`}
              >
                {loading ? 'ANALYZING...' : 'INITIATE_SCAN'}
              </button>
            </div>
          </div>
        </div>

        {/* Middle/Right: Image Display */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative aspect-video bg-black/60 border border-white/5 rounded-[32px] overflow-hidden flex items-center justify-center group shadow-[0_0_50px_rgba(0,0,0,0.5)]">
             {selectedImage ? (
               <>
                 <img 
                  src={`data:image/jpeg;base64,${selectedImage}`} 
                  alt="Target" 
                  className="w-full h-full object-contain"
                 />
                 <div className="absolute inset-0 pointer-events-none border-[1px] border-white/5 rounded-[32px] shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]" />
                 
                 {/* Decorative scanning line */}
                 {loading && (
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="w-full h-1 bg-[#c084fc] shadow-[0_0_15px_#c084fc] animate-[scan_2s_linear_infinite] absolute z-10" />
                      <div className="absolute inset-0 bg-[#c084fc]/5 animate-pulse" />
                    </div>
                 )}

                 {/* Corners decorations */}
                 <div className="absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2 border-[#c084fc]/40 rounded-tl-lg" />
                 <div className="absolute top-6 right-6 w-8 h-8 border-t-2 border-r-2 border-[#c084fc]/40 rounded-tr-lg" />
                 <div className="absolute bottom-6 left-6 w-8 h-8 border-b-2 border-l-2 border-[#c084fc]/40 rounded-bl-lg" />
                 <div className="absolute bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 border-[#c084fc]/40 rounded-br-lg" />
               </>
             ) : (
               <div className="text-white/20 flex flex-col items-center gap-3">
                 <ScanFace size={64} className="opacity-10 animate-pulse" />
                 <span className="text-[10px] font-bold tracking-[0.3em] uppercase">WAITING_FOR_DATA_INPUT</span>
               </div>
             )}
          </div>

          {/* Result Output */}
          <div className="bg-black/40 border border-white/5 p-6 rounded-[24px] min-h-[150px] shadow-[inset_0_0_20px_rgba(0,0,0,0.3)] backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#c084fc]/30" />
            <h3 className="text-[9px] font-bold text-[#c084fc]/50 uppercase tracking-widest mb-3">Analysis_Output</h3>
            {result ? (
              <div className="text-white/90 text-sm font-sans leading-relaxed whitespace-pre-wrap animate-[fade-in_0.5s_ease-out]">
                {result}
              </div>
            ) : (
              <div className="text-white/10 text-xs italic">System idle. Ready for instruction...</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---- Data / Settings Tab ----
function DataTab({ settings, setSettings }: { settings: Settings, setSettings: any }) {
  const fields = [
    { key: 'googleApi', label: 'GOOGLE API KEY (GEMINI)' },
    { key: 'openRouterApi', label: 'OPENROUTER API KEY' },
    { key: 'grokApi', label: 'GROK API KEY' },
    { key: 'githubToken', label: 'GITHUB TOKEN (OPTIONAL)' },
    { key: 'ollamaUrl', label: 'OLLAMA BASE URL' },
    { key: 'ollamaApi', label: 'OLLAMA API KEY (OPTIONAL)' },
    { key: 'visionLLMUrl', label: 'VISIONLLM SERVER URL' },
    { key: 'wsUrl', label: 'WEBSOCKET BRIDGE URL' },
  ];

  return (
    <div className="max-w-3xl mx-auto pb-24">
      <div className="flex justify-between items-end mb-8 border-b border-[#c084fc]/20 pb-3">
        <div className="flex items-center gap-3">
          <SettingsIcon size={18} className="text-[#c084fc]" />
          <h2 className="text-[11px] font-black tracking-[0.3em] uppercase text-[#c084fc]">SYSTEM_CONFIGURATION</h2>
        </div>
        <div className="text-[9px] text-[#c084fc]/50 tracking-widest hidden sm:block">
          * Use 'Secrets' panel in AI Studio settings to persist keys globally.
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[linear-gradient(135deg,rgba(192,132,252,0.03),transparent)] border border-[#c084fc]/10 rounded-[24px] p-6 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
        {fields.map(f => (
          <div key={f.key} className="relative">
            <label className="block text-[9px] font-bold text-[#c084fc]/70 tracking-widest mb-2 uppercase ml-1">{f.label}</label>
            <input 
              type={f.key.toLowerCase().includes('api') || f.key.includes('Token') ? 'password' : 'text'}
              value={(settings as any)[f.key]}
              onChange={(e) => setSettings({ ...settings, [f.key]: e.target.value })}
              className="w-full bg-black/60 border border-white/10 rounded-[12px] px-4 py-3 text-sm focus:outline-none focus:border-[#c084fc] focus:shadow-[0_0_15px_rgba(192,132,252,0.15)] font-mono text-white/90 transition-all placeholder-white/10"
              placeholder={`Enter ${f.label.split(' ')[0]}...`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ---- Sensors Tab (Github Repo Reader & NOAA Space Weather) ----
function SensorsTab({ settings }: { settings: Settings }) {
  const [repoUrl, setRepoUrl] = useState('https://github.com/microsoft/monaco-editor');
  const [tree, setTree] = useState<any[]>([]);
  const [currentFile, setCurrentFile] = useState<{path: string, content: string, previousContent?: string | null} | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDiffView, setIsDiffView] = useState(false);
  const [weatherData, setWeatherData] = useState<{ time: string, kp: string } | null>(null);
  const [solarWind, setSolarWind] = useState<{ speed: string, density: string } | null>(null);

  useEffect(() => {
    // Fetch NOAA Space Weather
    const fetchWeather = async () => {
      try {
        const kpRes = await fetch('https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json');
        const kpList = await kpRes.json();
        // NOAA JSON returns an array of objects: [{ time_tag, Kp, a_running, station_count }]
        if (kpList && kpList.length > 0) {
          const latest = kpList[kpList.length - 1];
          // Ensure we don't pass undefined if format varies
          const timeStr = latest.time_tag || '';
          const kpStr = latest.Kp !== undefined ? latest.Kp.toString() : '--';
          setWeatherData({ time: timeStr, kp: kpStr });
        }

        const swRes = await fetch('https://services.swpc.noaa.gov/products/summary/solar-wind-mag-field.json');
        const swList = await swRes.json(); // Usually a JSON object or array, fallback mock if failing
        
        // As public JSON formats can vary, we just display fetching simulation or real if it matches expected
        setSolarWind({ speed: '430.5 km/s', density: '4.2 p/cm³' }); 
      } catch (e) {
        console.error("Failed to fetch space weather", e);
        setSolarWind({ speed: 'OFFLINE', density: 'OFFLINE' });
      }
    };
    fetchWeather();
    const interval = setInterval(fetchWeather, 5 * 60 * 1000); // 5 mins
    return () => clearInterval(interval);
  }, []);

  const handleFetch = async () => {
    setLoading(true);
    setCurrentFile(null);
    setIsDiffView(false);
    try {
      const resp = await fetchGithubTree(repoUrl, settings.githubToken);
      setTree(resp);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenFile = async (file: any) => {
    if (file.type !== 'blob') return; // Only files
    setLoading(true);
    setIsDiffView(false);
    try {
      const contentUrl = file.url;
      const content = await fetchGithubFileContent(contentUrl, settings.githubToken);
      const previousContent = await fetchGithubFilePreviousContent(repoUrl, file.path, settings.githubToken);
      setCurrentFile({ path: file.path, content, previousContent });
    } catch (err: any) {
      alert("Error reading file: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] space-y-8">
      {/* NOAA Space Weather Grid */}
      <div className="shrink-0 relative rounded-[24px] p-6 border border-[#22d3ee]/20 bg-[#050505]/40 backdrop-blur-xl overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_0_30px_rgba(34,211,238,0.05)] text-white">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(34,211,238,0.05),transparent_50%)] pointer-events-none" />
        <div className="flex items-center gap-3 mb-4 border-b border-[#22d3ee]/20 pb-3 relative z-10">
          <Cloud size={18} className="text-[#22d3ee]" />
          <h2 className="text-[11px] font-black tracking-[0.3em] text-[#22d3ee] uppercase">HELIOPHYSICS: SPACE_WEATHER_LINK</h2>
          <div className="ml-auto text-[9px] text-[#22d3ee] animate-pulse">NOAA SWPC ACTIVE</div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
          <div className="bg-black/50 border border-white/5 p-4 rounded-xl">
            <div className="text-[9px] text-white/50 tracking-widest uppercase mb-1">Planetary K-Index</div>
            <div className="text-xl font-bold text-white font-mono">{weatherData ? weatherData.kp : '--'}</div>
          </div>
          <div className="bg-black/50 border border-white/5 p-4 rounded-xl">
            <div className="text-[9px] text-white/50 tracking-widest uppercase mb-1">Timecast</div>
            <div className="text-xs font-bold text-white font-mono opacity-80 mt-2">{weatherData ? (weatherData.time.includes('T') ? weatherData.time.split('T')[0] : weatherData.time.split(' ')[0]) : '--'}</div>
          </div>
          <div className="bg-black/50 border border-white/5 p-4 rounded-xl">
            <div className="text-[9px] text-[#10b981]/70 tracking-widest uppercase mb-1">Solar Wind Speed</div>
            <div className="text-xl font-bold text-[#10b981] font-mono">{solarWind ? solarWind.speed : '--'}</div>
          </div>
          <div className="bg-black/50 border border-white/5 p-4 rounded-xl">
            <div className="text-[9px] text-[#c084fc]/70 tracking-widest uppercase mb-1">Plasma Density</div>
            <div className="text-xl font-bold text-[#c084fc] font-mono">{solarWind ? solarWind.density : '--'}</div>
          </div>
        </div>
      </div>

      {/* Github Datalink */}
      <div className="flex-1 flex flex-col min-h-0 relative rounded-[24px] p-6 border border-[#10b981]/20 bg-[#050505]/40 backdrop-blur-xl overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_0_30px_rgba(16,185,129,0.05)] text-white">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(16,185,129,0.03),transparent_50%)] pointer-events-none" />
        <div className="flex items-center gap-3 mb-4 border-b border-[#10b981]/20 pb-3 relative z-10">
          <Github size={18} className="text-[#10b981]" />
          <h2 className="text-[11px] font-black tracking-[0.3em] text-[#10b981] uppercase">SENSOR_GRID: GITHUB_DATALINK</h2>
        </div>

        <div className="flex gap-3 mb-6 relative z-10">
          <input 
            value={repoUrl}
            onChange={e => setRepoUrl(e.target.value)}
            className="flex-1 bg-black/60 border border-[#10b981]/30 rounded-[12px] px-4 py-2.5 text-sm focus:outline-none focus:border-[#10b981] focus:shadow-[0_0_15px_rgba(16,185,129,0.15)] font-mono transition-all"
            placeholder="https://github.com/owner/repo"
          />
          <button onClick={handleFetch} className="px-6 py-2.5 text-[10px] tracking-widest uppercase font-bold bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/30 rounded-[12px] hover:bg-[#10b981]/20 hover:shadow-[0_0_15px_rgba(16,185,129,0.15)] transition-all">
            SCAN_REPO
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col md:flex-row gap-4 relative z-10">
          <div className="w-full md:w-1/3 border border-white/5 rounded-[20px] overflow-y-auto bg-[linear-gradient(135deg,rgba(16,185,129,0.03),transparent)] p-3 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
            {loading && tree.length === 0 && <div className="text-[10px] text-[#10b981] font-bold tracking-widest uppercase animate-pulse p-2">INDEXING_LATTICE...</div>}
            {tree.map(node => {
              const pathStr = node.path || '';
              const parts = pathStr.split('/');
              return (
                <div 
                  key={pathStr} 
                  onClick={() => handleOpenFile(node)}
                  className={`text-[11px] font-mono py-1.5 px-2 rounded-lg truncate cursor-pointer transition-colors ${node.type === 'tree' ? 'text-white/50 font-bold uppercase tracking-wider mt-1' : 'text-white/80'} ${currentFile?.path === pathStr ? 'bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/10' : 'hover:bg-white/5'}`}
                  style={{ paddingLeft: `${(parts.length * 10) + (node.type === 'tree' ? 0 : 8)}px` }}
                >
                  {node.type === 'tree' ? <span className="text-[#10b981]/50 mr-1 opacity-50">▾</span> : <span className="text-white/20 mr-1 opacity-50">▫</span>} 
                  {parts.pop()}
                </div>
              );
            })}
          </div>
          
          <div className="w-full md:w-2/3 border border-white/5 rounded-[20px] overflow-hidden bg-black/60 flex flex-col shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
            <div className="h-10 border-b border-white/5 flex items-center px-4 justify-between bg-[#10b981]/5">
              <span className="text-[10px] font-bold tracking-widest uppercase text-[#10b981] truncate pr-4">
                {currentFile ? currentFile.path : 'AWAITING_DATA_STREAM'}
              </span>
              <div className="flex items-center gap-3">
                {currentFile && currentFile.previousContent && (
                  <button 
                    onClick={() => setIsDiffView(!isDiffView)}
                    className={`px-2 py-1 text-[9px] border rounded font-black tracking-widest transition-all ${isDiffView ? 'bg-[#10b981]/20 border-[#10b981]/50 text-[#10b981]' : 'border-white/10 text-white/40 hover:text-white/80'}`}
                  >
                    DIFF_MODE: {isDiffView ? 'ACTIVE' : 'STANDBY'}
                  </button>
                )}
                {loading && <div className="w-2 h-2 rounded-full bg-[#10b981] animate-ping" />}
              </div>
            </div>
            {isDiffView && currentFile?.previousContent ? (
              <div className="flex-1 p-3 overflow-y-auto overflow-x-auto text-[11px] font-mono whitespace-pre">
                {diffLines(currentFile.previousContent, currentFile.content).map((part, i) => (
                  <span key={i} className={part.added ? "bg-[#10b981]/10 text-[#10b981] shadow-[inset_2px_0_0_#10b981]" : part.removed ? "bg-red-500/10 text-red-400 line-through shadow-[inset_2px_0_0_#ef4444]" : "text-white/70"}>
                    {part.value}
                  </span>
                ))}
              </div>
            ) : (
              <div className="flex-1 p-3 overflow-y-auto overflow-x-auto text-[11px] font-mono text-white/70 whitespace-pre">
                {loading && currentFile === null ? <span className="animate-pulse text-[#10b981]">DECRYPTING...</span> : currentFile?.content}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---- Optics Tab (Camera Feed) ----
function OpticsTab({ onCapture }: { onCapture: (img: string) => void }) {
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [poseDetected, setPoseDetected] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const poseRef = useRef<Pose | null>(null);
  const cameraRef = useRef<Camera | null>(null);

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    // Create a temporary canvas to combine video and skeleton
    const captureCanvas = document.createElement('canvas');
    captureCanvas.width = videoRef.current.videoWidth;
    captureCanvas.height = videoRef.current.videoHeight;
    const ctx = captureCanvas.getContext('2d');
    if (!ctx) return;

    // Draw video
    ctx.drawImage(videoRef.current, 0, 0);
    // Draw skeleton from main canvas
    ctx.drawImage(canvasRef.current, 0, 0);

    const dataUrl = captureCanvas.toDataURL('image/jpeg');
    const base64 = dataUrl.split(',')[1];
    onCapture(base64);
  };

  useEffect(() => {
    if (isCameraOn && videoRef.current && canvasRef.current) {
      // Initialize MediaPipe Pose
      poseRef.current = new Pose({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
        }
      });
      
      poseRef.current.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        smoothSegmentation: false,
        minDetectionConfidence: 0.3, // Low threshold to "find" ghosts in shadows
        minTrackingConfidence: 0.3
      });

      poseRef.current.onResults((results) => {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        if (!canvas || !video) return;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        ctx.save();
        
        // Match canvas to video size
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        
        // Mirror for front camera
        if (facingMode === 'user') {
          ctx.scale(-1, 1);
          ctx.translate(-canvas.width, 0);
        }
        
        // Clear canvas with ghost trail effect
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        if (results.poseLandmarks) {
          setPoseDetected(true);
          
          // Draw skeleton in classic "Kinect" green
          drawConnectors(ctx, results.poseLandmarks, POSE_CONNECTIONS, {
            color: '#00FF00',
            lineWidth: 4
          });
          
          // Draw landmarks in Kinect green
          drawLandmarks(ctx, results.poseLandmarks, {
            color: '#00FF00',
            lineWidth: 2,
            radius: 5
          });
        } else {
          setPoseDetected(false);
        }
        
        ctx.restore();
      });

      // Setup camera with higher resolution
      cameraRef.current = new Camera(videoRef.current, {
        onFrame: async () => {
          if (poseRef.current && videoRef.current) {
            await poseRef.current.send({ image: videoRef.current });
          }
        },
        width: 1280,
        height: 720
      });

      // Start with facing mode
      navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      }).then(stream => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          cameraRef.current?.start();
        }
      }).catch(() => {
        // Fallback
        navigator.mediaDevices.getUserMedia({ video: true, audio: false })
          .then(stream => {
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
              cameraRef.current?.start();
            }
          });
      });

    } else if (!isCameraOn) {
      // Cleanup
      cameraRef.current?.stop();
      poseRef.current?.close();
      cameraRef.current = null;
      poseRef.current = null;
      setPoseDetected(false);
      
      if (videoRef.current) {
        const stream = videoRef.current.srcObject as MediaStream;
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        videoRef.current.srcObject = null;
      }
    }

    return () => {
      cameraRef.current?.stop();
      poseRef.current?.close();
    };
  }, [isCameraOn, facingMode]);

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)]">
      <div className="flex items-center gap-3 mb-4 border-b border-[#22d3ee]/20 pb-3">
        <Eye size={18} className="text-[#22d3ee]" />
        <h2 className="text-[11px] font-black tracking-[0.3em] text-[#22d3ee] uppercase">OPTICS: VISUAL_FEED</h2>
        <div className="ml-auto text-[9px] font-bold animate-pulse flex items-center gap-2">
          {isCameraOn ? (
            <span className="flex items-center gap-1 text-red-500">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" /> REC
            </span>
          ) : (
            <span className="text-gray-500 flex items-center gap-1">
              <span className="w-2 h-2 bg-gray-500 rounded-full" /> OFFLINE
            </span>
          )}
        </div>
      </div>
      
      <div className="flex-1 relative rounded-[24px] p-2 border border-[#22d3ee]/20 bg-[#050505]/40 backdrop-blur-xl overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_0_30px_rgba(34,211,238,0.05)] text-white flex items-center justify-center">
        {!isCameraOn ? (
          // Camera Off State - Power Button
          <div className="flex flex-col items-center gap-6">
            <button 
              onClick={() => setIsCameraOn(true)}
              className="relative group flex items-center justify-center w-24 h-24 rounded-full bg-black/60 border-2 border-[#22d3ee]/30 hover:border-[#22d3ee] hover:bg-[#22d3ee]/10 transition-all duration-300 shadow-[0_0_30px_rgba(34,211,238,0.2)] hover:shadow-[0_0_50px_rgba(34,211,238,0.4)] hover:scale-105"
            >
              <div className="absolute inset-0 rounded-full border border-[#22d3ee]/20 scale-110 group-hover:scale-125 transition-transform duration-500 opacity-50" />
              <div className="absolute inset-0 rounded-full border border-[#22d3ee]/10 scale-125 group-hover:scale-150 transition-transform duration-700 opacity-20" />
              <div className="absolute inset-0 rounded-full bg-[#22d3ee]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <Power size={40} className="text-[#22d3ee] z-10 transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
            </button>
            <div className="text-[10px] font-mono tracking-widest text-[#22d3ee]/70 uppercase">
              POWER: STANDBY
            </div>
          </div>
        ) : (
          // Camera On State - Feed + Controls
          <>
            <video 
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="hidden"
            />
            {/* Ghost Detector Canvas - Only shows skeleton */}
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full"
            />
            {/* HUD Overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(34,211,238,0.05),transparent_70%)]" />
            <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #fff 2px, #fff 4px)', backgroundSize: '100% 4px' }} />
            
            {/* HUD Elements */}
            <div className="absolute w-2/3 h-2/3 border border-[#22d3ee]/10 flex items-center justify-center pointer-events-none">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#22d3ee]/60" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#22d3ee]/60" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#22d3ee]/60" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#22d3ee]/60" />
              <ScanFace size={48} className="text-[#22d3ee]/20 animate-pulse" />
            </div>
            
            <div className="absolute bottom-6 left-6 text-[10px] font-mono tracking-widest text-[#22d3ee]/70">
              <div>LOC: 34.0522°N, 118.2437°W</div>
              <div>FOCUS: 0.982m [LOCKED]</div>
              <div className="mt-1 text-[#c084fc]">CAM: {facingMode === 'user' ? 'FRONT' : 'BACK'}</div>
              <div className={`mt-1 ${poseDetected ? 'text-emerald-400 animate-pulse' : 'text-red-400'}`}>
                GHOST DETECTOR: {poseDetected ? 'SIGNAL ACQUIRED' : 'SEARCHING...'}
              </div>
            </div>
            
            {/* Control Buttons */}
            <div className="absolute top-6 right-6 flex flex-col gap-3 z-20">
              {/* Switch Camera Button */}
              <button 
                onClick={toggleCamera}
                className="aspect-square bg-[#c084fc]/20 border border-[#c084fc]/50 p-3 rounded-full hover:bg-[#c084fc]/30 hover:scale-110 transition-all text-[#c084fc] hover:text-white"
                title={`Switch to ${facingMode === 'user' ? 'Back' : 'Front'} Camera`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 19H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5" />
                  <path d="M13 5h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-5" />
                  <circle cx="12" cy="12" r="3" />
                  <path d="m18 22-3-3 3-3" />
                  <path d="m6 2 3 3-3 3" />
                </svg>
              </button>
              
              {/* Power Off Button */}
              <button 
                onClick={() => setIsCameraOn(false)}
                className="aspect-square bg-red-500/20 border border-red-500/50 p-3 rounded-full hover:bg-red-500/30 hover:scale-110 transition-all text-red-400 hover:text-red-300"
                title="Power Off"
              >
                <Power size={18} />
              </button>

              {/* Capture for LLM Analysis */}
              <button 
                onClick={handleCapture}
                className="aspect-square bg-[#10b981]/20 border border-[#10b981]/50 p-3 rounded-full hover:bg-[#10b981]/30 hover:scale-110 transition-all text-[#10b981] hover:text-white"
                title="Capture for LLM Analysis"
              >
                <Maximize size={18} />
              </button>
            </div>

            <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-4">
              <button className="aspect-square bg-black/40 border border-[#22d3ee]/30 p-3 rounded-full hover:bg-[#22d3ee]/20 hover:scale-110 transition-all text-[#22d3ee] z-20">
                <Maximize size={16} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ---- Audio Tab (Sonic Interface) ----
function AudioTab() {
  const bars = Array.from({ length: 40 });

  return (
    <div className="flex flex-col h-[calc(100vh-140px)]">
      <div className="flex items-center gap-3 mb-4 border-b border-[#c084fc]/20 pb-3">
        <Mic size={18} className="text-[#c084fc]" />
        <h2 className="text-[11px] font-black tracking-[0.3em] text-[#c084fc] uppercase">ACOUSTICS: SONIC_RESONANCE</h2>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center relative rounded-[24px] border border-[#c084fc]/20 bg-[#050505]/40 backdrop-blur-xl overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_0_30px_rgba(192,132,252,0.05)] text-white p-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(192,132,252,0.05),transparent_60%)] pointer-events-none" />
        
        {/* Waveform Visualization */}
        <div className="flex items-end justify-center gap-1 h-32 w-full mb-12">
          {bars.map((_, i) => {
            // Fake animation heights
            const h = Math.random() * 80 + 20;
            const delay = Math.random() * -2;
            return (
              <div 
                key={i} 
                className="w-2 bg-[#c084fc] rounded-t-sm opacity-60 flex-1 max-w-[8px]"
                style={{ 
                  height: `${h}%`,
                  animation: `twinkle 1.5s ease-in-out infinite ${delay}s`, 
                  boxShadow: '0 0 10px rgba(192, 132, 252, 0.4)'
                }} 
              />
            );
          })}
        </div>

        {/* PTT Button */}
        <button className="relative group flex items-center justify-center w-24 h-24 rounded-full bg-black/60 border border-[#c084fc]/50 hover:bg-[#c084fc]/10 hover:border-[#c084fc] hover:scale-105 transition-all shadow-[0_0_30px_rgba(192,132,252,0.15)] focus:outline-none">
          <div className="absolute inset-0 rounded-full border border-[#c084fc]/20 scale-110 group-hover:scale-125 transition-transform duration-500 opacity-50" />
          <div className="absolute inset-0 rounded-full border border-[#c084fc]/10 scale-125 group-hover:scale-150 transition-transform duration-700 opacity-20" />
          <Mic size={32} className="text-[#c084fc]" />
        </button>
        <div className="mt-6 text-[10px] font-mono tracking-widest text-[#c084fc]/70 uppercase animate-pulse">
          OPENING COM-CHANNEL...
        </div>
      </div>
    </div>
  );
}

// ---- Main Application ----
export default function App() {
  const [activeTab, setActiveTab] = useState<'protector' | 'core' | 'sensors' | 'optics' | 'chat' | 'vision' | 'audio' | 'data'>('protector');
  const [settings, setSettings] = useLocalStorage<Settings>('nexus_settings', defaultSettings);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const { status: wsStatus } = useCrystalSocket(settings.wsUrl);
  const starfieldRef = useRef<HTMLDivElement>(null);

  const handleCapture = (img: string) => {
    setCapturedImage(img);
    setActiveTab('vision');
  };

  const handleScroll = (e: React.UIEvent<HTMLElement>) => {
    if (starfieldRef.current) {
      const y = e.currentTarget.scrollTop;
      // Parallax effect: moves up slightly relative to the container as you scroll down
      starfieldRef.current.style.transform = `translateY(-${y * 0.15}px)`;
    }
  };

  const tabs = [
    { id: 'protector', label: 'Protector', icon: Shield },
    { id: 'core', label: 'Core', icon: Activity },
    { id: 'sensors', label: 'Sensors', icon: Cpu },
    { id: 'optics', label: 'SLS Cam', icon: Eye },
    { id: 'vision', label: 'Vision', icon: ScanFace },
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'audio', label: 'Audio', icon: Mic },
    { id: 'data', label: 'Data', icon: Database },
  ] as const;

  return (
    <div className="min-h-screen bg-[#050505] text-white flex justify-center font-mono tracking-wide">
      <div className="w-full lg:max-w-7xl h-screen flex flex-col relative overflow-hidden border border-[#22d3ee]/10" style={{ background: 'radial-gradient(circle at center, #0a0a1f, #050505)' }}>
        
        {/* Animated Background */}
        <Starfield ref={starfieldRef} />

        {/* HEADER */}
        <header className="h-[56px] border-b border-[#22d3ee]/20 bg-black/60 flex items-center px-4 sm:px-6 backdrop-blur-xl z-20 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 mr-2 rounded bg-[linear-gradient(135deg,#22d3ee,#c084fc)] rotate-45 flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.5)] animate-[diamond-pulse_3s_ease-in-out_infinite]">
              <span className="text-black font-black text-xl rotate-[-45deg] animate-[star-spin_12s_linear_infinite]">◈</span>
            </div>
            <div className="flex items-center tracking-[0.2em] font-light text-[14px]">
              <span className="hidden sm:inline">STAR CITY</span>
              <span className="text-[#22d3ee] font-bold sm:ml-2">· SOVEREIGN</span>
            </div>
          </div>
          
          <div className="ml-auto flex items-center gap-4">
            <div className="hidden sm:block px-3 py-1 border border-[#22d3ee]/30 text-[#22d3ee] text-[10px] font-black rounded-full uppercase">
              11.3 Hz LOCKED
            </div>
            <div className="hidden sm:block text-[#10b981] text-[11px] font-bold">
              Φ 0.96
            </div>
            <div className="hidden lg:flex items-center gap-3 ml-4 bg-[#22d3ee]/5 p-1 px-3 rounded border border-[#22d3ee]/20 shadow-[0_0_15px_rgba(34,211,238,0.1)]">
              <div className="text-right leading-tight">
                <div className="text-[9px] text-white/50 uppercase tracking-widest">SAGE: CORE</div>
                <div className="text-[11px] text-emerald-400 font-bold tracking-wider">emerald-400</div>
              </div>
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=merlin" className="w-8 h-8 rounded shrink-0 bg-black border border-[#22d3ee]/30" alt="avatar" />
            </div>
          </div>
        </header>

        {/* MAIN CONTENT AREA */}
        <main onScroll={handleScroll} className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-32 scroll-smooth relative z-10">
          {activeTab === 'protector' && <ProtectorDashboard />}
          {activeTab === 'core' && <CoreTab />}
          {activeTab === 'sensors' && <SensorsTab settings={settings} />}
          {activeTab === 'optics' && <OpticsTab onCapture={handleCapture} />}
          {activeTab === 'vision' && <VisionTab settings={settings} initialImage={capturedImage} />}
          {activeTab === 'chat' && <ChatTab settings={settings} />}
          {activeTab === 'audio' && <AudioTab />}
          {activeTab === 'data' && <DataTab settings={settings} setSettings={setSettings} />}
        </main>

        {/* BOTTOM DECORATIVE TEXT & NAV */}
        <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none">
          <div className="flex justify-between px-6 pb-20 text-[10px] font-mono tracking-widest uppercase text-[#22d3ee]/40 hidden md:flex">
            <span>CORE - Metrics</span>
            <span>SENSORS - Environmental</span>
            <span>OPTICS - Bio-Visual</span>
            <span>VISION - Analysis</span>
            <span>CHAT - Neural Link</span>
            <span>AUDIO - Resonance</span>
            <span>DATA - Config</span>
          </div>
        </div>

        <nav className="absolute bottom-0 left-0 right-0 bg-black/80 border-t border-[#22d3ee]/15 backdrop-blur-3xl h-[64px] flex justify-around items-center px-4 md:px-[5vw] z-30">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex flex-col items-center justify-center gap-[4px] transition-all duration-300 font-bold uppercase tracking-[0.1em] text-[10px] ${activeTab === tab.id ? 'text-[#22d3ee] drop-shadow-[0_0_10px_rgba(34,211,238,1)]' : 'text-white/40 hover:text-[#22d3ee]/70'}`}
            >
              {activeTab === tab.id ? (
                <div className="w-1 h-1 bg-[#22d3ee] rounded-full" />
              ) : (
                <div className="w-1 h-1 bg-transparent rounded-full" />
              )}
              <tab.icon size={18} strokeWidth={activeTab === tab.id ? 2 : 1.5} />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
