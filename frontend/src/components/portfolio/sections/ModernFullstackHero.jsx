import React from 'react';
import { EditableText } from '../../common/EditableText';
import { usePortfolio } from '../../../context/PortfolioContext';

export const ModernFullstackHero = ({ data = {}, sectionId }) => {
  const { updateSectionField } = usePortfolio();
  return (
    <section id={sectionId} className='modern-fullstack-hero py-20 px-6 max-w-5xl mx-auto text-center space-y-6'>
      <h1 className='text-4xl md:text-6xl font-bold tracking-tight'>
        <EditableText value={data?.name || 'Modern Developer'} onChange={(val) => updateSectionField(sectionId, 'name', val)} />
      </h1>
      <p className='text-xl md:text-2xl text-zinc-300 font-medium'>
        <EditableText value={data?.title || 'Full Stack Engineer'} onChange={(val) => updateSectionField(sectionId, 'title', val)} />
      </p>
      <p className='text-lg text-zinc-400 max-w-2xl mx-auto'>
        <EditableText value={data?.tagline || 'Crafting modern full-stack web experiences with high fidelity.'} onChange={(val) => updateSectionField(sectionId, 'tagline', val)} />
      </p>
      {data?.primaryCta && (
        <div className="pt-4">
          <a href={data.primaryCta.url || '#'} className='modern-fullstack-glow inline-block px-6 py-3 rounded-xl bg-pink-500 hover:bg-pink-600 text-white font-semibold transition-all shadow-lg'>
            {data.primaryCta.text || 'Explore Work'}
          </a>
        </div>
      )}
    </section>
  );
};