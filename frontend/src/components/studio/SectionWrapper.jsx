import React, { useState } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import {
  RiSparkling2Fill,
  RiArrowUpSLine,
  RiArrowDownSLine,
  RiDeleteBin6Line,
  RiFileCopyLine,
  RiAddCircleLine,
  RiSendPlaneFill,
  RiCloseLine
} from 'react-icons/ri';

export const SectionWrapper = ({ section, index, isFirst, isLast, children }) => {
  const {
    isEditMode,
    moveSection,
    deleteSection,
    duplicateSection,
    changeSectionVariant,
    addSection,
    refineSectionWithAi,
    isGenerating,
    studioTheme
  } = usePortfolio();

  const [isAiBarOpen, setIsAiBarOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);

  const isLight = studioTheme === 'light';

  if (!isEditMode) {
    return <>{children}</>;
  }

  const handleAiSubmit = (e) => {
    e.preventDefault();
    if (!aiPrompt.trim() || isGenerating) return;
    refineSectionWithAi(section.id, aiPrompt);
    setAiPrompt('');
    setIsAiBarOpen(false);
  };

  // Available variants for quick switching on the handle bar
  const getVariants = () => {
    if (section.type === 'hero') return ['split-portrait', 'terminal-dev', 'minimal-centered'];
    if (section.type === 'projects') return ['bento-grid', 'card-grid', 'minimal-list'];
    if (section.type === 'skills') return ['category-cards', 'pill-cloud'];
    if (section.type === 'experience') return ['timeline', 'clean-cards'];
    if (section.type === 'about') return ['bento', 'classic-story'];
    if (section.type === 'contact') return ['minimal-card', 'split-box'];
    return [];
  };

  const variants = getVariants();

  return (
    <div className="relative group/section transition-all my-3">
      {/* Elementor Floating Handle Bar */}
      <div
        className={`opacity-0 group-hover/section:opacity-100 focus-within:opacity-100 transition-opacity duration-200 absolute -top-5 left-2 sm:left-6 max-w-[95%] overflow-x-auto z-40 flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-xs select-none backdrop-blur-md shadow-xl border ${
          isLight
            ? 'bg-white/95 border-slate-300 text-slate-800 shadow-slate-300/40'
            : 'bg-[#141b2d] border-indigo-500/40 text-white'
        }`}
      >
        {/* Section Label */}
        <span className="font-extrabold uppercase tracking-wider text-[10px] flex items-center gap-1.5 text-indigo-600">
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
          {section.type}
        </span>

        <div className={`h-3 w-px mx-0.5 ${isLight ? 'bg-slate-200' : 'bg-white/20'}`} />

        {/* Variant Dropdown */}
        {variants.length > 0 && (
          <select
            value={section.variant || variants[0]}
            onChange={(e) => changeSectionVariant(section.id, e.target.value)}
            className={`text-[10px] font-bold rounded-lg px-2 py-0.5 border outline-none cursor-pointer ${
              isLight
                ? 'bg-slate-50 text-indigo-700 border-slate-200'
                : 'bg-[#1c2438] text-indigo-300 border-white/10'
            }`}
          >
            {variants.map((v) => (
              <option key={v} value={v}>
                {v.replace('-', ' ')}
              </option>
            ))}
          </select>
        )}

        <div className={`h-3 w-px mx-0.5 ${isLight ? 'bg-slate-200' : 'bg-white/20'}`} />

        {/* AI Mini Refine Trigger */}
        <button
          onClick={() => setIsAiBarOpen(!isAiBarOpen)}
          title="Ask AI to refine this specific section"
          className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-xs"
        >
          <RiSparkling2Fill className="w-3 h-3" />
          <span>Refine</span>
        </button>

        {/* Move Up */}
        <button
          onClick={() => !isFirst && moveSection(index, index - 1)}
          disabled={isFirst}
          title="Move section up"
          className="p-1 rounded text-zinc-400 hover:text-zinc-900 disabled:opacity-20"
        >
          <RiArrowUpSLine className="w-4 h-4" />
        </button>

        {/* Move Down */}
        <button
          onClick={() => !isLast && moveSection(index, index + 1)}
          disabled={isLast}
          title="Move section down"
          className="p-1 rounded text-zinc-400 hover:text-zinc-900 disabled:opacity-20"
        >
          <RiArrowDownSLine className="w-4 h-4" />
        </button>

        {/* Duplicate */}
        <button
          onClick={() => duplicateSection(section.id)}
          title="Duplicate section"
          className="p-1 rounded text-zinc-400 hover:text-zinc-900"
        >
          <RiFileCopyLine className="w-3.5 h-3.5" />
        </button>

        {/* Delete */}
        <button
          onClick={() => deleteSection(section.id)}
          title="Delete section"
          className="p-1 rounded text-zinc-400 hover:text-rose-500"
        >
          <RiDeleteBin6Line className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Floating AI Prompt Popover */}
      {isAiBarOpen && (
        <form
          onSubmit={handleAiSubmit}
          className={`absolute -top-16 left-6 z-50 flex items-center gap-2 rounded-2xl p-2 shadow-2xl border ${
            isLight
              ? 'bg-white border-indigo-400 shadow-indigo-100/50 text-slate-800'
              : 'bg-[#101726] border-indigo-500 text-white'
          }`}
        >
          <RiSparkling2Fill className="w-4 h-4 text-indigo-500 ml-2 shrink-0" />
          <input
            type="text"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder={`Ask AI to tweak this ${section.type}...`}
            autoFocus
            className={`w-64 bg-transparent text-xs outline-none ${isLight ? 'text-slate-900' : 'text-white'}`}
          />
          <button
            type="submit"
            disabled={!aiPrompt.trim() || isGenerating}
            className="px-3 py-1 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 shadow-sm"
          >
            Go
          </button>
          <button
            type="button"
            onClick={() => setIsAiBarOpen(false)}
            className="text-zinc-400 hover:text-zinc-600 p-1"
          >
            <RiCloseLine className="w-4 h-4" />
          </button>
        </form>
      )}

      {/* Section Content with Visual Hover Box */}
      <div className="relative rounded-2xl group-hover/section:ring-2 group-hover/section:ring-indigo-500/50 transition-all">
        {children}
      </div>

      {/* Elementor '+' Add Section Divider */}
      <div className="relative my-4 flex items-center justify-center opacity-0 group-hover/section:opacity-100 hover:opacity-100 transition-opacity">
        <div className="absolute inset-0 flex items-center">
          <div className={`w-full border-t border-dashed ${isLight ? 'border-slate-300' : 'border-indigo-500/30'}`} />
        </div>
        <div className="relative z-10 flex items-center gap-2">
          {!isAddMenuOpen ? (
            <button
              onClick={() => setIsAddMenuOpen(true)}
              className={`flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[11px] font-bold border shadow-md transition-all ${
                isLight
                  ? 'bg-white text-indigo-700 border-slate-300 hover:bg-indigo-600 hover:text-white hover:border-indigo-600'
                  : 'bg-[#141b2d] border-indigo-500/40 text-indigo-300 hover:bg-indigo-600 hover:text-white'
              }`}
            >
              <RiAddCircleLine className="w-3.5 h-3.5" />
              <span>Add Section</span>
            </button>
          ) : (
            <div
              className={`flex items-center gap-1.5 p-1.5 rounded-2xl shadow-xl border backdrop-blur-md ${
                isLight
                  ? 'bg-white border-slate-200 text-slate-800'
                  : 'bg-[#141b2d] border-indigo-500/50 text-white'
              }`}
            >
              <span className={`text-[10px] px-2 font-mono uppercase font-bold ${isLight ? 'text-slate-400' : 'text-zinc-400'}`}>
                Insert:
              </span>
              {['projects', 'experience', 'skills', 'about', 'contact'].map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    addSection(t, index);
                    setIsAddMenuOpen(false);
                  }}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold capitalize transition-all ${
                    isLight
                      ? 'bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-700'
                      : 'bg-white/5 hover:bg-indigo-600 hover:text-white text-zinc-300'
                  }`}
                >
                  +{t}
                </button>
              ))}
              <button
                onClick={() => setIsAddMenuOpen(false)}
                className="p-1 text-zinc-400 hover:text-zinc-600"
              >
                <RiCloseLine className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
