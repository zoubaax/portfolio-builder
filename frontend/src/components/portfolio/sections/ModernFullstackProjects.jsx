import React from 'react';
import { EditableText } from '../../common/EditableText';
import { usePortfolio } from '../../../context/PortfolioContext';

export const ModernFullstackProjects = ({ data = {}, sectionId }) => {
  const { updateSectionField } = usePortfolio();
  const items = Array.isArray(data?.items) ? data.items : [
    { title: 'Cloud Platform Dashboard', description: 'Real-time observability platform with interactive charts and automated alerting.', tags: ['React', 'TypeScript', 'Tailwind'], demoUrl: '#' },
    { title: 'AI Developer Assistant', description: 'Intelligent code review tool powered by LLMs with automated pull request feedback.', tags: ['Next.js', 'Python', 'FastAPI'], demoUrl: '#' }
  ];

  return (
    <section id={sectionId} className='modern-fullstack-projects py-16 px-6 max-w-5xl mx-auto space-y-8'>
      <h2 className='text-3xl md:text-4xl font-bold tracking-tight'>
        <EditableText value={data?.heading || 'Featured Projects'} onChange={(val) => updateSectionField(sectionId, 'heading', val)} />
      </h2>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {items.map((item, index) => (
          <div key={index} className='modern-fullstack-card bg-zinc-900/60 border border-zinc-800 p-6 rounded-2xl flex flex-col justify-between space-y-4 hover:border-pink-500/50 transition-all'>
            <div className="space-y-3">
              <h3 className='text-xl font-bold text-white'>
                <EditableText value={item.title} onChange={(val) => updateSectionField(sectionId, `items.${index}.title`, val)} />
              </h3>
              <p className='text-zinc-400 text-sm leading-relaxed'>
                <EditableText value={item.description} onChange={(val) => updateSectionField(sectionId, `items.${index}.description`, val)} />
              </p>
            </div>

            <div className="space-y-4 pt-2">
              <div className='flex flex-wrap gap-2'>
                {(item.tags || []).map((tag, tagIndex) => (
                  <span key={tagIndex} className='text-xs font-medium bg-zinc-800 text-zinc-300 px-2.5 py-1 rounded-md border border-zinc-700/50'>
                    <EditableText value={tag} onChange={(val) => updateSectionField(sectionId, `items.${index}.tags.${tagIndex}`, val)} />
                  </span>
                ))}
              </div>

              {item.demoUrl && (
                <div>
                  <a href={item.demoUrl} className='inline-flex items-center text-sm font-semibold text-pink-400 hover:text-pink-300 transition-colors'>
                    View Project &rarr;
                  </a>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};