import React, { useState, useRef, useEffect } from 'react';
import { UserButton, useUser } from '@clerk/react';
import {
  RiAddLine,
  RiFlashlightFill,
  RiMicLine,
  RiSendPlaneFill,
  RiCompass3Line,
  RiFileLine,
  RiGithubFill,
  RiCloseLine,
  RiCheckboxCircleFill,
  RiLoader4Line,
  RiSparkling2Fill,
  RiCheckLine,
  RiArrowRightLine,
  RiMoonLine,
  RiSunLine,
  RiBrainLine,
  RiGlobalLine
} from 'react-icons/ri';
import { usePortfolio } from '../../context/PortfolioContext';


export const AgentOnboarding = ({ onComplete }) => {
  const { user } = useUser();
  const { setPortfolio, sendChatMessage, savePortfolio } = usePortfolio();

  const [prompt, setPrompt] = useState('');
  const [modelType, setModelType] = useState('Fast'); // 'Fast' (Groq Llama 3.3) | 'Deep' (Mistral Large)
  const [showAttachmentModal, setShowAttachmentModal] = useState(false);
  const [githubUser, setGithubUser] = useState('');
  const [cvFileName, setCvFileName] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  // Clock Update
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      setCurrentTime(`${hours}:${minutes} ${ampm}`);
    };
    updateClock();
    const interval = setInterval(updateClock, 30000);
    return () => clearInterval(interval);
  }, []);

  // Agent Task Checklist Execution State
  const [isExecuting, setIsExecuting] = useState(false);
  const [tasks, setTasks] = useState([
    { id: 't1', label: 'Analyzing prompt & synthesizing design tokens', done: false, active: false },
    { id: 't2', label: 'Generating high-impact Hero positioning & tagline', done: false, active: false },
    { id: 't3', label: 'Crafting About narrative & engineering philosophy', done: false, active: false },
    { id: 't4', label: 'Curating Projects showcase & bento case studies', done: false, active: false },
    { id: 't5', label: 'Structuring Skills matrix & Career trajectory', done: false, active: false },
    { id: 't6', label: 'Compiling responsive schema & saving Neon DB snapshot', done: false, active: false },
  ]);

  const textareaRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [prompt]);

  // Voice Speech-to-Text simulation / Web Speech API
  const handleToggleVoice = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser. Please type your prompt.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setPrompt((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  // Launch Agent: Immediately opens Studio Workspace where tasks execute live in chat
  const handleLaunchAgent = async () => {
    const finalPrompt = prompt.trim() || 'Senior Full-Stack & AI Engineer with 5 years experience, dark bento design with high-impact case studies';
    
    // 1. Immediately transition to Studio Workspace
    onComplete();

    // 2. Dispatch prompt & live task checklist in Studio Copilot chat
    sendChatMessage(finalPrompt);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-[#FF4500] selection:text-white relative flex flex-col justify-between overflow-x-hidden font-sans">
      {/* Global Noise Overlay */}
      <div className="noise-overlay" />

      {/* Background Atmosphere */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none">
        <div className="absolute top-0 left-0 w-full h-full opacity-60 mix-blend-screen">
          <img
            src="https://framerusercontent.com/images/9zvwRJAavKKacVyhFCwHyXW1U.png?width=1536&height=1024"
            alt="Atmosphere"
            className="w-full h-full object-cover object-center opacity-80"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050505]/40 to-[#050505] z-10" />
      </div>

      {/* Floating Surrealist Hand Left */}
      <div className="absolute -left-[10%] top-[-8%] md:left-[-5%] md:top-[-10%] w-[50vw] md:w-[38vw] max-w-[800px] z-10 pointer-events-none mix-blend-hard-light opacity-80 animate-float-left">
        <img
          src="https://framerusercontent.com/images/KNhiA5A2ykNYqNkj04Hk6BVg5A.png?width=1540&height=1320"
          alt="Hand Reaching"
          className="w-full h-auto object-contain"
        />
      </div>

      {/* Floating Surrealist Hand Right */}
      <div className="absolute -right-[10%] bottom-[-8%] md:right-[-5%] md:bottom-[-6%] w-[45vw] md:w-[34vw] max-w-[700px] z-10 pointer-events-none mix-blend-hard-light opacity-80 animate-float-right">
        <img
          src="https://framerusercontent.com/images/X89VFCABCEjjZ4oLGa3PjbOmsA.png?width=1542&height=1002"
          alt="Hand Receiving"
          className="w-full h-auto object-contain"
        />
      </div>

      {/* Ambient Spectrum Rainbow Glow at Bottom (From imfa.app & Superdesign) */}
      <div className="spectrum-glow absolute bottom-[-10%] left-1/2 -translate-x-1/2 w-[120%] h-[320px] pointer-events-none z-10" />

      {/* 1. Header (Navbar matching Superdesign) */}
      <header className="relative z-30 px-6 py-6 flex items-center justify-between container mx-auto max-w-6xl">
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-[#FF4500] text-black flex items-center justify-center font-extrabold text-sm transition-transform duration-500 group-hover:rotate-45">
            ✦
          </div>
          <span className="text-2xl font-bold tracking-tight font-serif text-white">
            Superdesign<span className="text-[#FF4500]">.</span>
          </span>
        </div>

        {/* Right User & Actions */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-white/10 bg-white/5 text-[11px] font-mono text-gray-300">
            <RiGlobalLine className="w-3.5 h-3.5 text-gray-400" />
            <span>EN</span>
          </div>

          <UserButton
            appearance={{
              elements: {
                avatarBox: 'w-8 h-8 ring-2 ring-[#FF4500]/50 rounded-full',
              },
            }}
          />
        </div>
      </header>

      {/* 2. Main Center Content: Headline + Prompt Box */}
      <main className="relative z-20 flex-1 flex flex-col items-center justify-center px-4 max-w-4xl mx-auto w-full text-center pb-12">
        {!isExecuting ? (
          <>
            {/* Main Headline */}
            <h1
              className="text-5xl sm:text-6xl md:text-8xl font-normal leading-[1.06] tracking-tight mb-6 text-[#ffe0e0] font-serif"
              style={{ textShadow: '0 0 28px rgba(255, 69, 0, 0.35)' }}
            >
              Superdesign<span className="text-[#FF4500]">.</span> <br />
              <span className="italic font-light text-[#ffe0e0]/90">The design agent.</span>
            </h1>

            {/* Subtitle */}
            <p
              className="text-base md:text-lg text-[#ffe0e0]/80 max-w-xl mx-auto mb-10 font-light tracking-wide leading-relaxed font-sans"
              style={{ textShadow: '0 0 16px rgba(255, 255, 255, 0.4)' }}
            >
              We turn the unseen into the unforgettable. An agentic design engine for creators who dare to disappear to be found.
            </p>

            {/* Floating Prompt Box (Directly replicating imfa.app) */}
            <div className="w-full max-w-2xl bg-[#121215]/85 backdrop-blur-2xl border border-white/12 rounded-3xl p-4 shadow-2xl transition-all focus-within:border-[#FF4500]/70 focus-within:ring-2 focus-within:ring-[#FF4500]/20 relative">
              <textarea
                ref={textareaRef}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleLaunchAgent();
                  }
                }}
                placeholder="Senior Full-Stack & AI Engineer with 5 years experience, dark bento design with metrics..."
                rows={2}
                className="w-full bg-transparent text-sm sm:text-base text-white placeholder-gray-500 outline-none resize-none leading-relaxed"
              />

              {/* Ingestion Indicators (If CV or GitHub attached) */}
              {(cvFileName || githubUser) && (
                <div className="flex flex-wrap items-center gap-2 mb-3 pt-1">
                  {cvFileName && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-[11px] font-mono text-indigo-300">
                      <RiFileLine className="w-3.5 h-3.5" />
                      <span>{cvFileName}</span>
                      <button onClick={() => setCvFileName('')} className="hover:text-white">
                        <RiCloseLine className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {githubUser && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 border border-white/20 text-[11px] font-mono text-gray-200">
                      <RiGithubFill className="w-3.5 h-3.5" />
                      <span>@{githubUser}</span>
                      <button onClick={() => setGithubUser('')} className="hover:text-white">
                        <RiCloseLine className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                </div>
              )}

              {/* Bottom Actions Bar inside Prompt Box */}
              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                {/* Left Controls: '+' Attachment and Model Selector */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowAttachmentModal(true)}
                    className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                    title="Attach CV / PDF or link GitHub profile"
                  >
                    <RiAddLine className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setModelType(m => m === 'Fast' ? 'Deep' : 'Fast')}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-gray-300 transition-all cursor-pointer"
                    title="Switch AI Engine"
                  >
                    {modelType === 'Fast' ? (
                      <RiFlashlightFill className="w-3.5 h-3.5 text-amber-400" />
                    ) : (
                      <RiBrainLine className="w-3.5 h-3.5 text-purple-400" />
                    )}
                    <span>{modelType === 'Fast' ? 'Fast' : 'Deep'}</span>
                  </button>
                </div>

                {/* Right Controls: Microphone & Send Button */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleToggleVoice}
                    className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                      isListening
                        ? 'bg-rose-500/20 border-rose-500 text-rose-400 animate-pulse'
                        : 'bg-white/5 hover:bg-white/10 border-white/10 text-gray-400 hover:text-white'
                    }`}
                    title={isListening ? 'Listening...' : 'Voice Prompt (Speech to Text)'}
                  >
                    <RiMicLine className="w-4 h-4" />
                  </button>

                  <button
                    onClick={handleLaunchAgent}
                    className="w-9 h-9 rounded-xl bg-white text-black hover:bg-gray-200 active:scale-95 flex items-center justify-center shadow-lg transition-all cursor-pointer"
                    title="Generate Portfolio"
                  >
                    <RiSendPlaneFill className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Status Line Matching Landing Page */}
            <div className="mt-8 flex items-center justify-center gap-6 text-xs text-[#ffe0e0]/60 font-mono tracking-widest uppercase">
              <span>{currentTime || '10:30 PM'}</span>
              <span>|</span>
              <span>NYC, USA</span>
              <span>|</span>
              <span className="text-[#FF4500] font-semibold animate-pulse">SYSTEM READY</span>
            </div>
          </>
        ) : (
          /* 3. Live Agent Task Execution Checklist Screen */
          <div className="w-full max-w-xl bg-[#121215]/90 backdrop-blur-2xl border border-white/12 rounded-3xl p-6 sm:p-8 shadow-2xl text-left animate-in fade-in zoom-in-95 duration-300">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
              <div className="w-10 h-10 rounded-2xl bg-[#FF4500]/20 text-[#FF4500] flex items-center justify-center text-lg animate-spin">
                <RiSparkling2Fill />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white">
                  Agentic Architect at Work
                </h3>
                <p className="text-xs text-gray-400">
                  Synthesizing custom portfolio schema from your prompt...
                </p>
              </div>
            </div>

            {/* Step-by-Step Task Checklist */}
            <div className="space-y-3.5">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className={`flex items-center gap-3 text-xs sm:text-sm transition-all duration-300 ${
                    task.done
                      ? 'text-white font-medium'
                      : task.active
                        ? 'text-[#FF4500] font-semibold'
                        : 'text-gray-500'
                  }`}
                >
                  <div className="shrink-0">
                    {task.done ? (
                      <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                        <RiCheckLine className="w-3.5 h-3.5" />
                      </div>
                    ) : task.active ? (
                      <div className="w-5 h-5 rounded-full bg-[#FF4500]/20 text-[#FF4500] flex items-center justify-center animate-spin">
                        <RiLoader4Line className="w-3.5 h-3.5" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full border border-white/20 flex items-center justify-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 flex-1">
                    {task.done ? (
                      <span className="text-emerald-400 font-bold text-xs uppercase tracking-wider font-mono">Done:</span>
                    ) : task.active ? (
                      <span className="text-[#FF4500] font-bold text-xs uppercase tracking-wider font-mono animate-pulse">Building:</span>
                    ) : (
                      <span className="text-gray-500 font-semibold text-xs uppercase tracking-wider font-mono">Queued:</span>
                    )}
                    <span className="leading-snug">{task.label}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-gray-400 font-mono">
              <span>MODEL: {modelType === 'Fast' ? 'GROQ LLAMA 3.3 70B' : 'MISTRAL LARGE'}</span>
              <span className="text-[#FF4500] animate-pulse">SYNTHESIZING...</span>
            </div>
          </div>
        )}
      </main>

      {/* 4. Bottom Footer Info */}
      <footer className="relative z-20 px-6 py-4 text-center text-xs text-gray-500/60 font-mono">
        Superdesign Agent v1.0 • Autonomous Architecture Engine
      </footer>

      {/* Attachment Modal for CV / GitHub Ingestion */}
      {showAttachmentModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#121215] border border-white/12 rounded-3xl p-6 relative shadow-2xl">
            <button
              onClick={() => setShowAttachmentModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-white"
            >
              <RiCloseLine className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white mb-1">
              Add Context for Portfolio Agent
            </h3>
            <p className="text-xs text-gray-400 mb-6">
              Attach your CV or GitHub to ground projects in your real technical history.
            </p>

            {/* Option 1: GitHub Handle */}
            <div className="space-y-2 mb-5">
              <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                <RiGithubFill className="w-4 h-4" />
                <span>GitHub Username</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={githubUser}
                  onChange={(e) => setGithubUser(e.target.value.replace('@', ''))}
                  placeholder="e.g. torvalds"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#FF4500]"
                />
              </div>
            </div>

            {/* Option 2: CV / Resume File */}
            <div className="space-y-2 mb-6">
              <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                <RiFileLine className="w-4 h-4" />
                <span>Upload Resume / CV (PDF or Markdown)</span>
              </label>
              <input
                type="file"
                accept=".pdf,.txt,.md"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setCvFileName(file.name);
                }}
                className="w-full text-xs text-gray-400 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20 cursor-pointer"
              />
            </div>

            <button
              onClick={() => setShowAttachmentModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#FF4500] hover:bg-[#ff5714] text-black font-bold text-xs transition-all shadow-md cursor-pointer"
            >
              Attach Context & Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
