import React, { useState } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { UserButton } from '@clerk/react';
import {
  RiComputerLine,
  RiSmartphoneLine,
  RiEyeLine,
  RiCodeSSlashLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiSideBarLine,
  RiUploadCloud2Line,
  RiCheckLine,
  RiLoader4Line,
  RiExternalLinkLine,
  RiEdit2Line,
  RiGithubFill,
  RiHistoryLine
} from 'react-icons/ri';

export const V0Header = () => {
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
    history,
    historyIndex,
    canUndo,
    canRedo,
    undo,
    redo,
    savePortfolio,
    saveStatus,
    isPublished,
    hasGeneratedFirstPortfolio,
    setIsHistoryOpen,
  } = usePortfolio();

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(portfolio.meta?.title || 'my-portfolio');
  const [publishedUrl, setPublishedUrl] = useState(null);

  const currentVersion = historyIndex + 1;
  const totalVersions = Math.max(history.length, 1);

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

  const handleDeploy = async () => {
    try {
      const res = await savePortfolio(true);
      const slug = res?.subdomainSlug || portfolio.meta?.slug || 'zoubaa';
      setPublishedUrl(`https://${slug}.portfolify.dev`);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <header className="h-13 px-4 border-b border-zinc-800 bg-[#000000] text-zinc-100 flex items-center justify-between select-none z-30">
      
      {/* 1. Left: Vercel Geometric Logo + Project Name + Version Badge */}
      <div className="flex items-center gap-3">
        {/* Vercel Geometric Monochrome Triangle Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 20H22L12 2Z" fill="#FFFFFF" />
            </svg>
          </div>
          <span className="font-bold text-sm tracking-tight text-white">v0</span>
          <span className="text-zinc-600 text-xs">/</span>
        </div>

        {/* Project Name (Editable) */}
        <div className="flex items-center gap-2">
          {isEditingTitle ? (
            <input
              type="text"
              value={titleValue}
              onChange={(e) => setTitleValue(e.target.value)}
              onBlur={handleTitleSubmit}
              onKeyDown={(e) => e.key === 'Enter' && handleTitleSubmit()}
              autoFocus
              className="text-xs font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 outline-none text-white w-40"
            />
          ) : (
            <button
              onClick={() => setIsEditingTitle(true)}
              className="group flex items-center gap-1.5 text-xs font-mono text-zinc-200 hover:text-white transition-colors cursor-pointer"
              title="Click to rename"
            >
              <span>{portfolio.meta?.title || 'zoubaa-portfolio'}</span>
              <RiEdit2Line className="w-3 h-3 text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          )}

          {/* v0 Version Badge */}
          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-md px-1.5 py-0.5 text-[10px] font-mono text-zinc-400">
            <span>v{currentVersion}</span>
          </div>

          {/* Auto-saved indicator */}
          <div className="hidden lg:flex items-center gap-1.5 text-[10px] text-zinc-500 font-mono ml-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>{saveStatus === 'saving' ? 'Sauvegarde...' : 'Enregistré'}</span>
          </div>
        </div>
      </div>

      {/* 2. Center: [ Preview | Code ] Toggle + Device Switcher */}
      <div className="flex items-center gap-3">
        {/* v0 [ Preview | Code ] Tab Pill Switcher */}
        <div className="flex items-center bg-zinc-900/90 p-0.5 rounded-lg border border-zinc-800 text-xs">
          <button
            onClick={() => setViewMode('preview')}
            className={`px-3 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'preview'
                ? 'bg-zinc-800 text-white font-medium shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <RiEyeLine className="w-3.5 h-3.5" />
            <span>Aperçu</span>
          </button>

          <button
            onClick={() => setViewMode('code')}
            className={`px-3 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'code'
                ? 'bg-zinc-800 text-white font-medium shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <RiCodeSSlashLine className="w-3.5 h-3.5" />
            <span>Code</span>
          </button>

          {hasGeneratedFirstPortfolio && (
            <button
              onClick={() => setViewMode('projects')}
              className={`px-3 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1.5 animate-in fade-in zoom-in-95 duration-200 ${
                viewMode === 'projects'
                  ? 'bg-zinc-800 text-white font-medium shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Importer des projets depuis GitHub"
            >
              <RiGithubFill className="w-3.5 h-3.5" />
              <span>Projets</span>
            </button>
          )}
        </div>

        {/* Device Switcher (Desktop / Mobile) */}
        <div className="hidden sm:flex items-center bg-zinc-900/90 p-0.5 rounded-lg border border-zinc-800 text-xs">
          <button
            onClick={() => {
              setDeviceView('desktop');
              setSimulatedWidth(null);
            }}
            className={`p-1.5 rounded-md transition-all cursor-pointer ${
              !isMobileViewport
                ? 'bg-zinc-800 text-white'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
            title="Vue Bureau"
          >
            <RiComputerLine className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => {
              setDeviceView('mobile');
              setSimulatedWidth(390);
            }}
            className={`p-1.5 rounded-md transition-all cursor-pointer ${
              isMobileViewport
                ? 'bg-zinc-800 text-white'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
            title="Vue Mobile (390px)"
          >
            <RiSmartphoneLine className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3. Right: Version Scrubber (< v1 >) + Fullscreen Toggle + Deploy Button */}
      <div className="flex items-center gap-2.5">
        
        {/* v0 Version Scrubber: < v1 / 3 > */}
        <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-0.5 text-xs font-mono">
          <button
            onClick={undo}
            disabled={!canUndo}
            className={`p-1 rounded transition-colors ${
              canUndo
                ? 'hover:bg-zinc-800 text-zinc-300 hover:text-white cursor-pointer'
                : 'text-zinc-700 cursor-not-allowed'
            }`}
            title="Version précédente"
          >
            <RiArrowLeftSLine className="w-3.5 h-3.5" />
          </button>

          <span className="px-2 text-[11px] text-zinc-400">
            {currentVersion} / {totalVersions}
          </span>

          <button
            onClick={redo}
            disabled={!canRedo}
            className={`p-1 rounded transition-colors ${
              canRedo
                ? 'hover:bg-zinc-800 text-zinc-300 hover:text-white cursor-pointer'
                : 'text-zinc-700 cursor-not-allowed'
            }`}
            title="Version suivante"
          >
            <RiArrowRightSLine className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 1-Click Toggle Chat / Fullscreen Canvas */}
        <button
          onClick={() => setIsChatCollapsed(!isChatCollapsed)}
          className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
            isChatCollapsed
              ? 'bg-white text-black border-white'
              : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800'
          }`}
          title={isChatCollapsed ? 'Afficher le chat' : 'Plein écran'}
        >
          <RiSideBarLine className="w-4 h-4" />
        </button>

        {/* Sessions & Chat History Drawer Trigger */}
        <button
          onClick={() => setIsHistoryOpen((prev) => !prev)}
          className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          title="Historique des sessions de chat"
        >
          <RiHistoryLine className="w-4 h-4" />
        </button>

        {/* High-Contrast Solid White Vercel "Deploy" Button */}
        <button
          onClick={handleDeploy}
          disabled={saveStatus === 'saving'}
          className="bg-white text-black font-semibold text-xs px-3.5 py-1.5 rounded-lg hover:bg-zinc-200 transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
        >
          {saveStatus === 'saving' ? (
            <RiLoader4Line className="w-3.5 h-3.5 animate-spin" />
          ) : isPublished ? (
            <RiCheckLine className="w-3.5 h-3.5" />
          ) : (
            <RiUploadCloud2Line className="w-3.5 h-3.5" />
          )}
          <span>{isPublished ? 'Publié' : 'Publier'}</span>
        </button>

        {/* Clerk User Avatar */}
        <UserButton afterSignOutUrl="/" />
      </div>

      {/* Published URL Toast Modal */}
      {publishedUrl && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#09090b] border border-zinc-800 rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 text-center">
            <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center mx-auto mb-3 text-xl font-bold">
              ✓
            </div>
            <h3 className="text-base font-bold text-white mb-1">Portfolio Publié avec Succès</h3>
            <p className="text-xs text-zinc-400 mb-4 font-mono">
              Votre portfolio est désormais en ligne et accessible mondialement.
            </p>
            <div className="flex items-center gap-2 p-2 rounded-xl bg-zinc-900 border border-zinc-800 mb-4">
              <input
                type="text"
                readOnly
                value={publishedUrl}
                className="flex-1 bg-transparent border-0 outline-none text-xs text-zinc-200 font-mono px-2"
              />
              <a
                href={publishedUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-white text-black text-xs font-semibold flex items-center gap-1 hover:bg-zinc-200 transition-colors"
              >
                <span>Voir le site</span>
                <RiExternalLinkLine className="w-3 h-3" />
              </a>
            </div>
            <button
              onClick={() => setPublishedUrl(null)}
              className="text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer font-mono"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

    </header>
  );
};
