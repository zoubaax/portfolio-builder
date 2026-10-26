import React, { useState } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { TEMPLATE_MOCKS } from '../../types/portfolio';
import { PortfolioRenderer } from '../portfolio/PortfolioRenderer';
import {
  RiLayoutMasonryLine,
  RiCheckLine,
  RiGlobalLine,
  RiArrowRightLine,
  RiSparkling2Fill,
  RiEyeLine,
  RiArrowLeftLine,
  RiCloseLine,
  RiComputerLine,
  RiSmartphoneLine,
  RiTabletLine,
  RiInformationLine,
  RiExternalLinkLine
} from 'react-icons/ri';

export const TemplatesTab = ({ onApplyComplete }) => {
  const { portfolio, globalTemplates, applyGlobalTemplate, setViewMode } = usePortfolio();
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [previewTemplateId, setPreviewTemplateId] = useState(null);
  const [previewDevice, setPreviewDevice] = useState('desktop'); // 'desktop' | 'tablet' | 'mobile'

  const categories = ['Tous', ...Array.from(new Set(globalTemplates.map((t) => t.category).filter(Boolean)))];

  const filteredTemplates = selectedCategory === 'Tous'
    ? globalTemplates
    : globalTemplates.filter((t) => t.category === selectedCategory);

  const currentThemeId = portfolio?.theme?.id;

  const handleApply = (templateId) => {
    applyGlobalTemplate(templateId);
    setPreviewTemplateId(null);
    if (onApplyComplete) {
      onApplyComplete();
    }
  };

  const selectedMock = previewTemplateId ? TEMPLATE_MOCKS[previewTemplateId] : null;

  return (
    <div className="w-full h-full flex flex-col bg-[#0b0f19] text-zinc-100 overflow-y-auto selection:bg-sky-500/30">
      {/* 1. Header Bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-[#0b0f19]/90 backdrop-blur-xl border-b border-zinc-800/80">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-linear-to-tr from-sky-500/20 to-indigo-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400 shadow-sm">
            <RiLayoutMasonryLine className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <span>Galerie des Templates Globaux</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium text-sky-400 bg-sky-500/10 border border-sky-400/20">
                Aperçu Réel & Modulaire
              </span>
            </h1>
            <p className="text-xs text-zinc-400">
              Cliquez sur un template pour l’explorer en plein écran ou l’appliquer directement à votre portfolio.
            </p>
          </div>
        </div>

        <button
          onClick={() => setViewMode('preview')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-zinc-200 text-zinc-900 text-xs font-semibold transition-all cursor-pointer shadow-sm active:scale-95"
        >
          <RiGlobalLine className="w-3.5 h-3.5 text-zinc-800" />
          <span>Retour au Studio</span>
          <RiArrowRightLine className="w-3.5 h-3.5 text-zinc-500" />
        </button>
      </div>

      <div className="max-w-7xl mx-auto w-full px-6 py-6 space-y-6">
        {/* Info Banner */}
        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex items-start gap-3">
          <RiInformationLine className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
          <div className="text-xs text-zinc-300 space-y-1">
            <p className="font-semibold text-white">
              Vos informations personnelles et projets restent 100% préservés.
            </p>
            <p className="text-zinc-400 leading-relaxed">
              L'application d'un template adapte automatiquement le layout de toutes vos sections et vos couleurs. Après application, vous pouvez toujours modifier ou mixer chaque section individuellement grâce à la barre de contrôle au survol.
            </p>
          </div>
        </div>

        {/* 2. Category Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-sky-500 text-white font-semibold shadow-md shadow-sky-500/20'
                  : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800/80'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 3. Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
          {filteredTemplates.map((template) => {
            const isCurrent = currentThemeId === template.themeId;
            const mock = TEMPLATE_MOCKS[template.id];
            const heroData = mock?.sections?.find(s => s.type === 'hero')?.data || {};

            return (
              <div
                key={template.id}
                className={`group flex flex-col rounded-2xl border overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1.5 ${
                  isCurrent
                    ? 'border-sky-500 bg-zinc-900/95 shadow-lg shadow-sky-500/10 ring-1 ring-sky-500'
                    : 'border-zinc-800/80 bg-zinc-900/60 hover:border-zinc-700'
                }`}
              >
                {/* REAL MINIATURE PREVIEW THUMBNAIL */}
                <div
                  onClick={() => setPreviewTemplateId(template.id)}
                  className="relative h-56 p-5 flex flex-col justify-between overflow-hidden border-b border-zinc-800/60 cursor-pointer select-none"
                  style={{ backgroundColor: template.previewColors[0] }}
                >
                  {/* Subtle radial ambient background light */}
                  <div
                    className="absolute inset-0 opacity-25 pointer-events-none"
                    style={{
                      backgroundImage: `radial-gradient(circle at 50% 25%, ${template.previewColors[2]} 0%, transparent 70%)`
                    }}
                  />

                  {/* Top Bar Preview */}
                  <div className="relative z-10 flex items-center justify-between">
                    <span
                      className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold tracking-wide"
                      style={{
                        backgroundColor: template.previewColors[1],
                        color: template.previewColors[2],
                        border: `1px solid ${template.previewColors[2]}33`
                      }}
                    >
                      {template.category}
                    </span>

                    <div className="flex items-center gap-1.5 bg-black/50 px-2.5 py-1 rounded-full border border-white/10 backdrop-blur-sm">
                      {template.previewColors.map((color, cIdx) => (
                        <div
                          key={cIdx}
                          className="w-2.5 h-2.5 rounded-full border border-black/40 shadow-xs"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Dedicated Realistic Template Miniature Render */}
                  <div className="relative z-10 flex-1 flex flex-col justify-center">
                    {template.id === 'devops-architect' && (
                      <div className="flex items-center gap-4 py-1">
                        <div className="w-14 h-14 rounded-full border-2 border-sky-400 p-0.5 bg-slate-900 shrink-0 shadow-lg">
                          <img 
                            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80" 
                            alt="Preview" 
                            className="w-full h-full object-cover rounded-full" 
                          />
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono text-sky-400 font-bold uppercase tracking-wider block">
                            Hello, I am
                          </span>
                          <h4 className="text-lg font-black text-white leading-none">
                            DevOps Engineer
                          </h4>
                          <div className="text-[11px] font-mono text-slate-300 flex items-center gap-1">
                            <span>Cloud & Platform Architect</span>
                            <span className="w-1.5 h-3 bg-sky-400 animate-pulse" />
                          </div>
                        </div>
                      </div>
                    )}

                    {template.id === 'terminal-hacker' && (
                      <div className="rounded-xl border border-emerald-500/30 bg-black/80 p-3 font-mono text-[11px] space-y-1.5 shadow-inner">
                        <div className="flex items-center gap-1.5 pb-1 border-b border-white/5">
                          <div className="w-2 h-2 rounded-full bg-rose-500" />
                          <div className="w-2 h-2 rounded-full bg-amber-500" />
                          <div className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span className="text-[9px] text-zinc-500 ml-1">bash - cipher@cloud</span>
                        </div>
                        <div className="text-emerald-400">
                          <span className="text-zinc-500">root@node:~$ </span>./deploy_mesh.sh
                        </div>
                        <div className="text-emerald-300 text-[10px] flex items-center gap-1">
                          <span>✓ 18 microservices running</span>
                          <span className="w-1.5 h-2.5 bg-emerald-400 animate-pulse" />
                        </div>
                      </div>
                    )}

                    {template.id === 'bento-violet' && (
                      <div className="grid grid-cols-3 gap-2 py-1">
                        <div className="col-span-2 rounded-xl p-2.5 bg-purple-950/40 border border-purple-500/30 space-y-1">
                          <span className="text-[9px] text-purple-400 font-bold uppercase">SaaS Platform</span>
                          <h4 className="text-sm font-bold text-white leading-tight">Sophia Chen</h4>
                          <span className="text-[9px] text-zinc-400 block">AI Product Engineer</span>
                        </div>
                        <div className="rounded-xl p-2 bg-zinc-900/80 border border-white/10 flex flex-col justify-center items-center text-center">
                          <span className="text-base font-black text-purple-400">99.9%</span>
                          <span className="text-[8px] text-zinc-400">Reliability</span>
                        </div>
                      </div>
                    )}

                    {template.id === 'cyber-slate' && (
                      <div className="flex items-center gap-3.5 py-1">
                        <div className="w-12 h-12 rounded-xl border border-indigo-500/30 bg-slate-900 p-0.5 shrink-0 overflow-hidden shadow-md">
                          <img 
                            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80" 
                            alt="Alex" 
                            className="w-full h-full object-cover rounded-lg" 
                          />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-base font-bold text-white leading-none">Alex Vance</h4>
                          <p className="text-[10px] text-indigo-400 font-medium">Senior Full-Stack & AI</p>
                          <div className="flex gap-1">
                            <span className="px-1.5 py-0.5 rounded text-[8px] font-mono bg-white/5 border border-white/10 text-zinc-300">React</span>
                            <span className="px-1.5 py-0.5 rounded text-[8px] font-mono bg-white/5 border border-white/10 text-zinc-300">Docker</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {template.id === 'superdesign-ember' && (
                      <div className="rounded-xl p-3 bg-zinc-950 border border-orange-500/30 space-y-1.5 shadow-lg shadow-orange-500/5">
                        <span className="text-[9px] font-mono text-orange-500 font-bold uppercase">Senior Lead</span>
                        <h4 className="text-base font-black text-white leading-tight">Marcus Sterling</h4>
                        <div className="flex gap-1.5 pt-0.5">
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold text-black bg-orange-500">View Work</span>
                          <span className="px-2 py-0.5 rounded text-[9px] text-zinc-300 bg-white/5 border border-white/10">Architecture</span>
                        </div>
                      </div>
                    )}

                    {template.id === 'editorial-ivory' && (
                      <div className="rounded-xl p-3 bg-[#fbf9f5] border border-black/10 text-zinc-900 space-y-1 shadow-sm">
                        <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block">Consultant & Lead</span>
                        <h4 className="text-base font-serif font-black tracking-tight text-zinc-900 leading-tight">Julian Croft</h4>
                        <p className="text-[10px] font-serif text-zinc-600 italic">Writing software with clarity & restraint.</p>
                      </div>
                    )}

                    {/* Universal Miniature Preview for modern-fullstack & any newly ingested template */}
                    {!['devops-architect', 'terminal-hacker', 'bento-violet', 'cyber-slate', 'superdesign-ember', 'editorial-ivory'].includes(template.id) && (
                      <div className="rounded-xl p-3 bg-black/50 border border-white/10 backdrop-blur-md space-y-2 shadow-lg">
                        <div className="flex items-center justify-between">
                          <span
                            className="text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                            style={{
                              color: template.previewColors[2] || '#38bdf8',
                              backgroundColor: `${template.previewColors[2] || '#38bdf8'}22`,
                              border: `1px solid ${template.previewColors[2] || '#38bdf8'}44`
                            }}
                          >
                            {heroData.badge || template.badges?.[0] || 'Featured'}
                          </span>
                          {heroData.title && (
                            <span className="text-[9px] font-mono text-zinc-400 truncate max-w-[130px]">
                              {heroData.title}
                            </span>
                          )}
                        </div>
                        <h4
                          className="text-base font-black text-white leading-tight truncate"
                          style={{
                            fontFamily: mock?.theme?.typography?.headingFont || 'inherit'
                          }}
                        >
                          {heroData.name || template.name}
                        </h4>
                        <p className="text-[10px] text-zinc-300 line-clamp-1 leading-snug">
                          {heroData.tagline || template.description}
                        </p>
                        <div className="flex items-center gap-1.5 pt-0.5">
                          <span
                            className="px-2 py-0.5 rounded text-[8px] font-bold shadow-xs cursor-pointer"
                            style={{
                              backgroundColor: template.previewColors[2] || '#38bdf8',
                              color: '#000000'
                            }}
                          >
                            {heroData.primaryCta?.text || 'Explore'}
                          </span>
                          {template.badges?.slice(0, 2).map((b, bIdx) => (
                            <span key={bIdx} className="px-1.5 py-0.5 rounded text-[8px] text-zinc-300 bg-white/5 border border-white/10 truncate max-w-[85px]">
                              {b}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Hover Overlay with "Voir en Plein Écran" CTA */}
                  <div className="absolute inset-0 bg-slate-950/75 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20 flex flex-col items-center justify-center gap-2 backdrop-blur-xs">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewTemplateId(template.id);
                      }}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-zinc-100 text-zinc-950 text-xs font-bold transition-all shadow-lg hover:scale-105 cursor-pointer"
                    >
                      <RiEyeLine className="w-4 h-4 text-sky-600" />
                      <span>Explorer en Plein Écran</span>
                    </button>
                    <span className="text-[10px] text-zinc-400">Cliquez pour tester l'interactivité</span>
                  </div>

                  {/* Active Indicator Badge */}
                  {isCurrent && (
                    <div className="absolute top-3 right-3 z-30 flex items-center gap-1 px-2.5 py-1 rounded-full bg-sky-500 text-white text-[10px] font-bold shadow-md">
                      <RiCheckLine className="w-3 h-3" />
                      <span>Actuel</span>
                    </div>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-white tracking-tight mb-1.5 flex items-center justify-between">
                      <span>{template.name}</span>
                    </h3>
                    <p className="text-xs text-zinc-400 font-light leading-relaxed line-clamp-2">
                      {template.description}
                    </p>
                  </div>

                  {/* Feature Badges */}
                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-zinc-800/80">
                    {template.badges.map((badge, bIdx) => (
                      <span
                        key={bIdx}
                        className="px-2 py-0.5 rounded-md text-[10px] font-mono text-zinc-300 bg-zinc-800/70 border border-zinc-700/50"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>

                  {/* Dual Action Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => setPreviewTemplateId(template.id)}
                      className="py-2.5 px-3 rounded-xl text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <RiEyeLine className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Aperçu</span>
                    </button>

                    <button
                      onClick={() => handleApply(template.id)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm ${
                        isCurrent
                          ? 'bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-zinc-700'
                          : 'bg-sky-500 hover:bg-sky-400 text-white shadow-sky-500/20 active:scale-98'
                      }`}
                    >
                      {isCurrent ? (
                        <>
                          <RiCheckLine className="w-3.5 h-3.5 text-sky-400" />
                          <span>Appliqué</span>
                        </>
                      ) : (
                        <>
                          <RiSparkling2Fill className="w-3.5 h-3.5" />
                          <span>Choisir</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* FULL-SCREEN LIVE INTERACTIVE PREVIEW MODAL                                */}
      {/* ========================================================================= */}
      {previewTemplateId && selectedMock && (
        <div className="fixed inset-0 z-50 bg-[#07090e] flex flex-col animate-in fade-in duration-200">
          {/* Top Control Bar */}
          <header className="h-16 px-6 bg-zinc-900/90 backdrop-blur-xl border-b border-zinc-800 flex items-center justify-between z-30 shrink-0">
            {/* Left: Back Button */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setPreviewTemplateId(null)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white text-xs font-semibold transition-all cursor-pointer"
              >
                <RiArrowLeftLine className="w-4 h-4" />
                <span>← Revenir aux Templates</span>
              </button>

              <div className="h-4 w-px bg-zinc-700" />

              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>{globalTemplates.find(t => t.id === previewTemplateId)?.name}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium text-sky-400 bg-sky-500/10 border border-sky-400/20">
                    Aperçu 100% Réel
                  </span>
                </h2>
              </div>
            </div>

            {/* Center: Device Viewport Switcher */}
            <div className="hidden sm:flex items-center gap-1 bg-zinc-800/80 p-1 rounded-xl border border-zinc-700/60">
              <button
                onClick={() => setPreviewDevice('desktop')}
                className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                  previewDevice === 'desktop' ? 'bg-zinc-700 text-white font-bold' : 'text-zinc-400 hover:text-white'
                }`}
                title="Vue Écran Large"
              >
                <RiComputerLine className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPreviewDevice('tablet')}
                className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                  previewDevice === 'tablet' ? 'bg-zinc-700 text-white font-bold' : 'text-zinc-400 hover:text-white'
                }`}
                title="Vue Tablette"
              >
                <RiTabletLine className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPreviewDevice('mobile')}
                className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                  previewDevice === 'mobile' ? 'bg-zinc-700 text-white font-bold' : 'text-zinc-400 hover:text-white'
                }`}
                title="Vue Mobile"
              >
                <RiSmartphoneLine className="w-4 h-4" />
              </button>
            </div>

            {/* Right: Apply Primary Button & Close */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleApply(previewTemplateId)}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold transition-all shadow-lg shadow-sky-500/25 active:scale-95 cursor-pointer"
              >
                <RiSparkling2Fill className="w-4 h-4" />
                <span>Appliquer ce Template à mon Portfolio</span>
              </button>

              <button
                onClick={() => setPreviewTemplateId(null)}
                className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                title="Fermer"
              >
                <RiCloseLine className="w-5 h-5" />
              </button>
            </div>
          </header>

          {/* Full-Screen Scrollable Canvas */}
          <div className="flex-1 overflow-y-auto bg-black/40 flex justify-center items-start py-6 px-4">
            <div
              className={`w-full transition-all duration-300 shadow-2xl rounded-2xl overflow-hidden border border-zinc-800 ${
                previewDevice === 'mobile'
                  ? 'max-w-sm min-h-[750px]'
                  : previewDevice === 'tablet'
                  ? 'max-w-2xl min-h-[850px]'
                  : 'max-w-6xl min-h-[900px]'
              }`}
            >
              <PortfolioRenderer portfolio={selectedMock} isPreview={true} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
