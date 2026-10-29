import React, { useState } from 'react';
import { EditableText } from '../../common/EditableText';
import { usePortfolio } from '../../../context/PortfolioContext';
import { getSocialIcon } from '../../common/BrandIcons';
import { ImagePickerModal } from '../../common/ImagePickerModal';
import { SocialLinksModal } from '../../common/SocialLinksModal';
import { RiCameraLine } from 'react-icons/ri';

export const MidnightCodeProjects = ({ data = {}, sectionId }) => {
  const { updateSectionField, isEditMode, isMobileViewport } = usePortfolio();
  const fallbackProjects = [
  {
    "title": "Project Alpha",
    "description": "High performance scalable web application.",
    "tags": [
      "React",
      "Tailwind"
    ],
    "demoUrl": "#"
  }
];
  const projectList = (Array.isArray(data?.projects) && data.projects.length > 0)
    ? data.projects
    : (Array.isArray(data?.items) && data.items.length > 0 ? data.items : fallbackProjects);
  return (
    <section className={`relative ${isMobileViewport ? 'py-8 px-4' : 'py-20 md:py-28 px-6 md:px-12'} overflow-hidden max-w-full mb-16 scroll-mt-16 md:mb-24 lg:mb-36 lg:scroll-mt-24`} id={sectionId} aria-label="Selected projects">
      <div className="sticky top-0 z-20 -mx-6 mb-4 w-screen bg-slate-900/75 px-6 py-5 backdrop-blur md:-mx-12 md:px-12 lg:sr-only lg:relative lg:top-auto lg:mx-auto lg:w-full lg:px-0 lg:py-0 lg:opacity-0">
        <h2 className="break-words max-w-full text-sm font-bold uppercase tracking-widest text-slate-200 lg:sr-only">
          <EditableText value={data?.heading || 'Projects'} as="h2" />
        </h2>
      </div>
      <div>
        <ul className="group/list">
          {projectList.map((project, idx) => {
            const projectImg = project?.imageUrl || project?.image || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=640&q=80';
            const projectLink = project?.liveUrl || project?.githubUrl || '#';
            const tags = Array.isArray(project?.tags) ? project.tags : (Array.isArray(project?.technologies) ? project.technologies : []);
            return (
              <li key={project?.id || idx} className="max-w-full break-words mb-12">
                <div className="group relative grid gap-4 pb-1 transition-all sm:grid-cols-8 sm:gap-8 md:gap-4 lg:hover:!opacity-100 lg:group-hover/list:opacity-50">
                  <div className="absolute -inset-x-4 -inset-y-4 z-0 hidden rounded-md transition motion-reduce:transition-none lg:-inset-x-6 lg:block lg:group-hover:bg-slate-800/50 lg:group-hover:shadow-[inset_0_1px_0_0_rgba(148,163,184,0.1)] lg:group-hover:drop-shadow-lg"></div>
                  <div className="z-10 sm:order-2 sm:col-span-6">
                    <h3 className="break-words max-w-full text-base font-medium text-slate-200">
                      <a href={projectLink} target="_blank" rel="noreferrer" className="inline-flex items-baseline font-medium leading-tight text-slate-200 hover:text-teal-300 group/link text-base">
                        <EditableText value={project?.title || project?.name || 'Project Title'} as="span" />
                        <span className="inline-flex items-center ml-1 text-xs">✦</span>
                      </a>
                    </h3>
                    <p className="mt-2 text-sm leading-normal text-slate-400">
                      {project?.description || project?.desc || ''}
                    </p>
                    {tags.length > 0 && (
                      <ul className="mt-2 flex flex-wrap" aria-label="Technologies used">
                        {tags.map((tag, tIdx) => (
                          <li key={tIdx} className="mr-1.5 mt-2">
                            <div className="flex items-center rounded-full bg-teal-400/10 px-3 py-1 text-xs font-medium leading-5 text-teal-300">
                              {typeof tag === 'string' ? tag : (tag?.name || '')}
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <img
                    className="max-w-full h-auto aspect-video object-cover rounded border-2 border-slate-200/10 transition group-hover:border-slate-200/30 sm:order-1 sm:col-span-2 sm:translate-y-1"
                    alt={project?.title || "Project preview"}
                    loading="lazy"
                    width="200"
                    height="112"
                    src={projectImg}
                  />
                </div>
              </li>
            );
          })}
        </ul>
        <div className="mt-12">
          <a
            className="inline-flex items-center font-semibold leading-tight text-teal-300 hover:text-teal-200 group text-sm"
            aria-label="View Project Repositories"
            href={data?.githubUrl || '#projects'}
            target="_blank"
            rel="noreferrer"
          >
            <span>
              <span className="pb-px transition motion-reduce:transition-none">View All Repositories</span>
              <span className="whitespace-nowrap ml-1"><span className="inline-flex items-center">✦</span></span>
            </span>
          </a>
        </div>
      </div>
    </section>
  );
};