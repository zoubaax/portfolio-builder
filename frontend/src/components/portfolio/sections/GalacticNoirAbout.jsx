import React, { useState } from 'react';
import { EditableText } from '../../common/EditableText';
import { usePortfolio } from '../../../context/PortfolioContext';
import { getSocialIcon } from '../../common/BrandIcons';
import { ImagePickerModal } from '../../common/ImagePickerModal';
import { SocialLinksModal } from '../../common/SocialLinksModal';
import { RiCameraLine } from 'react-icons/ri';

export const GalacticNoirAbout = ({ data = {}, sectionId }) => {
  const { updateSectionField, isEditMode, isMobileViewport } = usePortfolio();
  const fallbackBio = "I'm a software engineer building at the intersection of full-stack systems and machine learning. I care deeply about clean architecture, meaningful products, and open-source collaboration.";
  const bioText = Array.isArray(data?.bio) ? data.bio.join('\n\n') : (data?.bio || data?.description || fallbackBio);

  return (
    <section className={`relative ${isMobileViewport ? 'py-8 px-4' : 'py-20 md:py-28 px-6'} overflow-hidden max-w-full`} id={sectionId}>
      <div className="w-full max-w-4xl mx-auto" style={{ opacity: "1", transform: "none" }}>
        <div className={`mb-8 sm:mb-10 ${isMobileViewport ? 'text-center' : ''}`}>
          <p className="text-[var(--text-muted)] text-xs tracking-[0.35em] uppercase mb-2" style={{ fontFamily: "DM Sans, sans-serif" }}>
            Who I Am
          </p>
          <h2 style={{ fontFamily: "Comfortaa, cursive", fontWeight: "700", color: "var(--text-primary)", fontSize: isMobileViewport ? "clamp(1.75rem, 6vw, 2.25rem)" : "clamp(2rem, 5vw, 3rem)" }}>
            <EditableText value={data?.heading || 'About Me'} as="h2" />
          </h2>
        </div>

        {/* Top Two Bento Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5 w-full">
          {/* Location Card */}
          <div
            className="rounded-2xl relative overflow-hidden select-none"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)", minHeight: "200px" }}
          >
            <div className="absolute inset-0 p-5 sm:p-6 flex flex-col justify-between z-10">
              <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 70% 60%, rgba(0,217,255,0.1) 0%, transparent 65%)" }} />
              <div className="relative flex items-center gap-1.5 text-[var(--text-muted)] text-xs" style={{ fontFamily: "DM Mono, monospace" }}>
                <span className="inline-flex items-center">✦</span> LOCATION
              </div>
              <div className="relative">
                <div className="text-[var(--text-primary)] font-bold text-2xl sm:text-3xl mb-1" style={{ fontFamily: "Comfortaa, cursive" }}>
                  GLOBAL / REMOTE
                </div>
                <div className="text-[var(--text-secondary)] text-xs mb-0.5" style={{ fontFamily: "DM Mono, monospace" }}>
                  AVAILABLE WORLDWIDE
                </div>
                <div className="text-[var(--text-muted)] text-xs" style={{ fontFamily: "DM Mono, monospace" }}>
                  OPEN TO WORK
                </div>
              </div>
            </div>
            <div className="absolute inset-0 rounded-2xl overflow-hidden opacity-40">
              <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(0,217,255,0.08) 0%, transparent 60%)" }} />
              <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "linear-gradient(rgba(0,217,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,217,255,0.04) 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
            </div>
          </div>

          {/* Bio Card */}
          <div
            className="rounded-2xl p-5 sm:p-6 flex flex-col justify-between gap-4"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)", minHeight: "200px" }}
          >
            <div>
              <p className="text-[var(--text-muted)] text-xs tracking-widest mb-3" style={{ fontFamily: "DM Mono, monospace" }}>
                / ABOUT
              </p>
              <p className="text-[var(--text-secondary)] text-sm leading-relaxed" style={{ fontFamily: "DM Sans, sans-serif" }}>
                <EditableText value={bioText} as="p" />
              </p>
            </div>
            <p className="text-[var(--text-muted)] text-xs italic border-t border-[var(--border)] pt-4" style={{ fontFamily: "DM Sans, sans-serif" }}>
              "Engineering with craft, speed, and precision."
            </p>
          </div>
        </div>

        {/* Academic / Status Banner */}
        <div className="mb-5 w-full">
          <div
            className="rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4 flex-wrap relative overflow-hidden"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
          >
            <div className="flex flex-col gap-1 min-w-[140px] relative z-10">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-[var(--text-muted)] text-xs tracking-[0.3em] uppercase" style={{ fontFamily: "DM Mono, monospace" }}>
                  Engineering Track
                </p>
                <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: "rgba(0,217,255,0.08)", color: "rgba(0,217,255,0.7)", fontFamily: "DM Mono, monospace" }}>
                  FULL-STACK & DEVOPS
                </span>
              </div>
              <p className="text-[var(--text-primary)] text-xl sm:text-2xl font-semibold tabular-nums" style={{ fontFamily: "DM Sans, sans-serif" }}>
                100% Delivery <span className="text-[var(--text-muted)] text-xs font-normal ml-1.5" style={{ fontFamily: "DM Mono, monospace" }}>SUCCESS RATE</span>
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Three Value Pillars (Responsive Stack on Mobile) */}
        <div className={`grid ${isMobileViewport ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-3'} gap-3 w-full`}>
          <div className="rounded-xl p-4" style={{ background: "#a78bfa0d", border: "1px solid #a78bfa30" }}>
            <div className="text-xs font-bold tracking-widest mb-2" style={{ color: "#a78bfa", fontFamily: "DM Mono, monospace" }}>
              GROWTH
            </div>
            <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)", fontFamily: "DM Sans, sans-serif" }}>
              An explorer of systems, driven by curiosity and understanding.
            </p>
          </div>

          <div className="rounded-xl p-4" style={{ background: "#00d9ff0d", border: "1px solid #00d9ff30" }}>
            <div className="text-xs font-bold tracking-widest mb-2" style={{ color: "#00d9ff", fontFamily: "DM Mono, monospace" }}>
              FOCUS
            </div>
            <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)", fontFamily: "DM Sans, sans-serif" }}>
              Deep work on efficiency and precision in every layer built.
            </p>
          </div>

          <div className="rounded-xl p-4" style={{ background: "#f59e0b0d", border: "1px solid #f59e0b30" }}>
            <div className="text-xs font-bold tracking-widest mb-2" style={{ color: "#f59e0b", fontFamily: "DM Mono, monospace" }}>
              CRAFT
            </div>
            <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)", fontFamily: "DM Sans, sans-serif" }}>
              Discipline and dedication in every single line of code.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};