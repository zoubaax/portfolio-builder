import React from 'react';
import { EditableText } from '../../common/EditableText';
import { usePortfolio } from '../../../context/PortfolioContext';

export const ModernFullstackExperience = ({ data = {}, sectionId }) => {
  const { updateSectionField } = usePortfolio();
  const items = Array.isArray(data?.items) ? data.items : [
    { role: 'Senior Full Stack Engineer', company: 'Tech Innovation Labs', period: '2023 - Present', description: 'Architecting scalable cloud microservices and responsive React web applications.' },
    { role: 'Frontend Engineer', company: 'Digital Studio', period: '2021 - 2023', description: 'Developed dynamic UI libraries and accessible design systems.' }
  ];

  return (
    <section id={sectionId} className='modern-fullstack-experience py-16 px-6 max-w-5xl mx-auto space-y-8'>
      <h2 className='text-3xl md:text-4xl font-bold tracking-tight'>
        <EditableText value={data?.heading || 'Experience & Track Record'} onChange={(val) => updateSectionField(sectionId, 'heading', val)} />
      </h2>

      <div className='space-y-4'>
        {items.map((item, index) => (
          <div key={index} className='modern-fullstack-card bg-zinc-900/60 border border-zinc-800 p-6 rounded-2xl space-y-2 hover:border-zinc-700 transition-all'>
            <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-1'>
              <h3 className='text-xl font-bold text-white'>
                <EditableText value={item.role} onChange={(val) => updateSectionField(sectionId, `items.${index}.role`, val)} />
              </h3>
              <span className='text-xs font-semibold px-2.5 py-1 rounded bg-zinc-800 text-pink-400 border border-zinc-700/60 w-fit'>
                <EditableText value={item.period} onChange={(val) => updateSectionField(sectionId, `items.${index}.period`, val)} />
              </span>
            </div>
            <p className='text-sm text-zinc-400 font-medium'>
              <EditableText value={item.company} onChange={(val) => updateSectionField(sectionId, `items.${index}.company`, val)} />
            </p>
            <p className='text-sm text-zinc-300 leading-relaxed pt-1'>
              <EditableText value={item.description} onChange={(val) => updateSectionField(sectionId, `items.${index}.description`, val)} />
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};