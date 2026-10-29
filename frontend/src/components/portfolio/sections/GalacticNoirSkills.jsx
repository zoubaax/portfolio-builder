import React, { useState } from 'react';
import { EditableText } from '../../common/EditableText';
import { usePortfolio } from '../../../context/PortfolioContext';
import { getSocialIcon } from '../../common/BrandIcons';
import { ImagePickerModal } from '../../common/ImagePickerModal';
import { SocialLinksModal } from '../../common/SocialLinksModal';
import { RiCameraLine } from 'react-icons/ri';

export const GalacticNoirSkills = ({ data = {}, sectionId }) => {
  const { updateSectionField, isEditMode, isMobileViewport, setViewMode } = usePortfolio();
  const fallbackCategories = [
    {
      "name": "Core Stack",
      "skills": [
        "React",
        "TypeScript",
        "Node.js",
        "Python"
      ]
    }
  ];
  const categories = (Array.isArray(data?.categories) && data.categories.length > 0)
    ? data.categories
    : (Array.isArray(data?.skills) && data.skills.length > 0
        ? [{ name: "Technologies", skills: data.skills }]
        : fallbackCategories);

  return (
    <section className={`relative ${isMobileViewport ? 'py-8 px-4' : 'py-20 md:py-28 px-6'} overflow-hidden max-w-full`} id={sectionId}>
      <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 sm:gap-8" style={{ opacity: "1", transform: "none" }}>
        <div className={`mb-4 sm:mb-8 ${isMobileViewport ? 'text-center' : ''}`}>
          <p className="text-[var(--text-muted)] text-xs tracking-[0.35em] uppercase mb-2" style={{ fontFamily: "DM Sans, sans-serif" }}>
            Skills · Workflow · Identity
          </p>
          <h2 style={{ fontFamily: "Comfortaa, cursive", fontWeight: "700", color: "var(--text-primary)", fontSize: isMobileViewport ? "clamp(1.75rem, 6vw, 2.25rem)" : "clamp(2rem, 5vw, 3rem)" }}>
            <EditableText value={data?.heading || 'Stack & Skills'} as="h2" />
          </h2>
        </div>

        {/* Workflow & Categories Card */}
        <div className="rounded-2xl p-4 sm:p-6 relative overflow-hidden" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(167,139,250,0.04) 0%, transparent 70%)" }} />
          <p className="text-[var(--text-muted)] text-xs tracking-[0.3em] uppercase mb-4 sm:mb-6 relative z-10" style={{ fontFamily: "DM Mono, monospace" }}>
            WORKFLOW
          </p>
          
          {/* Scrollable Workflow Steps on Mobile */}
          <div className="flex items-center justify-between gap-1 overflow-x-auto relative z-10 pb-2">
            {[
              { label: 'IDEA', color: '#f59e0b' },
              { label: 'PLAN', color: '#f97316' },
              { label: 'AI HELP', color: '#a78bfa' },
              { label: 'CODE', color: '#00d9ff' },
              { label: 'REVIEW', color: '#ec4899' },
              { label: 'TEST', color: '#f43f5e' },
              { label: 'LEARN', color: '#ffffff' },
            ].map((step, sIdx, arr) => (
              <React.Fragment key={step.label}>
                <div className="flex flex-col items-center gap-2 min-w-[48px] sm:min-w-[52px] cursor-pointer group shrink-0">
                  <div
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center group-hover:shadow-[0_0_18px_rgba(255,255,255,0.07)] transition-all duration-300"
                    style={{ background: `${step.color}0d`, border: `1px solid ${step.color}22` }}
                  >
                    <span className="inline-flex items-center text-xs">✦</span>
                  </div>
                  <span
                    className="text-[var(--text-muted)] text-[9px] sm:text-[10px] tracking-wider whitespace-nowrap group-hover:text-[var(--text-secondary)] transition-colors duration-200"
                    style={{ fontFamily: "DM Sans, sans-serif" }}
                  >
                    {step.label}
                  </span>
                </div>
                {sIdx < arr.length - 1 && (
                  <div className="flex-1 h-px min-w-[6px] sm:min-w-[8px] bg-gradient-to-r from-white/10 to-white/5 shrink-0" />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Dynamic Categories Grid */}
          <div className={`grid ${isMobileViewport ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'} gap-4 mt-6`}>
            {categories.map((cat, cIdx) => (
              <div key={cat.id || cIdx} className="rounded-xl p-4" style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid var(--border)" }}>
                <h4 className="text-xs font-bold tracking-widest uppercase mb-2.5" style={{ color: "var(--cyan, #00d9ff)", fontFamily: "DM Mono, monospace" }}>
                  {cat.name}
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {(cat.skills || []).map((skill, sIdx) => (
                    <span
                      key={sIdx}
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: "rgba(0, 217, 255, 0.06)", color: "rgba(0, 217, 255, 0.9)", border: "1px solid rgba(0, 217, 255, 0.18)", fontFamily: "DM Mono, monospace" }}
                    >
                      {typeof skill === 'string' ? skill : (skill.name || '')}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Form Card */}
        <div className={`rounded-2xl ${isMobileViewport ? 'p-5' : 'p-6 md:p-10'} relative overflow-hidden`} style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(0,217,255,0.05) 0%, transparent 70%)" }} />
          <div className="flex items-center gap-2.5 mb-6 relative z-10">
            <span className="inline-flex items-center">✦</span>
            <h3 className="text-lg sm:text-xl font-semibold" style={{ color: "var(--text-primary)", fontFamily: "Comfortaa, cursive" }}>
              Send a Message
            </h3>
          </div>
          <form id={sectionId} onSubmit={(e) => e.preventDefault()} className="relative z-10 flex flex-col gap-4 sm:gap-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] tracking-[0.14em] uppercase" style={{ color: "var(--text-muted)" }}>Name</label>
                <input
                  className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none transition-colors"
                  style={{ background: "rgba(255, 255, 255, 0.04)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                  placeholder="Your name"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] tracking-[0.14em] uppercase" style={{ color: "var(--text-muted)" }}>Email</label>
                <input
                  className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none transition-colors"
                  style={{ background: "rgba(255, 255, 255, 0.04)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                  type="email"
                  placeholder="you@mail.com"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] tracking-[0.14em] uppercase" style={{ color: "var(--text-muted)" }}>Message</label>
              <textarea
                className="w-full rounded-lg px-3.5 py-2.5 text-sm outline-none resize-none transition-colors"
                style={{ background: "rgba(255, 255, 255, 0.04)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                placeholder="What's on your mind?"
                rows="4"
              />
            </div>
            <div className="flex justify-center pt-2">
              <button
                type="submit"
                style={{
                  position: "relative",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "7px",
                  padding: "10px 24px",
                  borderRadius: "100px",
                  border: "1px solid rgba(0,217,255,0.28)",
                  background: "rgba(0,217,255,0.05)",
                  cursor: "pointer",
                  fontFamily: "DM Sans, sans-serif",
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "rgba(0,217,255,0.85)"
                }}
              >
                ✦ Send Message
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};