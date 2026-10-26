import React, { useState } from 'react';
import { EditableText } from '../../common/EditableText';
import { usePortfolio } from '../../../context/PortfolioContext';
import { getSocialIcon } from '../../common/BrandIcons';
import { ImagePickerModal } from '../../common/ImagePickerModal';
import { SocialLinksModal } from '../../common/SocialLinksModal';
import { RiCameraLine } from 'react-icons/ri';

export const GalacticNoirExperience = ({ data = {}, sectionId }) => {
  const { updateSectionField, isEditMode, isMobileViewport } = usePortfolio();
  const fallbackExp = [
    {
      "role": "Lead Engineer",
      "company": "Tech Corp",
      "period": "2023 - Present",
      "description": "Architecture & delivery."
    }
  ];
  const expList = (Array.isArray(data?.items) && data.items.length > 0)
    ? data.items
    : (Array.isArray(data?.experience) && data.experience.length > 0 ? data.experience : fallbackExp);

  return (
    <section className={`relative ${isMobileViewport ? 'py-8 px-4' : 'py-20 md:py-28 px-6'} overflow-hidden max-w-full`} id={sectionId}>
      <div className="w-full max-w-4xl mx-auto" style={{ opacity: "1", transform: "none" }}>
        <div className={`mb-8 sm:mb-10 ${isMobileViewport ? 'text-center' : ''}`}>
          <p className="text-[var(--text-muted)] text-xs tracking-[0.35em] uppercase mb-2" style={{ fontFamily: "DM Sans, sans-serif" }}>
            Education & Work
          </p>
          <h2 style={{ fontFamily: "Comfortaa, cursive", fontWeight: "700", color: "var(--text-primary)", fontSize: isMobileViewport ? "clamp(1.75rem, 6vw, 2.25rem)" : "clamp(2rem, 5vw, 3rem)" }}>
            <EditableText value={data?.heading || 'Experience'} as="h2" />
          </h2>
        </div>

        <div className={`grid ${isMobileViewport ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'} gap-6 w-full`}>
          <div className="flex flex-col gap-5 w-full">
            <div className="relative pl-5 border-l border-[var(--border)]">
              <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#00d9ff]" style={{ boxShadow: "0 0 8px rgba(0,217,255,0.5)" }} />
              <span className="text-[#00d9ff]/60 text-xs tracking-widest" style={{ fontFamily: "DM Mono, monospace" }}>CAREER & IMPACT</span>
              <h3 className="text-[var(--text-primary)] font-semibold text-lg mt-1" style={{ fontFamily: "DM Sans, sans-serif" }}>
                {data?.title || 'Engineering Journey'}
              </h3>
              <p className="text-[var(--text-secondary)] text-sm" style={{ fontFamily: "DM Sans, sans-serif" }}>
                {data?.tagline || 'Proven track record of building production systems.'}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4 w-full">
            {expList.map((exp, idx) => (
              <div
                key={exp?.id || idx}
                className="rounded-2xl p-5 sm:p-6 w-full max-w-full break-words"
                style={{ background: "var(--bg-card)", border: "1px solid rgba(245,158,11,0.18)" }}
              >
                <div className="flex items-start justify-between mb-3 gap-2">
                  <div>
                    <span className="text-[#f59e0b]/70 text-xs tracking-widest" style={{ fontFamily: "DM Mono, monospace" }}>
                      {exp?.period || '2024 — Present'}
                    </span>
                    <h3 className="text-[var(--text-primary)] font-semibold text-lg sm:text-xl mt-1 leading-snug" style={{ fontFamily: "DM Sans, sans-serif" }}>
                      <EditableText value={exp?.role || 'Software Engineer'} as="h3" />
                    </h3>
                  </div>
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.18)" }}>
                    <span className="inline-flex items-center text-xs">✦</span>
                  </div>
                </div>
                <p className="text-[#f59e0b]/90 text-sm font-semibold mb-3" style={{ fontFamily: "DM Sans, sans-serif" }}>
                  {exp?.company || 'Company'}
                </p>
                <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-4" style={{ fontFamily: "DM Sans, sans-serif" }}>
                  {exp?.description || ''}
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {((Array.isArray(exp?.technologies) && exp.technologies.length > 0) ? exp.technologies : (Array.isArray(exp?.tags) ? exp.tags : [])).map((tech, tIdx) => (
                    <span
                      key={tIdx}
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: "rgba(245,158,11,0.07)", color: "rgba(245,158,11,0.85)", border: "1px solid rgba(245,158,11,0.14)", fontFamily: "DM Mono, monospace" }}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};