import React from 'react';
import { EditableText } from '../../common/EditableText';
import { usePortfolio } from '../../../context/PortfolioContext';

export const ModernFullstackSkills = ({ data = {}, sectionId }) => {
  const { updateSectionField } = usePortfolio();
  const categories = Array.isArray(data?.categories) ? data.categories : [
    { name: 'Frontend', skills: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS'] },
    { name: 'Backend & Cloud', skills: ['Node.js', 'FastAPI', 'PostgreSQL', 'Docker'] }
  ];

  return (
    <section id={sectionId} className='modern-fullstack-skills py-16 px-6 max-w-5xl mx-auto space-y-8'>
      <h2 className='text-3xl md:text-4xl font-bold tracking-tight'>
        <EditableText value={data?.heading || 'Technical Stack'} onChange={(val) => updateSectionField(sectionId, 'heading', val)} />
      </h2>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {categories.map((category, index) => (
          <div key={index} className='modern-fullstack-card bg-zinc-900/60 border border-zinc-800 p-6 rounded-2xl space-y-4'>
            <h3 className='text-xl font-semibold text-white'>
              <EditableText value={category.name} onChange={(val) => updateSectionField(sectionId, `categories.${index}.name`, val)} />
            </h3>
            <div className='flex flex-wrap gap-2'>
              {(category.skills || []).map((skill, skillIndex) => (
                <span key={skillIndex} className='px-3 py-1.5 rounded-lg bg-zinc-800/80 border border-zinc-700/60 text-sm text-zinc-200'>
                  <EditableText value={skill} onChange={(val) => updateSectionField(sectionId, `categories.${index}.skills.${skillIndex}`, val)} />
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};