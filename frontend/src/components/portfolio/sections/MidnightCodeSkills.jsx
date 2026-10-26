import React, { useState } from 'react';
import { EditableText } from '../../common/EditableText';
import { usePortfolio } from '../../../context/PortfolioContext';
import { getSocialIcon } from '../../common/BrandIcons';
import { ImagePickerModal } from '../../common/ImagePickerModal';
import { SocialLinksModal } from '../../common/SocialLinksModal';
import { RiCameraLine } from 'react-icons/ri';

export const MidnightCodeSkills = ({ data = {}, sectionId }) => {
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
    <section className={`relative ${isMobileViewport ? 'py-8 px-4' : 'py-20 md:py-28 px-6 md:px-12'} overflow-hidden max-w-full mb-16 scroll-mt-16 md:mb-24 lg:mb-36 lg:scroll-mt-24`} id={sectionId} aria-label="Skills & Technologies">
      <div className="sticky top-0 z-20 -mx-6 mb-4 w-screen bg-slate-900/75 px-6 py-5 backdrop-blur md:-mx-12 md:px-12 lg:sr-only lg:relative lg:top-auto lg:mx-auto lg:w-full lg:px-0 lg:py-0 lg:opacity-0">
        <h2 className="break-words max-w-full text-sm font-bold uppercase tracking-widest text-slate-200 lg:sr-only">
          <EditableText value={data?.heading || 'Skills'} as="h2" />
        </h2>
      </div>
      <div className="space-y-8">
        {categories.map((cat, cIdx) => (
          <div key={cat?.id || cIdx} className="rounded-xl border border-slate-800/80 bg-slate-800/30 p-5 backdrop-blur-sm transition-all hover:border-slate-700/80">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-300 mb-3.5">
              {cat?.name || 'Skills'}
            </h3>
            <div className="flex flex-wrap gap-2">
              {(cat?.skills || []).map((skill, sIdx) => (
                <span
                  key={sIdx}
                  className="inline-flex items-center rounded-full bg-teal-400/10 px-3.5 py-1 text-xs font-medium text-teal-300 border border-teal-500/20 shadow-sm transition hover:bg-teal-400/20 hover:border-teal-400/40"
                >
                  {typeof skill === 'string' ? skill : (skill?.name || '')}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};