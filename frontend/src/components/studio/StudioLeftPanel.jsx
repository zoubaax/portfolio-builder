import React, { useState, useRef, useEffect } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { THEME_PRESETS } from '../../types/portfolio';
import {
  RiSparkling2Fill,
  RiLayoutMasonryLine,
  RiPaletteLine,
  RiSendPlaneFill,
  RiEyeLine,
  RiEyeOffLine,
  RiArrowUpSLine,
  RiArrowDownSLine,
  RiMagicLine,
  RiAddCircleLine,
  RiCheckDoubleLine,
  RiTerminalBoxLine,
  RiFileTextLine,
  RiArrowRightSLine,
  RiCodeSSlashLine,
  RiShieldCheckLine,
  RiHeartPulseLine,
  RiAppsLine,
  RiDeleteBin6Line,
  RiFileCopyLine,
  RiPriceTag3Line
} from 'react-icons/ri';
import { TbLayersLinked, TbChecklist, TbLayoutBoard } from 'react-icons/tb';

const SUGGESTION_PILLS = [
  { label: '🟣 Bento Violet Style', prompt: 'Make it a dark bento violet style with high-contrast borders' },
  { label: '💻 Terminal Dev Hero', prompt: 'Switch to a developer terminal hero and cyber dark theme' },
  { label: '🖋️ Editorial Minimalist', prompt: 'Apply the refined minimal editorial theme with serif typography' },
  { label: '🚀 Make Bio More Senior', prompt: 'Rewrite my bio and headline to position me as a Principal Architect' },
  { label: '✨ Add AI Engine Project', prompt: 'Add a new featured AI orchestrator project to my work section' },
];

export const StudioLeftPanel = () => {
  const {
    portfolio,
    activeTab,
    setActiveTab,
    chatMessages,
    isGenerating,
    sendChatMessage,
    toggleSectionVisibility,
    changeSectionVariant,
    moveSection,
    deleteSection,
    duplicateSection,
    addSection,
    setThemePreset,
    updateThemeToken,
    studioTheme
  } = usePortfolio();

  const [inputPrompt, setInputPrompt] = useState('');
  const chatScrollRef = useRef(null);
  const isLight = studioTheme === 'light';

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages, isGenerating]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputPrompt.trim() || isGenerating) return;
    sendChatMessage(inputPrompt);
    setInputPrompt('');
  };

  const visibleCount = portfolio.sections.filter(s => s.visible !== false).length;

  return (
    <aside
      className={`w-full md:w-[410px] lg:w-[440px] shrink-0 border-r flex flex-col h-[calc(100vh-4rem)] transition-colors duration-200 select-none ${
        isLight
          ? 'bg-[#ffffff] border-slate-200 text-slate-800'
          : 'bg-[#0c101a] border-white/10 text-white'
      }`}
    >
      {/* 1. SaaS Mini Metric Widgets (Inspired by the 4 cards in the screenshot) */}
      <div className={`p-4 border-b ${isLight ? 'border-slate-200 bg-slate-50/60' : 'border-white/10 bg-[#090d16]'}`}>
        <div className="grid grid-cols-2 gap-2.5">
          {/* Widget 1: Sections Count */}
          <div
            className={`p-3 rounded-2xl border transition-all ${
              isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-white/5 border-white/10'
            }`}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-6 h-6 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center text-xs">
                <RiLayoutMasonryLine className="w-3.5 h-3.5" />
              </div>
              <span className={`text-[11px] font-semibold ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                Sections
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-extrabold">{visibleCount}</span>
              <span className={`text-[10px] ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>
                / {portfolio.sections.length} Active
              </span>
            </div>
          </div>

          {/* Widget 2: AI Health Score */}
          <div
            className={`p-3 rounded-2xl border transition-all ${
              isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-white/5 border-white/10'
            }`}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center text-xs">
                <RiShieldCheckLine className="w-3.5 h-3.5" />
              </div>
              <span className={`text-[11px] font-semibold ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                AI Health
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-extrabold text-blue-600">98%</span>
              <span className={`text-[10px] ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>
                Optimized
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Structured SaaS Sidebar Navigation (Categorized like screenshot) */}
      <div className={`px-4 pt-3 pb-2 border-b space-y-1 ${isLight ? 'border-slate-200' : 'border-white/10'}`}>
        <p className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 ${
          isLight ? 'text-slate-400' : 'text-zinc-500'
        }`}>
          Studio Workspace
        </p>

        <div className="grid grid-cols-3 gap-1">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'chat'
                ? isLight
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-indigo-600 text-white shadow-sm'
                : isLight
                  ? 'text-slate-600 hover:bg-slate-100'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <RiSparkling2Fill className="w-3.5 h-3.5" />
            <span>AI Copilot</span>
          </button>

          <button
            onClick={() => setActiveTab('sections')}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'sections'
                ? isLight
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-indigo-600 text-white shadow-sm'
                : isLight
                  ? 'text-slate-600 hover:bg-slate-100'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <RiLayoutMasonryLine className="w-3.5 h-3.5" />
            <span>Sections</span>
          </button>

          <button
            onClick={() => setActiveTab('theme')}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'theme'
                ? isLight
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-indigo-600 text-white shadow-sm'
                : isLight
                  ? 'text-slate-600 hover:bg-slate-100'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <RiPaletteLine className="w-3.5 h-3.5" />
            <span>Theme</span>
          </button>
        </div>
      </div>

      {/* TAB 1: AI COPILOT */}
      {activeTab === 'chat' && (
        <div className="flex-1 flex flex-col min-h-0">
          {/* Quick Prompt Pills */}
          <div className={`p-3 border-b overflow-x-auto flex items-center gap-2 no-scrollbar ${
            isLight ? 'border-slate-200 bg-slate-50/50' : 'border-white/5 bg-[#090d16]'
          }`}>
            {SUGGESTION_PILLS.map((pill, idx) => (
              <button
                key={idx}
                onClick={() => sendChatMessage(pill.prompt)}
                disabled={isGenerating}
                className={`shrink-0 text-[11px] font-semibold px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                  isLight
                    ? 'bg-white hover:bg-indigo-50 hover:border-indigo-300 text-slate-700 border-slate-200 shadow-xs'
                    : 'bg-white/5 hover:bg-white/10 text-zinc-300 border-white/10 hover:border-indigo-500/40'
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>

          {/* Messages Feed */}
          <div ref={chatScrollRef} className="flex-1 overflow-y-auto p-4 space-y-3.5">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 text-xs leading-relaxed ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    <RiSparkling2Fill className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[84%] rounded-2xl p-3.5 ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white shadow-sm font-medium'
                      : isLight
                        ? 'bg-slate-100 text-slate-800 border border-slate-200/80 shadow-xs'
                        : 'bg-white/5 text-zinc-300 border border-white/10'
                  }`}
                >
                  <p>{msg.text}</p>
                  <span className={`block mt-1 text-[10px] text-right ${
                    msg.role === 'user' ? 'text-indigo-200' : isLight ? 'text-slate-400' : 'text-zinc-500'
                  }`}>
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {isGenerating && (
              <div className="flex gap-3 text-xs justify-start">
                <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 animate-spin">
                  <RiMagicLine className="w-4 h-4" />
                </div>
                <div className={`rounded-2xl p-3.5 flex items-center gap-2 border ${
                  isLight
                    ? 'bg-indigo-50 text-indigo-900 border-indigo-200'
                    : 'bg-white/5 text-indigo-300 border-indigo-500/20'
                }`}>
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                  <span className="font-semibold">Synthesizing portfolio adjustments...</span>
                </div>
              </div>
            )}
          </div>

          {/* Input Box */}
          <form
            onSubmit={handleSubmit}
            className={`p-3 border-t ${isLight ? 'border-slate-200 bg-white' : 'border-white/10 bg-[#090d16]'}`}
          >
            <div className="relative flex items-center">
              <input
                type="text"
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                placeholder="Ask AI: 'Change hero to terminal', 'Rewrite bio', 'Add project'..."
                disabled={isGenerating}
                className={`w-full rounded-2xl px-4 py-3 text-xs outline-none pr-11 transition-all border ${
                  isLight
                    ? 'bg-slate-50 focus:bg-white border-slate-200 focus:border-indigo-500 text-slate-900 placeholder-slate-400 shadow-xs'
                    : 'bg-[#131926] border-white/10 focus:border-indigo-500 text-white placeholder-zinc-500'
                }`}
              />
              <button
                type="submit"
                disabled={!inputPrompt.trim() || isGenerating}
                className="absolute right-2 p-2 rounded-xl bg-indigo-600 text-white disabled:opacity-30 hover:bg-indigo-700 transition-colors shadow-sm"
              >
                <RiSendPlaneFill className="w-4 h-4" />
              </button>
            </div>
            <p className={`text-[10px] mt-2 px-1 text-center font-medium ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>
              Schema-driven AI updates guarantee 100% layout and syntax integrity.
            </p>
          </form>
        </div>
      )}

      {/* TAB 2: SECTIONS & STRUCTURE */}
      {activeTab === 'sections' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-inherit">
            <span className={`text-[11px] font-bold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
              Portfolio Layout ({portfolio.sections.length})
            </span>
            <button
              onClick={() => addSection('projects', portfolio.sections.length - 1)}
              className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-700"
            >
              <RiAddCircleLine className="w-3.5 h-3.5" />
              <span>Add Section</span>
            </button>
          </div>

          <div className="space-y-2">
            {portfolio.sections.map((section, idx) => (
              <div
                key={section.id}
                className={`p-3 rounded-2xl border transition-all ${
                  isLight
                    ? 'bg-white hover:bg-slate-50/80 border-slate-200 shadow-xs'
                    : 'bg-white/5 hover:bg-white/10 border-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold capitalize">
                      {section.type}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-md font-semibold ${
                        isLight
                          ? 'bg-slate-100 text-slate-600'
                          : 'bg-white/10 text-zinc-400'
                      }`}
                    >
                      {section.variant}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Move Up */}
                    <button
                      onClick={() => idx > 0 && moveSection(idx, idx - 1)}
                      disabled={idx === 0}
                      className="p-1 rounded-md text-zinc-400 hover:text-zinc-900 disabled:opacity-20"
                    >
                      <RiArrowUpSLine className="w-4 h-4" />
                    </button>
                    {/* Move Down */}
                    <button
                      onClick={() => idx < portfolio.sections.length - 1 && moveSection(idx, idx + 1)}
                      disabled={idx === portfolio.sections.length - 1}
                      className="p-1 rounded-md text-zinc-400 hover:text-zinc-900 disabled:opacity-20"
                    >
                      <RiArrowDownSLine className="w-4 h-4" />
                    </button>
                    {/* Duplicate */}
                    <button
                      onClick={() => duplicateSection(section.id)}
                      className="p-1 rounded-md text-zinc-400 hover:text-zinc-900"
                      title="Duplicate"
                    >
                      <RiFileCopyLine className="w-3.5 h-3.5" />
                    </button>
                    {/* Toggle Visibility */}
                    <button
                      onClick={() => toggleSectionVisibility(section.id)}
                      className="p-1 rounded-md"
                    >
                      {section.visible === false ? (
                        <RiEyeOffLine className="w-4 h-4 text-zinc-400" />
                      ) : (
                        <RiEyeLine className="w-4 h-4 text-indigo-600" />
                      )}
                    </button>
                    {/* Delete */}
                    <button
                      onClick={() => deleteSection(section.id)}
                      className="p-1 rounded-md text-zinc-400 hover:text-rose-500"
                    >
                      <RiDeleteBin6Line className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Quick Variant Switcher */}
                {section.type === 'hero' && (
                  <div className="grid grid-cols-3 gap-1 pt-2">
                    {['split-portrait', 'terminal-dev', 'minimal-centered'].map((v) => (
                      <button
                        key={v}
                        onClick={() => changeSectionVariant(section.id, v)}
                        className={`text-[10px] py-1 px-1.5 rounded-lg border capitalize truncate font-medium ${
                          section.variant === v
                            ? 'bg-indigo-600 text-white border-indigo-600 font-bold shadow-xs'
                            : isLight
                              ? 'border-slate-200 text-slate-600 hover:bg-slate-100'
                              : 'border-white/10 text-zinc-400 hover:bg-white/5'
                        }`}
                      >
                        {v.replace('-', ' ')}
                      </button>
                    ))}
                  </div>
                )}

                {section.type === 'projects' && (
                  <div className="grid grid-cols-3 gap-1 pt-2">
                    {['bento-grid', 'card-grid', 'minimal-list'].map((v) => (
                      <button
                        key={v}
                        onClick={() => changeSectionVariant(section.id, v)}
                        className={`text-[10px] py-1 px-1.5 rounded-lg border capitalize truncate font-medium ${
                          section.variant === v
                            ? 'bg-indigo-600 text-white border-indigo-600 font-bold shadow-xs'
                            : isLight
                              ? 'border-slate-200 text-slate-600 hover:bg-slate-100'
                              : 'border-white/10 text-zinc-400 hover:bg-white/5'
                        }`}
                      >
                        {v.replace('-', ' ')}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: THEME & TOKENS */}
      {activeTab === 'theme' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Preset Palettes */}
          <div className="space-y-3">
            <span className={`text-[11px] font-bold uppercase tracking-wider block ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>
              Curated Theme Presets
            </span>
            <div className="grid grid-cols-1 gap-2.5">
              {Object.values(THEME_PRESETS).map((p) => {
                const isActive = portfolio.theme?.id === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setThemePreset(p.id)}
                    className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all ${
                      isActive
                        ? isLight
                          ? 'border-indigo-600 bg-indigo-50/50 shadow-sm ring-1 ring-indigo-500'
                          : 'border-indigo-500 bg-indigo-500/10 shadow-sm ring-1 ring-indigo-500'
                        : isLight
                          ? 'border-slate-200 bg-white hover:border-slate-300'
                          : 'border-white/10 bg-white/5 hover:border-white/20'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold">{p.name}</span>
                        {isActive && <RiCheckDoubleLine className="w-4 h-4 text-indigo-600" />}
                      </div>
                      <p className={`text-[11px] mt-0.5 ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                        {p.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 pl-2">
                      <div className="w-4 h-4 rounded-full border border-black/10 shadow-xs" style={{ backgroundColor: p.palette.bg }} />
                      <div className="w-4 h-4 rounded-full shadow-xs" style={{ backgroundColor: p.palette.accent }} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Accent Color Palette Customizer */}
          <div className="space-y-3 pt-3 border-t border-inherit">
            <span className={`text-[11px] font-bold uppercase tracking-wider block ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>
              Accent Color Tone
            </span>
            <div className="flex items-center gap-2">
              {['#4f46e5', '#8b5cf6', '#ec4899', '#0d9488', '#f59e0b', '#2563eb', '#10b981'].map((hex) => (
                <button
                  key={hex}
                  onClick={() => updateThemeToken('palette', 'accent', hex)}
                  className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 shadow-sm"
                  style={{
                    backgroundColor: hex,
                    borderColor: portfolio.theme?.palette?.accent === hex ? (isLight ? '#0f172a' : '#ffffff') : 'transparent',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Corner Radius Token */}
          <div className="space-y-3 pt-3 border-t border-inherit">
            <span className={`text-[11px] font-bold uppercase tracking-wider block ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>
              Corner Radius
            </span>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Sharp (8px)', val: '0.5rem' },
                { label: 'Smooth (14px)', val: '0.875rem' },
                { label: 'Round (20px)', val: '1.25rem' },
              ].map((r) => (
                <button
                  key={r.val}
                  onClick={() => updateThemeToken('typography', 'radius', r.val)}
                  className={`py-2 px-2 text-xs rounded-xl border font-bold ${
                    portfolio.theme?.typography?.radius === r.val
                      ? 'border-indigo-600 bg-indigo-600 text-white shadow-xs'
                      : isLight
                        ? 'border-slate-200 text-slate-600 hover:bg-slate-100'
                        : 'border-white/10 text-zinc-400 hover:bg-white/5'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
