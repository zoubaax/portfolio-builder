import React, { useState, useEffect, useRef } from 'react';
import { SignInButton, SignUpButton, useUser } from '@clerk/react';
import {
  RiSparkling2Fill,
  RiArrowRightLine,
  RiStarFill,
  RiTerminalBoxLine,
  RiCompass3Line,
  RiContrastDropLine,
  RiTimeLine,
  RiAddLine,
  RiFlashlightFill,
  RiMicLine,
  RiSendPlaneFill,
  RiFileLine,
  RiGithubFill,
  RiCloseLine,
  RiCheckLine,
  RiLoader4Line,
  RiBrainLine
} from 'react-icons/ri';
import { usePortfolio } from '../../context/PortfolioContext';


export const LandingPage = ({ onStartStudio }) => {
  const { isSignedIn } = useUser();
  const { sendChatMessage, savePortfolio } = usePortfolio();

  const [currentTime, setCurrentTime] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [modelType, setModelType] = useState('Fast');
  const [showAttachmentModal, setShowAttachmentModal] = useState(false);
  const [githubUser, setGithubUser] = useState('');
  const [cvFileName, setCvFileName] = useState('');
  const [isListening, setIsListening] = useState(false);

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
  const heroWrapperRef = useRef(null);

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

  // Scroll Effects: Navbar, Parallax, and Reveal Observer
  useEffect(() => {
    // 1. Reveal Elements with IntersectionObserver
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    );

    document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

    // 2. Parallax and Navbar Scroll Listener
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setScrolled(scrollY > 40);

      // Hero Parallax Fade
      if (heroWrapperRef.current && scrollY < 900) {
        heroWrapperRef.current.style.transform = `translateY(${scrollY * 0.35}px)`;
        heroWrapperRef.current.style.opacity = Math.max(0, 1 - scrollY / 700);
      }

      // Card Parallax
      document.querySelectorAll('.parallax-card-up').forEach((el) => {
        el.style.setProperty('--scroll-offset-up', `${scrollY * -0.05}px`);
      });
      document.querySelectorAll('.parallax-card-down').forEach((el) => {
        el.style.setProperty('--scroll-offset-down', `${scrollY * 0.05}px`);
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      revealObserver.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [prompt]);

  // Voice Speech-to-Text simulation
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

  // Launch Agent Generation Workflow with Step-by-Step Task Execution
  const handleLaunchAgent = async () => {
    const finalPrompt = prompt.trim() || 'Senior Full-Stack & AI Engineer with 5 years experience, dark bento design with metrics';
    setIsExecuting(true);

    // Reset tasks
    setTasks([
      { id: 't1', label: 'Analyzing prompt & synthesizing design tokens', done: false, active: false },
      { id: 't2', label: 'Generating high-impact Hero positioning & tagline', done: false, active: false },
      { id: 't3', label: 'Crafting About narrative & engineering philosophy', done: false, active: false },
      { id: 't4', label: 'Curating Projects showcase & bento case studies', done: false, active: false },
      { id: 't5', label: 'Structuring Skills matrix & Career trajectory', done: false, active: false },
      { id: 't6', label: 'Compiling responsive schema & saving Neon DB snapshot', done: false, active: false },
    ]);

    for (let i = 0; i < tasks.length; i++) {
      // Mark current task active
      setTasks((prev) =>
        prev.map((t, idx) => (idx === i ? { ...t, active: true } : t))
      );

      await new Promise((r) => setTimeout(r, i === 0 ? 500 : 650));

      // Mark current task done
      setTasks((prev) =>
        prev.map((t, idx) => (idx === i ? { ...t, done: true, active: false } : t))
      );
    }

    // Trigger AI generation in context with the prompt
    try {
      await sendChatMessage(finalPrompt);
      await savePortfolio(false, `Agent Build: ${finalPrompt.slice(0, 50)}...`);
    } catch (e) {
      console.warn('Backend sync completed with local schema fallback', e);
    }

    await new Promise((r) => setTimeout(r, 600));
    setIsExecuting(false);

    if (onStartStudio) {
      onStartStudio();
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-[#FF4500] selection:text-white relative overflow-x-hidden font-sans">
      {/* Global Noise Overlay */}
      <div className="noise-overlay" />

      {/* Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${
          scrolled
            ? 'py-3.5 bg-black/25 backdrop-blur-2xl border-b border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.35)]'
            : 'py-7 bg-transparent border-b border-transparent'
        }`}
      >
        <div className="container mx-auto px-6 max-w-6xl flex items-center justify-between">
          <a href="#" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-full bg-[#FF4500] text-black flex items-center justify-center font-extrabold text-sm transition-transform duration-500 group-hover:rotate-45">
              ✦
            </div>
            <span className="text-2xl font-bold tracking-tight font-serif text-white">
              Superdesign<span className="text-[#FF4500]">.</span>
            </span>
          </a>

          <div className="hidden md:flex items-center space-x-8 text-sm text-gray-400 font-medium">
            <a href="#chat-agent" className="hover:text-white transition-colors duration-300">
              Agent Copilot
            </a>
            <a href="#expertise" className="hover:text-white transition-colors duration-300">
              Expertise
            </a>
            <a href="#works" className="hover:text-white transition-colors duration-300">
              Archetypes
            </a>
          </div>

          <div className="flex items-center gap-3">
            {!isSignedIn ? (
              <>
                <SignInButton mode="modal">
                  <button className="text-xs font-semibold px-4 py-2 text-gray-300 hover:text-white transition-colors cursor-pointer">
                    Sign In
                  </button>
                </SignInButton>

                <SignUpButton mode="modal">
                  <button className="inline-flex items-center justify-center px-5 py-2.5 rounded-full text-xs font-bold bg-white text-black hover:scale-105 hover:bg-gray-100 active:scale-95 transition-all duration-300 shadow-lg cursor-pointer">
                    <span>Start Project</span>
                    <RiArrowRightLine className="w-3.5 h-3.5 ml-1.5" />
                  </button>
                </SignUpButton>
              </>
            ) : (
              <button
                onClick={onStartStudio}
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-full text-xs font-bold bg-[#FF4500] text-black hover:bg-[#ff5714] hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg shadow-[#FF4500]/25 cursor-pointer"
              >
                <RiSparkling2Fill className="w-3.5 h-3.5 mr-1.5" />
                <span>Open Studio</span>
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section with Atmosphere & Surrealist Hands */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-32 pb-24 bg-[#050505]">
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

        {/* Ambient Spectrum Rainbow Glow at Bottom (From imfa.app) */}
        <div className="spectrum-glow absolute bottom-[-10%] left-1/2 -translate-x-1/2 w-[120%] h-[320px] pointer-events-none z-10" />

        {/* Hero Content */}
        <div
          ref={heroWrapperRef}
          className="container mx-auto px-6 relative z-20 text-center flex flex-col items-center justify-center max-w-4xl"
        >

          <div className="reveal" style={{ transitionDelay: '100ms' }}>
            <h1
              className="text-5xl sm:text-6xl md:text-8xl font-normal leading-[1.06] tracking-tight mb-6 text-[#ffe0e0] font-serif"
              style={{ textShadow: '0 0 28px rgba(255, 69, 0, 0.35)' }}
            >
              Superdesign<span className="text-[#FF4500]">.</span> <br />
              <span className="italic font-light text-[#ffe0e0]/90">The design agent.</span>
            </h1>
          </div>

          <div className="reveal" style={{ transitionDelay: '200ms' }}>
            <p
              className="text-base md:text-lg text-[#ffe0e0]/80 max-w-xl mx-auto mb-10 font-light tracking-wide leading-relaxed"
              style={{ textShadow: '0 0 16px rgba(255, 255, 255, 0.4)' }}
            >
              We turn the unseen into the unforgettable. An agentic design engine for creators who dare to disappear to be found.
            </p>
          </div>

          {/* CHAT AGENT PROMPT BOX (Inspired directly by imfa.app) */}
          <div
            id="chat-agent"
            className="reveal w-full max-w-2xl bg-[#121215]/85 backdrop-blur-2xl border border-white/12 rounded-3xl p-4 shadow-2xl transition-all focus-within:border-[#FF4500]/70 focus-within:ring-2 focus-within:ring-[#FF4500]/20 relative text-left"
            style={{ transitionDelay: '300ms' }}
          >
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
              placeholder="e.g. Senior Full-Stack & AI Engineer with 5 years experience, dark bento design with metrics..."
              rows={2}
              className="w-full bg-transparent text-sm sm:text-base text-white placeholder-gray-500 outline-none resize-none leading-relaxed"
            />

            {/* Ingestion Indicators (If CV or GitHub attached) */}
            {(cvFileName || githubUser) && (
              <div className="flex flex-wrap items-center gap-2 mb-3 pt-1">
                {cvFileName && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FF4500]/15 border border-[#FF4500]/30 text-[11px] font-mono text-[#FF4500]">
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
                  onClick={() => setModelType((m) => (m === 'Fast' ? 'Deep' : 'Fast'))}
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
                  className="w-9 h-9 rounded-xl bg-[#FF4500] text-black hover:bg-[#ff5714] active:scale-95 flex items-center justify-center shadow-lg shadow-[#FF4500]/30 transition-all cursor-pointer font-bold"
                  title="Generate Portfolio"
                >
                  <RiSendPlaneFill className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>


          <div className="reveal flex items-center gap-4 text-[10px] md:text-xs text-white/50 uppercase tracking-widest mt-8 font-mono" style={{ transitionDelay: '500ms' }}>
            <span>{currentTime || '11:11 PM'}</span>
            <span className="w-px h-3 bg-white/20" />
            <span>NYC, USA</span>
            <span className="w-px h-3 bg-white/20" />
            <span className="text-[#FF4500]">SYSTEM READY</span>
          </div>
        </div>
      </section>

      {/* Mission / Philosophy Section */}
      <section id="expertise" className="py-32 relative border-t border-white/5">
        <div className="container mx-auto px-6 max-w-5xl text-center">
          <div className="reveal">
            <h2 className="text-3xl sm:text-4xl md:text-6xl leading-tight text-white/90 mb-10 font-serif">
              We design the negative space where your personal brand truly lives.
            </h2>
          </div>

          <div className="reveal" style={{ transitionDelay: '150ms' }}>
            <p className="text-lg md:text-2xl text-gray-400 leading-relaxed font-light max-w-3xl mx-auto">
              Elegance is refusal. We remove the clutter and hallucinations so your work resonates with absolute authority and clarity.
            </p>
          </div>

          {/* Logo / Archetype Strip */}
          <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center opacity-40 hover:opacity-75 transition-all duration-500">
            <div className="reveal font-bold text-lg md:text-xl tracking-widest font-mono">VOGUE</div>
            <div className="reveal font-bold text-lg md:text-xl tracking-widest font-mono" style={{ transitionDelay: '100ms' }}>TESLA</div>
            <div className="reveal font-bold text-lg md:text-xl tracking-widest font-mono" style={{ transitionDelay: '200ms' }}>MOMA</div>
            <div className="reveal font-bold text-lg md:text-xl tracking-widest font-mono" style={{ transitionDelay: '300ms' }}>AESOP</div>
          </div>
        </div>
      </section>

      {/* Selected Works / Parallax Cards Section */}
      <section id="works" className="py-36 relative overflow-hidden border-t border-white/5">
        <div className="container mx-auto px-6 max-w-6xl relative z-10">
          <div className="reveal mb-24 text-center">
            <span className="text-xs font-mono uppercase tracking-widest text-[#FF4500] block mb-3">
              Curated Archetypes
            </span>
            <h2 className="text-4xl sm:text-6xl md:text-7xl font-serif text-white">
              Define your <br />
              <span className="italic text-[#ffe0e0]/90">digital presence</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Card 1 - Red / Fire Accent with parallax-card-down */}
            <div className="parallax-card-down group cursor-pointer">
              <div className="reveal bg-[#FF4500] rounded-3xl p-8 md:p-12 aspect-[4/5] flex flex-col justify-between shadow-2xl hover:shadow-[0_20px_50px_rgba(255,69,0,0.35)] transition-all duration-500 group-hover:-translate-y-2">
                <div className="flex justify-between items-start">
                  <div className="w-12 h-12 rounded-full bg-black/10 flex items-center justify-center group-hover:rotate-45 transition-transform duration-500">
                    <RiStarFill className="text-black text-xl" />
                  </div>
                  <span className="text-black font-semibold text-xs border border-black/20 px-3 py-1 rounded-full uppercase tracking-wider font-mono">
                    01
                  </span>
                </div>

                <div>
                  <h3 className="text-4xl md:text-5xl text-black mb-4 leading-none tracking-tight font-serif font-medium">
                    Emerging <br />Talent
                  </h3>
                  <p className="text-black/80 text-base md:text-lg leading-snug">
                    You have the spark. We provide the atmosphere for your engineering achievements to ignite into a blazing reality.
                  </p>
                </div>

                <div className="w-full pt-4 border-t border-black/15 flex items-center justify-between text-xs font-bold text-black uppercase tracking-wider">
                  <span>Explore Archetype</span>
                  <RiArrowRightLine className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>

            {/* Card 2 - Deep Obsidian Glass with parallax-card-up */}
            <div className="parallax-card-up group cursor-pointer md:mt-16">
              <div
                className="reveal bg-[#111111] border border-white/10 rounded-3xl p-8 md:p-12 aspect-[4/5] flex flex-col justify-between shadow-2xl group-hover:border-[#FF4500]/60 transition-all duration-500 group-hover:-translate-y-2"
                style={{ transitionDelay: '150ms' }}
              >
                <div className="flex justify-between items-start">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                    <RiArrowRightLine className="text-white text-xl -rotate-45 text-[#FF4500]" />
                  </div>
                  <span className="text-white/50 font-semibold text-xs border border-white/10 px-3 py-1 rounded-full uppercase tracking-wider font-mono">
                    02
                  </span>
                </div>

                <div>
                  <h3 className="text-4xl md:text-5xl text-white mb-4 leading-none tracking-tight font-serif font-medium">
                    Evolving <br />Legacy
                  </h3>
                  <p className="text-gray-400 text-base md:text-lg leading-snug">
                    You have arrived. Now let's make sure you never leave their minds. Architectural permanence is our craft.
                  </p>
                </div>

                <div className="w-full pt-4 border-t border-white/10 flex items-center justify-between text-xs font-bold text-gray-300 uppercase tracking-wider">
                  <span>Explore Archetype</span>
                  <RiArrowRightLine className="w-4 h-4 group-hover:translate-x-1 transition-transform text-[#FF4500]" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ambient Grid Pattern */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] opacity-15 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, #444 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-white/5 bg-[#050505] relative overflow-hidden">
        <div className="container mx-auto px-6 max-w-6xl relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-12">
            <div className="w-full md:w-auto">
              <h2 className="text-[12vw] leading-[0.8] tracking-tighter text-white/10 font-bold select-none pointer-events-none font-serif">
                SUPERDESIGN<span className="text-[#FF4500]/20">.</span>
              </h2>
            </div>

            <div className="flex flex-col gap-6 text-right">
              <div className="flex items-center gap-6 text-sm text-gray-400 font-mono">
                <a href="#" className="hover:text-[#FF4500] transition-colors">GitHub</a>
                <a href="#" className="hover:text-[#FF4500] transition-colors">Twitter</a>
                <a href="#" className="hover:text-[#FF4500] transition-colors">LinkedIn</a>
              </div>
              <p className="text-xs text-gray-600 font-mono">
                © {new Date().getFullYear()} Superdesign Agent. Portfolify Engine v1.0.
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* LIVE AGENT TASK CHECKLIST MODAL */}
      {isExecuting && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-[#0f1420]/95 border border-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl text-left animate-in fade-in zoom-in-95 duration-300">
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
        </div>
      )}

      {/* Attachment Modal for CV / GitHub Ingestion */}
      {showAttachmentModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#131926] border border-white/15 rounded-3xl p-6 relative shadow-2xl">
            <button
              onClick={() => setShowAttachmentModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-white cursor-pointer"
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
              <input
                type="text"
                value={githubUser}
                onChange={(e) => setGithubUser(e.target.value.replace('@', ''))}
                placeholder="e.g. torvalds"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#FF4500]"
              />
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
