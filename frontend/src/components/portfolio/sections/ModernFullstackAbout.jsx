import React from 'react';
import { EditableText } from '../../common/EditableText';
import { usePortfolio } from '../../../context/PortfolioContext';

export const ModernFullstackAbout = ({ data = {}, sectionId }) => {
  const { updateSectionField } = usePortfolio();
  const bio = Array.isArray(data?.bio) ? data.bio : [
    "Full-stack engineer building modern web applications with React, Next.js, and Node.",
    "Focused on performance, clean architecture, and delightful user experiences."
  ];
  const stats = Array.isArray(data?.stats) ? data.stats : [
    { value: '5+', label: 'Years Exp' },
    { value: '30+', label: 'Projects' }
  ];

  return (
    <section id={sectionId} className='modern-fullstack-about py-16 px-6 max-w-5xl mx-auto space-y-8'>
      <div className="space-y-2">
        <h2 className='text-3xl md:text-4xl font-bold tracking-tight'>
          <EditableText value={data?.heading || 'About Me'} onChange={(val) => updateSectionField(sectionId, 'heading', val)} />
        </h2>
        {data?.subheading && (
          <h3 className='text-sm uppercase tracking-widest text-pink-400 font-semibold'>
            <EditableText value={data.subheading} onChange={(val) => updateSectionField(sectionId, 'subheading', val)} />
          </h3>
        )}
      </div>

      <div className="space-y-4 text-zinc-300 leading-relaxed text-lg">
        {bio.map((paragraph, index) => (
          <p key={index}>
            <EditableText value={paragraph} onChange={(val) => updateSectionField(sectionId, `bio.${index}`, val)} />
          </p>
        ))}
      </div>

      {stats.length > 0 && (
        <div className='grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4'>
          {stats.map((stat, index) => (
            <div key={index} className='modern-fullstack-card bg-zinc-900/60 border border-zinc-800 p-5 rounded-2xl'>
              <p className='text-3xl font-extrabold text-white'>{stat.value}</p>
              <p className='text-sm text-zinc-400 mt-1'>{stat.label}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};