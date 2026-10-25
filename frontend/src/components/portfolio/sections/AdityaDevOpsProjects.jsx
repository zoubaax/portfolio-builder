import React, { useState } from 'react';
import { ArrowUpRight, ExternalLink, Sparkles } from 'lucide-react';
import { GithubIcon } from '../../common/BrandIcons';
import { EditableText } from '../../common/EditableText';
import { ImagePickerModal } from '../../common/ImagePickerModal';
import { usePortfolio } from '../../../context/PortfolioContext';

/**
 * Exact replica of Aditya Seth's Projects cards layout with image preview,
 * technical description block, and categorized technologies footer.
 */
export const AdityaDevOpsProjects = ({ data, sectionId }) => {
  const { updateSectionField, isMobileViewport, isEditMode, setViewMode } = usePortfolio();
  const { heading, subheading } = data || {};
  const projects = (data?.projects && Array.isArray(data.projects) && data.projects.length > 0)
    ? data.projects
    : (Array.isArray(data?.items) ? data.items : []);
  const [activeImageModalIdx, setActiveImageModalIdx] = useState(null);

  const handleProjectUpdate = (projIndex, field, newVal) => {
    const updatedProjects = [...projects];
    updatedProjects[projIndex] = { ...updatedProjects[projIndex], [field]: newVal };
    updateSectionField(sectionId, 'projects', updatedProjects);
  };

  return (
    <section id="projects" className={`${isMobileViewport ? 'py-12 px-4' : 'py-20 px-6 md:px-12'} max-w-6xl mx-auto`}>
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto mb-14">
        <EditableText
          as="span"
          value={subheading || "ACHIEVEMENTS"}
          onSave={(val) => updateSectionField(sectionId, 'subheading', val)}
          singleLine
          className="text-xs uppercase tracking-widest font-mono font-semibold block mb-2 text-sky-400"
        />
        <EditableText
          as="h2"
          value={heading || "My Projects"}
          onSave={(val) => updateSectionField(sectionId, 'heading', val)}
          singleLine
          className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white"
          style={{ fontFamily: 'var(--theme-heading-font)' }}
        />
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div 
          className="rounded-3xl border border-dashed p-10 text-center max-w-xl mx-auto"
          style={{
            backgroundColor: 'rgba(18, 23, 35, 0.5)',
            borderColor: 'rgba(255, 255, 255, 0.12)'
          }}
        >
          <Sparkles className="w-8 h-8 mx-auto text-sky-400 mb-3 animate-pulse" />
          <h3 className="text-lg font-bold text-white mb-2">Prêt à importer vos projets GitHub</h3>
          <p className="text-sm text-slate-400 mb-5">
            Sélectionnez vos dépôts GitHub depuis le panneau latéral pour les afficher dans ce format haute fidélité.
          </p>
          {isEditMode && (
            <button
              onClick={() => setViewMode('projects')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-sky-500 hover:bg-sky-400 transition-all cursor-pointer shadow-lg"
            >
              <GithubIcon className="w-4 h-4" />
              <span>Choisir mes projets GitHub</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, idx) => {
            const tags = Array.isArray(project.tags) 
              ? project.tags 
              : (typeof project.tags === 'string' ? project.tags.split(',').map(t => t.trim()) : []);

            return (
              <div 
                key={project.id || idx}
                className="aditya-b-box aditya-project-card group flex flex-col overflow-hidden"
              >
                {/* Image Banner with Hover Overlay */}
                <div className="relative aspect-video w-full overflow-hidden bg-slate-900 border-b border-white/5">
                  <img
                    src={project.image || `https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80`}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-slate-950/90 via-slate-950/40 to-transparent flex flex-col justify-end p-4">
                    <h3 className="text-lg font-bold text-white tracking-tight leading-snug">
                      <EditableText
                        value={project.title}
                        onSave={(val) => handleProjectUpdate(idx, 'title', val)}
                        singleLine
                      />
                    </h3>
                  </div>
                </div>

                {/* Description Body */}
                <div className="flex-1 p-5 flex flex-col justify-between space-y-4">
                  <div className="text-slate-300 text-sm leading-relaxed font-light line-clamp-3">
                    <EditableText
                      value={project.description || "Architected resilient distributed pipeline with automated observability and infrastructure as code."}
                      onSave={(val) => handleProjectUpdate(idx, 'description', val)}
                    />
                  </div>

                  {/* Categorized Tech Stack Tags */}
                  <div className="pt-3 border-t border-white/5 flex flex-wrap gap-1.5">
                    {tags.length > 0 ? (
                      tags.map((tag, tIdx) => (
                        <span 
                          key={tIdx}
                          className="px-2 py-0.5 rounded-md text-[11px] font-mono font-medium text-sky-400 bg-sky-500/10 border border-sky-400/20"
                        >
                          {tag}
                        </span>
                      ))
                    ) : (
                      <span className="text-[11px] font-mono text-slate-500">Python, Docker, Kubernetes, Terraform</span>
                    )}
                  </div>

                  {/* Links (Live URL / GitHub) */}
                  <div className="flex items-center gap-3 pt-2">
                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-400 hover:text-sky-300 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Live Demo</span>
                      </a>
                    )}
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors ml-auto"
                      >
                        <GithubIcon className="w-3.5 h-3.5" />
                        <span>Code</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeImageModalIdx !== null && (
        <ImagePickerModal
          isOpen={true}
          onClose={() => setActiveImageModalIdx(null)}
          currentImage={projects[activeImageModalIdx]?.image}
          onSelect={(url) => {
            handleProjectUpdate(activeImageModalIdx, 'image', url);
            setActiveImageModalIdx(null);
          }}
        />
      )}
    </section>
  );
};
