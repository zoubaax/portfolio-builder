import React, { useState } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { useUser, UserButton } from '@clerk/react';
import {
  RiSparkling2Fill,
  RiSearch2Line,
  RiHome5Line,
  RiTimeLine,
  RiGlobalLine,
  RiFlashlightLine,
  RiBookOpenLine,
  RiBriefcase4Line,
  RiTerminalBoxLine,
  RiMailLine,
  RiPaletteLine,
  RiFontSize,
  RiDatabase2Line,
  RiCloudLine,
  RiArrowRightSLine,
  RiArrowUpDownLine,
  RiSideBarLine,
  RiSunLine,
  RiMoonLine,
  RiEyeLine,
  RiEyeOffLine,
  RiAddLine
} from 'react-icons/ri';

export const StudioSidebar = ({ onNewProject }) => {
  const { user } = useUser();
  const {
    portfolio,
    studioTheme,
    toggleStudioTheme,
    setThemePreset,
    chatMessages,
    versions,
    rollbackToVersion,
    toggleSectionVisibility
  } = usePortfolio();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState('home');
  const [expandedCategory, setExpandedCategory] = useState({
    recents: false,
    architecture: true,
    design: false,
    system: false,
  });
  const [searchQuery, setSearchQuery] = useState('');

  const isLight = studioTheme === 'light';

  const toggleCategory = (cat) => {
    setExpandedCategory((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  const userEmail = user?.primaryEmailAddress?.emailAddress || 'zoubaax@gmail.com';
  const recentPrompts = chatMessages.filter((m) => m.role === 'user').slice(-5).reverse();

  return (
    <aside
      className={`h-[calc(100vh-3.5rem)] transition-all duration-200 flex flex-col z-30 select-none ${
        isCollapsed ? 'w-16' : 'w-64'
      } ${
        isLight
          ? 'bg-[#ffffff] border-r border-slate-200 text-slate-800'
          : 'bg-[#0f1117] border-r border-white/10 text-[#d1d5db]'
      }`}
    >
      {/* 1. Cloudflare Top Header: Logo + Account / Email Selector */}
      <div className="p-3 border-b border-white/10 flex items-center justify-between">
        {!isCollapsed ? (
          <div className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer hover:opacity-90 transition-opacity">
            <div className="w-7 h-7 rounded-lg bg-[#FF4500] text-white flex items-center justify-center shrink-0 shadow-sm shadow-[#FF4500]/30 font-bold text-sm">
              <RiCloudLine className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-medium truncate text-white leading-tight">
                {userEmail}
              </p>
            </div>
            <RiArrowUpDownLine className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-lg bg-[#FF4500] text-white flex items-center justify-center mx-auto shadow-sm shadow-[#FF4500]/30">
            <RiCloudLine className="w-4 h-4" />
          </div>
        )}
      </div>

      {/* 2. Cloudflare Search Bar */}
      {!isCollapsed && (
        <div className="px-3 pt-3 pb-1">
          <div className="relative flex items-center">
            <RiSearch2Line className="w-3.5 h-3.5 absolute left-3 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Quick search..."
              className={`w-full pl-8 pr-8 py-1.5 text-xs rounded-lg border outline-none transition-colors ${
                isLight
                  ? 'bg-slate-50 focus:bg-white border-slate-200 focus:border-[#FF4500] text-slate-900 placeholder-slate-400'
                  : 'bg-white/5 focus:bg-[#161a24] border-white/10 focus:border-[#FF4500]/50 text-white placeholder-gray-500'
              }`}
            />
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-white/10 absolute right-2 text-gray-500 bg-white/5 pointer-events-none">
              ⌘K
            </span>
          </div>
        </div>
      )}

      {/* 3. Navigation List (Cloudflare button & text style) */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-4">
        
        {/* PRIMARY GROUP (Account Home / Recents / Domains) */}
        <div className="space-y-0.5">
          {/* Account Home (Active state) */}
          <button
            onClick={() => setActiveItem('home')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[13px] transition-colors cursor-pointer ${
              activeItem === 'home'
                ? isLight
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'bg-white/10 text-white font-medium'
                : isLight
                  ? 'text-slate-700 hover:bg-slate-50'
                  : 'text-[#9ca3af] hover:bg-white/5 hover:text-white'
            }`}
            title="Studio Home"
          >
            <div className="flex items-center gap-2.5 truncate">
              <RiHome5Line className="w-4 h-4 shrink-0 text-[#9ca3af]" />
              {!isCollapsed && <span>Studio home</span>}
            </div>
          </button>

          {/* Recents */}
          <button
            onClick={() => toggleCategory('recents')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[13px] transition-colors cursor-pointer ${
              isLight
                ? 'text-slate-700 hover:bg-slate-50'
                : 'text-[#9ca3af] hover:bg-white/5 hover:text-white'
            }`}
            title="Recents"
          >
            <div className="flex items-center gap-2.5 truncate">
              <RiTimeLine className="w-4 h-4 shrink-0 text-[#9ca3af]" />
              {!isCollapsed && <span>Recents</span>}
            </div>
            {!isCollapsed && (
              <RiArrowRightSLine
                className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                  expandedCategory.recents ? 'rotate-90' : ''
                }`}
              />
            )}
          </button>

          {/* Expanded Recents Prompts */}
          {expandedCategory.recents && !isCollapsed && (
            <div className="pl-9 pr-2 py-1 space-y-1">
              {recentPrompts.length > 0 ? (
                recentPrompts.map((p, idx) => (
                  <div
                    key={idx}
                    className="text-[11px] text-gray-400 hover:text-white truncate py-1 cursor-pointer transition-colors"
                    title={p.text}
                  >
                    • {p.text}
                  </div>
                ))
              ) : (
                <p className="text-[11px] text-gray-500">No prompt history</p>
              )}
            </div>
          )}

          {/* Domains */}
          <div
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-[13px] transition-colors cursor-pointer ${
              isLight
                ? 'text-slate-700 hover:bg-slate-50'
                : 'text-[#9ca3af] hover:bg-white/5 hover:text-white'
            }`}
            title="Domains"
          >
            <div className="flex items-center gap-2.5 truncate">
              <RiGlobalLine className="w-4 h-4 shrink-0 text-[#9ca3af]" />
              {!isCollapsed && <span>Domains</span>}
            </div>
            {!isCollapsed && <RiArrowRightSLine className="w-4 h-4 text-gray-500" />}
          </div>
        </div>

        {/* CATEGORY: PAGE ARCHITECTURE (Cloudflare "Observe" Style) */}
        <div className="space-y-0.5">
          {!isCollapsed && (
            <p className="px-3 pb-1 text-[11px] font-medium text-gray-400 tracking-wide">
              Architecture
            </p>
          )}

          {portfolio.sections.map((sec) => (
            <div
              key={sec.id}
              className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-[13px] transition-colors group cursor-pointer ${
                isLight
                  ? 'text-slate-700 hover:bg-slate-50'
                  : 'text-[#9ca3af] hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                {sec.type === 'hero' && <RiFlashlightLine className="w-4 h-4 text-[#9ca3af] shrink-0" />}
                {sec.type === 'about' && <RiBookOpenLine className="w-4 h-4 text-[#9ca3af] shrink-0" />}
                {sec.type === 'projects' && <RiBriefcase4Line className="w-4 h-4 text-[#9ca3af] shrink-0" />}
                {sec.type === 'skills' && <RiTerminalBoxLine className="w-4 h-4 text-[#9ca3af] shrink-0" />}
                {sec.type === 'contact' && <RiMailLine className="w-4 h-4 text-[#9ca3af] shrink-0" />}
                {!isCollapsed && (
                  <span className="capitalize text-[13px]">
                    {sec.type}
                  </span>
                )}
              </div>

              {!isCollapsed && (
                <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSectionVisibility(sec.id);
                    }}
                    className="p-1 hover:bg-white/10 rounded cursor-pointer"
                    title={sec.visible !== false ? 'Hide section' : 'Show section'}
                  >
                    {sec.visible !== false ? (
                      <RiEyeLine className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <RiEyeOffLine className="w-3 h-3 text-gray-500" />
                    )}
                  </button>
                  <RiArrowRightSLine className="w-4 h-4 text-gray-500" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CATEGORY: DESIGN ENGINE (Cloudflare "Build" Style) */}
        <div className="space-y-0.5">
          {!isCollapsed && (
            <p className="px-3 pb-1 text-[11px] font-medium text-gray-400 tracking-wide">
              Design engine
            </p>
          )}

          {/* Theme Presets */}
          <div
            onClick={() => toggleCategory('design')}
            className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-[13px] transition-colors cursor-pointer ${
              isLight
                ? 'text-slate-700 hover:bg-slate-50'
                : 'text-[#9ca3af] hover:bg-white/5 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5 truncate">
              <RiPaletteLine className="w-4 h-4 text-[#9ca3af] shrink-0" />
              {!isCollapsed && <span>Theme presets</span>}
            </div>
            {!isCollapsed && (
              <RiArrowRightSLine
                className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                  expandedCategory.design ? 'rotate-90' : ''
                }`}
              />
            )}
          </div>

          {/* Expanded Theme Choices */}
          {expandedCategory.design && !isCollapsed && (
            <div className="pl-9 pr-2 py-1 space-y-1">
              <button
                onClick={() => setThemePreset('cyber-dark')}
                className="w-full text-left text-[11px] text-gray-400 hover:text-cyan-400 py-1 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>• Cyber Dark (Terminal)</span>
              </button>
              <button
                onClick={() => setThemePreset('bento-violet')}
                className="w-full text-left text-[11px] text-gray-400 hover:text-violet-400 py-1 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>• Bento Violet</span>
              </button>
              <button
                onClick={() => setThemePreset('minimal-editorial')}
                className="w-full text-left text-[11px] text-gray-400 hover:text-amber-400 py-1 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>• Minimal Editorial</span>
              </button>
            </div>
          )}

          {/* AI Copilot */}
          <div
            onClick={onNewProject}
            className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-[13px] transition-colors cursor-pointer ${
              isLight
                ? 'text-slate-700 hover:bg-slate-50'
                : 'text-[#9ca3af] hover:bg-white/5 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5 truncate">
              <RiSparkling2Fill className="w-4 h-4 text-[#FF4500] shrink-0" />
              {!isCollapsed && <span>AI Synthesis</span>}
            </div>
            {!isCollapsed && <RiArrowRightSLine className="w-4 h-4 text-gray-500" />}
          </div>
        </div>

        {/* CATEGORY: STORAGE & DATABASE (Cloudflare "Storage & databases" Style) */}
        <div className="space-y-0.5">
          {!isCollapsed && (
            <p className="px-3 pb-1 text-[11px] font-medium text-gray-400 tracking-wide">
              Storage & databases
            </p>
          )}

          <div
            onClick={() => toggleCategory('system')}
            className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-[13px] transition-colors cursor-pointer ${
              isLight
                ? 'text-slate-700 hover:bg-slate-50'
                : 'text-[#9ca3af] hover:bg-white/5 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5 truncate">
              <RiDatabase2Line className="w-4 h-4 text-[#9ca3af] shrink-0" />
              {!isCollapsed && <span>Neon DB snapshots</span>}
            </div>
            {!isCollapsed && (
              <RiArrowRightSLine
                className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                  expandedCategory.system ? 'rotate-90' : ''
                }`}
              />
            )}
          </div>

          {expandedCategory.system && !isCollapsed && (
            <div className="pl-9 pr-2 py-1 space-y-1">
              {versions.length > 0 ? (
                versions.slice(-3).map((v) => (
                  <button
                    key={v.id}
                    onClick={() => rollbackToVersion(v)}
                    className="w-full text-left text-[11px] text-gray-400 hover:text-emerald-400 py-1 transition-colors flex items-center justify-between cursor-pointer"
                  >
                    <span>• v{v.versionNumber}</span>
                    <span className="text-[9px] font-mono text-gray-500">Restore</span>
                  </button>
                ))
              ) : (
                <p className="text-[11px] text-gray-500">Auto-snapshot active</p>
              )}
            </div>
          )}
        </div>

      </div>

      {/* 4. Bottom Footer: Cloudflare Collapse Button [ ◫ ] + Theme Switcher */}
      <div className="p-3 border-t border-white/10 flex items-center justify-between">
        {/* Collapse Sidebar Icon Button (Matching Cloudflare's exact bottom-left icon) */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
            isLight
              ? 'hover:bg-slate-100 text-slate-600'
              : 'hover:bg-white/10 text-gray-400 hover:text-white'
          }`}
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          <RiSideBarLine className="w-4 h-4" />
        </button>

        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <button
              onClick={toggleStudioTheme}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                isLight
                  ? 'hover:bg-slate-100 text-slate-600'
                  : 'hover:bg-white/10 text-gray-400 hover:text-white'
              }`}
              title="Toggle Light / Dark mode"
            >
              {isLight ? <RiMoonLine className="w-4 h-4" /> : <RiSunLine className="w-4 h-4" />}
            </button>
            <UserButton afterSignOutUrl="/" />
          </div>
        )}
      </div>
    </aside>
  );
};
