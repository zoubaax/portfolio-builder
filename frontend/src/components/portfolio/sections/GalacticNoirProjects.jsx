import React, { useState } from 'react';
import { EditableText } from '../../common/EditableText';
import { usePortfolio } from '../../../context/PortfolioContext';
import { getSocialIcon } from '../../common/BrandIcons';
import { ImagePickerModal } from '../../common/ImagePickerModal';
import { SocialLinksModal } from '../../common/SocialLinksModal';
import { RiCameraLine } from 'react-icons/ri';

export const GalacticNoirProjects = ({ data = {}, sectionId }) => {
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
    <section className={`relative ${isMobileViewport ? 'py-8 px-4' : 'py-20 md:py-28 px-6'} overflow-hidden max-w-full`} id={sectionId}>
      <div className="w-full max-w-4xl mx-auto" style={{ opacity: "1", transform: "none" }}>
        <div className={`mb-8 sm:mb-10 ${isMobileViewport ? 'text-center' : ''}`}>
          <p className="text-[var(--text-muted)] text-xs tracking-[0.35em] uppercase mb-2" style={{ fontFamily: "DM Sans, sans-serif" }}>
            Featured Work
          </p>
          <h2 style={{ fontFamily: "Comfortaa, cursive", fontWeight: "700", color: "var(--text-primary)", fontSize: isMobileViewport ? "clamp(1.75rem, 6vw, 2.25rem)" : "clamp(2rem, 5vw, 3rem)" }}>
            <EditableText value={data?.heading || 'Projects'} as="h2" />
          </h2>
        </div>

        <div className={`grid ${isMobileViewport ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'} gap-4 w-full`}>
          {projectList.map((project, idx) => (
            <div
              key={project?.id || idx}
              className="proj-card rounded-2xl p-5 flex flex-col gap-3 w-full max-w-full break-words"
              style={{ background: "var(--bg-card)", border: "1px solid #00d9ff18" }}
            >
              <div className="w-8 h-0.5 rounded-full" style={{ background: "#00d9ff" }}></div>
              <h3 className="text-[var(--text-primary)] font-semibold text-lg" style={{ fontFamily: "DM Sans, sans-serif" }}>
                <EditableText value={project?.title || project?.name || 'Project Title'} as="h3" />
              </h3>
              <p className="text-[var(--text-secondary)] text-sm leading-relaxed flex-1" style={{ fontFamily: "DM Sans, sans-serif" }}>
                {project?.description || project?.desc || ''}
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {((Array.isArray(project?.tags) && project.tags.length > 0) ? project.tags : (Array.isArray(project?.technologies) ? project.technologies : [])).map((tag, tIdx) => (
                  <span
                    key={tIdx}
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: "#00d9ff08", color: "#00d9ff90", border: "1px solid #00d9ff18", fontFamily: "DM Mono, monospace" }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-8 sm:mt-10">
          <div style={{ position: "relative", display: "inline-flex", flexDirection: "column", alignItems: "center" }}>
            <a
              style={{
                position: "relative",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "7px",
                padding: "12px 28px",
                borderRadius: "100px",
                border: "1px solid rgba(0,217,255,0.28)",
                background: "rgba(0,217,255,0.05)",
                cursor: "pointer",
                overflow: "hidden",
                fontFamily: "DM Sans, sans-serif",
                fontSize: "13px",
                fontWeight: "600",
                letterSpacing: "0.3px",
                textDecoration: "none",
                transition: "transform 0.2s cubic-bezier(.34,1.56,.64,1), border-color 0.2s ease, box-shadow 0.2s ease",
                boxShadow: "0 2px 12px rgba(0,0,0,0.25)"
              }}
              href="#projects"
            >
              <span
                style={{
                  position: "absolute",
                  top: "3px",
                  left: "12%",
                  right: "12%",
                  height: "35%",
                  background: "linear-gradient(to bottom,rgba(255,255,255,0.18) 0%,transparent 100%)",
                  borderRadius: "100px",
                  zIndex: "2",
                  pointerEvents: "none"
                }}
              />
              <span style={{ position: "relative", zIndex: "3", display: "flex", alignItems: "center", gap: "7px", transition: "color 0.15s ease", color: "rgba(0,217,255,0.80)" }}>
                View All Projects <span className="inline-flex items-center">✦</span>
              </span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};