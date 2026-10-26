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
      title: 'MSc Computer Science - Distributed Systems',
      subtitle: 'University of Technology | 2023 - Present',
      desc: 'Research in distributed consensus algorithms, high-throughput cloud messaging, and container orchestration.'
    },
    {
      title: 'BSc Computer Science & Engineering',
      subtitle: 'Institute of Technology | 2019 - 2023',
      desc: 'Active leadership in developer communities, cloud architecture, and DevOps workshops.'
    }
  ];

  const defaultExperience = [
    {
      title: 'Senior Cloud & Platform Engineer',
      subtitle: 'Cloud Solutions Inc. | 2023 - Present',
      desc: 'Architecting enterprise cloud infrastructure, Kubernetes clusters, and production CI/CD automation pipelines.'
    },
    {
      title: 'Systems & DevOps Engineer',
      subtitle: 'Global Tech Labs | 2021 - 2023',
      desc: 'Designed high-concurrency microservices, benchmarked cloud architectures, and maintained observability pipelines.'
    }
  ];

  // Dynamically resolve education and experience
  const eduItems = (Array.isArray(data?.education) && data.education.length > 0)
    ? data.education
    : defaultEducation;

  const expItems = items.length > 0 
    ? items 
    : (Array.isArray(data?.experience) && data.experience.length > 0 
        ? data.experience 
        : defaultExperience);

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
            {eduItems.map((edu, idx) => (
              <div
                key={idx}
                className="aditya-b-box aditya-exp-card p-6"
              >
                <h4 className="text-base font-bold text-white mb-2">
                  <EditableText
                    value={edu.title}
                    onSave={(val) => {
                      const newEdu = [...eduItems];
                      newEdu[idx] = { ...newEdu[idx], title: val };
                      updateSectionField(sectionId, 'education', newEdu);
                    }}
                    singleLine
                  />
                </h4>
                <div className="inline-block px-2.5 py-1 rounded text-xs font-mono font-medium text-sky-300 bg-sky-500/10 border border-sky-400/20 mb-3">
                  <EditableText
                    value={edu.subtitle}
                    onSave={(val) => {
                      const newEdu = [...eduItems];
                      newEdu[idx] = { ...newEdu[idx], subtitle: val };
                      updateSectionField(sectionId, 'education', newEdu);
                    }}
                    singleLine
                  />
                </div>
                <p className="text-xs sm:text-sm text-slate-300 font-light leading-relaxed">
                  <EditableText
                    value={edu.desc}
                    onSave={(val) => {
                      const newEdu = [...eduItems];
                      newEdu[idx] = { ...newEdu[idx], desc: val };
                      updateSectionField(sectionId, 'education', newEdu);
                    }}
                  />
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
