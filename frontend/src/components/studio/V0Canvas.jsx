import React, { useState, useRef, useEffect } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { PortfolioRenderer } from '../portfolio/PortfolioRenderer';
import { PortfolioChatWidget } from '../portfolio/PortfolioChatWidget';
import { THEME_PRESETS } from '../../types/portfolio';
import {
  RiGlobalLine,
  RiCodeSSlashLine,
  RiAddLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiSmartphoneLine,
  RiTabletLine,
  RiComputerLine,
  RiExternalLinkLine,
  RiRefreshLine,
  RiArrowDownSLine,
  RiMoreFill,
  RiPaletteLine,
  RiSideBarLine,
  RiFileCopyLine,
  RiCheckLine,
  RiCloseLine,
  RiArrowRightLine,
  RiLoader4Line,
  RiGithubFill,
  RiStackLine,
  RiRobot2Line
} from 'react-icons/ri';
import { GithubProjectsTab } from './GithubProjectsTab';
import { SkillsTab } from './SkillsTab';
import { AiChatbotSettingsModal } from './AiChatbotSettingsModal';

const QUICK_ACCENT_COLORS = [
  { name: 'Flame Orange', hex: '#FF4500' },
  { name: 'Emerald Neon', hex: '#10b981' },
  { name: 'Cyber Cyan', hex: '#06b6d4' },
  { name: 'Electric Violet', hex: '#a855f7' },
  { name: 'Indigo Core', hex: '#6366f1' },
  { name: 'Crimson Rose', hex: '#f43f5e' },
  { name: 'Amber Gold', hex: '#f59e0b' },
];

export const V0Canvas = () => {
  const {
    portfolio,
    setPortfolio,
    deviceView,
    setDeviceView,
    simulatedWidth,
    setSimulatedWidth,
    isMobileViewport,
    viewMode,
    setViewMode,
    isChatCollapsed,
    setIsChatCollapsed,
    isGenerating,
    hasGeneratedFirstPortfolio,
    streamingCode,
    setThemePreset,
    updateThemeToken,
    savePortfolio,
    saveStatus,
    isPublished
  } = usePortfolio();

  const [publishedUrl, setPublishedUrl] = useState(null);
  const [showColorPopover, setShowColorPopover] = useState(false);
  const [isAiBotModalOpen, setIsAiBotModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const codeScrollRef = useRef(null);
  const frameContainerRef = useRef(null);

  // Compute active width (null means 100% full-width desktop)
  const activeWidth = simulatedWidth !== null 
    ? simulatedWidth 
    : (deviceView === 'mobile' ? 390 : (deviceView === 'tablet' ? 768 : null));

  // Pointer drag to resize handle
  const handlePointerDownResize = (e, side) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    const startX = e.clientX;
    const initialWidth = activeWidth || 1000;

    const onPointerMove = (moveEvent) => {
      const delta = (moveEvent.clientX - startX) * (side === 'right' ? 2 : -2);
      const newWidth = Math.max(320, Math.min(1400, Math.round(initialWidth + delta)));
      setSimulatedWidth(newWidth);
      if (newWidth < 768) {
        setDeviceView('mobile');
      } else if (newWidth < 1024) {
        setDeviceView('tablet');
      } else {
        setDeviceView('desktop');
      }
    };

    const onPointerUp = () => {
      setIsResizing(false);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  // Auto-scroll code editor as streaming tokens arrive
  useEffect(() => {
    if (viewMode === 'code' && codeScrollRef.current) {
      codeScrollRef.current.scrollTop = codeScrollRef.current.scrollHeight;
    }
  }, [viewMode, streamingCode]);

  const handlePublish = async () => {
    try {
      const res = await savePortfolio(true);
      const slug = res?.subdomainSlug || portfolio.meta?.slug || 'portfolio';
      setPublishedUrl(`https://${slug}.portfolify.dev`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopyCode = () => {
    const text = streamingCode || JSON.stringify(portfolio, null, 2);
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <main className="flex-1 relative flex flex-col h-screen overflow-hidden bg-white text-zinc-900 font-sans">
      
      {/* 1. Top Preview & Code Bar (v0 style) */}
      <div className="h-12 px-3 border-b border-zinc-200 bg-white flex items-center justify-between z-20 select-none">
        
        {/* Left: [ 🌐 Preview ] [ </> Code ] */}
        <div className="flex items-center gap-1.5">
          {isChatCollapsed && (
            <button
              onClick={() => setIsChatCollapsed(false)}
              className="p-1.5 rounded-md hover:bg-zinc-100 text-zinc-600 transition-colors mr-1 cursor-pointer"
              title="Open Chat Panel"
            >
              <RiSideBarLine className="w-4 h-4" />
            </button>
          )}

          {/* Preview Tab */}
          <button
            onClick={() => setViewMode('preview')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              viewMode === 'preview'
                ? 'bg-zinc-100 text-zinc-900 font-semibold'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <RiGlobalLine className="w-3.5 h-3.5" />
            <span>Aperçu</span>
          </button>

          {/* Code Tab (Forced during generation) */}
          <button
            onClick={() => setViewMode('code')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              viewMode === 'code'
                ? 'bg-zinc-100 text-zinc-900 font-semibold'
                : 'text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <RiCodeSSlashLine className="w-3.5 h-3.5" />
            <span>Code</span>
            {isGenerating && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-0.5" />
            )}
          </button>

          {/* GitHub Projects Tab (Only visible after first generation) */}
          {hasGeneratedFirstPortfolio && (
            <>
              <button
                onClick={() => setViewMode('projects')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer animate-in fade-in zoom-in-95 duration-200 ${
                  viewMode === 'projects'
                    ? 'bg-zinc-100 text-zinc-900 font-semibold border border-zinc-300 shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-800'
                }`}
                title="Importer des projets GitHub"
              >
                <RiGithubFill className="w-3.5 h-3.5 text-zinc-800" />
                <span>Projets</span>
              </button>

              <button
                onClick={() => setViewMode('skills')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer animate-in fade-in zoom-in-95 duration-200 ${
                  viewMode === 'skills'
                    ? 'bg-zinc-100 text-zinc-900 font-semibold border border-zinc-300 shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-800'
                }`}
                title="Gérer les compétences et technologies"
              >
                <RiStackLine className="w-3.5 h-3.5 text-zinc-800" />
                <span>Compétences</span>
              </button>
            </>
          )}
        </div>

        {/* Center: Address Bar Pill [ < > 📱 / ⧉ ⟳ ▾ ] */}
        <div className="flex items-center gap-2 bg-zinc-100/80 border border-zinc-200/80 rounded-lg px-2.5 py-1 text-xs text-zinc-600">
          <button className="text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer">
            <RiArrowLeftSLine className="w-3.5 h-3.5" />
          </button>
          <button className="text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer">
            <RiArrowRightSLine className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => {
              if (activeWidth !== null) {
                setDeviceView('desktop');
                setSimulatedWidth(null);
              } else {
                setDeviceView('mobile');
                setSimulatedWidth(390);
              }
            }}
            className={`p-0.5 rounded transition-colors cursor-pointer ${
              activeWidth !== null ? 'text-zinc-900 font-bold' : 'text-zinc-500 hover:text-zinc-800'
            }`}
            title={activeWidth !== null ? "Passer en vue Plein écran (Desktop)" : "Passer en vue Mobile"}
          >
            {activeWidth !== null ? (
              <RiComputerLine className="w-3.5 h-3.5 text-zinc-900" />
            ) : (
              <RiSmartphoneLine className="w-3.5 h-3.5" />
            )}
          </button>

          <span className="text-zinc-400 select-none">/</span>

          <div className="h-3 w-px bg-zinc-300 mx-0.5" />

          <button
            onClick={() => window.open(publishedUrl || '#', '_blank')}
            className="text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer"
            title="Ouvrir dans une nouvelle fenêtre"
          >
            <RiExternalLinkLine className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => window.location.reload()}
            className="text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer"
            title="Rafraîchir"
          >
            <RiRefreshLine className="w-3.5 h-3.5" />
          </button>

          <RiArrowDownSLine className="w-3 h-3 text-zinc-400 cursor-pointer" />
        </div>

        {/* Right: AI Bot Settings + Palette Button + Invite + Publish */}
        <div className="flex items-center gap-2">
          {/* AI Chatbot BYOK Settings Button */}
          <button
            onClick={() => setIsAiBotModalOpen(true)}
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
              isAiBotModalOpen
                ? 'bg-zinc-200 text-zinc-900'
                : 'hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900'
            }`}
            title="Configurer l'Assistant IA (Modèle, Clé API, Activation)"
          >
            <RiRobot2Line className="w-4 h-4" />
          </button>

          {/* Floating Palette Trigger in Navbar */}
          <button
            onClick={() => setShowColorPopover(!showColorPopover)}
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
              showColorPopover
                ? 'bg-zinc-200 text-zinc-900'
                : 'hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900'
            }`}
            title="Thèmes & Nuancier"
          >
            <RiPaletteLine className="w-4 h-4" />
          </button>

          <button className="px-3 py-1 rounded-lg border border-zinc-200 hover:bg-zinc-50 text-xs font-medium text-zinc-700 transition-colors cursor-pointer">
            Inviter
          </button>

          <button
            onClick={handlePublish}
            disabled={saveStatus === 'saving'}
            className="px-3.5 py-1 rounded-lg bg-black hover:bg-zinc-800 text-white text-xs font-medium transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <span>{isPublished ? 'Publié' : 'Publier'}</span>
          </button>
        </div>
      </div>

      {/* 2. Color Swatch Popover */}
      {showColorPopover && (
        <div className="absolute top-14 right-4 z-40 w-72 bg-white border border-zinc-200 rounded-2xl p-4 shadow-2xl animate-in fade-in slide-from-top-2 duration-200 text-zinc-900">
          <div className="flex items-center justify-between pb-2.5 border-b border-zinc-100 mb-3">
            <div className="flex items-center gap-1.5">
              <RiPaletteLine className="w-4 h-4 text-zinc-700" />
              <h4 className="text-xs font-bold text-zinc-900">Thèmes & Nuancier</h4>
            </div>
            <button
              onClick={() => setShowColorPopover(false)}
              className="text-zinc-400 hover:text-zinc-700 cursor-pointer"
            >
              <RiCloseLine className="w-4 h-4" />
            </button>
          </div>

          {/* Preset Swatches */}
          <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold mb-2">
            Thèmes Prédéfinis
          </p>
          <div className="space-y-1.5 mb-4">
            {Object.values(THEME_PRESETS).map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setThemePreset(t.id);
                  setShowColorPopover(false);
                }}
                className={`w-full flex items-center justify-between p-2 rounded-xl text-xs transition-colors cursor-pointer ${
                  portfolio.theme?.id === t.id
                    ? 'bg-zinc-100 font-semibold text-zinc-900'
                    : 'hover:bg-zinc-50 text-zinc-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0 shadow-xs"
                    style={{ backgroundColor: t.palette.accent }}
                  />
                  <span>{t.name}</span>
                </div>
                {portfolio.theme?.id === t.id && (
                  <RiCheckLine className="w-3.5 h-3.5 text-black" />
                )}
              </button>
            ))}
          </div>

          {/* Quick Accent Color Buttons */}
          <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold mb-2">
            Couleur d'accentuation
          </p>
          <div className="flex flex-wrap gap-2 mb-3">
            {QUICK_ACCENT_COLORS.map((c) => (
              <button
                key={c.hex}
                onClick={() => updateThemeToken('palette', 'accent', c.hex)}
                className="w-6 h-6 rounded-full border border-black/10 transition-transform hover:scale-110 active:scale-95 cursor-pointer shadow-xs"
                style={{ backgroundColor: c.hex }}
                title={c.name}
              />
            ))}
          </div>

          {/* Custom Hex Color Picker */}
          <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-xs">
            <span className="text-zinc-500 text-[11px]">Hex personnalisé</span>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={portfolio.theme?.palette?.accent || '#FF4500'}
                onChange={(e) => updateThemeToken('palette', 'accent', e.target.value)}
                className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
              />
              <span className="font-mono text-[11px] text-zinc-600">
                {portfolio.theme?.palette?.accent || '#FF4500'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 3. Permanent Responsive Dimension Bar (ALWAYS visible in Preview mode) */}
      {viewMode === 'preview' && (
        <div className="w-full bg-white border-b border-zinc-200 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs select-none shadow-xs shrink-0 z-20">
          {/* Presets */}
          <div className="flex items-center gap-1 bg-zinc-100 p-0.5 rounded-xl border border-zinc-200/80">
            <button
              onClick={() => { setDeviceView('mobile'); setSimulatedWidth(320); }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                activeWidth === 320 ? 'bg-white text-zinc-900 shadow-xs font-bold' : 'text-zinc-500 hover:text-zinc-800'
              }`}
              title="Mobile Compact (320px)"
            >
              <RiSmartphoneLine className="w-3 h-3 text-zinc-400" />
              <span>320</span>
            </button>
            <button
              onClick={() => { setDeviceView('mobile'); setSimulatedWidth(375); }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                activeWidth === 375 ? 'bg-white text-zinc-900 shadow-xs font-bold' : 'text-zinc-500 hover:text-zinc-800'
              }`}
              title="Mobile Standard (375px)"
            >
              <span>375</span>
            </button>
            <button
              onClick={() => { setDeviceView('mobile'); setSimulatedWidth(390); }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                activeWidth === 390 ? 'bg-white text-zinc-900 shadow-xs font-bold' : 'text-zinc-500 hover:text-zinc-800'
              }`}
              title="iPhone 14/15/16 (390px)"
            >
              <span>390</span>
            </button>
            <button
              onClick={() => { setDeviceView('mobile'); setSimulatedWidth(428); }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                activeWidth === 428 ? 'bg-white text-zinc-900 shadow-xs font-bold' : 'text-zinc-500 hover:text-zinc-800'
              }`}
              title="Mobile Large (428px)"
            >
              <span>428</span>
            </button>
            <button
              onClick={() => { setDeviceView('tablet'); setSimulatedWidth(768); }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                activeWidth === 768 ? 'bg-white text-zinc-900 shadow-xs font-bold' : 'text-zinc-500 hover:text-zinc-800'
              }`}
              title="Tablette iPad (768px)"
            >
              <RiTabletLine className="w-3 h-3 text-zinc-400" />
              <span>768</span>
            </button>
            <button
              onClick={() => { setDeviceView('desktop'); setSimulatedWidth(null); }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                activeWidth === null ? 'bg-white text-zinc-900 shadow-xs font-bold' : 'text-zinc-500 hover:text-zinc-800'
              }`}
              title="Plein écran Desktop (100%)"
            >
              <RiComputerLine className="w-3 h-3 text-zinc-400" />
              <span>100%</span>
            </button>
          </div>

          {/* Width Slider + Live Pixel Badge */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-[11px] text-zinc-400 font-mono">320px</span>
              <input
                type="range"
                min="320"
                max="1280"
                step="5"
                value={activeWidth || 1280}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (val >= 1200) {
                    setDeviceView('desktop');
                    setSimulatedWidth(null);
                  } else {
                    setSimulatedWidth(val);
                    setDeviceView(val < 768 ? 'mobile' : 'tablet');
                  }
                }}
                className="w-24 sm:w-36 accent-zinc-900 cursor-pointer h-1.5 bg-zinc-200 rounded-lg"
              />
              <span className="text-[11px] text-zinc-400 font-mono">100%</span>
            </div>

            <div className="px-3 py-1 rounded-lg bg-zinc-900 text-white font-mono text-xs font-medium shadow-xs flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
              <span>{activeWidth ? `${activeWidth}px` : 'Plein écran (100%)'}</span>
            </div>
          </div>
        </div>
      )}

      {/* 4. Main Viewport (Preview OR Real Code Stream) */}
      <div className="flex-1 overflow-hidden relative flex flex-col bg-white">
        
        {/* ========================================================================= */}
        {/* TAB 1: PREVIEW MODE                                                       */}
        {/* ========================================================================= */}
        {viewMode === 'preview' && (
          <div className="flex-1 h-full w-full flex flex-col justify-center items-center overflow-hidden">
            {/* STATE A: EMPTY STATE (Matching Screenshot) */}
            {!hasGeneratedFirstPortfolio && !isGenerating && (
              <div className="flex flex-col items-center justify-center text-center p-8 select-none">
                <div className="w-14 h-14 text-zinc-800 mb-4 flex items-center justify-center">
                  <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="4" />
                    <path d="M8 8h8v8H8z" />
                    <path d="M12 8v8M8 12h8" />
                  </svg>
                </div>
                <p className="text-zinc-400 text-sm font-normal">
                  Votre portfolio généré s'affichera ici.
                </p>
              </div>
            )}

            {/* STATE B: GENERATING STATE (If user switches back to preview while still generating) */}
            {isGenerating && (
              <div className="flex flex-col items-center justify-center text-center p-8 select-none animate-in fade-in duration-200">
                <RiLoader4Line className="w-8 h-8 animate-spin text-zinc-600 mb-3" />
                <p className="text-xs text-zinc-600 font-mono mb-2">
                  Génération du code en cours...
                </p>
                <button
                  onClick={() => setViewMode('code')}
                  className="px-3 py-1.5 rounded-lg bg-zinc-900 text-white text-xs font-mono flex items-center gap-1.5 hover:bg-black transition-colors cursor-pointer"
                >
                  <RiCodeSSlashLine className="w-3.5 h-3.5" />
                  <span>Voir le Code →</span>
                </button>
              </div>
            )}

            {/* STATE C: GENERATED PORTFOLIO */}
            {hasGeneratedFirstPortfolio && !isGenerating && (
              <div className="w-full h-full flex flex-col overflow-hidden bg-zinc-100/60">
                {/* Scrollable Canvas Area with Drag-to-Resize Frame */}
                <div className={`w-full flex-1 overflow-hidden flex justify-center items-center relative ${activeWidth ? 'p-2 sm:p-4' : 'p-0'}`}>
                  <div
                    ref={frameContainerRef}
                    className="relative transition-[width] duration-75 flex justify-center items-center origin-top shrink-0 h-full max-h-full"
                    style={{
                      width: activeWidth ? `${activeWidth}px` : '100%',
                      maxWidth: '100%',
                    }}
                  >
                    {/* Left Drag Handle */}
                    {activeWidth !== null && (
                      <div
                        onPointerDown={(e) => handlePointerDownResize(e, 'left')}
                        className={`absolute -left-3.5 top-1/2 -translate-y-1/2 z-40 w-6 h-16 rounded-full flex items-center justify-center cursor-ew-resize transition-all hover:scale-110 active:scale-95 group/handle border shadow-xl select-none ${
                          isResizing ? 'bg-zinc-900 scale-110 border-zinc-700' : 'bg-zinc-800/90 hover:bg-zinc-900 border-white/20'
                        }`}
                        title="Glisser pour redimensionner"
                      >
                        <div className="w-1 h-5 bg-white/70 rounded-full group-hover/handle:bg-white" />
                      </div>
                    )}

                    {/* Mockup Shell */}
                    <div
                      className={`w-full transition-all flex flex-col relative ${
                        activeWidth && activeWidth < 900
                          ? 'h-[calc(100vh-140px)] max-h-205 rounded-[2.8rem] border-[9px] border-zinc-900 shadow-2xl bg-black overflow-hidden'
                          : 'h-full w-full border-0 overflow-hidden'
                      }`}
                    >
                      {/* iPhone Dynamic Island */}
                      {activeWidth && activeWidth < 900 && (
                        <div className="h-7 bg-zinc-900 flex items-center justify-center relative select-none shrink-0">
                          <div className="w-24 h-4 bg-black rounded-full flex items-center justify-end px-3">
                            <div className="w-2.5 h-2.5 rounded-full bg-[#151515] border border-zinc-700/60" />
                          </div>
                        </div>
                      )}

                      {/* Screen Viewport Container: Strictly bounds scrollable portfolio and keeps floating AI chat pinned at bottom-right */}
                      <div className="flex-1 w-full h-full relative overflow-hidden flex flex-col bg-white">
                        {/* 1. Scrollable Portfolio Sections - Navigates freely */}
                        <div className="w-full h-full overflow-y-auto overflow-x-hidden flex flex-col">
                          <PortfolioRenderer portfolio={portfolio} isPreview={true} />
                        </div>

                        {/* 2. Floating AI Chatbot Widget - Strictly INSIDE the screen, pinned at bottom-right, fixed across all sections */}
                        <PortfolioChatWidget portfolio={portfolio} isAbsolute={true} />
                      </div>

                      {/* Home Indicator */}
                      {activeWidth && activeWidth < 900 && (
                        <div className="h-6 bg-zinc-900 flex items-center justify-center select-none shrink-0">
                          <div className="w-32 h-1 bg-zinc-600 rounded-full" />
                        </div>
                      )}
                    </div>

                    {/* Right Drag Handle */}
                    {activeWidth !== null && (
                      <div
                        onPointerDown={(e) => handlePointerDownResize(e, 'right')}
                        className={`absolute -right-3.5 top-1/2 -translate-y-1/2 z-40 w-6 h-16 rounded-full flex items-center justify-center cursor-ew-resize transition-all hover:scale-110 active:scale-95 group/handle border shadow-xl select-none ${
                          isResizing ? 'bg-zinc-900 scale-110 border-zinc-700' : 'bg-zinc-800/90 hover:bg-zinc-900 border-white/20'
                        }`}
                        title="Glisser pour redimensionner"
                      >
                        <div className="w-1 h-5 bg-white/70 rounded-full group-hover/handle:bg-white" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: CODE MODE (FORCED DURING GENERATION - REAL CODE WRITING STREAM)   */}
        {/* ========================================================================= */}
        {viewMode === 'code' && (
          <div className="w-full h-full flex flex-col bg-[#09090b] text-zinc-100 font-mono">
            
            {/* Code Bar Header */}
            <div className="h-10 px-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950 text-xs shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="text-white font-medium">portfolio.schema.json</span>
                <span className="text-zinc-600">•</span>
                
                {isGenerating ? (
                  <span className="flex items-center gap-1.5 text-emerald-400 font-mono text-[11px]">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>Génération en direct...</span>
                  </span>
                ) : hasGeneratedFirstPortfolio ? (
                  <span className="text-zinc-400 text-[11px]">
                    ✓ Code Prêt
                  </span>
                ) : (
                  <span className="text-zinc-500 text-[11px]">
                    En attente du premier prompt...
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Switch to Preview Button */}
                <button
                  onClick={() => setViewMode('preview')}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-white text-black text-[11px] font-semibold hover:bg-zinc-200 transition-colors cursor-pointer"
                >
                  <RiGlobalLine className="w-3 h-3" />
                  <span>Voir l'Aperçu</span>
                  <RiArrowRightLine className="w-3 h-3" />
                </button>

                {/* Copy Code Button */}
                {hasGeneratedFirstPortfolio && (
                  <button
                    onClick={handleCopyCode}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[11px] text-zinc-300 hover:text-white transition-colors cursor-pointer"
                  >
                    {copiedCode ? (
                      <>
                        <RiCheckLine className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Copié</span>
                      </>
                    ) : (
                      <>
                        <RiFileCopyLine className="w-3 h-3" />
                        <span>Copier</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Code Body: Empty state before prompt vs real code editor */}
            {!hasGeneratedFirstPortfolio && !isGenerating ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 select-none text-zinc-500 font-mono">
                <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 mb-3 shadow-inner">
                  <RiCodeSSlashLine className="w-6 h-6" />
                </div>
                <p className="text-sm text-zinc-300 font-medium mb-1.5">
                  Aucun code généré pour le moment
                </p>
                <p className="text-xs text-zinc-500 max-w-sm leading-relaxed">
                  Saisissez votre prompt dans le panneau de gauche. Dès que vous lancerez la génération, le code JSON structuré s'écrira ici en direct.
                </p>
              </div>
            ) : (
              <div ref={codeScrollRef} className="flex-1 overflow-y-auto p-4 selection:bg-zinc-800 bg-[#09090b]">
                <pre className="text-xs leading-relaxed text-zinc-300 font-mono">
                  <code>
                    {isGenerating ? streamingCode : JSON.stringify(portfolio, null, 2)}
                    {isGenerating && (
                      <span className="w-2 h-4 inline-block bg-white ml-0.5 animate-pulse align-middle" />
                    )}
                  </code>
                </pre>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: GITHUB PROJECTS MODE                                              */}
        {/* ========================================================================= */}
        {viewMode === 'projects' && (
          <div className="w-full h-full flex flex-col flex-1 overflow-hidden">
            <GithubProjectsTab onApplyComplete={() => setViewMode('preview')} />
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: SKILLS MANAGEMENT MODE                                            */}
        {/* ========================================================================= */}
        {viewMode === 'skills' && (
          <div className="w-full h-full flex flex-col flex-1 overflow-hidden">
            <SkillsTab onApplyComplete={() => setViewMode('preview')} />
          </div>
        )}

      </div>

      {/* Published URL Toast Modal */}
      {publishedUrl && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white border border-zinc-200 rounded-2xl p-5 shadow-2xl animate-in zoom-in-95 text-center">
            <h3 className="text-sm font-bold text-zinc-900 mb-1">Portfolio Publié !</h3>
            <p className="text-xs text-zinc-500 mb-4">
              Votre portfolio est désormais accessible en ligne.
            </p>
            <div className="flex items-center gap-2 p-2 rounded-xl bg-zinc-50 border border-zinc-200 mb-4">
              <input
                type="text"
                readOnly
                value={publishedUrl}
                className="flex-1 bg-transparent border-0 outline-none text-xs text-zinc-700 font-mono px-1"
              />
              <a
                href={publishedUrl}
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1 rounded-md bg-black text-white text-xs font-medium hover:bg-zinc-800"
              >
                Visiter
              </a>
            </div>
            <button
              onClick={() => setPublishedUrl(null)}
              className="text-xs text-zinc-400 hover:text-zinc-700 cursor-pointer"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* AI Chatbot Settings Modal (BYOK & Multi-Provider config) */}
      <AiChatbotSettingsModal
        isOpen={isAiBotModalOpen}
        onClose={() => setIsAiBotModalOpen(false)}
        portfolio={portfolio}
        onSave={(updatedConfig) => {
          setPortfolio((prev) => ({
            ...prev,
            aiChatbot: updatedConfig,
          }));
        }}
      />

    </main>
  );
};
