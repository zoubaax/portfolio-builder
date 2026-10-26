import React, { useState } from 'react';
import { EditableText } from '../../common/EditableText';
import { usePortfolio } from '../../../context/PortfolioContext';
import { getSocialIcon } from '../../common/BrandIcons';
import { ImagePickerModal } from '../../common/ImagePickerModal';
import { SocialLinksModal } from '../../common/SocialLinksModal';
import { RiCameraLine } from 'react-icons/ri';

export const GalacticNoirHero = ({ data = {}, sectionId }) => {
  const { updateSectionField, isEditMode, effectiveAvatar, githubUsername, isMobileViewport } = usePortfolio();
  const [isImagePickerOpen, setIsImagePickerOpen] = useState(false);
  const [isSocialModalOpen, setIsSocialModalOpen] = useState(false);
  const isUnsplash = !data?.avatar || data.avatar.includes('unsplash.com');
  const displayAvatar = isUnsplash
    ? (effectiveAvatar || (githubUsername ? `https://github.com/${githubUsername}.png` : ''))
    : data.avatar;

  return (
    <>
      <section
        className={`relative ${isMobileViewport ? 'py-8 px-4 min-h-[520px]' : 'min-h-screen py-16 md:py-24 px-6 md:px-12'} flex items-center justify-center overflow-x-hidden w-full max-w-full`}
        id={sectionId}
      >
        {/* Background Gradients */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            style={{
              position: "absolute",
              inset: "0",
              backgroundImage: "linear-gradient(rgba(0,217,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,217,255,0.03) 1px, transparent 1px)",
              backgroundSize: isMobileViewport ? "32px 32px" : "48px 48px"
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: "0",
              background: "radial-gradient(ellipse 70% 60% at 65% 50%, rgba(0,217,255,0.06) 0%, transparent 70%)"
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: "0",
              background: "radial-gradient(ellipse 40% 40% at 20% 50%, rgba(167,139,250,0.04) 0%, transparent 65%)"
            }}
          />
        </div>

        {/* Content Container */}
        <div className={`relative z-10 w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-[1fr_auto] ${isMobileViewport ? 'gap-6 pt-4 pb-6 text-center' : 'gap-12 md:gap-16 items-center pt-20 pb-12'} overflow-hidden`}>
          <div className="flex flex-col gap-5 sm:gap-6 w-full max-w-full">
            {/* Version Toggle Pill */}
            <div className={`${isMobileViewport ? 'self-center' : 'self-start'}`} style={{ opacity: "1", transform: "none" }}>
              <div
                className="flex items-center gap-0.5 rounded-lg p-0.5"
                style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
              >
                <button
                  className="px-3 py-1 text-[10px] font-semibold tracking-wider rounded-md transition-colors duration-200 text-[var(--cyan)] bg-[var(--cyan-muted)]"
                  aria-pressed="true"
                >
                  NEW
                </button>
                <button
                  className="px-3 py-1 text-[10px] font-semibold tracking-wider rounded-md transition-colors duration-200 text-[var(--text-secondary)] hover:text-[var(--cyan)]"
                  aria-pressed="false"
                >
                  OLD
                </button>
              </div>
            </div>

            {/* Name / Heading */}
            <div style={{ opacity: "1", transform: "none" }} className="w-full max-w-full">
              <h1
                style={{
                  fontFamily: "Comfortaa, cursive",
                  fontWeight: "700",
                  fontSize: isMobileViewport ? "clamp(2rem, 8vw, 2.75rem)" : "clamp(3rem, 7vw, 5.5rem)",
                  color: "var(--text-primary)",
                  lineHeight: "1.08",
                  letterSpacing: "-0.02em",
                  wordBreak: "break-word",
                  overflowWrap: "break-word",
                  maxWidth: "100%"
                }}
              >
                <EditableText value={data?.name || 'Your Name'} as="h1" />
              </h1>
            </div>

            {/* Stack Subtitle */}
            <div
              className={`flex items-center gap-2 sm:gap-3 flex-wrap ${isMobileViewport ? 'justify-center text-[10px]' : 'text-[11px]'}`}
              style={{
                fontFamily: "DM Mono, monospace",
                letterSpacing: isMobileViewport ? "0.15em" : "0.25em",
                color: "var(--text-muted)",
                opacity: "1"
              }}
            >
              <span>{data?.title ? data.title.toUpperCase() : 'FULL-STACK · CLOUD · DEVELOPER'}</span>
            </div>

            {/* Tagline / Bio */}
            <p
              style={{
                fontFamily: "DM Sans, sans-serif",
                fontSize: isMobileViewport ? "14px" : "15px",
                color: "var(--text-secondary)",
                lineHeight: "1.65",
                maxWidth: "440px",
                margin: isMobileViewport ? "0 auto" : "0",
                wordBreak: "break-word"
              }}
            >
              <EditableText
                value={data?.tagline || data?.bio?.[0] || 'Building intelligent systems at the intersection of full-stack engineering and machine learning.'}
                as="p"
              />
            </p>

            {/* Animated Role */}
            <div className={`flex items-center gap-3 w-full max-w-full ${isMobileViewport ? 'justify-center' : ''}`} style={{ opacity: "1" }}>
              <div style={{ overflow: "hidden", maxWidth: "100%" }}>
                <span
                  className="hero-role role-out"
                  style={{
                    fontFamily: "Comfortaa, cursive",
                    fontWeight: "700",
                    fontSize: isMobileViewport ? "clamp(1.75rem, 8vw, 2.5rem)" : "clamp(2.75rem, 6vw, 4.5rem)",
                    background: "linear-gradient(90deg, rgb(245, 158, 11), rgb(0, 217, 255))",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    whiteSpace: "nowrap",
                    display: "block",
                    lineHeight: "1.15",
                    textAlign: isMobileViewport ? "center" : "left"
                  }}
                >
                  <EditableText value={data?.tagline || 'BUILDER'} as="span" />
                </span>
              </div>
            </div>

            {/* Pagination Dots */}
            <div className={`flex items-center gap-2 ${isMobileViewport ? 'justify-center' : ''}`}>
              <div className="dot-pill rounded-full" style={{ height: "4px", width: "4px", background: "var(--border)", transition: "0.35s" }} />
              <div className="dot-pill rounded-full" style={{ height: "4px", width: "4px", background: "var(--border)", transition: "0.35s" }} />
              <div className="dot-pill rounded-full" style={{ height: "4px", width: "24px", background: "rgb(0, 217, 255)", transition: "0.35s" }} />
              <div className="dot-pill rounded-full" style={{ height: "4px", width: "4px", background: "var(--border)", transition: "all 0.35s ease" }} />
              <div className="dot-pill rounded-full" style={{ height: "4px", width: "4px", background: "var(--border)", transition: "all 0.35s ease" }} />
            </div>

            {/* Action Buttons */}
            <div className={`flex items-center gap-3 pt-2 flex-wrap ${isMobileViewport ? 'justify-center' : ''}`}>
              <div className="relative inline-flex">
                <button className="group relative inline-flex overflow-hidden rounded-2xl p-[1.5px] transition-transform duration-300 ease-in-out hover:scale-105 active:scale-95">
                  <span
                    className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite]"
                    style={{ background: "conic-gradient(from 90deg at 50% 50%, transparent 0%, #00d9ff 15%, transparent 30%)" }}
                  />
                  <span className="relative z-10 flex h-10 sm:h-11 items-center justify-center gap-2 rounded-[14px] bg-[#0a0f14] px-4 sm:px-5 text-xs sm:text-sm font-semibold text-white">
                    <span className="inline-flex items-center">✦</span>
                    <span className="whitespace-nowrap">Lounge</span>
                  </span>
                </button>
                <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[16px] h-4 px-1 bg-[#00D9FF] text-[9px] font-semibold text-[#04202b] rounded-full z-20">
                  1
                </span>
              </div>
              <a
                className="group relative inline-flex overflow-hidden rounded-2xl p-[1.5px] transition-transform duration-300 ease-in-out hover:scale-105 active:scale-95"
                href="#projects"
              >
                <span
                  className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite]"
                  style={{ background: "conic-gradient(from 90deg at 50% 50%, transparent 0%, #00d9ff 15%, transparent 30%)" }}
                />
                <span className="relative z-10 flex h-10 sm:h-11 items-center justify-center gap-2 rounded-[14px] bg-[#0a0f14] px-4 sm:px-5 text-xs sm:text-sm font-semibold text-white">
                  <span className="inline-flex items-center">✦</span>
                  <span className="whitespace-nowrap">Explore Works</span>
                </span>
              </a>
            </div>

            {/* Mobile Flip Card & Social Bar (Visible on mobile/when isMobileViewport) */}
            <div className={`${isMobileViewport ? 'block' : 'block md:hidden'} w-full max-w-full`} style={{ marginTop: "12px" }}>
              <div style={{ width: "100%", maxWidth: "280px", height: isMobileViewport ? "320px" : "360px", margin: "0 auto", perspective: "1000px", cursor: "pointer" }}>
                <div style={{ position: "relative", width: "100%", height: "100%", transformStyle: "preserve-3d", transition: "transform 0.7s cubic-bezier(0.4, 0.2, 0.2, 1)" }}>
                  {/* Front Card */}
                  <div style={{ position: "absolute", inset: "0", backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", borderRadius: "20px", overflow: "hidden", border: "1px solid rgba(0,217,255,0.12)", boxShadow: "0 0 60px rgba(0,217,255,0.04), 0 32px 80px rgba(0,0,0,0.4)" }}>
                    <div className="relative group/avatar cursor-pointer w-full h-full" onClick={() => isEditMode && setIsImagePickerOpen(true)}>
                      <img
                        className="object-cover"
                        style={{ position: "absolute", inset: "0", width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", zIndex: "1" }}
                        src={displayAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80"}
                        alt={data?.name || "Avatar"}
                      />
                      {isEditMode && (
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center rounded-inherit z-20">
                          <RiCameraLine className="w-6 h-6 text-white" />
                        </div>
                      )}
                    </div>
                    <div style={{ position: "absolute", inset: "0", backgroundImage: "linear-gradient(rgba(0,217,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,217,255,0.03) 1px,transparent 1px)", backgroundSize: "24px 24px", zIndex: "2", pointerEvents: "none" }} />
                    <div style={{ position: "absolute", top: "0", left: "0", width: "20px", height: "20px", borderTop: "1.5px solid rgba(0,217,255,0.35)", borderLeft: "1.5px solid rgba(0,217,255,0.35)", margin: "10px", zIndex: "4" }} />
                    <div style={{ position: "absolute", top: "0", right: "0", transform: "scaleX(-1)", width: "20px", height: "20px", borderTop: "1.5px solid rgba(0,217,255,0.35)", borderLeft: "1.5px solid rgba(0,217,255,0.35)", margin: "10px", zIndex: "4" }} />
                    <div style={{ position: "absolute", bottom: "0", left: "0", transform: "scaleY(-1)", width: "20px", height: "20px", borderTop: "1.5px solid rgba(0,217,255,0.35)", borderLeft: "1.5px solid rgba(0,217,255,0.35)", margin: "10px", zIndex: "4" }} />
                    <div style={{ position: "absolute", bottom: "0", right: "0", transform: "scale(-1)", width: "20px", height: "20px", borderTop: "1.5px solid rgba(0,217,255,0.35)", borderLeft: "1.5px solid rgba(0,217,255,0.35)", margin: "10px", zIndex: "4" }} />
                    <div style={{ position: "absolute", left: "0px", right: "0px", height: "1px", background: "linear-gradient(90deg, transparent, rgba(0, 217, 255, 0.4), transparent)", zIndex: "3", top: "31.2857%" }} />
                    <div style={{ position: "absolute", top: "10px", right: "12px", zIndex: "5", fontFamily: "DM Mono,monospace", fontSize: "8px", color: "rgba(0,217,255,0.6)", letterSpacing: "0.1em" }}>TAP TO FLIP</div>
                  </div>

                  {/* Back Card */}
                  <div style={{ position: "absolute", inset: "0", backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", transform: "rotateY(180deg)", borderRadius: "20px", overflow: "hidden", border: "1px solid rgba(167,139,250,0.2)", boxShadow: "0 0 60px rgba(167,139,250,0.06), 0 32px 80px rgba(0,0,0,0.4)" }}>
                    <div className="relative group/avatar cursor-pointer w-full h-full" onClick={() => isEditMode && setIsImagePickerOpen(true)}>
                      <img
                        className="object-cover"
                        style={{ position: "absolute", inset: "0", width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", zIndex: "1" }}
                        src={displayAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80"}
                        alt={data?.name || "Avatar"}
                      />
                      {isEditMode && (
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center rounded-inherit z-20">
                          <RiCameraLine className="w-6 h-6 text-white" />
                        </div>
                      )}
                    </div>
                    <div style={{ position: "absolute", inset: "0", backgroundImage: "linear-gradient(rgba(167,139,250,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(167,139,250,0.04) 1px,transparent 1px)", backgroundSize: "24px 24px", zIndex: "2", pointerEvents: "none" }} />
                    <div style={{ position: "absolute", bottom: "0", left: "0", right: "0", padding: "10px 14px", background: "linear-gradient(to top,rgba(0,0,0,0.8),transparent)", display: "flex", justifyContent: "space-between", zIndex: "4" }}>
                      <span style={{ fontFamily: "DM Mono,monospace", fontSize: "9px", color: "rgba(167,139,250,0.75)", letterSpacing: "0.15em" }}>DEVELOPER</span>
                      <span style={{ fontFamily: "DM Mono,monospace", fontSize: "9px", color: "rgba(245,158,11,0.75)", letterSpacing: "0.15em" }}>PORTFOLIO</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile Social Links Bar */}
              <div className="flex justify-center mt-3 w-full">
                <div className="flex flex-wrap items-center justify-center gap-1.5 rounded-2xl bg-white/5 p-1.5 border border-white/10 backdrop-blur-lg max-w-full">
                  {['email', 'github', 'linkedin', 'twitter'].map((platform) => (
                    <div key={platform} className="flex items-center justify-center" style={{ width: "34px", height: "34px" }}>
                      <a
                        href={data?.socials?.[platform] || '#'}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => {
                          if (isEditMode) {
                            e.preventDefault();
                            setIsSocialModalOpen(true);
                          }
                        }}
                        className="flex h-full w-full items-center justify-center rounded-md border border-white/10 bg-white/5 text-[var(--text-secondary)] hover:text-[#00d9ff] hover:border-[#00d9ff66] transition-colors"
                        title={platform}
                      >
                        {getSocialIcon(platform, "w-4 h-4")}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Right Column (Hidden on mobile / when isMobileViewport) */}
          <div className={`relative ${isMobileViewport ? 'hidden' : 'hidden md:flex'} flex-col items-center justify-center`} style={{ width: "300px", opacity: "1", transform: "none" }}>
            <div style={{ position: "absolute", top: "-18px", left: "-28px", background: "rgba(0, 217, 255, 0.06)", border: "1px solid rgba(0, 217, 255, 0.19)", borderRadius: "8px", padding: "5px 10px", fontFamily: "DM Mono, monospace", fontSize: "10px", color: "rgba(0, 217, 255, 0.8)", letterSpacing: "0.12em", whiteSpace: "nowrap", backdropFilter: "blur(8px)", zIndex: "20" }}>
              REACT · TYPESCRIPT
            </div>
            <div style={{ position: "absolute", top: "20px", right: "-36px", background: "rgba(74, 222, 128, 0.06)", border: "1px solid rgba(74, 222, 128, 0.19)", borderRadius: "8px", padding: "5px 10px", fontFamily: "DM Mono, monospace", fontSize: "10px", color: "rgba(74, 222, 128, 0.8)", letterSpacing: "0.12em", whiteSpace: "nowrap", backdropFilter: "blur(8px)", zIndex: "20" }}>
              ▲ FULL-STACK ARCHITECT
            </div>
            <div style={{ position: "absolute", bottom: "80px", right: "-40px", background: "rgba(167, 139, 250, 0.06)", border: "1px solid rgba(167, 139, 250, 0.19)", borderRadius: "8px", padding: "5px 10px", fontFamily: "DM Mono, monospace", fontSize: "10px", color: "rgba(167, 139, 250, 0.8)", letterSpacing: "0.12em", whiteSpace: "nowrap", backdropFilter: "blur(8px)", zIndex: "20" }}>
              ⚙ CLOUD & DEVOPS
            </div>

            <div style={{ width: "100%", height: "380px", perspective: "1000px", cursor: "pointer" }}>
              <div style={{ position: "relative", width: "100%", height: "100%", transformStyle: "preserve-3d", transition: "transform 0.7s cubic-bezier(0.4, 0.2, 0.2, 1)" }}>
                {/* Desktop Front Card */}
                <div style={{ position: "absolute", inset: "0", backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", borderRadius: "24px", overflow: "hidden", border: "1px solid rgba(0,217,255,0.12)", boxShadow: "0 0 60px rgba(0,217,255,0.04), 0 32px 80px rgba(0,0,0,0.4)" }}>
                  <div className="relative group/avatar cursor-pointer w-full h-full" onClick={() => isEditMode && setIsImagePickerOpen(true)}>
                    <img
                      className="object-cover"
                      style={{ position: "absolute", inset: "0", width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", zIndex: "1" }}
                      src={displayAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80"}
                      alt={data?.name || "Avatar"}
                    />
                    {isEditMode && (
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center rounded-inherit z-20">
                        <RiCameraLine className="w-6 h-6 text-white" />
                      </div>
                    )}
                  </div>
                  <div style={{ position: "absolute", inset: "0", backgroundImage: "linear-gradient(rgba(0,217,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,217,255,0.03) 1px,transparent 1px)", backgroundSize: "24px 24px", zIndex: "2", pointerEvents: "none" }} />
                  <div style={{ position: "absolute", top: "0", left: "0", width: "24px", height: "24px", borderTop: "1.5px solid rgba(0,217,255,0.35)", borderLeft: "1.5px solid rgba(0,217,255,0.35)", margin: "12px", zIndex: "4" }} />
                  <div style={{ position: "absolute", top: "0", right: "0", transform: "scaleX(-1)", width: "24px", height: "24px", borderTop: "1.5px solid rgba(0,217,255,0.35)", borderLeft: "1.5px solid rgba(0,217,255,0.35)", margin: "12px", zIndex: "4" }} />
                  <div style={{ position: "absolute", bottom: "0", left: "0", transform: "scaleY(-1)", width: "24px", height: "24px", borderTop: "1.5px solid rgba(0,217,255,0.35)", borderLeft: "1.5px solid rgba(0,217,255,0.35)", margin: "12px", zIndex: "4" }} />
                  <div style={{ position: "absolute", bottom: "0", right: "0", transform: "scale(-1)", width: "24px", height: "24px", borderTop: "1.5px solid rgba(0,217,255,0.35)", borderLeft: "1.5px solid rgba(0,217,255,0.35)", margin: "12px", zIndex: "4" }} />
                  <div style={{ position: "absolute", left: "0px", right: "0px", height: "1px", background: "linear-gradient(90deg, transparent, rgba(0, 217, 255, 0.4), transparent)", pointerEvents: "none", zIndex: "3", top: "31.2857%" }} />
                </div>

                {/* Desktop Back Card */}
                <div style={{ position: "absolute", inset: "0", backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", transform: "rotateY(180deg)", borderRadius: "24px", overflow: "hidden", border: "1px solid rgba(167,139,250,0.2)", boxShadow: "0 0 60px rgba(167,139,250,0.06), 0 32px 80px rgba(0,0,0,0.4)" }}>
                  <div className="relative group/avatar cursor-pointer w-full h-full" onClick={() => isEditMode && setIsImagePickerOpen(true)}>
                    <img
                      className="object-cover"
                      style={{ position: "absolute", inset: "0", width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", zIndex: "1" }}
                      src={displayAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80"}
                      alt={data?.name || "Avatar"}
                    />
                    {isEditMode && (
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center rounded-inherit z-20">
                        <RiCameraLine className="w-6 h-6 text-white" />
                      </div>
                    )}
                  </div>
                  <div style={{ position: "absolute", inset: "0", backgroundImage: "linear-gradient(rgba(167,139,250,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(167,139,250,0.04) 1px,transparent 1px)", backgroundSize: "24px 24px", zIndex: "2", pointerEvents: "none" }} />
                  <div style={{ position: "absolute", bottom: "0", left: "0", right: "0", padding: "12px 16px", background: "linear-gradient(to top,rgba(0,0,0,0.8),transparent)", display: "flex", justifyContent: "space-between", zIndex: "4" }}>
                    <span style={{ fontFamily: "DM Mono,monospace", fontSize: "9px", color: "rgba(167,139,250,0.75)", letterSpacing: "0.15em" }}>DEVELOPER</span>
                    <span style={{ fontFamily: "DM Mono,monospace", fontSize: "9px", color: "rgba(245,158,11,0.75)", letterSpacing: "0.15em" }}>PORTFOLIO</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop Social Bar */}
            <div className="mt-5">
              <div className="flex h-[52px] items-center gap-2 rounded-2xl bg-white/5 px-2 border border-white/10 backdrop-blur-lg">
                {['email', 'github', 'linkedin', 'twitter'].map((platform) => (
                  <div key={platform} className="flex items-center justify-center" style={{ width: "36px", height: "36px" }}>
                    <a
                      href={data?.socials?.[platform] || '#'}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => {
                        if (isEditMode) {
                          e.preventDefault();
                          setIsSocialModalOpen(true);
                        }
                      }}
                      className="flex h-full w-full items-center justify-center rounded-md border border-white/10 bg-white/5 text-[var(--text-secondary)] hover:text-[#00d9ff] hover:border-[#00d9ff66] transition-colors"
                      title={platform}
                    >
                      {getSocialIcon(platform, "w-5 h-5")}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 opacity-25 pointer-events-none">
          <div className="w-px h-8 bg-[var(--text-primary)]" style={{ transform: "scaleY(0.5)" }} />
        </div>
      </section>

      {isImagePickerOpen && (
        <ImagePickerModal
          isOpen={isImagePickerOpen}
          onClose={() => setIsImagePickerOpen(false)}
          onSave={(url) => updateSectionField(sectionId, 'avatar', url)}
          currentImage={displayAvatar}
        />
      )}
      {isSocialModalOpen && (
        <SocialLinksModal
          isOpen={isSocialModalOpen}
          onClose={() => setIsSocialModalOpen(false)}
          socials={data?.socials || {}}
          onSave={(newSocials) => updateSectionField(sectionId, 'socials', newSocials)}
        />
      )}
    </>
  );
};