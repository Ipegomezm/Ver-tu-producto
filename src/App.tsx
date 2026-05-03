/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Layout, 
  Newspaper, 
  Instagram, 
  Monitor, 
  Loader2,
  Box,
  Palette,
  ChevronRight,
  RefreshCcw
} from 'lucide-react';
import { synthesizeProductDNA, generateMediumPrompt, generateBrandImage, ProductDNA } from './services/geminiService';

interface BrandAsset {
  medium: 'billboard' | 'newspaper' | 'social';
  url: string;
  label: string;
  description: string;
}

export default function App() {
  const [description, setDescription] = useState('');
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [dna, setDna] = useState<ProductDNA | null>(null);
  const [assets, setAssets] = useState<BrandAsset[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!description.trim()) return;
    
    setIsSynthesizing(true);
    setError(null);
    setAssets([]);
    
    try {
      const productDNA = await synthesizeProductDNA(description);
      setDna(productDNA);
      setIsSynthesizing(false);
      setIsGenerating(true);

      const mediums: Array<{ key: 'billboard' | 'newspaper' | 'social'; label: string; desc: string }> = [
        { key: 'billboard', label: 'Billboard | 48\' x 14\'', desc: 'Large scale outdoor impact' },
        { key: 'newspaper', label: 'Print | Daily Journal', desc: 'Luxury newsprint feature' },
        { key: 'social', label: 'Digital | Social 4:5', desc: 'Modern digital lifestyle' }
      ];

      const generatedAssets: BrandAsset[] = [];
      
      for (const m of mediums) {
        const prompt = await generateMediumPrompt(productDNA, m.key);
        const url = await generateBrandImage(prompt);
        generatedAssets.push({
          medium: m.key,
          url,
          label: m.label,
          description: m.desc
        });
        setAssets([...generatedAssets]);
      }

    } catch (err) {
      console.error(err);
      setError('An error occurred during generation. Please try again.');
    } finally {
      setIsSynthesizing(false);
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#050505] text-[#E0E0E0] font-sans selection:bg-brand/30">
      {/* Sidebar - Controls */}
      <aside className="w-85 border-r border-white/10 bg-[#0A0A0A] flex flex-col shrink-0">
        <div className="p-8 border-b border-white/10">
          <h1 className="text-[10px] tracking-[0.3em] uppercase text-brand font-bold mb-4">Brand Builder</h1>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
            <span className="text-[9px] uppercase tracking-[0.2em] text-white/40 font-mono">Nano-Banana v4.2 Active</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-10">
          <section>
            <label className="text-[10px] uppercase tracking-widest text-white/50 block mb-4 font-semibold">
              Product Definition
            </label>
            <div className="relative group">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your vision..."
                className="w-full h-44 bg-white/5 border border-white/10 rounded-lg p-5 text-sm leading-relaxed text-white/80 font-serif italic focus:border-brand/50 focus:bg-white/10 outline-none transition-all resize-none placeholder:text-white/20"
              />
            </div>
            
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={handleGenerate}
              disabled={isSynthesizing || isGenerating || !description}
              className="w-full py-4 mt-6 border border-brand/40 text-brand text-[10px] uppercase tracking-[0.2em] hover:bg-brand/10 transition-colors rounded-sm disabled:opacity-30 disabled:cursor-not-allowed font-bold"
            >
              {isSynthesizing || isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin mx-auto" />
              ) : "Synthesize Assets"}
            </motion.button>

            {error && (
              <p className="mt-4 text-[10px] text-red-500/80 uppercase tracking-wider">{error}</p>
            )}
          </section>

          <AnimatePresence>
            {dna && (
              <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6 pt-6 border-t border-white/5"
              >
                <label className="text-[10px] uppercase tracking-widest text-white/50 block mb-4 font-semibold">Brand Identity DNA</label>
                
                <div className="space-y-5">
                  <div className="flex justify-between items-center text-[11px] font-mono tracking-wider">
                    <span className="text-white/40 uppercase">Product Name</span>
                    <span className="text-brand">{dna.name}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-mono text-white/40 uppercase tracking-wider">Palette</span>
                    <div className="flex gap-1">
                      {dna.colorPalette.map((color, i) => (
                        <div key={i} className="w-3 h-3 rounded-full border border-white/10" style={{ backgroundColor: color }} />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-[10px] font-mono">
                      <span className="text-white/40 uppercase tracking-wider text-[9px]">Consistency Lock</span>
                      <span className="text-brand">98%</span>
                    </div>
                    <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: "98%" }}
                        className="bg-brand h-full shadow-[0_0_8px_rgba(197,160,89,0.3)]" 
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-brand/5 border border-brand/20 rounded-lg">
                    <p className="text-[11px] text-brand/80 leading-relaxed font-serif italic italic italic italic">
                      "{dna.materials}"
                    </p>
                  </div>
                </div>
              </motion.section>
            )}
          </AnimatePresence>
        </div>
      </aside>

      {/* Main Preview Zone */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#050505]">
        <header className="px-10 py-8 flex justify-between items-end border-b border-white/5 shrink-0 bg-[#050505]/80 backdrop-blur-xl z-20">
          <div>
            <h2 className="text-4xl font-serif text-white tracking-tight mb-1">Visual Simulation</h2>
            <p className="text-xs text-white/30 font-light tracking-wide uppercase italic italic italic">Multi-Medium Product Consistency Report</p>
          </div>
          <div className="flex gap-4">
            <div className="px-5 py-2 bg-white/5 hover:bg-white/10 cursor-pointer transition-colors rounded-full text-[9px] uppercase tracking-widest border border-white/10 font-bold">
              Export Package
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10">
          {assets.length === 0 && !isGenerating && !isSynthesizing ? (
            <div className="h-full border border-white/5 rounded-2xl flex flex-col items-center justify-center text-center p-12 bg-white/[0.02]">
              <div className="w-20 h-20 border border-brand/20 rounded-full flex items-center justify-center mb-8 bg-brand/5">
                <Box className="w-8 h-8 text-brand opacity-40" />
              </div>
              <h3 className="text-xl font-serif text-white/90 mb-3 tracking-wide">Awaiting Definition</h3>
              <p className="text-sm text-white/30 max-w-sm font-light leading-relaxed">
                Enter your product description in the control panel to initiate the multi-medium rendering sequence.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-8 auto-rows-min pb-12">
              <AnimatePresence mode="popLayout">
                {assets.map((asset, index) => (
                  <motion.div
                    key={asset.medium}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.15 }}
                    className={`relative group rounded-xl overflow-hidden border border-white/10 bg-[#0A0A0A] ${
                      asset.medium === 'billboard' ? 'col-span-2' : 'col-span-1'
                    }`}
                  >
                    {/* Tag */}
                    <div className="absolute top-5 left-5 z-10 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded text-[9px] font-mono uppercase tracking-[0.1em] text-white/70 border border-white/10">
                      {asset.label}
                    </div>

                    <div className={`relative overflow-hidden w-full ${
                      asset.medium === 'billboard' ? 'aspect-[21/9]' : 'aspect-square'
                    }`}>
                      <img
                        src={asset.url}
                        alt={asset.label}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-105"
                      />
                      
                      {/* Overlay Info */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 p-8 flex flex-col justify-end">
                        <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                          <p className="text-brand text-[10px] uppercase tracking-[0.3em] font-bold mb-2">Technical Meta</p>
                          <p className="text-xs text-white/60 font-serif italic max-w-md">
                            Ensuring high-fidelity shadow mapping and consistent material response across diverse lighting environments.
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {(isSynthesizing || isGenerating) && assets.length < 3 && (
                <div className="col-span-2 py-24 flex flex-col items-center justify-center rounded-2xl bg-white/[0.02] border border-dashed border-white/10">
                   <RefreshCcw className="w-8 h-8 text-brand animate-spin mb-6" />
                   <p className="text-[10px] tracking-[0.4em] text-white/30 uppercase font-mono animate-pulse">
                     Rendering Sequence: {isSynthesizing ? "Synthesizing DNA" : "Building Medium " + (assets.length + 1)}
                   </p>
                </div>
              )}
            </div>
          )}
        </div>

        <footer className="px-10 py-6 border-t border-white/5 flex justify-between items-center bg-[#0A0A0A]/50 shrink-0">
          <div className="flex gap-8">
            <div className="flex items-center gap-3">
               <div className="w-1.5 h-1.5 rounded-full bg-brand"></div>
               <span className="text-[9px] uppercase tracking-widest text-white/30 font-mono">Sim Status: Nominal</span>
            </div>
            <div className="flex items-center gap-3">
               <div className="w-1.5 h-1.5 rounded-full bg-brand"></div>
               <span className="text-[9px] uppercase tracking-widest text-white/30 font-mono">Product Lock: Active</span>
            </div>
          </div>
          <div className="text-[9px] uppercase tracking-widest text-white/20 font-mono">
            &copy; Brand Builder Engine // 2026
          </div>
        </footer>
      </main>
    </div>
  );
}

