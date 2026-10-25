import React, { useState, useEffect } from 'react';
import { ArrowUpRight, Calendar, Download, Eye, MousePointer } from 'lucide-react';
import { EditableText } from '../../common/EditableText';
import { usePortfolio } from '../../../context/PortfolioContext';

/**
 * Exact replica of Aditya Seth's Hero section, fully parameterized for React 19 & Portfolify
 */
export const AdityaDevOpsHero = ({ data, sectionId }) => {
  const { updateSectionField, isMobileViewport, effectiveAvatar, githubUsername } = usePortfolio();
  const { badge, name, title, tagline, primaryCta, secondaryCta } = data || {};

  // Interactive typewriter effect for the title line
  const typingWords = [
    title || 'DevOps & Cloud Architect',
    'AI Systems & Infrastructure Lead',
    'Kubernetes & Platform Engineer'
  ];
  const [currentWordIdx, setCurrentWordIdx] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const word = typingWords[currentWordIdx % typingWords.length];
    const typingSpeed = isDeleting ? 40 : 80;

    const timer = setTimeout(() => {
      if (!isDeleting) {
        setCurrentText(word.substring(0, currentText.length + 1));
        if (currentText.length + 1 === word.length) {
          setTimeout(() => setIsDeleting(true), 1800);
        }
      } else {
        setCurrentText(word.substring(0, currentText.length - 1));
        if (currentText.length === 0) {
          setIsDeleting(false);
          setCurrentWordIdx((prev) => prev + 1);
        }
      }
    }, typingSpeed);

    return () => clearTimeout(timer);
  }, [currentText, isDeleting, currentWordIdx]);

  return (
    <section 
      id="home"
      className="relative min-h-[85vh] flex flex-col justify-center items-center text-center px-4 overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse at 50% 20%, rgba(3, 155, 229, 0.12) 0%, rgba(10, 13, 20, 0.98) 75%)',
      }}
    >
      {/* Background architectural grid */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto space-y-6 pt-10 pb-16">
        {/* Intro Greeting */}
        <span 
          className="inline-block text-sm md:text-base font-medium tracking-wide uppercase"
          style={{ color: 'var(--theme-accent)' }}
        >
          <EditableText
            value={badge || "Hello, I am"}
            onSave={(val) => updateSectionField(sectionId, 'badge', val)}
            singleLine
            placeholder="Hello, I am"
          />
        </span>

        {/* Large Name Headline */}
        <div className="relative">
          <EditableText
            as="h1"
            value={name || "Aditya Seth"}
            onSave={(val) => updateSectionField(sectionId, 'name', val)}
            singleLine
            className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tight"
            style={{ 
              fontFamily: 'var(--theme-heading-font)', 
              color: 'var(--theme-text-primary)',
              letterSpacing: '-0.03em'
            }}
            placeholder="Your Name"
          />
        </div>

        {/* Dynamic Typewriter Line */}
        <div className="flex items-center justify-center gap-1 text-xl sm:text-2xl md:text-3xl font-light font-mono" style={{ color: 'var(--theme-text-secondary)' }}>
          <span>{currentText}</span>
          <span className="inline-block w-2.5 h-7 ml-1 bg-sky-400 animate-pulse" />
        </div>

        {/* Optional Tagline */}
        {tagline && (
          <EditableText
            as="p"
            value={tagline}
            onSave={(val) => updateSectionField(sectionId, 'tagline', val)}
            className="max-w-2xl mx-auto text-sm sm:text-base text-slate-400 leading-relaxed font-normal"
            placeholder="Tagline or short bio..."
          />
        )}

        {/* 3 Call-To-Action Buttons (Matching Aditya's original 3 CTAs) */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 pt-4">
          {/* 1. View My Work */}
          <a
            href="#projects"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold tracking-wide transition-all duration-300 shadow-lg hover:scale-105 active:scale-95"
            style={{
              backgroundColor: 'var(--theme-accent)',
              color: '#ffffff',
              boxShadow: '0 4px 20px rgba(56, 189, 248, 0.35)'
            }}
          >
            <Eye className="w-4 h-4" />
            <EditableText
              value={primaryCta?.text || "View My Work"}
              onSave={(val) => updateSectionField(sectionId, 'primaryCta.text', val)}
              singleLine
            />
          </a>

          {/* 2. Download CV */}
          <a
            href={secondaryCta?.link || "#resume"}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold tracking-wide border transition-all duration-300 hover:bg-white/5 hover:scale-105 active:scale-95"
            style={{
              borderColor: 'var(--theme-border)',
              color: 'var(--theme-text-primary)',
              backgroundColor: 'var(--theme-surface)'
            }}
          >
            <Download className="w-4 h-4" />
            <EditableText
              value={secondaryCta?.text || "Download CV"}
              onSave={(val) => updateSectionField(sectionId, 'secondaryCta.text', val)}
              singleLine
            />
          </a>

          {/* 3. Wanna connect? (Direct Calendar Booking) */}
          <a
            href="#contact"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold tracking-wide transition-all duration-300 text-white shadow-md hover:scale-105 active:scale-95"
            style={{
              backgroundColor: '#039be5',
              borderColor: '#039be5',
              boxShadow: '0 4px 15px rgba(3, 155, 229, 0.3)'
            }}
          >
            <Calendar className="w-4 h-4" />
            <span>Wanna connect?</span>
          </a>
        </div>
      </div>

      {/* Exact Mouse Scroll-Down Indicator */}
      <a 
        href="#about"
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 opacity-70 hover:opacity-100 transition-opacity cursor-pointer z-10"
      >
        <div className="w-5 h-9 rounded-full border-2 border-slate-400/60 flex items-start justify-center p-1">
          <div className="w-1.5 h-2.5 rounded-full bg-slate-300 animate-bounce" />
        </div>
        <span className="text-[10px] tracking-widest uppercase font-mono text-slate-400">Scroll</span>
      </a>
    </section>
  );
};
