import React, { useState } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import {
  RiSparkling2Fill,
  RiComputerLine,
  RiTabletLine,
  RiSmartphoneLine,
  RiArrowGoBackLine,
  RiArrowGoForwardLine,
  RiEdit2Line,
  RiEyeLine,
  RiUploadCloud2Line,
  RiCheckLine,
  RiLoader4Line,
  RiExternalLinkLine,
  RiCloseLine
} from 'react-icons/ri';

export const StudioHeader = () => {
  const {
    portfolio,
    setPortfolio,
    deviceView,
    setDeviceView,
    isEditMode,
    setIsEditMode,
    studioTheme,
    undo,
    redo,
    canUndo,
    canRedo,
    savePortfolio,
    saveStatus,
    isPublished
  } = usePortfolio();

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(portfolio.meta?.title || 'Zoubaa Portfolio');
  const [publishedUrl, setPublishedUrl] = useState(null);

  const isLight = studioTheme === 'light';

  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
    if (titleValue.trim()) {
      setPortfolio((curr) => ({
        ...curr,
        meta: {
          ...curr.meta,
          title: titleValue.trim(),
        },
      }));
    }
  };

  const handlePublish = async () => {
    try {
      const res = await savePortfolio(true);
      const slug = res?.subdomainSlug || portfolio.meta?.slug || 'zoubaa';
      setPublishedUrl(`https://${slug}.portfolify.dev`);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <header
      className={`h-14 px-4 md:px-6 border-b transition-colors duration-200 flex items-center justify-between z-30 select-none ${
        isLight
          ? 'bg-white border-slate-200 text-slate-800'
          : 'bg-[#0b0e17] border-white/10 text-white'
      }`}
    >
      {/* 1. Left: Brand & Portfolio Title (Inline Editable) */}
      <div className="flex items-center gap-3.5">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-orange-600 to-[#FF4500] flex items-center justify-center text-white shadow-md shadow-[#FF4500]/20">
          <RiSparkling2Fill className="w-4 h-4" />
        </div>

        <div className="flex items-center gap-2">
          {isEditingTitle ? (
            <input
              type="text"
              value={titleValue}
              onChange={(e) => setTitleValue(e.target.value)}
              onBlur={handleTitleSubmit}
              onKeyDown={(e) => e.key === 'Enter' && handleTitleSubmit()}
              autoFocus
              className="text-xs font-bold px-2 py-1 rounded bg-white/10 border border-[#FF4500]/40 outline-none text-white w-44"
            />
          ) : (
            <button
              onClick={() => setIsEditingTitle(true)}
              className="group flex items-center gap-1.5 text-xs font-bold text-white hover:text-[#FF4500] transition-colors cursor-pointer"
              title="Click to rename portfolio"
            >
              <span>{portfolio.meta?.title || 'Zoubaa Portfolio'}</span>
              <RiEdit2Line className="w-3 h-3 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          )}

          {/* Clean Auto-saved indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-gray-400">
            {saveStatus === 'saving' ? (
              <>
                <RiLoader4Line className="w-2.5 h-2.5 animate-spin text-[#FF4500]" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Auto-saved</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 2. Center: Minimalist Device Switcher Pill */}
      <div className="flex items-center bg-white/5 p-1 rounded-xl border border-white/10">
        <button
          onClick={() => setDeviceView('desktop')}
          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
            deviceView === 'desktop'
              ? 'bg-[#FF4500] text-white shadow-sm font-semibold'
              : 'text-gray-400 hover:text-white'
          }`}
          title="Desktop view (100%)"
        >
          <RiComputerLine className="w-3.5 h-3.5" />
          <span className="hidden md:inline text-[11px]">Desktop</span>
        </button>

        <button
          onClick={() => setDeviceView('tablet')}
          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
            deviceView === 'tablet'
              ? 'bg-[#FF4500] text-white shadow-sm font-semibold'
              : 'text-gray-400 hover:text-white'
          }`}
          title="Tablet view (768px)"
        >
          <RiTabletLine className="w-3.5 h-3.5" />
          <span className="hidden md:inline text-[11px]">Tablet</span>
        </button>

        <button
          onClick={() => setDeviceView('mobile')}
          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
            deviceView === 'mobile'
              ? 'bg-[#FF4500] text-white shadow-sm font-semibold'
              : 'text-gray-400 hover:text-white'
          }`}
          title="Mobile view (380px)"
        >
          <RiSmartphoneLine className="w-3.5 h-3.5" />
          <span className="hidden md:inline text-[11px]">Mobile</span>
        </button>
      </div>

      {/* 3. Right: Undo/Redo + Preview Toggle + Publish Button */}
      <div className="flex items-center gap-2">
        {/* Undo / Redo */}
        <div className="hidden sm:flex items-center gap-1">
          <button
            onClick={undo}
            disabled={!canUndo}
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
              canUndo
                ? 'hover:bg-white/10 text-gray-300 hover:text-white'
                : 'text-gray-600 cursor-not-allowed'
            }`}
            title="Undo (Cmd+Z)"
          >
            <RiArrowGoBackLine className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
              canRedo
                ? 'hover:bg-white/10 text-gray-300 hover:text-white'
                : 'text-gray-600 cursor-not-allowed'
            }`}
            title="Redo (Cmd+Shift+Z)"
          >
            <RiArrowGoForwardLine className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="h-4 w-px bg-white/10 mx-1 hidden sm:block" />

        {/* Visual Edit vs Clean Preview Toggle */}
        <button
          onClick={() => setIsEditMode(!isEditMode)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
            isEditMode
              ? 'bg-white/10 text-white border-white/20'
              : 'bg-white/5 text-gray-400 hover:text-white border-white/10'
          }`}
          title={isEditMode ? 'Visual Edit Mode active' : 'Clean Preview active'}
        >
          {isEditMode ? (
            <>
              <RiEdit2Line className="w-3.5 h-3.5 text-[#FF4500]" />
              <span className="hidden md:inline">Edit Mode</span>
            </>
          ) : (
            <>
              <RiEyeLine className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline">Preview</span>
            </>
          )}
        </button>

        {/* Primary Glowing Action: Publish */}
        <button
          onClick={handlePublish}
          disabled={saveStatus === 'saving'}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-orange-600 to-[#FF4500] hover:from-orange-500 hover:to-[#ff5722] text-white shadow-md shadow-[#FF4500]/25 transition-all hover:scale-102 active:scale-98 cursor-pointer"
        >
          {saveStatus === 'saving' ? (
            <RiLoader4Line className="w-3.5 h-3.5 animate-spin" />
          ) : isPublished ? (
            <RiCheckLine className="w-3.5 h-3.5" />
          ) : (
            <RiUploadCloud2Line className="w-3.5 h-3.5" />
          )}
          <span>{isPublished ? 'Published' : 'Publish'}</span>
        </button>
      </div>

      {/* Published URL Toast Modal */}
      {publishedUrl && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#121215] border border-white/15 rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-3 text-xl">
              <RiCheckLine />
            </div>
            <h3 className="text-base font-bold text-white mb-1">Your Portfolio is Live!</h3>
            <p className="text-xs text-gray-400 mb-4">
              Your custom portfolio schema is deployed and publicly accessible.
            </p>
            <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/10 mb-4">
              <input
                type="text"
                readOnly
                value={publishedUrl}
                className="flex-1 bg-transparent border-0 outline-none text-xs text-zinc-300 font-mono px-2"
              />
              <a
                href={publishedUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1 rounded-lg bg-[#FF4500] text-white text-xs font-bold flex items-center gap-1 hover:bg-[#ff5722]"
              >
                <span>Visit</span>
                <RiExternalLinkLine className="w-3 h-3" />
              </a>
            </div>
            <button
              onClick={() => setPublishedUrl(null)}
              className="text-xs text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
