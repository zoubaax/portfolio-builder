import React, { useState, useRef, useEffect } from 'react';
import { usePortfolio } from '../../context/PortfolioContext';
import { useUser } from '@clerk/react';
import {
  RiSideBarLine,
  RiStarLine,
  RiArrowDownSLine,
  RiArrowRightSLine,
  RiMoreFill,
  RiAddLine,
  RiChat1Line,
  RiCameraLine,
  RiArrowUpLine,
  RiLoader4Line,
  RiCheckLine,
  RiCheckDoubleLine,
  RiGithubFill,
  RiArrowRightLine
} from 'react-icons/ri';

export const V0ChatPanel = ({ onNewProject }) => {
  const { user } = useUser();
  const {
    portfolio,
    setPortfolio,
    chatMessages,
    sendChatMessage,
    isGenerating,
    activeTasks,
    isChatCollapsed,
    setIsChatCollapsed,
    setViewMode
  } = usePortfolio();

  const [prompt, setPrompt] = useState('');
  const [expandedWorkSteps, setExpandedWorkSteps] = useState({});
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const scrollRef = useRef(null);

  // Timer for "Worked for Xs"
  useEffect(() => {
    let interval = null;
    if (isGenerating) {
      setSecondsElapsed(1);
      interval = setInterval(() => {
        setSecondsElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isGenerating]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages, isGenerating]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (!prompt.trim() || isGenerating) return;
    const text = prompt.trim();
    setPrompt('');
    sendChatMessage(text);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const toggleWorkStep = (msgId) => {
    setExpandedWorkSteps((prev) => ({ ...prev, [msgId]: !prev[msgId] }));
  };

  if (isChatCollapsed) {
    return null;
  }

  const projectTitle = portfolio.meta?.title?.split('—')[0]?.trim() || 'Test';

  return (
    <aside className="w-[360px] lg:w-[400px] h-screen border-r border-zinc-200 bg-white flex flex-col z-20 shrink-0 select-none text-zinc-900 font-sans">
      
      {/* 1. Top Bar (Matching Screenshot: [ ◫ ] ☆ Test ▾) */}
      <div className="h-12 px-3.5 border-b border-zinc-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Collapse Icon [ ◫ ] */}
          <button
            onClick={() => setIsChatCollapsed(true)}
            className="w-7 h-7 rounded-md hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 flex items-center justify-center transition-colors cursor-pointer"
            title="Collapse Sidebar"
          >
            <RiSideBarLine className="w-4 h-4" />
          </button>

          {/* Star + Project Name + Dropdown Chevron */}
          <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-700 hover:text-zinc-900 cursor-pointer px-1.5 py-1 rounded hover:bg-zinc-100 transition-colors">
            <RiStarLine className="w-3.5 h-3.5 text-zinc-400" />
            <span className="font-semibold text-zinc-800 max-w-[150px] truncate">{projectTitle}</span>
            <RiArrowDownSLine className="w-3 h-3 text-zinc-400" />
          </div>
        </div>

        {/* New Session Button */}
        <button
          onClick={onNewProject}
          className="text-xs text-zinc-500 hover:text-zinc-900 px-2 py-1 rounded hover:bg-zinc-100 transition-colors cursor-pointer"
          title="New Generation"
        >
          New
        </button>
      </div>

      {/* 2. Messages Stream */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-5">
        {chatMessages.map((msg) => (
          <div key={msg.id} className="space-y-2 text-xs">
            {msg.role === 'user' ? (
              /* User Message (Right-aligned pill with avatar like screenshot) */
              <div className="flex items-start justify-end gap-2">
                <div className="max-w-[85%] bg-zinc-100 text-zinc-900 rounded-2xl px-3.5 py-2 leading-relaxed text-xs font-normal">
                  <p>{msg.text}</p>
                </div>
                <div className="w-6 h-6 rounded-full bg-zinc-800 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  {user?.firstName?.charAt(0) || 'Z'}
                </div>
              </div>
            ) : (
              /* Assistant Message (Matching Screenshot: > Worked for 4s ... + text) */
              <div className="space-y-2 text-zinc-800">
                {/* Collapsible Step Accordion: > Worked for 4s */}
                <div className="flex items-center justify-between text-xs text-zinc-500 hover:text-zinc-800 transition-colors py-1">
                  <button
                    onClick={() => toggleWorkStep(msg.id)}
                    className="flex items-center gap-1.5 cursor-pointer font-normal text-zinc-500 hover:text-zinc-800"
                  >
                    <RiArrowRightSLine
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${
                        expandedWorkSteps[msg.id] ? 'rotate-90' : ''
                      }`}
                    />
                    <span>Worked for {msg.duration || 4}s</span>
                  </button>

                  <button className="text-zinc-400 hover:text-zinc-700 p-1 rounded cursor-pointer">
                    <RiMoreFill className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Expanded Task Checklist Details if opened */}
                {expandedWorkSteps[msg.id] && msg.tasks && (
                  <div className="ml-5 p-2.5 bg-zinc-50 border border-zinc-100 rounded-xl space-y-1.5 animate-in fade-in duration-200">
                    <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold mb-1">
                      Execution Steps
                    </p>
                    {msg.tasks.map((t) => (
                      <div key={t.id} className="flex items-center gap-1.5 text-[11px] text-zinc-600">
                        <RiCheckLine className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span className="truncate">{t.label}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Main AI Text (Natural, Clean, No Raw JSON) */}
                <div className="text-xs text-zinc-800 leading-relaxed font-normal pl-5">
                  <p className="whitespace-pre-line">
                    {msg.text?.trim().startsWith('{') || msg.text?.trim().startsWith('"')
                      ? 'Tudo certo — estou funcionando.'
                      : msg.text}
                  </p>

                  {/* Optional Interactive Action Buttons (e.g. Open Projects Tab) */}
                  {msg.action === 'open_projects' && (
                    <button
                      type="button"
                      onClick={() => setViewMode('projects')}
                      className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md shadow-indigo-600/25 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <RiGithubFill className="w-4 h-4" />
                      <span>Ouvrir l'onglet Projets & Importer GitHub</span>
                      <RiArrowRightLine className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Live Generating State: > Working... with live timer */}
        {isGenerating && (
          <div className="space-y-2 text-xs text-zinc-800 animate-in fade-in duration-200">
            <div className="flex items-center gap-1.5 text-zinc-500 font-normal py-1">
              <RiLoader4Line className="w-3.5 h-3.5 animate-spin text-zinc-600" />
              <span>Working for {secondsElapsed}s...</span>
            </div>

            {activeTasks && (
              <div className="ml-5 p-2.5 bg-zinc-50 border border-zinc-100 rounded-xl space-y-1.5">
                {activeTasks.map((t) => (
                  <div
                    key={t.id}
                    className={`flex items-center gap-1.5 text-[11px] ${
                      t.done
                        ? 'text-zinc-600'
                        : t.active
                          ? 'text-zinc-900 font-medium'
                          : 'text-zinc-400'
                    }`}
                  >
                    {t.done ? (
                      <RiCheckLine className="w-3 h-3 text-emerald-600 shrink-0" />
                    ) : t.active ? (
                      <RiLoader4Line className="w-3 h-3 animate-spin text-zinc-800 shrink-0" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 ml-1 mr-1" />
                    )}
                    <span className="truncate">{t.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. Bottom Input Dock (Matching Screenshot: + Ask a follow-up... 💬 📷 ↑) */}
      <div className="p-3 border-t border-zinc-100 bg-white">
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-zinc-200 bg-white shadow-xs p-2 pl-3 flex items-center gap-2 hover:border-zinc-300 focus-within:border-zinc-400 transition-colors"
        >
          {/* + Attachment Button */}
          <button
            type="button"
            className="w-6 h-6 rounded-full hover:bg-zinc-100 text-zinc-500 hover:text-zinc-800 flex items-center justify-center transition-colors cursor-pointer shrink-0"
            title="Add attachment"
          >
            <RiAddLine className="w-4 h-4" />
          </button>

          {/* Text Input: "Ask a follow-up..." */}
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isGenerating}
            placeholder={isGenerating ? "Working..." : "Ask a follow-up..."}
            className="flex-1 bg-transparent border-0 outline-none text-xs text-zinc-900 placeholder-zinc-400 font-sans"
          />

          {/* Right Action Icons: 💬 📷 ↑ */}
          <div className="flex items-center gap-1.5 shrink-0 text-zinc-400">
            <button
              type="button"
              className="p-1 hover:text-zinc-700 transition-colors cursor-pointer"
              title="Chat mode"
            >
              <RiChat1Line className="w-4 h-4" />
            </button>

            <button
              type="button"
              className="flex items-center p-1 hover:text-zinc-700 transition-colors cursor-pointer"
              title="Media upload"
            >
              <RiCameraLine className="w-4 h-4" />
              <RiArrowDownSLine className="w-2.5 h-2.5 -ml-0.5" />
            </button>

            {/* Circular Black Send Button with White Arrow */}
            <button
              type="submit"
              disabled={!prompt.trim() || isGenerating}
              className={`w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                prompt.trim() && !isGenerating
                  ? 'bg-black text-white hover:bg-zinc-800'
                  : 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
              }`}
              title="Send"
            >
              <RiArrowUpLine className="w-4 h-4 font-bold" />
            </button>
          </div>
        </form>
      </div>

    </aside>
  );
};
