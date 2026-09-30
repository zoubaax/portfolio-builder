import React, { useState } from 'react';
import { ArrowUpRight, ExternalLink } from 'lucide-react';
import { GithubIcon } from '../../common/BrandIcons';
import { EditableText } from '../../common/EditableText';
import { ImagePickerModal } from '../../common/ImagePickerModal';
import { usePortfolio } from '../../../context/PortfolioContext';
import { RiCameraLine } from 'react-icons/ri';

export const ProjectsSection = ({ data, variant = 'bento-grid', sectionId }) => {
  const { updateSectionField, isEditMode } = usePortfolio();
  const { heading, subheading, projects = [] } = data || {};
  const [activeImageModalIdx, setActiveImageModalIdx] = useState(null);

  const handleProjectUpdate = (projIndex, field, newVal) => {
    const updatedProjects = [...projects];
    updatedProjects[projIndex] = { ...updatedProjects[projIndex], [field]: newVal };
    updateSectionField(sectionId, 'projects', updatedProjects);
  };

  return (
    <section id="projects" className="py-16 px-6 md:px-12 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
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
          Showing {projects.length} curated works
        </p>
      </div>

      {/* 1. Bento Grid Variant */}
      {variant === 'bento-grid' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {projects.map((proj, idx) => {
            const isWide = idx === 0 || (idx % 3 === 0);
            return (
              <div key={proj.id || idx}
                   className={`group relative rounded-3xl border overflow-hidden transition-all duration-300 hover:shadow-2xl ${
                     isWide ? 'md:col-span-8' : 'md:col-span-4'
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
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--theme-surface)] via-transparent to-transparent" />

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
                      className="text-xl sm:text-2xl font-bold tracking-tight group-hover:text-[var(--theme-accent)] transition-colors block"
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
                    {proj.tags?.map((tag, tIdx) => (
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
      {variant === 'card-grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  {proj.link && (
                    <a href={proj.link} target="_blank" rel="noreferrer" style={{ color: 'var(--theme-accent)' }}>
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
                {proj.tags?.map((t, i) => (
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
      {variant === 'minimal-list' && (
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
                  className="text-xl font-semibold group-hover:text-[var(--theme-accent)] transition-colors block"
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
