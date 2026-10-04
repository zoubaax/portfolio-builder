import React, { useState } from 'react';
import { ArrowUpRight, Terminal, Sparkles, Mail } from 'lucide-react';
import { getSocialIcon } from '../../common/BrandIcons';
import { EditableText } from '../../common/EditableText';
import { ImagePickerModal } from '../../common/ImagePickerModal';
import { SocialLinksModal } from '../../common/SocialLinksModal';
import { usePortfolio } from '../../../context/PortfolioContext';
import { RiCameraLine, RiAddLine } from 'react-icons/ri';

export const HeroSection = ({ data, variant = 'split-portrait', sectionId }) => {
  const { updateSectionField, isEditMode, isMobileViewport } = usePortfolio();
  const { badge, name, title, tagline, avatar, primaryCta, secondaryCta, socials } = data || {};
  const [isImagePickerOpen, setIsImagePickerOpen] = useState(false);
  const [isSocialModalOpen, setIsSocialModalOpen] = useState(false);

  // 1. Split Portrait Variant
  if (variant === 'split-portrait') {
    return (
      <section className={`relative ${isMobileViewport ? 'py-8 px-4' : 'py-16 md:py-24 px-6 md:px-12'} max-w-6xl mx-auto`}>
        <div className={`grid grid-cols-1 ${isMobileViewport ? 'gap-8' : 'lg:grid-cols-12 gap-12'} items-center`}>
          <div className={`${isMobileViewport ? 'col-span-1 space-y-5 text-center sm:text-left' : 'lg:col-span-7 space-y-6'}`}>
            {badge !== undefined && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border"
                   style={{
                     backgroundColor: 'var(--theme-surface)',
                     borderColor: 'var(--theme-border)',
                     color: 'var(--theme-accent)'
                   }}>
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--theme-accent)' }} />
                <EditableText
                  value={badge}
                  onSave={(val) => updateSectionField(sectionId, 'badge', val)}
                  singleLine
                  placeholder="Add badge text..."
                />
              </div>
            )}

            <div className="space-y-2">
              <EditableText
                as="h1"
                value={name}
                onSave={(val) => updateSectionField(sectionId, 'name', val)}
                singleLine
                className={`${isMobileViewport ? 'text-3xl sm:text-4xl' : 'text-4xl sm:text-5xl md:text-6xl'} font-extrabold tracking-tight leading-[1.15] block`}
                style={{ fontFamily: 'var(--theme-heading-font)', color: 'var(--theme-text-primary)' }}
                placeholder="Your Name"
              />
              <EditableText
                as="p"
                value={title}
                onSave={(val) => updateSectionField(sectionId, 'title', val)}
                singleLine
                className={`${isMobileViewport ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl'} font-medium block`}
                style={{ color: 'var(--theme-accent)' }}
                placeholder="Your Professional Title"
              />
            </div>

            <EditableText
              as="p"
              value={tagline}
              onSave={(val) => updateSectionField(sectionId, 'tagline', val)}
              className={`${isMobileViewport ? 'text-sm' : 'text-base sm:text-lg'} leading-relaxed max-w-xl block ${isMobileViewport ? 'mx-auto sm:mx-0' : ''}`}
              style={{ color: 'var(--theme-text-secondary)', fontFamily: 'var(--theme-body-font)' }}
              placeholder="Your professional tagline or mission..."
            />

            <div className={`flex flex-wrap items-center gap-3 pt-2 ${isMobileViewport ? 'justify-center sm:justify-start' : ''}`}>
              {primaryCta && (
                <a href={primaryCta.link || '#projects'}
                   className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 shadow-lg hover:opacity-90 active:scale-95"
                   style={{
                     backgroundColor: 'var(--theme-accent)',
                     color: '#ffffff',
                   }}>
                  <EditableText
                    value={primaryCta.text}
                    onSave={(val) => updateSectionField(sectionId, 'primaryCta.text', val)}
                    singleLine
                  />
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              )}
              {secondaryCta && (
                <a href={secondaryCta.link || '#contact'}
                   className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 border hover:bg-white/5 active:scale-95"
                   style={{
                     borderColor: 'var(--theme-border)',
                     color: 'var(--theme-text-primary)',
                     backgroundColor: 'var(--theme-surface)'
                   }}>
                  <EditableText
                    value={secondaryCta.text}
                    onSave={(val) => updateSectionField(sectionId, 'secondaryCta.text', val)}
                    singleLine
                  />
                </a>
              )}
            </div>

            {(socials?.length > 0 || isEditMode) && (
              <div className="flex items-center gap-3 pt-4 border-t flex-wrap" style={{ borderColor: 'var(--theme-border)' }}>
                <span className="text-xs uppercase tracking-wider font-semibold" style={{ color: 'var(--theme-text-secondary)' }}>
                  Connect
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  {socials?.map((s, idx) => (
                    <a
                      key={idx}
                      href={isEditMode ? '#' : s.url}
                      onClick={(e) => {
                        if (isEditMode) {
                          e.preventDefault();
                          setIsSocialModalOpen(true);
                        }
                      }}
                      target={isEditMode ? undefined : "_blank"}
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg border transition-all hover:scale-105 cursor-pointer relative group/social"
                      style={{
                        backgroundColor: 'var(--theme-surface)',
                        borderColor: 'var(--theme-border)',
                        color: 'var(--theme-text-secondary)'
                      }}
                      title={isEditMode ? `Manage ${s.platform}` : s.platform}
                    >
                      {getSocialIcon(s.platform, 'w-4 h-4')}
                    </a>
                  ))}

                  {isEditMode && (
                    <button
                      type="button"
                      onClick={() => setIsSocialModalOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed text-xs font-medium transition-all hover:border-indigo-400 hover:text-indigo-400 cursor-pointer"
                      style={{
                        borderColor: 'var(--theme-border)',
                        color: 'var(--theme-text-secondary)',
                        backgroundColor: 'rgba(255,255,255,0.02)'
                      }}
                    >
                      <RiAddLine className="w-3.5 h-3.5" />
                      <span>{socials?.length > 0 ? 'Edit Contacts' : 'Add Contact'}</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className={`${isMobileViewport ? 'col-span-1 order-first sm:order-last' : 'lg:col-span-5'} flex justify-center`}>
            <div className="relative group">
              <div className="absolute -inset-1 rounded-3xl blur-2xl opacity-40 transition duration-500 group-hover:opacity-75"
                   style={{ background: 'radial-gradient(circle, var(--theme-accent), transparent 70%)' }} />
              <div
                className={`relative ${isMobileViewport ? 'w-48 h-48 sm:w-60 sm:h-60' : 'w-64 h-64 sm:w-80 sm:h-80'} rounded-3xl overflow-hidden border p-2 group/avatar transition-all ${
                  isEditMode ? 'cursor-pointer hover:border-indigo-500' : ''
                }`}
                onClick={() => isEditMode && setIsImagePickerOpen(true)}
                style={{
                  backgroundColor: 'var(--theme-surface)',
                  borderColor: 'var(--theme-border)'
                }}
              >
                <img src={avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                     alt={name}
                     className="w-full h-full object-cover rounded-2xl filter saturate-[1.05] contrast-[1.02]" />

                {isEditMode && (
                  <div className="absolute inset-2 rounded-2xl bg-black/60 backdrop-blur-xs opacity-0 group-hover/avatar:opacity-100 flex flex-col items-center justify-center text-white gap-2 transition-all">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white shadow-lg">
                      <RiCameraLine className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider bg-black/70 px-3 py-1 rounded-full border border-white/20">
                      Change Photo
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Avatar Image Picker Modal */}
        <ImagePickerModal
          isOpen={isImagePickerOpen}
          onClose={() => setIsImagePickerOpen(false)}
          currentImage={avatar}
          onSave={(newImg) => updateSectionField(sectionId, 'avatar', newImg)}
          title="Change Profile Photo"
        />

        {/* Social & Contact Links Modal */}
        <SocialLinksModal
          isOpen={isSocialModalOpen}
          onClose={() => setIsSocialModalOpen(false)}
          socials={socials || []}
          onSave={(newSocials) => updateSectionField(sectionId, 'socials', newSocials)}
        />
      </section>
    );
  }

  // 2. Terminal Dev Variant
  if (variant === 'terminal-dev') {
    return (
      <section className="relative py-16 md:py-24 px-6 md:px-12 max-w-5xl mx-auto">
        <div className="rounded-2xl border overflow-hidden shadow-2xl backdrop-blur-xl"
             style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)' }}>
          {/* Terminal Window Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b"
               style={{ borderColor: 'var(--theme-border)', backgroundColor: 'rgba(0,0,0,0.3)' }}>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="ml-2 text-xs font-mono opacity-60" style={{ color: 'var(--theme-text-secondary)' }}>
                bash ~ /portfolio/profile.sh
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-mono" style={{ color: 'var(--theme-accent)' }}>
              <Terminal className="w-3.5 h-3.5" />
              <span>ready</span>
            </div>
          </div>

          {/* Terminal Content */}
          <div className="p-6 md:p-10 space-y-6 font-mono">
            <div>
              <p className="text-xs opacity-60 mb-1" style={{ color: 'var(--theme-text-secondary)' }}>
                $ whoami
              </p>
              <EditableText
                as="h1"
                value={name}
                onSave={(val) => updateSectionField(sectionId, 'name', val)}
                singleLine
                className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight block"
                style={{ color: 'var(--theme-text-primary)', fontFamily: 'var(--theme-heading-font)' }}
              />
              <div className="flex items-center gap-1 mt-1 text-lg font-semibold" style={{ color: 'var(--theme-accent)' }}>
                <span>//</span>
                <EditableText
                  value={title}
                  onSave={(val) => updateSectionField(sectionId, 'title', val)}
                  singleLine
                />
              </div>
            </div>

            <div>
              <p className="text-xs opacity-60 mb-1" style={{ color: 'var(--theme-text-secondary)' }}>
                $ cat about.txt
              </p>
              <EditableText
                as="p"
                value={tagline}
                onSave={(val) => updateSectionField(sectionId, 'tagline', val)}
                className="text-sm sm:text-base leading-relaxed max-w-2xl block"
                style={{ color: 'var(--theme-text-secondary)', fontFamily: 'var(--theme-body-font)' }}
              />
            </div>

            <div className="pt-2 flex flex-wrap gap-4">
              <a href={primaryCta?.link || '#projects'}
                 className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all"
                 style={{ backgroundColor: 'var(--theme-accent)', color: '#ffffff' }}>
                $ ./view-work.sh <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
              <a href={secondaryCta?.link || '#contact'}
                 className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider border"
                 style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-text-primary)' }}>
                $ ping contact
              </a>
            </div>

            {(socials?.length > 0 || isEditMode) && (
              <div className="pt-3 border-t border-white/5 flex items-center gap-2 flex-wrap text-xs">
                <span className="opacity-50" style={{ color: 'var(--theme-text-secondary)' }}>$ links:</span>
                {socials?.map((s, idx) => (
                  <a
                    key={idx}
                    href={isEditMode ? '#' : s.url}
                    onClick={(e) => {
                      if (isEditMode) {
                        e.preventDefault();
                        setIsSocialModalOpen(true);
                      }
                    }}
                    target={isEditMode ? undefined : "_blank"}
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border transition-all hover:scale-105 cursor-pointer"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      borderColor: 'var(--theme-border)',
                      color: 'var(--theme-accent)'
                    }}
                    title={isEditMode ? `Manage ${s.platform}` : s.platform}
                  >
                    {getSocialIcon(s.platform, 'w-3.5 h-3.5')}
                    <span className="capitalize">{s.platform}</span>
                  </a>
                ))}
                {isEditMode && (
                  <button
                    type="button"
                    onClick={() => setIsSocialModalOpen(true)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-dashed text-xs opacity-75 hover:opacity-100 hover:border-indigo-400 hover:text-indigo-400 cursor-pointer transition-all"
                    style={{
                      borderColor: 'var(--theme-border)',
                      color: 'var(--theme-text-secondary)'
                    }}
                  >
                    <RiAddLine className="w-3.5 h-3.5" />
                    <span>{socials?.length > 0 ? 'Edit Contacts' : 'Add Contact'}</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Social & Contact Links Modal */}
        <SocialLinksModal
          isOpen={isSocialModalOpen}
          onClose={() => setIsSocialModalOpen(false)}
          socials={socials || []}
          onSave={(newSocials) => updateSectionField(sectionId, 'socials', newSocials)}
        />
      </section>
    );
  }

  // 3. Minimal Centered Variant (Editorial / Swiss)
  return (
    <section className="relative py-20 md:py-32 px-6 max-w-4xl mx-auto text-center">
      {badge && (
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border mb-6"
             style={{
               backgroundColor: 'var(--theme-surface)',
               borderColor: 'var(--theme-border)',
               color: 'var(--theme-accent)'
             }}>
          <Sparkles className="w-3 h-3" />
          <EditableText
            value={badge}
            onSave={(val) => updateSectionField(sectionId, 'badge', val)}
            singleLine
          />
        </div>
      )}

      <EditableText
        as="h1"
        value={name}
        onSave={(val) => updateSectionField(sectionId, 'name', val)}
        singleLine
        className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-4 block"
        style={{ fontFamily: 'var(--theme-heading-font)', color: 'var(--theme-text-primary)' }}
      />

      <EditableText
        as="p"
        value={title}
        onSave={(val) => updateSectionField(sectionId, 'title', val)}
        singleLine
        className="text-xl sm:text-2xl font-light italic mb-6 max-w-2xl mx-auto block"
        style={{ color: 'var(--theme-text-secondary)' }}
      />

      <EditableText
        as="p"
        value={tagline}
        onSave={(val) => updateSectionField(sectionId, 'tagline', val)}
        className="text-base sm:text-lg max-w-xl mx-auto leading-relaxed mb-8 block"
        style={{ color: 'var(--theme-text-secondary)', fontFamily: 'var(--theme-body-font)' }}
      />

      <div className="flex justify-center items-center gap-4">
        {primaryCta && (
          <a href={primaryCta.link || '#projects'}
             className="px-6 py-3 rounded-full text-sm font-semibold transition-all hover:scale-105"
             style={{ backgroundColor: 'var(--theme-accent)', color: '#ffffff' }}>
            {primaryCta.text}
          </a>
        )}
        {secondaryCta && (
          <a href={secondaryCta.link || '#contact'}
             className="px-6 py-3 rounded-full text-sm font-medium border hover:bg-white/5 transition-all"
             style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-text-primary)' }}>
            {secondaryCta.text}
          </a>
        )}
      </div>

      {(socials?.length > 0 || isEditMode) && (
        <div className="flex justify-center items-center gap-3 mt-8 flex-wrap">
          {socials?.map((s, idx) => (
            <a
              key={idx}
              href={isEditMode ? '#' : s.url}
              onClick={(e) => {
                if (isEditMode) {
                  e.preventDefault();
                  setIsSocialModalOpen(true);
                }
              }}
              target={isEditMode ? undefined : "_blank"}
              rel="noopener noreferrer"
              className="p-2.5 rounded-full border transition-all hover:scale-110 cursor-pointer"
              style={{
                backgroundColor: 'var(--theme-surface)',
                borderColor: 'var(--theme-border)',
                color: 'var(--theme-text-secondary)'
              }}
              title={isEditMode ? `Manage ${s.platform}` : s.platform}
            >
              {getSocialIcon(s.platform, 'w-4 h-4')}
            </a>
          ))}
          {isEditMode && (
            <button
              type="button"
              onClick={() => setIsSocialModalOpen(true)}
              className="p-2.5 rounded-full border border-dashed flex items-center justify-center transition-all hover:border-indigo-400 hover:text-indigo-400 cursor-pointer"
              style={{
                backgroundColor: 'var(--theme-surface)',
                borderColor: 'var(--theme-border)',
                color: 'var(--theme-text-secondary)'
              }}
              title={socials?.length > 0 ? 'Edit Contacts' : 'Add Contact'}
            >
              <RiAddLine className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Social & Contact Links Modal */}
      <SocialLinksModal
        isOpen={isSocialModalOpen}
        onClose={() => setIsSocialModalOpen(false)}
        socials={socials || []}
        onSave={(newSocials) => updateSectionField(sectionId, 'socials', newSocials)}
      />
    </section>
  );
};
