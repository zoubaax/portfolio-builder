import React from 'react';
import { Layers, Cpu, Code2, Globe } from 'lucide-react';
import { usePortfolio } from '../../../context/PortfolioContext';

export const SkillsSection = ({ data, variant = 'category-cards' }) => {
  const { isMobileViewport } = usePortfolio();
  const { heading, subheading, categories = [] } = data || {};

  return (
    <section id="skills" className={`${isMobileViewport ? 'py-10 px-4' : 'py-16 px-6 md:px-12'} max-w-6xl mx-auto`}>
      <div className="mb-8 sm:mb-12">
        {subheading && (
          <p className="text-xs uppercase tracking-widest font-bold mb-2"
             style={{ color: 'var(--theme-accent)' }}>
            {subheading}
          </p>
        )}
        <h2 className={`${isMobileViewport ? 'text-2xl sm:text-3xl' : 'text-3xl sm:text-4xl'} font-extrabold tracking-tight`}
            style={{ fontFamily: 'var(--theme-heading-font)', color: 'var(--theme-text-primary)' }}>
          {heading || 'Skills & Technologies'}
        </h2>
      </div>

      {variant === 'category-cards' ? (
        <div className={isMobileViewport ? "grid grid-cols-1 gap-4" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"}>
          {categories.map((cat, idx) => (
            <div key={idx}
                 className={`${isMobileViewport ? 'p-5 rounded-2xl' : 'p-6 rounded-3xl'} border flex flex-col justify-between transition-all hover:scale-[1.02] shadow-sm`}
                 style={{
                   backgroundColor: 'var(--theme-surface)',
                   borderColor: 'var(--theme-border)',
                 }}>
              <div>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 border"
                     style={{
                       backgroundColor: 'rgba(255,255,255,0.02)',
                       borderColor: 'var(--theme-border)',
                       color: 'var(--theme-accent)'
                     }}>
                  {idx % 4 === 0 && <Code2 className="w-5 h-5" />}
                  {idx % 4 === 1 && <Cpu className="w-5 h-5" />}
                  {idx % 4 === 2 && <Layers className="w-5 h-5" />}
                  {idx % 4 === 3 && <Globe className="w-5 h-5" />}
                </div>

                <h3 className="text-lg font-bold mb-4"
                    style={{ color: 'var(--theme-text-primary)', fontFamily: 'var(--theme-heading-font)' }}>
                  {cat.name || cat.label || 'Competencies'}
                </h3>
              </div>

              <div className="flex flex-wrap gap-2">
                {(cat.skills || cat.items || []).map((skill, sIdx) => (
                  <span key={sIdx}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors hover:border-(--theme-accent)"
                        style={{
                          backgroundColor: 'rgba(255,255,255,0.03)',
                          borderColor: 'var(--theme-border)',
                          color: 'var(--theme-text-secondary)',
                          fontFamily: 'var(--theme-mono-font)'
                        }}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Pill Cloud Variant */
        <div className="p-8 sm:p-12 rounded-3xl border flex flex-wrap justify-center gap-3 sm:gap-4 max-w-4xl mx-auto"
             style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)' }}>
          {categories.flatMap(cat => cat.skills || cat.items || []).map((skill, idx) => (
            <div key={idx}
                 className="px-5 py-2.5 rounded-full text-sm font-semibold border transition-all duration-200 hover:scale-110 shadow-sm cursor-default"
                 style={{
                   backgroundColor: 'rgba(255, 255, 255, 0.04)',
                   borderColor: 'var(--theme-border)',
                   color: 'var(--theme-text-primary)'
                 }}>
              {skill}
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
