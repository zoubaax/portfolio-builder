import React, { useMemo, useState } from 'react';
import { HeroSection } from './sections/HeroSection';
import { AboutSection } from './sections/AboutSection';
import { ProjectsSection } from './sections/ProjectsSection';
import { SkillsSection } from './sections/SkillsSection';
import { ExperienceSection } from './sections/ExperienceSection';
import { ContactSection } from './sections/ContactSection';
import { SectionWrapper } from '../studio/SectionWrapper';
import { ExternalLink, Sparkles, Menu, X, ArrowUpRight } from 'lucide-react';
import { usePortfolio } from '../../context/PortfolioContext';
import { PortfolioChatWidget } from './PortfolioChatWidget';

export const PortfolioRenderer = ({ portfolio, isPreview = false }) => {
  const { isMobileViewport } = usePortfolio();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!portfolio) return null;

  const { theme, sections = [], meta } = portfolio;
  const palette = theme?.palette || {};
  const typography = theme?.typography || {};

  // Compute CSS custom properties dynamically from the schema's theme tokens
  const styleVariables = useMemo(() => ({
    '--theme-bg': palette.bg || '#0a0e17',
    '--theme-surface': palette.surface || '#111827',
    '--theme-surface-hover': palette.surfaceHover || '#1f2937',
    '--theme-text-primary': palette.textPrimary || '#f9fafb',
    '--theme-text-secondary': palette.textSecondary || '#9ca3af',
    '--theme-accent': palette.accent || '#6366f1',
    '--theme-accent-hover': palette.accentHover || '#4f46e5',
    '--theme-border': palette.border || 'rgba(255, 255, 255, 0.08)',
    '--theme-border-hover': palette.borderHover || 'rgba(99, 102, 241, 0.4)',
    '--theme-heading-font': typography.headingFont || "'Outfit', sans-serif",
    '--theme-body-font': typography.bodyFont || "'Inter', sans-serif",
    '--theme-mono-font': typography.monoFont || "'JetBrains Mono', monospace",
    '--theme-radius': typography.radius || '0.875rem',
  }), [palette, typography]);

  const heroSection = sections.find(s => s.type === 'hero');
  const heroName = heroSection?.data?.name || meta?.title?.split('—')[0]?.trim() || 'Portfolio';

  return (
    <div className="w-full min-h-full flex-1 flex flex-col relative transition-colors duration-300 selection:bg-(--theme-accent) selection:text-white"
         style={{
           ...styleVariables,
           backgroundColor: 'var(--theme-bg)',
           color: 'var(--theme-text-primary)',
           fontFamily: 'var(--theme-body-font)',
           containerType: 'inline-size',
         }}>
      {/* Floating Modern Header / Navbar */}
      <header className="sticky top-0 z-30 backdrop-blur-md border-b px-4 sm:px-6 py-3.5 sm:py-4 transition-all"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--theme-bg) 88%, transparent)',
                borderColor: 'var(--theme-border)',
              }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <a href="#" className="font-bold tracking-tight text-base sm:text-lg flex items-center gap-2"
             style={{ fontFamily: 'var(--theme-heading-font)', color: 'var(--theme-text-primary)' }}>
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'var(--theme-accent)' }} />
            <span className="truncate max-w-[180px] sm:max-w-none">{heroName}</span>
          </a>

          {/* Desktop Navigation Links */}
          {!isMobileViewport && (
            <div className="hidden md:flex items-center gap-6">
              <nav className="flex items-center gap-6 text-sm font-medium"
                   style={{ color: 'var(--theme-text-secondary)' }}>
                {sections.filter(s => s.visible !== false && s.type !== 'hero').map(s => (
                  <a key={s.id} href={`#${s.type}`}
                     className="capitalize hover:text-[var(--theme-text-primary)] transition-colors">
                    {s.type}
                  </a>
                ))}
              </nav>

              <a href="#contact"
                 className="px-4 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-90 active:scale-95"
                 style={{
                   backgroundColor: 'var(--theme-accent)',
                   color: '#ffffff'
                 }}>
                Contact
              </a>
            </div>
          )}

          {/* Mobile Hamburger Menu Button */}
          {isMobileViewport && (
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl border transition-colors flex items-center justify-center cursor-pointer"
              style={{
                borderColor: 'var(--theme-border)',
                color: 'var(--theme-text-primary)',
                backgroundColor: 'var(--theme-surface)',
              }}
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}
        </div>

        {/* Mobile Navigation Dropdown Drawer */}
        {isMobileViewport && isMobileMenuOpen && (
          <div
            className="pt-4 pb-3 px-2 border-t mt-3 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200"
            style={{ borderColor: 'var(--theme-border)' }}
          >
            <nav className="flex flex-col space-y-1">
              {sections.filter(s => s.visible !== false && s.type !== 'hero').map(s => (
                <a
                  key={s.id}
                  href={`#${s.type}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="capitalize px-3 py-2 rounded-lg text-sm font-medium hover:bg-white/5 transition-colors flex items-center justify-between"
                  style={{ color: 'var(--theme-text-primary)' }}
                >
                  <span>{s.type}</span>
                  <ArrowUpRight className="w-4 h-4 opacity-50" />
                </a>
              ))}
            </nav>

            <div className="pt-2 border-t" style={{ borderColor: 'var(--theme-border)' }}>
              <a
                href="#contact"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full block text-center py-2.5 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95"
                style={{
                  backgroundColor: 'var(--theme-accent)',
                  color: '#ffffff',
                }}
              >
                Me Contacter
              </a>
            </div>
          </div>
        )}
      </header>

      {/* Render Dynamic Portfolio Sections with SectionWrapper */}
      <main className="space-y-6 pb-24 flex-1">
        {sections.map((section, idx) => {
          if (section.visible === false) return null;

          let content = null;
          switch (section.type) {
            case 'hero':
              content = <HeroSection data={section.data} variant={section.variant} sectionId={section.id} />;
              break;
            case 'about':
              content = <AboutSection data={section.data} variant={section.variant} sectionId={section.id} />;
              break;
            case 'projects':
              content = <ProjectsSection data={section.data} variant={section.variant} sectionId={section.id} />;
              break;
            case 'skills':
              content = <SkillsSection data={section.data} variant={section.variant} sectionId={section.id} />;
              break;
            case 'experience':
              content = <ExperienceSection data={section.data} variant={section.variant} sectionId={section.id} />;
              break;
            case 'contact':
              content = <ContactSection data={section.data} variant={section.variant} sectionId={section.id} />;
              break;
            default:
              content = null;
          }

          return (
            <SectionWrapper
              key={section.id}
              section={section}
              index={idx}
              isFirst={idx === 0}
              isLast={idx === sections.length - 1}
            >
              {content}
            </SectionWrapper>
          );
        })}
      </main>

      {/* Portfolio Footer */}
      <footer className="border-t py-8 px-6 text-center text-xs"
              style={{
                borderColor: 'var(--theme-border)',
                color: 'var(--theme-text-secondary)',
              }}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} {heroName}. All rights reserved.</p>
          <div className="flex items-center gap-1.5 opacity-70">
            <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--theme-accent)' }} />
            <span>Built with Portfolify Studio</span>
          </div>
        </div>
      </footer>

      {/* Floating AI Digital Twin Recruiter Chatbot (Rendered on standalone/public pages) */}
      {!isPreview && (
        <PortfolioChatWidget portfolio={portfolio} />
      )}
    </div>
  );
};
