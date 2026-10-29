import React, { useState } from 'react';
import { EditableText } from '../../common/EditableText';
import { usePortfolio } from '../../../context/PortfolioContext';
import { getSocialIcon } from '../../common/BrandIcons';
import { ImagePickerModal } from '../../common/ImagePickerModal';
import { SocialLinksModal } from '../../common/SocialLinksModal';
import { RiCameraLine } from 'react-icons/ri';

export const MidnightCodeAbout = ({ data = {}, sectionId }) => {
  const { updateSectionField, isEditMode, isMobileViewport } = usePortfolio();
  const fallbackBio = "I'm a passionate software engineer focused on building clean, accessible, and high-performance digital experiences.";
  const bioParagraphs = Array.isArray(data?.bio)
    ? data.bio
    : (typeof data?.bio === 'string' && data.bio.trim()
        ? data.bio.split('\n\n').filter(Boolean)
        : [fallbackBio]);

  return (
    <section className={`relative ${isMobileViewport ? 'py-8 px-4' : 'py-20 md:py-28 px-6 md:px-12'} overflow-hidden max-w-full mb-16 scroll-mt-16 md:mb-24 lg:mb-36 lg:scroll-mt-24`} id={sectionId} aria-label="About me">
      <div className="sticky top-0 z-20 -mx-6 mb-4 w-screen bg-slate-900/75 px-6 py-5 backdrop-blur md:-mx-12 md:px-12 lg:sr-only lg:relative lg:top-auto lg:mx-auto lg:w-full lg:px-0 lg:py-0 lg:opacity-0">
        <h2 className="break-words max-w-full text-sm font-bold uppercase tracking-widest text-slate-200 lg:sr-only">
          <EditableText value={data?.heading || 'About'} as="h2" />
        </h2>
      </div>
      <div className="space-y-4 text-slate-400 leading-relaxed text-sm sm:text-base">
        {bioParagraphs.map((para, idx) => (
          <p key={idx} className="mb-4">
            <EditableText value={para} as="p" />
          </p>
        ))}
      </div>
    </section>
  );
};