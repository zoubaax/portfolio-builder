import React from 'react';
import { GraduationCap, Briefcase, Calendar } from 'lucide-react';
import { EditableText } from '../../common/EditableText';
import { usePortfolio } from '../../../context/PortfolioContext';

/**
 * Exact replica of Aditya Seth's Education & Experience timeline layout
 */
export const AdityaDevOpsExperience = ({ data, sectionId }) => {
  const { updateSectionField, isMobileViewport } = usePortfolio();
  const { heading, subheading, items = [] } = data || {};

  const defaultEducation = [
    {
      title: 'MTech CSE - Distributed Systems',
      subtitle: 'Techno India University | 2025 - Present',
      desc: 'Research in distributed consensus algorithms, high-throughput cloud messaging, and AI orchestration.'
    },
    {
      title: 'BTech (Hons) - Computer Science & Engineering',
      subtitle: 'Techno Main Salt Lake | 2021 - 2025',
      desc: 'Lead of GDG On-Campus & Technical Lead. Scaled developer community to 1950+ members through hands-on Cloud and DevOps workshops.'
    }
  ];

  const defaultExperience = [
    {
      title: 'Software & AI Initiatives Lead',
      subtitle: 'Techno India Group | 2024 - Present',
      desc: 'Architecting enterprise cloud infrastructure, multi-agent AI simulations, and production CI/CD automation pipelines.'
    },
    {
      title: 'Research Engineer',
      subtitle: 'IIT Roorkee | 2023 - 2024',
      desc: 'Designed high-concurrency microservices, benchmarked ML models on GPU clusters, and published system design artifacts.'
    }
  ];

  // If items exist, partition them or display gracefully
  const expItems = items.length > 0 ? items : defaultExperience;

  return (
    <section id="resume" className={`${isMobileViewport ? 'py-12 px-4' : 'py-20 px-6 md:px-12'} max-w-6xl mx-auto`}>
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-14">
        <EditableText
          as="span"
          value={subheading || "MY RESUME"}
          onSave={(val) => updateSectionField(sectionId, 'subheading', val)}
          singleLine
          className="text-xs uppercase tracking-widest font-mono font-semibold block mb-2 text-sky-400"
        />
        <EditableText
          as="h2"
          value={heading || "Education & Experience"}
          onSave={(val) => updateSectionField(sectionId, 'heading', val)}
          singleLine
          className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white"
          style={{ fontFamily: 'var(--theme-heading-font)' }}
        />
      </div>

      {/* 2-Column Split: Education on Left, Experience on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Education Column */}
        <div className="space-y-6">
          <div className="flex items-center gap-2.5 pb-2 border-b border-white/5">
            <GraduationCap className="w-5 h-5 text-sky-400" />
            <h3 className="text-lg font-bold text-white tracking-tight">Education</h3>
          </div>

          <div className="space-y-4">
            {defaultEducation.map((edu, idx) => (
              <div
                key={idx}
                className="aditya-b-box aditya-exp-card p-6"
              >
                <h4 className="text-base font-bold text-white mb-2">{edu.title}</h4>
                <div className="inline-block px-2.5 py-1 rounded text-xs font-mono font-medium text-sky-300 bg-sky-500/10 border border-sky-400/20 mb-3">
                  {edu.subtitle}
                </div>
                <p className="text-xs sm:text-sm text-slate-300 font-light leading-relaxed">
                  {edu.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Experience Column */}
        <div className="space-y-6">
          <div className="flex items-center gap-2.5 pb-2 border-b border-white/5">
            <Briefcase className="w-5 h-5 text-sky-400" />
            <h3 className="text-lg font-bold text-white tracking-tight">Experience</h3>
          </div>

          <div className="space-y-4">
            {expItems.map((exp, idx) => {
              const roleTitle = exp.role || exp.title;
              const companySubtitle = exp.company ? `${exp.company} | ${exp.period || ''}` : exp.subtitle;
              const description = exp.description || exp.desc;

              return (
                <div
                  key={exp.id || idx}
                  className="aditya-b-box aditya-exp-card p-6"
                >
                  <h4 className="text-base font-bold text-white mb-2">
                    <EditableText
                      value={roleTitle}
                      onSave={(val) => {
                        const newItems = [...expItems];
                        newItems[idx] = { ...newItems[idx], [exp.role ? 'role' : 'title']: val };
                        updateSectionField(sectionId, 'items', newItems);
                      }}
                      singleLine
                    />
                  </h4>
                  <div className="inline-block px-2.5 py-1 rounded text-xs font-mono font-medium text-sky-300 bg-sky-500/10 border border-sky-400/20 mb-3">
                    <EditableText
                      value={companySubtitle}
                      onSave={(val) => {
                        const newItems = [...expItems];
                        newItems[idx] = { ...newItems[idx], [exp.company ? 'company' : 'subtitle']: val };
                        updateSectionField(sectionId, 'items', newItems);
                      }}
                      singleLine
                    />
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 font-light leading-relaxed">
                    <EditableText
                      value={description}
                      onSave={(val) => {
                        const newItems = [...expItems];
                        newItems[idx] = { ...newItems[idx], [exp.description ? 'description' : 'desc']: val };
                        updateSectionField(sectionId, 'items', newItems);
                      }}
                    />
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
