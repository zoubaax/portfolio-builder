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
  RiPriceTag3Line,
  RiHistoryLine,
  RiRestartLine,
  RiTimeLine,
  RiCheckLine,
  RiLoader4Line
} from 'react-icons/ri';
import { TbLayersLinked, TbChecklist, TbLayoutBoard } from 'react-icons/tb';

const SUGGESTION_PILLS = [
  { label: 'Bento Violet Style', prompt: 'Make it a dark bento violet style with high-contrast borders' },
  { label: 'Terminal Dev Hero', prompt: 'Switch to a developer terminal hero and cyber dark theme' },
  { label: 'Editorial Minimalist', prompt: 'Apply the refined minimal editorial theme with serif typography' },
  { label: 'Elevate Bio & Headline', prompt: 'Rewrite my bio and headline to position me as a Principal Architect' },
  { label: 'Add AI Engine Project', prompt: 'Add a new featured AI orchestrator project to my work section' },
];

export const StudioLeftPanel = () => {
  const {
    portfolio,
    activeTab,
    setActiveTab,
    chatMessages,
    isGenerating,
    activeTasks,
    sendChatMessage,
    toggleSectionVisibility,
    changeSectionVariant,
    moveSection,
    deleteSection,
    duplicateSection,
    addSection,
    setThemePreset,
    updateThemeToken,
    studioTheme,
    versions,
    rollbackToVersion,
    fetchVersions,
    portfolioId
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

        <div className="grid grid-cols-4 gap-1">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center justify-center gap-1 py-2 px-1.5 rounded-xl text-[11px] font-bold transition-all ${
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
            <span className="truncate">AI Copilot</span>
          </button>

          <button
            onClick={() => setActiveTab('sections')}
            className={`flex items-center justify-center gap-1 py-2 px-1.5 rounded-xl text-[11px] font-bold transition-all ${
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
            <span className="truncate">Sections</span>
          </button>

          <button
            onClick={() => setActiveTab('theme')}
            className={`flex items-center justify-center gap-1 py-2 px-1.5 rounded-xl text-[11px] font-bold transition-all ${
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
            <span className="truncate">Theme</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center justify-center gap-1 py-2 px-1.5 rounded-xl text-[11px] font-bold transition-all ${
              activeTab === 'history'
                ? isLight
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-indigo-600 text-white shadow-sm'
                : isLight
                  ? 'text-slate-600 hover:bg-slate-100'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <RiHistoryLine className="w-3.5 h-3.5" />
            <span className="truncate">History</span>
            {versions.length > 0 && (
              <span className={`text-[9px] px-1 rounded font-mono ${
                activeTab === 'history' ? 'bg-white/20 text-white' : 'bg-indigo-500/20 text-indigo-400'
              }`}>
                {versions.length}
              </span>
            )}
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
                  className={`max-w-[88%] rounded-2xl p-3.5 ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-orange-600 to-[#FF4500] text-white shadow-sm font-medium'
                      : isLight
                        ? 'bg-slate-100 text-slate-800 border border-slate-200/80 shadow-xs'
                        : 'bg-white/5 text-zinc-300 border border-white/10'
                  }`}
                >
                  <p>{msg.text}</p>

                  {/* Completed Checklist Tasks inside Assistant Message */}
                  {msg.tasks && (
                    <div className="mt-3 pt-2.5 border-t border-white/10 space-y-1.5">
                      <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold mb-1.5 flex items-center gap-1.5">
                        <RiCheckDoubleLine className="w-3.5 h-3.5" />
                        <span>Tasks Completed</span>
                      </div>
                      {msg.tasks.map((task) => (
                        <div key={task.id} className="flex items-center gap-2 text-[11px] text-zinc-300">
                          <div className="w-3.5 h-3.5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                            <RiCheckLine className="w-2.5 h-2.5" />
                          </div>
                          <span className="truncate">{task.label}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <span className={`block mt-1 text-[10px] text-right ${
                    msg.role === 'user' ? 'text-white/80' : isLight ? 'text-slate-400' : 'text-zinc-500'
                  }`}>
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {/* Live ChatGPT-style 3-Dots Thinking & Task Checklist during AI Generation */}
            {isGenerating && (
              <div className="space-y-3 animate-in fade-in duration-300">
                {/* 3-Dots Assistant Bubble */}
                <div className="flex items-start gap-2.5">
                  <div className={`p-3 rounded-2xl ${
                    isLight ? 'bg-slate-100 text-slate-600' : 'bg-white/10 text-white/80'
                  } inline-flex items-center gap-1.5 shadow-sm`}>
                    <span className="ai-typing-dot shrink-0" />
                    <span className="ai-typing-dot shrink-0" />
                    <span className="ai-typing-dot shrink-0" />
                  </div>
                </div>

                {activeTasks && (
                  <div className="w-full bg-[#121215]/95 backdrop-blur-2xl border border-white/12 rounded-2xl p-4 shadow-xl text-left">
                    <div className="flex items-center gap-2.5 mb-3.5 pb-2.5 border-b border-white/10">
                      <div className="w-7 h-7 rounded-xl bg-[#FF4500]/20 text-[#FF4500] flex items-center justify-center text-sm animate-spin">
                        <RiSparkling2Fill />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                          <span>Thinking</span>
                          <span className="inline-flex items-center gap-1 text-[#FF4500]">
                            <span className="ai-typing-dot shrink-0" />
                            <span className="ai-typing-dot shrink-0" />
                            <span className="ai-typing-dot shrink-0" />
                          </span>
                        </h3>
                        <p className="text-[10px] text-gray-400">
                          Synthesizing custom portfolio schema from prompt...
                        </p>
                      </div>
                    </div>


                {/* Step-by-Step Task Checklist */}
                <div className="space-y-2.5">
                  {activeTasks.map((task) => (
                    <div
                      key={task.id}
                      className={`flex items-center gap-2.5 text-[11px] transition-all duration-300 ${
                        task.done
                          ? 'text-white font-medium'
                          : task.active
                            ? 'text-[#FF4500] font-semibold'
                            : 'text-gray-500'
                      }`}
                    >
                      <div className="shrink-0">
                        {task.done ? (
                          <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                            <RiCheckLine className="w-3 h-3" />
                          </div>
                        ) : task.active ? (
                          <div className="w-4 h-4 rounded-full bg-[#FF4500]/20 text-[#FF4500] flex items-center justify-center animate-spin">
                            <RiLoader4Line className="w-3 h-3" />
                          </div>
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-white/20 flex items-center justify-center">
                            <span className="w-1 h-1 rounded-full bg-white/20" />
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 flex-1 min-w-0">
                        {task.done ? (
                          <span className="text-emerald-400 font-bold text-[10px] uppercase tracking-wider font-mono">
                            Done:
                          </span>
                        ) : task.active ? (
                          <span className="text-[#FF4500] font-bold text-[10px] uppercase tracking-wider font-mono animate-pulse">
                            Building:
                          </span>
                        ) : (
                          <span className="text-gray-500 font-semibold text-[10px] uppercase tracking-wider font-mono">
                            Queued:
                          </span>
                        )}
                        <span className="truncate">{task.label}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-3.5 pt-2.5 border-t border-white/10 flex items-center justify-between text-[10px] text-gray-400 font-mono">
                  <span>MODEL: NVIDIA NEMOTRON 3 ULTRA 550B</span>
                  <span className="text-[#FF4500] animate-pulse">SYNTHESIZING...</span>
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

      {/* TAB 4: VERSION HISTORY & ROLLBACK */}
      {activeTab === 'history' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-inherit">
            <div>
              <span className={`text-[11px] font-bold uppercase tracking-wider block ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                Cloud Version Snapshots
              </span>
              <p className={`text-[10px] ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>
                Neon PostgreSQL immutable audit log
              </p>
            </div>
            <button
              onClick={() => fetchVersions()}
              className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700"
              title="Refresh from Neon DB"
            >
              Refresh
            </button>
          </div>

          {versions.length === 0 ? (
            <div className={`p-6 rounded-2xl border text-center space-y-3 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/10'
            }`}>
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mx-auto">
                <RiHistoryLine className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold">No Snapshots Yet</h4>
              <p className={`text-[11px] leading-relaxed ${isLight ? 'text-slate-500' : 'text-zinc-400'}`}>
                Click the <strong className="text-indigo-500">Save</strong> or <strong className="text-indigo-500">Publish</strong> button in the top bar to commit your first snapshot to Neon DB.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {versions.map((ver, idx) => {
                const dateStr = new Date(ver.createdAt).toLocaleDateString([], {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });
                const sectionCount = ver.snapshotData?.sections?.length || 0;
                const themeName = ver.snapshotData?.theme?.name || 'Default';

                return (
                  <div
                    key={ver.id}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      idx === 0
                        ? isLight
                          ? 'bg-indigo-50/50 border-indigo-200 shadow-xs'
                          : 'bg-indigo-500/10 border-indigo-500/30'
                        : isLight
                          ? 'bg-white hover:bg-slate-50 border-slate-200 shadow-xs'
                          : 'bg-white/5 hover:bg-white/10 border-white/10'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold">
                            {ver.promptNote || `Snapshot #${versions.length - idx}`}
                          </span>
                          {idx === 0 && (
                            <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-600 text-white">
                              Latest
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mt-1">
                          <span className={`flex items-center gap-1 text-[10px] ${isLight ? 'text-slate-400' : 'text-zinc-500'}`}>
                            <RiTimeLine className="w-3 h-3" />
                            {dateStr}
                          </span>
                          <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                            isLight ? 'bg-slate-100 text-slate-600' : 'bg-white/10 text-zinc-400'
                          }`}>
                            {sectionCount} sections • {themeName}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => rollbackToVersion(ver.id)}
                        className={`p-1.5 rounded-xl border flex items-center gap-1 text-[11px] font-semibold transition-all shrink-0 ${
                          isLight
                            ? 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700 hover:text-indigo-600'
                            : 'bg-white/5 hover:bg-white/10 border-white/10 text-zinc-300 hover:text-white'
                        }`}
                        title="Rollback canvas to this snapshot"
                      >
                        <RiRestartLine className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Rollback</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </aside>
  );
};
