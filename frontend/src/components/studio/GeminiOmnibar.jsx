import React, { useState, useRef, useEffect } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import {
  RiSparkling2Fill,
  RiArrowUpLine,
  RiAddLine,
  RiHistoryLine,
  RiCheckLine,
  RiLoader4Line,
  RiCloseLine,
  RiCodeSSlashLine,
  RiPaletteLine,
  RiFileTextLine,
  RiTerminalBoxLine,
  RiLayoutMasonryLine,
  RiChat1Line,
  RiCheckDoubleLine,
  RiGitRepositoryLine,
} from 'react-icons/ri';

const QUICK_SUGGESTIONS = [
  { icon: <RiTerminalBoxLine className="w-3 h-3 text-cyan-400" />, label: 'Cyber Dark & Terminal', prompt: 'Switch to cyber-dark theme with a terminal-dev hero and high-tech typography' },
  { icon: <RiPaletteLine className="w-3 h-3 text-violet-400" />, label: 'Bento Violet Layout', prompt: 'Apply the bento-violet theme and reorganize projects into an asymmetric bento grid' },
  { icon: <RiFileTextLine className="w-3 h-3 text-amber-400" />, label: 'Minimal Editorial', prompt: 'Use minimal-editorial theme with elegant serif typography and centered hero' },
  { icon: <RiCodeSSlashLine className="w-3 h-3 text-emerald-400" />, label: 'Add DevOps Skills', prompt: 'Add Kubernetes, Terraform, Docker, AWS, and GitOps to my technical skills section' },
  { icon: <RiGitRepositoryLine className="w-3 h-3 text-blue-400" />, label: 'Add Cloud Case Studies', prompt: 'Add 3 production cloud infrastructure case studies with real deployment metrics' },
];

export const GeminiOmnibar = () => {
  const {
    sendChatMessage,
    isGenerating,
    activeTasks,
    chatMessages,
    addSection,
    setThemePreset,
    loadPresetPortfolio,
    studioTheme
  } = usePortfolio();

  const [prompt, setPrompt] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showChips, setShowChips] = useState(true);

  const inputRef = useRef(null);
  const historyScrollRef = useRef(null);
  const isLight = studioTheme === 'light';

  // Auto-scroll chat history when open
  useEffect(() => {
    if (showHistory && historyScrollRef.current) {
      historyScrollRef.current.scrollTop = historyScrollRef.current.scrollHeight;
    }
  }, [showHistory, chatMessages]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!prompt.trim() || isGenerating) return;
    const text = prompt.trim();
    setPrompt('');
    sendChatMessage(text);
    setShowChips(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleChipClick = (chipPrompt) => {
    if (isGenerating) return;
    sendChatMessage(chipPrompt);
    setShowChips(false);
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[94%] max-w-3xl z-40 flex flex-col items-center pointer-events-none">
      <div className="w-full flex flex-col items-center pointer-events-auto">
        
        {/* 1. Live Step-by-Step Task Checklist during AI Generation */}
        {isGenerating && activeTasks && (
          <div className="w-full mb-3 bg-[#121215]/95 backdrop-blur-2xl border border-white/15 rounded-2xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.7)] text-left animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-[#FF4500]/20 text-[#FF4500] flex items-center justify-center text-sm animate-spin">
                  <RiSparkling2Fill />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>Agentic Architect at Work</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF4500] animate-ping" />
                  </h3>
                  <p className="text-[10px] text-gray-400">
                    Synthesizing custom portfolio schema from prompt...
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[10px] font-mono text-gray-400">
                <span className="hidden sm:inline">NVIDIA NEMOTRON 3 ULTRA 550B</span>
                <span className="px-2 py-0.5 rounded-md bg-[#FF4500]/15 text-[#FF4500] font-semibold animate-pulse">
                  SYNTHESIZING...
                </span>
              </div>
            </div>

            {/* Step-by-Step Task Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {activeTasks.map((task) => (
                <div
                  key={task.id}
                  className={`flex items-center gap-2 text-[11px] p-1.5 rounded-lg transition-all duration-300 ${
                    task.done
                      ? 'text-white font-medium bg-white/5'
                      : task.active
                        ? 'text-[#FF4500] font-semibold bg-[#FF4500]/10 border border-[#FF4500]/20'
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
                      <span className="text-emerald-400 font-bold text-[9px] uppercase tracking-wider font-mono">
                        Done:
                      </span>
                    ) : task.active ? (
                      <span className="text-[#FF4500] font-bold text-[9px] uppercase tracking-wider font-mono animate-pulse">
                        Building:
                      </span>
                    ) : (
                      <span className="text-gray-500 font-semibold text-[9px] uppercase tracking-wider font-mono">
                        Queued:
                      </span>
                    )}
                    <span className="truncate">{task.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. Chat Conversation History Popover */}
        {showHistory && (
          <div className="w-full mb-3 bg-[#121215]/95 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-300">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/5">
              <div className="flex items-center gap-2">
                <RiChat1Line className="w-4 h-4 text-[#FF4500]" />
                <span className="text-xs font-bold text-white tracking-wide">Conversation Transcript</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-gray-400">
                  {chatMessages.length} messages
                </span>
              </div>
              <button
                onClick={() => setShowHistory(false)}
                className="w-6 h-6 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <RiCloseLine className="w-4 h-4" />
              </button>
            </div>

            <div ref={historyScrollRef} className="max-h-72 overflow-y-auto p-4 space-y-3">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 text-xs leading-relaxed ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-6 h-6 rounded-lg bg-[#FF4500]/20 text-[#FF4500] flex items-center justify-center shrink-0 mt-0.5 font-bold">
                      <RiSparkling2Fill className="w-3.5 h-3.5" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl p-3 ${
                      msg.role === 'user'
                        ? 'bg-[#FF4500] text-white shadow-sm font-medium'
                        : 'bg-white/5 text-zinc-200 border border-white/10'
                    }`}
                  >
                    <p>{msg.text}</p>

                    {/* Task checklist if attached */}
                    {msg.tasks && (
                      <div className="mt-2.5 pt-2 border-t border-white/10 space-y-1">
                        <div className="text-[9px] font-mono uppercase tracking-wider text-emerald-400 font-bold flex items-center gap-1">
                          <RiCheckDoubleLine className="w-3 h-3" />
                          <span>Generated Artifacts</span>
                        </div>
                        {msg.tasks.map((t) => (
                          <div key={t.id} className="flex items-center gap-1.5 text-[10px] text-zinc-300">
                            <RiCheckLine className="w-3 h-3 text-emerald-400 shrink-0" />
                            <span className="truncate">{t.label}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <span className="block mt-1 text-[9px] text-right text-gray-400 font-mono">
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. Floating Quick Suggestion Chips (Gemini Style) */}
        {showChips && !isGenerating && (
          <div className="w-full flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none mb-1 px-1">
            {QUICK_SUGGESTIONS.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleChipClick(chip.prompt)}
                className="shrink-0 px-3 py-1.5 rounded-full text-[11px] font-medium bg-[#121215]/80 hover:bg-[#1a1f2c] text-zinc-300 hover:text-white border border-white/10 hover:border-[#FF4500]/40 backdrop-blur-xl transition-all shadow-md cursor-pointer flex items-center gap-1.5"
              >
                {chip.icon}
                <span>{chip.label}</span>
              </button>
            ))}
            <button
              onClick={() => setShowChips(false)}
              className="shrink-0 w-6 h-6 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center text-xs transition-colors cursor-pointer"
              title="Hide suggestions"
            >
              <RiCloseLine />
            </button>
          </div>
        )}

        {/* 4. The Gemini Floating Omnibar */}
        <div className="w-full relative bg-[#121215]/90 backdrop-blur-2xl border border-white/12 hover:border-white/20 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] p-2 pl-3 flex items-center gap-2 transition-all">
          
          {/* Quick Insert (+) Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowAddMenu(!showAddMenu)}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                showAddMenu
                  ? 'bg-[#FF4500] text-white rotate-45'
                  : 'bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10'
              }`}
              title="Quick Add & Presets"
            >
              <RiAddLine className="w-5 h-5 transition-transform duration-200" />
            </button>

            {/* Dropdown Menu */}
            {showAddMenu && (
              <div className="absolute bottom-full left-0 mb-3 w-64 bg-[#121215]/95 backdrop-blur-2xl border border-white/15 rounded-2xl p-2 shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-2 duration-200 text-left">
                <p className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Quick Insert Sections
                </p>
                <div className="space-y-0.5">
                  <button
                    onClick={() => {
                      addSection('projects');
                      setShowAddMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium hover:bg-white/10 text-zinc-200 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <RiLayoutMasonryLine className="w-4 h-4 text-[#FF4500]" />
                    <span>Projects Showcase</span>
                  </button>
                  <button
                    onClick={() => {
                      addSection('skills');
                      setShowAddMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium hover:bg-white/10 text-zinc-200 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <RiCodeSSlashLine className="w-4 h-4 text-emerald-400" />
                    <span>Skills Matrix</span>
                  </button>
                  <button
                    onClick={() => {
                      addSection('contact');
                      setShowAddMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium hover:bg-white/10 text-zinc-200 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <RiChat1Line className="w-4 h-4 text-purple-400" />
                    <span>Contact Card</span>
                  </button>
                </div>

                <div className="my-1.5 border-t border-white/10" />

                <p className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Theme Presets
                </p>
                <div className="space-y-0.5">
                  <button
                    onClick={() => {
                      setThemePreset('cyber-dark');
                      setShowAddMenu(false);
                    }}
                    className="w-full text-left px-3 py-1.5 rounded-xl text-xs font-medium hover:bg-white/10 text-zinc-200 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <RiTerminalBoxLine className="w-4 h-4 text-cyan-400" />
                    <span>Cyber Dark</span>
                  </button>
                  <button
                    onClick={() => {
                      setThemePreset('bento-violet');
                      setShowAddMenu(false);
                    }}
                    className="w-full text-left px-3 py-1.5 rounded-xl text-xs font-medium hover:bg-white/10 text-zinc-200 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <RiPaletteLine className="w-4 h-4 text-violet-400" />
                    <span>Bento Violet</span>
                  </button>
                  <button
                    onClick={() => {
                      setThemePreset('minimal-editorial');
                      setShowAddMenu(false);
                    }}
                    className="w-full text-left px-3 py-1.5 rounded-xl text-xs font-medium hover:bg-white/10 text-zinc-200 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <RiFileTextLine className="w-4 h-4 text-amber-400" />
                    <span>Minimal Editorial</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Central Omnibar Input */}
          <form onSubmit={handleSubmit} className="flex-1 flex items-center">
            <input
              ref={inputRef}
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isGenerating}
              placeholder={isGenerating ? "Agent synthesizing portfolio schema..." : "Ask Portfolify or describe changes... (e.g. 'Make it cyber dark with terminal hero')"}
              className="w-full bg-transparent border-0 outline-none text-sm text-white placeholder-gray-400 px-2 py-1.5 selection:bg-[#FF4500]/30 disabled:opacity-50"
            />
          </form>

          {/* Right Action Group */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Model Indicator Pill */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-[11px] font-mono text-zinc-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Nemotron 550B</span>
            </div>

            {/* Conversation History Toggle */}
            <button
              onClick={() => setShowHistory(!showHistory)}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                showHistory
                  ? 'bg-white/20 text-white'
                  : 'bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10'
              }`}
              title="Toggle Conversation Transcript"
            >
              <RiHistoryLine className="w-4 h-4" />
            </button>

            {/* Send / Generate Arrow Button */}
            <button
              onClick={handleSubmit}
              disabled={!prompt.trim() || isGenerating}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                prompt.trim() && !isGenerating
                  ? 'bg-gradient-to-r from-orange-600 to-[#FF4500] text-white shadow-md shadow-[#FF4500]/30 hover:scale-105 active:scale-95'
                  : 'bg-white/5 text-gray-500 cursor-not-allowed border border-white/5'
              }`}
              title="Send to Portfolify AI"
            >
              {isGenerating ? (
                <RiLoader4Line className="w-4 h-4 animate-spin text-[#FF4500]" />
              ) : (
                <RiArrowUpLine className="w-5 h-5 font-bold" />
              )}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
