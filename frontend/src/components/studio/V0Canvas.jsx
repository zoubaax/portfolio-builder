import React, { useState, useRef, useEffect } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { PortfolioRenderer } from '../portfolio/PortfolioRenderer';
import { THEME_PRESETS } from '../../types/portfolio';
import {
  RiGlobalLine,
  RiCodeSSlashLine,
  RiAddLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiSmartphoneLine,
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
  RiLoader4Line
} from 'react-icons/ri';

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
    deviceView,
    setDeviceView,
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
  const [copiedCode, setCopiedCode] = useState(false);
  const codeScrollRef = useRef(null);

  // Auto-scroll code editor as streaming tokens arrive
  useEffect(() => {
    if (viewMode === 'code' && codeScrollRef.current) {
      codeScrollRef.current.scrollTop = codeScrollRef.current.scrollHeight;
    }
  }, [viewMode, streamingCode]);

  const handlePublish = async () => {
    try {
      const res = await savePortfolio(true);
      const slug = res?.subdomainSlug || portfolio.meta?.slug || 'zoubaa';
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

  // Device frame styling
  let frameWidthClass = 'w-full';
  let frameBorderClass = 'border-0';

  if (deviceView === 'mobile') {
    frameWidthClass = 'max-w-[390px] my-6 rounded-[2.5rem] border-[8px] border-zinc-200 shadow-xl';
  }

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
            <span>Preview</span>
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

          <button
            className="w-7 h-7 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 flex items-center justify-center transition-colors cursor-pointer"
            title="Add tab"
          >
            <RiAddLine className="w-4 h-4" />
          </button>
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
            onClick={() => setDeviceView(deviceView === 'mobile' ? 'desktop' : 'mobile')}
            className={`p-0.5 rounded transition-colors cursor-pointer ${
              deviceView === 'mobile' ? 'text-black font-bold' : 'text-zinc-500 hover:text-zinc-800'
            }`}
            title="Toggle Mobile View"
          >
            {deviceView === 'mobile' ? (
              <RiComputerLine className="w-3.5 h-3.5" />
            ) : (
              <RiSmartphoneLine className="w-3.5 h-3.5" />
            )}
          </button>

          <span className="text-zinc-400 select-none">/</span>

          <div className="h-3 w-px bg-zinc-300 mx-0.5" />

          <button
            onClick={() => window.open(publishedUrl || '#', '_blank')}
            className="text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer"
            title="Open in new window"
          >
            <RiExternalLinkLine className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => window.location.reload()}
            className="text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer"
            title="Refresh"
          >
            <RiRefreshLine className="w-3.5 h-3.5" />
          </button>

          <RiArrowDownSLine className="w-3 h-3 text-zinc-400 cursor-pointer" />
        </div>

        {/* Right: Palette Button + Invite + Publish */}
        <div className="flex items-center gap-2">
          {/* Floating Palette Trigger in Navbar */}
          <button
            onClick={() => setShowColorPopover(!showColorPopover)}
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
              showColorPopover
                ? 'bg-zinc-200 text-zinc-900'
                : 'hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900'
            }`}
            title="Theme & Color Swatches"
          >
            <RiPaletteLine className="w-4 h-4" />
          </button>

          <button className="px-3 py-1 rounded-lg border border-zinc-200 hover:bg-zinc-50 text-xs font-medium text-zinc-700 transition-colors cursor-pointer">
            Invite
          </button>

          <button
            onClick={handlePublish}
            disabled={saveStatus === 'saving'}
            className="px-3.5 py-1 rounded-lg bg-black hover:bg-zinc-800 text-white text-xs font-medium transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <span>{isPublished ? 'Published' : 'Publish'}</span>
          </button>
        </div>
      </div>

      {/* 2. Color Swatch Popover */}
      {showColorPopover && (
        <div className="absolute top-14 right-4 z-40 w-72 bg-white border border-zinc-200 rounded-2xl p-4 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200 text-zinc-900">
          <div className="flex items-center justify-between pb-2.5 border-b border-zinc-100 mb-3">
            <div className="flex items-center gap-1.5">
              <RiPaletteLine className="w-4 h-4 text-zinc-700" />
              <h4 className="text-xs font-bold text-zinc-900">Theme & Color Swatches</h4>
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
            Curated Themes
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
            Instant Accent Color
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
            <span className="text-zinc-500 text-[11px]">Custom Hex</span>
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

      {/* 3. Main Viewport (Preview OR Real Code Stream) */}
      <div className="flex-1 overflow-y-auto relative flex flex-col bg-white">
        
        {/* ========================================================================= */}
        {/* TAB 1: PREVIEW MODE                                                       */}
        {/* ========================================================================= */}
        {viewMode === 'preview' && (
          <div className="flex-1 flex flex-col justify-center items-center">
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
                  Your v0 generation will show here.
                </p>
              </div>
            )}

            {/* STATE B: GENERATING STATE (If user switches back to preview while still generating) */}
            {isGenerating && (
              <div className="flex flex-col items-center justify-center text-center p-8 select-none animate-in fade-in duration-200">
                <RiLoader4Line className="w-8 h-8 animate-spin text-zinc-600 mb-3" />
                <p className="text-xs text-zinc-600 font-mono mb-2">
                  Streaming code in background...
                </p>
                <button
                  onClick={() => setViewMode('code')}
                  className="px-3 py-1.5 rounded-lg bg-zinc-900 text-white text-xs font-mono flex items-center gap-1.5 hover:bg-black transition-colors cursor-pointer"
                >
                  <RiCodeSSlashLine className="w-3.5 h-3.5" />
                  <span>Switch to Code View →</span>
                </button>
              </div>
            )}

            {/* STATE C: GENERATED PORTFOLIO */}
            {hasGeneratedFirstPortfolio && !isGenerating && (
              <div className="w-full h-full overflow-y-auto flex justify-center items-start p-2 sm:p-6">
                <div className={`transition-all duration-300 origin-top overflow-hidden ${frameWidthClass} ${frameBorderClass}`}>
                  {deviceView === 'mobile' && (
                    <div className="h-6 bg-zinc-200 flex items-center justify-center">
                      <div className="w-20 h-3 bg-black rounded-full" />
                    </div>
                  )}
                  <PortfolioRenderer portfolio={portfolio} isPreview={true} />
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
                    <span>Streaming (NVIDIA Nemotron 3 Ultra 550B)</span>
                  </span>
                ) : (
                  <span className="text-zinc-400 text-[11px]">
                    ✓ Code Ready
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
                  <span>View Preview</span>
                  <RiArrowRightLine className="w-3 h-3" />
                </button>

                {/* Copy Code Button */}
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[11px] text-zinc-300 hover:text-white transition-colors cursor-pointer"
                >
                  {copiedCode ? (
                    <>
                      <RiCheckLine className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <RiFileCopyLine className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Code Body with Auto-Scroll and Blinking Cursor */}
            <div ref={codeScrollRef} className="flex-1 overflow-y-auto p-4 selection:bg-zinc-800 bg-[#09090b]">
              <pre className="text-xs leading-relaxed text-zinc-300 font-mono">
                <code>
                  {streamingCode || JSON.stringify(portfolio, null, 2)}
                  {isGenerating && (
                    <span className="w-2 h-4 inline-block bg-white ml-0.5 animate-pulse align-middle" />
                  )}
                </code>
              </pre>
            </div>
          </div>
        )}

      </div>

      {/* Published URL Toast Modal */}
      {publishedUrl && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white border border-zinc-200 rounded-2xl p-5 shadow-2xl animate-in zoom-in-95 text-center">
            <h3 className="text-sm font-bold text-zinc-900 mb-1">Portfolio Published!</h3>
            <p className="text-xs text-zinc-500 mb-4">
              Your custom portfolio is live on the web.
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
                Visit
              </a>
            </div>
            <button
              onClick={() => setPublishedUrl(null)}
              className="text-xs text-zinc-400 hover:text-zinc-700 cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </main>
  );
};
