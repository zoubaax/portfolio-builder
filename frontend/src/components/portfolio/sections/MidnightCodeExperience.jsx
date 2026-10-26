import React, { useState } from 'react';
import { EditableText } from '../../common/EditableText';
import { usePortfolio } from '../../../context/PortfolioContext';
import { getSocialIcon } from '../../common/BrandIcons';
import { ImagePickerModal } from '../../common/ImagePickerModal';
import { SocialLinksModal } from '../../common/SocialLinksModal';
import { RiCameraLine } from 'react-icons/ri';

export const MidnightCodeExperience = ({ data = {}, sectionId }) => {
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
    <section className={`relative ${isMobileViewport ? 'py-8 px-4' : 'py-20 md:py-28 px-6 md:px-12'} overflow-hidden max-w-full mb-16 scroll-mt-16 md:mb-24 lg:mb-36 lg:scroll-mt-24`} id={sectionId} aria-label="Work experience">
      <div className="sticky top-0 z-20 -mx-6 mb-4 w-screen bg-slate-900/75 px-6 py-5 backdrop-blur md:-mx-12 md:px-12 lg:sr-only lg:relative lg:top-auto lg:mx-auto lg:w-full lg:px-0 lg:py-0 lg:opacity-0">
        <h2 className="break-words max-w-full text-sm font-bold uppercase tracking-widest text-slate-200 lg:sr-only">
          <EditableText value={data?.heading || 'Experience'} as="h2" />
        </h2>
      </div>
      <div>
        <ol className="group/list">
          {expList.map((exp, index) => {
            const role = exp?.role || exp?.title || 'Software Engineer';
            const company = exp?.company || exp?.organization || '';
            const period = exp?.period || exp?.duration || exp?.year || '2023 — Present';
            const desc = exp?.description || exp?.summary || '';
            const skills = Array.isArray(exp?.skills) ? exp.skills : (Array.isArray(exp?.technologies) ? exp.technologies : []);
            return (
              <li key={exp?.id || index} className="mb-12">
                <div className="group relative grid pb-1 transition-all sm:grid-cols-8 sm:gap-8 md:gap-4 lg:hover:!opacity-100 lg:group-hover/list:opacity-50">
                  <div className="absolute -inset-x-4 -inset-y-4 z-0 hidden rounded-md transition motion-reduce:transition-none lg:-inset-x-6 lg:block lg:group-hover:bg-slate-800/50 lg:group-hover:shadow-[inset_0_1px_0_0_rgba(148,163,184,0.1)] lg:group-hover:drop-shadow-lg"></div>
                  <header className="z-10 mb-2 mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:col-span-2">
                    {period}
                  </header>
                  <div className="z-10 sm:col-span-6">
                    <h3 className="break-words max-w-full font-medium leading-snug text-slate-200 text-base">
                      <span className="inline-flex items-baseline font-medium leading-tight text-slate-200 group/link text-base">
                        {role} {company && <span className="text-teal-300">· {company}</span>}
                      </span>
                    </h3>
                    {desc && <p className="mt-2 text-sm leading-normal text-slate-400">{desc}</p>}
                    {skills.length > 0 && (
                      <ul className="mt-2 flex flex-wrap" aria-label="Technologies used">
                        {skills.map((skill, sIdx) => (
                          <li key={sIdx} className="mr-1.5 mt-2">
                            <div className="flex items-center rounded-full bg-teal-400/10 px-3 py-1 text-xs font-medium leading-5 text-teal-300">
                              {typeof skill === 'string' ? skill : (skill?.name || '')}
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
        {data?.resumeUrl && (
          <div className="mt-12">
            <a className="inline-flex items-baseline font-medium leading-tight text-teal-300 hover:text-teal-200 font-semibold group/link text-base" href={data.resumeUrl} target="_blank" rel="noreferrer noopener">
              <span>View Full <span className="inline-block">Résumé <span className="inline-flex items-center">✦</span></span></span>
            </a>
          </div>
        )}
      </div>
    </section>
  );
};