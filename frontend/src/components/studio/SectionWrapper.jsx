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
        className={`opacity-0 group-hover/section:opacity-100 focus-within:opacity-100 transition-opacity duration-200 absolute -top-5 left-2 sm:left-6 max-w-[95%] overflow-x-auto z-40 flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-xs select-none backdrop-blur-md shadow-lg border font-sans ${
          isLight
            ? 'bg-white/95 border-zinc-200 text-zinc-900 shadow-zinc-900/10'
            : 'bg-zinc-900/95 border-zinc-700 text-zinc-100 shadow-black/80'
        }`}
      >
        {/* Section Label */}
        <span className="font-bold uppercase tracking-wider text-[10px] flex items-center gap-1.5 text-zinc-900 dark:text-zinc-100">
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-900 dark:bg-white" />
          {section.type}
        </span>

        <div className={`h-3 w-px mx-0.5 ${isLight ? 'bg-zinc-200' : 'bg-zinc-700'}`} />

        {/* Variant Dropdown */}
        {variants.length > 0 && (
          <select
            value={section.variant || variants[0]}
            onChange={(e) => changeSectionVariant(section.id, e.target.value)}
            className={`text-[10px] font-semibold rounded-md px-1.5 py-0.5 border outline-none cursor-pointer ${
              isLight
                ? 'bg-zinc-50 text-zinc-800 border-zinc-200'
                : 'bg-zinc-800 text-zinc-200 border-zinc-700'
            }`}
          >
            {variants.map((v) => (
              <option key={v} value={v}>
                {v.replace('-', ' ')}
              </option>
            ))}
          </select>
        )}

        <div className={`h-3 w-px mx-0.5 ${isLight ? 'bg-zinc-200' : 'bg-zinc-700'}`} />

        {/* AI Mini Refine Trigger */}
        <button
          onClick={() => setIsAiBarOpen(!isAiBarOpen)}
          title="Demander un ajustement à l'IA pour cette section"
          className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold transition-colors cursor-pointer ${
            isLight
              ? 'bg-zinc-900 text-white hover:bg-black'
              : 'bg-white text-zinc-900 hover:bg-zinc-100'
          }`}
        >
          <RiSparkling2Fill className="w-3 h-3" />
          <span>Ajuster</span>
        </button>

        {/* Move Up */}
        <button
          onClick={() => !isFirst && moveSection(index, index - 1)}
          disabled={isFirst}
          title="Monter la section"
          className="p-1 rounded text-zinc-400 hover:text-zinc-900 dark:hover:text-white disabled:opacity-20 cursor-pointer"
        >
          <RiArrowUpSLine className="w-3.5 h-3.5" />
        </button>

        {/* Move Down */}
        <button
          onClick={() => !isLast && moveSection(index, index + 1)}
          disabled={isLast}
          title="Descendre la section"
          className="p-1 rounded text-zinc-400 hover:text-zinc-900 dark:hover:text-white disabled:opacity-20 cursor-pointer"
        >
          <RiArrowDownSLine className="w-3.5 h-3.5" />
        </button>

        {/* Duplicate */}
        <button
          onClick={() => duplicateSection(section.id)}
          title="Dupliquer la section"
          className="p-1 rounded text-zinc-400 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
        >
          <RiFileCopyLine className="w-3 h-3" />
        </button>

        {/* Delete */}
        <button
          onClick={() => deleteSection(section.id)}
          title="Supprimer la section"
          className="p-1 rounded text-zinc-400 hover:text-rose-500 cursor-pointer"
        >
          <RiDeleteBin6Line className="w-3 h-3" />
        </button>
      </div>

      {/* Floating AI Prompt Popover */}
      {isAiBarOpen && (
        <form
          onSubmit={handleAiSubmit}
          className={`absolute -top-14 left-6 z-50 flex items-center gap-2 rounded-xl p-1.5 shadow-xl border font-sans ${
            isLight
              ? 'bg-white border-zinc-200 text-zinc-900 shadow-zinc-900/10'
              : 'bg-zinc-900 border-zinc-700 text-white shadow-black/80'
          }`}
        >
          <input
            type="text"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder={`Ajuster cette section ${section.type}...`}
            autoFocus
            className={`w-64 bg-transparent text-xs outline-none px-2 ${isLight ? 'text-zinc-900' : 'text-white'}`}
          />
          <button
            type="submit"
            disabled={!aiPrompt.trim() || isGenerating}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer disabled:opacity-40 ${
              isLight
                ? 'bg-zinc-900 hover:bg-black text-white'
                : 'bg-white hover:bg-zinc-100 text-zinc-900'
            }`}
          >
            Envoyer
          </button>
          <button
            type="button"
            onClick={() => setIsAiBarOpen(false)}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1 cursor-pointer"
          >
            <RiCloseLine className="w-3.5 h-3.5" />
          </button>
        </form>
      )}

      {/* Section Content with Visual Hover Box */}
      <div className="relative rounded-2xl group-hover/section:ring-1 group-hover/section:ring-zinc-400/40 dark:group-hover/section:ring-zinc-600/40 transition-all">
        {children}
      </div>

      {/* Elementor '+' Add Section Divider */}
      <div className="relative my-4 flex items-center justify-center opacity-0 group-hover/section:opacity-100 hover:opacity-100 transition-opacity font-sans">
        <div className="absolute inset-0 flex items-center">
          <div className={`w-full border-t border-dashed ${isLight ? 'border-zinc-200' : 'border-zinc-800'}`} />
        </div>
        <div className="relative z-10 flex items-center gap-2">
          {!isAddMenuOpen ? (
            <button
              onClick={() => setIsAddMenuOpen(true)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border shadow-xs transition-all cursor-pointer ${
                isLight
                  ? 'bg-white text-zinc-800 border-zinc-200 hover:bg-zinc-900 hover:text-white hover:border-zinc-900'
                  : 'bg-zinc-900 border-zinc-700 text-zinc-200 hover:bg-white hover:text-zinc-900'
              }`}
            >
              <RiAddCircleLine className="w-3.5 h-3.5" />
              <span>Ajouter une section</span>
            </button>
          ) : (
            <div
              className={`flex items-center gap-1.5 p-1 rounded-xl shadow-xl border backdrop-blur-md ${
                isLight
                  ? 'bg-white border-zinc-200 text-zinc-800'
                  : 'bg-zinc-900 border-zinc-700 text-zinc-100'
              }`}
            >
              <span className={`text-[10px] px-2 font-mono uppercase font-semibold ${isLight ? 'text-zinc-400' : 'text-zinc-500'}`}>
                Insérer :
              </span>
              {[
                { type: 'projects', label: 'Projets' },
                { type: 'experience', label: 'Expérience' },
                { type: 'skills', label: 'Compétences' },
                { type: 'about', label: 'À propos' },
                { type: 'contact', label: 'Contact' }
              ].map(({ type, label }) => (
                <button
                  key={type}
                  onClick={() => {
                    addSection(type, index);
                    setIsAddMenuOpen(false);
                  }}
                  className={`px-2 py-0.5 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                    isLight
                      ? 'bg-zinc-100 hover:bg-zinc-900 hover:text-white text-zinc-700'
                      : 'bg-zinc-800 hover:bg-white hover:text-zinc-900 text-zinc-300'
                  }`}
                >
                  +{label}
                </button>
              ))}
              <button
                onClick={() => setIsAddMenuOpen(false)}
                className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
              >
                <RiCloseLine className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
