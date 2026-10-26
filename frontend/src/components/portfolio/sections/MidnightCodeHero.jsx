import React, { useState } from 'react';
import { EditableText } from '../../common/EditableText';
import { usePortfolio } from '../../../context/PortfolioContext';
import { getSocialIcon } from '../../common/BrandIcons';
import { ImagePickerModal } from '../../common/ImagePickerModal';
import { SocialLinksModal } from '../../common/SocialLinksModal';
import { RiCameraLine } from 'react-icons/ri';

export const MidnightCodeHero = ({ data = {}, sectionId }) => {
  const { updateSectionField, isEditMode, effectiveAvatar, githubUsername, isMobileViewport } = usePortfolio();
  const [isImagePickerOpen, setIsImagePickerOpen] = useState(false);
  const [isSocialModalOpen, setIsSocialModalOpen] = useState(false);
  const isUnsplash = !data?.avatar || data.avatar.includes('unsplash.com');
  const displayAvatar = isUnsplash
    ? (effectiveAvatar || (githubUsername ? `https://github.com/${githubUsername}.png` : ''))
    : data.avatar;
  return (
    <>
      <header className={`relative ${isMobileViewport ? 'py-8 px-4' : 'py-20 md:py-28 px-6 md:px-12'} overflow-hidden max-w-full lg:sticky lg:top-0 lg:flex lg:max-h-screen lg:w-[48%] lg:flex-col lg:justify-between lg:py-24`} id={sectionId}>
        <div>
          <div className="mb-6 flex justify-start">
            <div className="relative group/avatar cursor-pointer inline-block" onClick={() => isEditMode && setIsImagePickerOpen(true)}>
              <img
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-2 border-slate-700/80 shadow-xl transition-all duration-300 group-hover/avatar:border-teal-400/80 group-hover/avatar:scale-105"
                src={displayAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"}
                alt={data?.name || "Avatar"}
              />
              {isEditMode && (
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center rounded-full z-20">
                  <RiCameraLine className="w-6 h-6 text-white" />
                </div>
              )}
            </div>
          </div>
          <h1 className="break-words max-w-full text-4xl font-bold tracking-tight text-slate-200 sm:text-5xl">
            <EditableText value={data?.name || 'Your Name'} as="h1" />
          </h1>
          <h2 className="break-words max-w-full mt-3 text-lg font-medium tracking-tight text-teal-300 sm:text-xl">
            <EditableText value={data?.title || data?.role || 'Full Stack Engineer'} as="h2" />
          </h2>
          <p className="mt-4 max-w-xs leading-normal text-slate-400">
            <EditableText value={data?.tagline || (Array.isArray(data?.bio) ? data.bio[0] : data?.bio) || 'Building scalable, high-performance web applications.'} as="p" />
          </p>
          <nav className="nav hidden lg:block" aria-label="In-page jump links">
            <ul className="mt-16 w-max">
              <li><a className="group flex items-center py-3 active" href="#about"><span className="nav-indicator mr-4 h-px w-8 bg-slate-600 transition-all group-hover:w-16 group-hover:bg-slate-200 group-focus-visible:w-16 group-focus-visible:bg-slate-200 motion-reduce:transition-none"></span> <span className="nav-text text-xs font-bold uppercase tracking-widest text-slate-500 group-hover:text-slate-200 group-focus-visible:text-slate-200">About</span></a></li>
              <li><a className="group flex items-center py-3" href="#experience"><span className="nav-indicator mr-4 h-px w-8 bg-slate-600 transition-all group-hover:w-16 group-hover:bg-slate-200 group-focus-visible:w-16 group-focus-visible:bg-slate-200 motion-reduce:transition-none"></span> <span className="nav-text text-xs font-bold uppercase tracking-widest text-slate-500 group-hover:text-slate-200 group-focus-visible:text-slate-200">Experience</span></a></li>
              <li><a className="group flex items-center py-3" href="#projects"><span className="nav-indicator mr-4 h-px w-8 bg-slate-600 transition-all group-hover:w-16 group-hover:bg-slate-200 group-focus-visible:w-16 group-focus-visible:bg-slate-200 motion-reduce:transition-none"></span> <span className="nav-text text-xs font-bold uppercase tracking-widest text-slate-500 group-hover:text-slate-200 group-focus-visible:text-slate-200">Projects</span></a></li>
            </ul>
          </nav>
        </div>
        <ul className="ml-1 mt-8 flex items-center gap-5" aria-label="Social media">
          {['github', 'linkedin', 'twitter', 'instagram', 'email'].map((platform) => {
            const link = data?.socials?.[platform] || (platform === 'github' && githubUsername ? `https://github.com/${githubUsername}` : '');
            return (
              <li key={platform} className="shrink-0 text-xs">
                <a
                  href={link || '#'}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => {
                    if (isEditMode) {
                      e.preventDefault();
                      setIsSocialModalOpen(true);
                    }
                  }}
                  className="block text-slate-400 hover:text-teal-300 transition-colors"
                  title={platform}
                >
                  {getSocialIcon(platform, "w-5 h-5")}
                </a>
              </li>
            );
          })}
        </ul>
      </header>

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