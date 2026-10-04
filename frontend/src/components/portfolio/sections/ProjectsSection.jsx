import React, { useState } from 'react';
import { ArrowUpRight, ExternalLink } from 'lucide-react';
import { GithubIcon } from '../../common/BrandIcons';
import { EditableText } from '../../common/EditableText';
import { ImagePickerModal } from '../../common/ImagePickerModal';
import { usePortfolio } from '../../../context/PortfolioContext';
import { RiCameraLine } from 'react-icons/ri';

export const ProjectsSection = ({ data, variant = 'bento-grid', sectionId }) => {
  const { updateSectionField, isEditMode, isMobileViewport, setViewMode } = usePortfolio();
  const { heading, subheading } = data || {};
  const projects = (data?.projects && Array.isArray(data.projects) && data.projects.length > 0)
    ? data.projects
    : (Array.isArray(data?.items) ? data.items : []);
  const [activeImageModalIdx, setActiveImageModalIdx] = useState(null);

  const activeVariant = ['bento-grid', 'card-grid', 'minimal-list'].includes(variant)
    ? variant
    : 'bento-grid';

  const handleProjectUpdate = (projIndex, field, newVal) => {
    const updatedProjects = [...projects];
    updatedProjects[projIndex] = { ...updatedProjects[projIndex], [field]: newVal };
    updateSectionField(sectionId, 'projects', updatedProjects);
  };

  return (
    <section id="projects" className={`${isMobileViewport ? 'py-10 px-4' : 'py-16 px-6 md:px-12'} max-w-6xl mx-auto`}>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-12 gap-4">
        <div>
          {subheading && (
            <EditableText
              as="p"
              value={subheading}
              onSave={(val) => updateSectionField(sectionId, 'subheading', val)}
              singleLine
              className="text-xs uppercase tracking-widest font-bold mb-2 block"
              style={{ color: 'var(--theme-accent)' }}
            />
          )}
          <EditableText
            as="h2"
            value={heading || 'Featured Projects'}
            onSave={(val) => updateSectionField(sectionId, 'heading', val)}
            singleLine
            className="text-3xl sm:text-4xl font-extrabold tracking-tight block"
            style={{ fontFamily: 'var(--theme-heading-font)', color: 'var(--theme-text-primary)' }}
          />
        </div>
        <p className="text-sm font-medium" style={{ color: 'var(--theme-text-secondary)' }}>
          {projects.length > 0 ? `Showing ${projects.length} curated works` : '0 projet sélectionné'}
        </p>
      </div>

      {/* Empty State when no GitHub projects have been imported yet */}
      {projects.length === 0 ? (
        <div
          className="rounded-3xl border border-dashed p-8 sm:p-12 text-center transition-all duration-300"
          style={{
            backgroundColor: 'var(--theme-surface)',
            borderColor: 'var(--theme-border)',
          }}
        >
          <div
            className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-inner"
            style={{
              backgroundColor: 'rgba(99, 102, 241, 0.12)',
              border: '1px solid var(--theme-border)',
              color: 'var(--theme-accent)',
            }}
          >
            <GithubIcon className="w-8 h-8" />
          </div>

          <h3
            className="text-lg sm:text-xl font-bold mb-2 tracking-tight"
            style={{
              fontFamily: 'var(--theme-heading-font)',
              color: 'var(--theme-text-primary)',
            }}
          >
            Aucun projet importé pour le moment
          </h3>

          <p
            className="text-xs sm:text-sm max-w-md mx-auto mb-6 leading-relaxed"
            style={{ color: 'var(--theme-text-secondary)' }}
          >
            Connectez votre compte GitHub pour importer vos vrais dépôts, générer des maquettes 3D avec l'IA et personnaliser cette section selon vos envies.
          </p>

          {setViewMode && (
            <button
              onClick={() => setViewMode('projects')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all transform hover:scale-105 active:scale-95 shadow-lg cursor-pointer"
              style={{
                backgroundColor: 'var(--theme-accent)',
                color: '#ffffff',
                boxShadow: '0 10px 25px -5px var(--theme-accent-glow, rgba(99,102,241,0.4))',
              }}
            >
              <GithubIcon className="w-4 h-4" />
              <span>Importer mes projets GitHub</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : (
        <>
          {/* 1. Bento Grid Variant */}
      {activeVariant === 'bento-grid' && (
        <div className={`grid ${isMobileViewport ? 'grid-cols-1 gap-5' : 'grid-cols-1 md:grid-cols-12 gap-6'}`}>
          {projects.map((proj, idx) => {
            const isWide = !isMobileViewport && (idx === 0 || (idx % 3 === 0));
            return (
              <div key={proj.id || idx}
                   className={`group relative rounded-3xl border overflow-hidden transition-all duration-300 hover:shadow-2xl ${
                     isMobileViewport ? 'col-span-1' : (isWide ? 'md:col-span-8' : 'md:col-span-4')
                   }`}
                   style={{
                     backgroundColor: 'var(--theme-surface)',
                     borderColor: 'var(--theme-border)',
                   }}>
                {/* Thumbnail if provided */}
                {proj.image && (
                  <div
                    className={`relative h-48 sm:h-56 overflow-hidden group/thumb ${
                      isEditMode ? 'cursor-pointer' : ''
                    }`}
                    onClick={() => isEditMode && setActiveImageModalIdx(idx)}
                  >
                    <img src={proj.image} alt={proj.title}
                         className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-linear-to-t from-(--theme-surface) via-transparent to-transparent" />

                    {isEditMode && (
                      <div className="absolute inset-0 bg-black/50 backdrop-blur-xs opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-all z-20">
                        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/70 border border-white/20 text-white text-xs font-bold shadow-lg">
                          <RiCameraLine className="w-4 h-4 text-indigo-400" />
                          <span>Change Cover</span>
                        </span>
                      </div>
                    )}
                    
                    {proj.metrics && (
                      <div className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md border shadow z-10"
                           style={{
                             backgroundColor: 'rgba(0,0,0,0.6)',
                             borderColor: 'var(--theme-border)',
                             color: 'var(--theme-accent)'
                           }}>
                        <EditableText
                          value={proj.metrics}
                          onSave={(val) => handleProjectUpdate(idx, 'metrics', val)}
                          singleLine
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Content */}
                <div className="p-6 sm:p-8 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <EditableText
                      as="h3"
                      value={proj.title}
                      onSave={(val) => handleProjectUpdate(idx, 'title', val)}
                      singleLine
                      className="text-xl sm:text-2xl font-bold tracking-tight group-hover:text-(--theme-accent) transition-colors block"
                      style={{ color: 'var(--theme-text-primary)', fontFamily: 'var(--theme-heading-font)' }}
                    />
                    <div className="flex items-center gap-2 shrink-0">
                      {proj.github && (
                        <a href={proj.github} target="_blank" rel="noopener noreferrer"
                           className="p-2 rounded-lg border hover:scale-105 transition-transform"
                           style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-text-secondary)' }}>
                          <GithubIcon className="w-4 h-4" />
                        </a>
                      )}
                      {proj.link && (
                        <a href={proj.link} target="_blank" rel="noopener noreferrer"
                           className="p-2 rounded-lg transition-transform hover:scale-105"
                           style={{ backgroundColor: 'var(--theme-accent)', color: '#ffffff' }}>
                          <ArrowUpRight className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>

                  <EditableText
                    as="p"
                    value={proj.description}
                    onSave={(val) => handleProjectUpdate(idx, 'description', val)}
                    className="text-sm sm:text-base leading-relaxed block"
                    style={{ color: 'var(--theme-text-secondary)', fontFamily: 'var(--theme-body-font)' }}
                  />

                  {/* Tech stack badges */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {(proj.tags || proj.tech || []).map((tag, tIdx) => (
                      <span key={tIdx} className="px-2.5 py-1 rounded-lg text-xs font-medium border"
                            style={{
                              backgroundColor: 'rgba(255,255,255,0.03)',
                              borderColor: 'var(--theme-border)',
                              color: 'var(--theme-text-secondary)'
                            }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 2. Card Grid Variant */}
      {activeVariant === 'card-grid' && (
        <div className={`grid ${isMobileViewport ? 'grid-cols-1 gap-5' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'}`}>
          {projects.map((proj, idx) => (
            <div key={proj.id || idx}
                 className="p-6 rounded-2xl border flex flex-col justify-between transition-all hover:scale-[1.01]"
                 style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)' }}>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <EditableText
                    as="h3"
                    value={proj.title}
                    onSave={(val) => handleProjectUpdate(idx, 'title', val)}
                    singleLine
                    className="text-lg font-bold block"
                    style={{ color: 'var(--theme-text-primary)' }}
                  />
                  {(proj.link || proj.links?.demo || proj.links?.repo) && (
                    <a href={proj.link || proj.links?.demo || proj.links?.repo} target="_blank" rel="noreferrer" style={{ color: 'var(--theme-accent)' }}>
                      <ArrowUpRight className="w-4 h-4" />
                    </a>
                  )}
                </div>
                <EditableText
                  as="p"
                  value={proj.description}
                  onSave={(val) => handleProjectUpdate(idx, 'description', val)}
                  className="text-sm block"
                  style={{ color: 'var(--theme-text-secondary)' }}
                />
              </div>
              <div className="flex flex-wrap gap-1.5 pt-4">
                {(proj.tags || proj.tech || []).map((t, i) => (
                  <span key={i} className="text-xs px-2 py-0.5 rounded border"
                        style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-text-secondary)' }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. Minimal List Variant */}
      {activeVariant === 'minimal-list' && (
        <div className="divide-y" style={{ borderColor: 'var(--theme-border)' }}>
          {projects.map((proj, idx) => (
            <div key={proj.id || idx}
                 className="py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group transition-colors hover:pl-2"
                 style={{ borderColor: 'var(--theme-border)' }}>
              <div>
                <EditableText
                  as="h3"
                  value={proj.title}
                  onSave={(val) => handleProjectUpdate(idx, 'title', val)}
                  singleLine
                  className="text-xl font-semibold group-hover:text-(--theme-accent) transition-colors block"
                  style={{ color: 'var(--theme-text-primary)', fontFamily: 'var(--theme-heading-font)' }}
                />
                <EditableText
                  as="p"
                  value={proj.description}
                  onSave={(val) => handleProjectUpdate(idx, 'description', val)}
                  className="text-sm mt-1 block"
                  style={{ color: 'var(--theme-text-secondary)' }}
                />
                <div className="flex gap-2 mt-2">
                  {proj.tags?.map((t, i) => (
                    <span key={i} className="text-xs opacity-75 font-mono" style={{ color: 'var(--theme-text-secondary)' }}>
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
              {proj.link && (
                <a href={proj.link} target="_blank" rel="noreferrer"
                   className="inline-flex items-center gap-1 text-sm font-semibold self-start sm:self-center transition-transform group-hover:translate-x-1"
                   style={{ color: 'var(--theme-accent)' }}>
                  Visit <ArrowUpRight className="w-4 h-4" />
                </a>
              )}
            </div>
          ))}
        </div>
      )}
        </>
      )}

      {/* Project Cover Image Picker Modal */}
      {activeImageModalIdx !== null && (
        <ImagePickerModal
          isOpen={activeImageModalIdx !== null}
          onClose={() => setActiveImageModalIdx(null)}
          currentImage={projects[activeImageModalIdx]?.image}
          onSave={(newImg) => {
            handleProjectUpdate(activeImageModalIdx, 'image', newImg);
            setActiveImageModalIdx(null);
          }}
          title={`Change Cover: ${projects[activeImageModalIdx]?.title || 'Project'}`}
        />
      )}
    </section>
  );
};
