import React, { useState } from 'react';
import { EditableText } from '../../common/EditableText';
import { usePortfolio } from '../../../context/PortfolioContext';
import { ImagePickerModal } from '../../common/ImagePickerModal';
import { RiCameraLine } from 'react-icons/ri';

export const ModernFullstackHero = ({ data = {}, sectionId }) => {
  const { updateSectionField, isEditMode, effectiveAvatar, githubUsername, isMobileViewport } = usePortfolio();
  const [isImagePickerOpen, setIsImagePickerOpen] = useState(false);
  const isUnsplash = !data?.avatar || data.avatar.includes('unsplash.com');
  const displayAvatar = isUnsplash
    ? (effectiveAvatar || (githubUsername ? `https://github.com/${githubUsername}.png` : ''))
    : data.avatar;

  return (
    <>
      <section id={sectionId} className={`modern-fullstack-hero relative ${isMobileViewport ? 'py-10 px-4' : 'py-20 px-6'} max-w-5xl mx-auto text-center space-y-6 overflow-hidden max-w-full`}>
        <div className="flex justify-center mb-4">
          <div
            className="relative group/avatar cursor-pointer inline-block"
            onClick={() => isEditMode && setIsImagePickerOpen(true)}
          >
            <img
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-2 border-pink-500/80 shadow-xl transition-all duration-300 group-hover/avatar:scale-105 group-hover/avatar:shadow-pink-500/30"
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

        <h1 className="break-words max-w-full text-4xl md:text-6xl font-bold tracking-tight">
          <EditableText value={data?.name || 'Modern Developer'} onChange={(val) => updateSectionField(sectionId, 'name', val)} />
        </h1>
        <p className="text-xl md:text-2xl text-zinc-300 font-medium">
          <EditableText value={data?.title || 'Full Stack Engineer'} onChange={(val) => updateSectionField(sectionId, 'title', val)} />
        </p>
        <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto">
          <EditableText value={data?.tagline || 'Crafting modern full-stack web experiences with high fidelity.'} onChange={(val) => updateSectionField(sectionId, 'tagline', val)} />
        </p>
        {data?.primaryCta && (
          <div className="pt-4">
            <a href={data.primaryCta.url || '#'} className="modern-fullstack-glow inline-block px-6 py-3 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-semibold transition-all shadow-lg">
              {data.primaryCta.text || 'Explore Work'}
            </a>
          </div>
        )}
      </section>

      {isImagePickerOpen && (
        <ImagePickerModal
          isOpen={isImagePickerOpen}
          onClose={() => setIsImagePickerOpen(false)}
          onSave={(url) => updateSectionField(sectionId, 'avatar', url)}
          currentImage={displayAvatar}
        />
      )}
    </>
  );
};