import React, { useState } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import {
  RiSparkling2Fill,
  RiSearch2Line,
  RiNotification3Line,
  RiSunLine,
  RiMoonLine,
  RiComputerLine,
  RiTabletLine,
  RiSmartphoneLine,
  RiArrowGoBackLine,
  RiArrowGoForwardLine,
  RiEdit2Line,
  RiEyeLine,
  RiCodeSSlashLine,
  RiUploadCloud2Line,
  RiArrowDownSLine,
  RiCheckLine,
  RiFlashlightLine
} from 'react-icons/ri';
import { TbLayersLinked } from 'react-icons/tb';

export const StudioHeader = () => {
  const {
    portfolio,
    deviceView,
    setDeviceView,
    isEditMode,
    setIsEditMode,
    studioTheme,
    toggleStudioTheme,
    undo,
    redo,
    canUndo,
    canRedo,
    loadPresetPortfolio
  } = usePortfolio();

  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const isLight = studioTheme === 'light';

  return (
    <header
      className={`h-16 px-4 md:px-6 border-b transition-colors duration-200 flex items-center justify-between z-40 select-none ${
        isLight
          ? 'bg-white border-slate-200 text-slate-800'
          : 'bg-[#0d121f] border-white/10 text-white'
      }`}
    >
      {/* 1. Left Brand & Breadcrumb */}
      <div className="flex items-center gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <RiSparkling2Fill className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-base">Portfolify</span>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                  isLight
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                    : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                }`}
              >
                Studio Pro
              </span>
            </div>
            <p className={`text-[11px] font-medium leading-none mt-0.5 ${isLight ? 'text-slate-400' : 'text-slate-400'}`}>
              AI Site Engine • {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </p>
          </div>
        </div>

        <div className={`h-6 w-px mx-1 hidden lg:block ${isLight ? 'bg-slate-200' : 'bg-white/10'}`} />

        {/* Archetype Preset Selector Dropdown */}
        <div className="relative hidden md:block">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              isLight
                ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                : 'bg-white/5 hover:bg-white/10 border-white/10 text-zinc-200'
            }`}
          >
            <TbLayersLinked className="w-4 h-4 text-indigo-500" />
            <span className="truncate max-w-[140px]">
              {portfolio.meta?.title?.split('—')[0]?.trim() || 'Portfolio'}
            </span>
            <RiArrowDownSLine className="w-3.5 h-3.5 opacity-60" />
          </button>

          {isDropdownOpen && (
            <div
              className={`absolute top-full left-0 mt-2 w-64 p-2 rounded-2xl border shadow-xl z-50 transition-all ${
                isLight
                  ? 'bg-white border-slate-200 shadow-slate-200/50 text-slate-800'
                  : 'bg-[#141a29] border-white/10 shadow-2xl text-white'
              }`}
            >
              <p className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-slate-400' : 'text-zinc-400'}`}>
                Switch Archetype Preset
              </p>
              <button
                onClick={() => {
                  loadPresetPortfolio('developer');
                  setIsDropdownOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors flex items-center justify-between ${
                  isLight ? 'hover:bg-slate-100 text-slate-700' : 'hover:bg-white/10 text-zinc-200'
                }`}
              >
                <span>💻 Full-Stack & AI Engineer</span>
              </button>
              <button
                onClick={() => {
                  loadPresetPortfolio('designer');
                  setIsDropdownOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors flex items-center justify-between ${
                  isLight ? 'hover:bg-slate-100 text-slate-700' : 'hover:bg-white/10 text-zinc-200'
                }`}
              >
                <span>🎨 Product & Systems Designer</span>
              </button>
              <button
                onClick={() => {
                  loadPresetPortfolio('minimalist');
                  setIsDropdownOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors flex items-center justify-between ${
                  isLight ? 'hover:bg-slate-100 text-slate-700' : 'hover:bg-white/10 text-zinc-200'
                }`}
              >
                <span>🖋️ Minimalist Editorial</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. Middle: Search Bar + Device Switcher + Undo/Redo */}
      <div className="flex items-center gap-3">
        {/* SaaS Global Search Bar */}
        <div className="relative hidden xl:flex items-center">
          <RiSearch2Line className={`w-4 h-4 absolute left-3 pointer-events-none ${isLight ? 'text-slate-400' : 'text-zinc-500'}`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search sections, styles, prompts..."
            className={`w-64 pl-9 pr-8 py-1.5 text-xs rounded-xl border outline-none transition-all ${
              isLight
                ? 'bg-slate-50 focus:bg-white border-slate-200 focus:border-indigo-500 text-slate-800 placeholder-slate-400'
                : 'bg-white/5 focus:bg-[#121926] border-white/10 focus:border-indigo-500 text-white placeholder-zinc-500'
            }`}
          />
          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border absolute right-2.5 ${
            isLight ? 'bg-slate-100 border-slate-200 text-slate-500' : 'bg-white/10 border-white/10 text-zinc-400'
          }`}>
            ⌘K
          </span>
        </div>

        {/* Visual Edit vs Live Preview Toggle */}
        <button
          onClick={() => setIsEditMode(!isEditMode)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
            isEditMode
              ? isLight
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                : 'bg-indigo-600 text-white border-indigo-500 shadow-sm'
              : isLight
                ? 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                : 'bg-white/5 text-zinc-400 border-white/10 hover:text-white'
          }`}
          title={isEditMode ? 'Visual Edit Mode (Elementor style) - click to switch to clean Preview' : 'Preview Mode - click to edit inline'}
        >
          {isEditMode ? (
            <>
              <RiEdit2Line className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Visual Edit</span>
            </>
          ) : (
            <>
              <RiEyeLine className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Preview</span>
            </>
          )}
        </button>

        {/* Device Viewport Segmented Control */}
        <div className={`flex items-center rounded-xl p-1 border ${
          isLight ? 'bg-slate-100 border-slate-200' : 'bg-white/5 border-white/10'
        }`}>
          <button
            onClick={() => setDeviceView('desktop')}
            className={`p-1.5 rounded-lg transition-all ${
              deviceView === 'desktop'
                ? isLight
                  ? 'bg-white text-indigo-600 shadow-sm font-bold'
                  : 'bg-indigo-600 text-white shadow-sm'
                : isLight
                  ? 'text-slate-500 hover:text-slate-900'
                  : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title="Desktop View"
          >
            <RiComputerLine className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeviceView('tablet')}
            className={`p-1.5 rounded-lg transition-all ${
              deviceView === 'tablet'
                ? isLight
                  ? 'bg-white text-indigo-600 shadow-sm font-bold'
                  : 'bg-indigo-600 text-white shadow-sm'
                : isLight
                  ? 'text-slate-500 hover:text-slate-900'
                  : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title="Tablet View (768px)"
          >
            <RiTabletLine className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeviceView('mobile')}
            className={`p-1.5 rounded-lg transition-all ${
              deviceView === 'mobile'
                ? isLight
                  ? 'bg-white text-indigo-600 shadow-sm font-bold'
                  : 'bg-indigo-600 text-white shadow-sm'
                : isLight
                  ? 'text-slate-500 hover:text-slate-900'
                  : 'text-zinc-400 hover:text-zinc-200'
            }`}
            title="Mobile View (375px)"
          >
            <RiSmartphoneLine className="w-4 h-4" />
          </button>
        </div>

        {/* Undo / Redo */}
        <div className={`hidden sm:flex items-center rounded-xl p-1 border ${
          isLight ? 'bg-slate-100 border-slate-200' : 'bg-white/5 border-white/10'
        }`}>
          <button
            onClick={undo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            className={`p-1.5 rounded-lg transition-colors ${
              canUndo
                ? isLight
                  ? 'text-slate-700 hover:bg-white'
                  : 'text-zinc-300 hover:text-white hover:bg-white/10'
                : 'text-zinc-400/40 cursor-not-allowed'
            }`}
          >
            <RiArrowGoBackLine className="w-4 h-4" />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
            className={`p-1.5 rounded-lg transition-colors ${
              canRedo
                ? isLight
                  ? 'text-slate-700 hover:bg-white'
                  : 'text-zinc-300 hover:text-white hover:bg-white/10'
                : 'text-zinc-400/40 cursor-not-allowed'
            }`}
          >
            <RiArrowGoForwardLine className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3. Right: Studio Light/Dark Toggle + Notifications + User Profile (like inspiration screenshot) */}
      <div className="flex items-center gap-3">
        {/* Studio Theme Switcher (Sun / Moon) */}
        <button
          onClick={toggleStudioTheme}
          title={`Switch to ${isLight ? 'Dark' : 'Light'} Studio Theme`}
          className={`p-2 rounded-xl border transition-all ${
            isLight
              ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-amber-500'
              : 'bg-white/5 hover:bg-white/10 border-white/10 text-amber-400'
          }`}
        >
          {isLight ? <RiMoonLine className="w-4 h-4 text-slate-700" /> : <RiSunLine className="w-4 h-4 text-amber-400" />}
        </button>

        {/* Notification Bell with Badge */}
        <div className="relative">
          <button
            className={`p-2 rounded-xl border transition-all ${
              isLight
                ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600'
                : 'bg-white/5 hover:bg-white/10 border-white/10 text-zinc-300'
            }`}
          >
            <RiNotification3Line className="w-4 h-4" />
          </button>
          <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-1.5 right-1.5 ring-2 ring-white" />
        </div>

        {/* Publish Action Button */}
        <button
          onClick={() => {
            alert(`Ready for Phase 4! In Phase 4, this publishes to ${portfolio.meta?.slug || 'username'}.yourplatform.com via Cloudflare Wildcard routing.`);
          }}
          className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 active:scale-95 transition-all"
        >
          <RiUploadCloud2Line className="w-4 h-4" />
          <span>Publish</span>
        </button>

        {/* User Profile Card (Directly inspired by screenshot: "zoubaa STUDENT") */}
        <div className={`flex items-center gap-2 pl-2 border-l ${isLight ? 'border-slate-200' : 'border-white/10'}`}>
          <div className="w-8 h-8 rounded-full bg-[#181f30] text-white flex items-center justify-center font-bold text-xs ring-2 ring-indigo-500/30">
            z
          </div>
          <div className="hidden md:block text-left leading-tight">
            <span className={`block font-bold text-xs ${isLight ? 'text-slate-800' : 'text-white'}`}>
              zoubaa
            </span>
            <span className="text-[10px] font-semibold text-indigo-500 uppercase tracking-wider">
              CREATOR
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
