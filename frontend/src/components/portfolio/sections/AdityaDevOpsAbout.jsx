import React from 'react';
import { EditableText } from '../../common/EditableText';
import { usePortfolio } from '../../../context/PortfolioContext';

/**
 * Exact replica of Aditya Seth's About Me section with dual-column bio, circular photo, and 4 Stat cards
 */
export const AdityaDevOpsAbout = ({ data, sectionId }) => {
  const { updateSectionField, isMobileViewport, effectiveAvatar, githubUsername } = usePortfolio();
  const { heading, subheading, bio, stats, avatar } = data || {};

  const displayAvatar = avatar || effectiveAvatar || (githubUsername ? `https://github.com/${githubUsername}.png` : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80');

  const defaultStats = [
    { value: '2800+', label: 'Students Mentored' },
    { value: '15+', label: 'Cloud Initiatives' },
    { value: '8+', label: 'Hackathons Hosted' },
    { value: '99.9%', label: 'Infrastructure Uptime' }
  ];

  const currentStats = (stats && stats.length > 0) ? stats : defaultStats;

  const handleBioChange = (newText, index) => {
    if (Array.isArray(bio)) {
      const newBio = [...bio];
      newBio[index] = newText;
      updateSectionField(sectionId, 'bio', newBio);
    } else {
      updateSectionField(sectionId, 'bio', newText);
    }
  };

  const handleStatChange = (newVal, field, index) => {
    const newStats = [...currentStats];
    newStats[index] = { ...newStats[index], [field]: newVal };
    updateSectionField(sectionId, 'stats', newStats);
  };

  return (
    <section id="about" className={`${isMobileViewport ? 'py-12 px-4' : 'py-20 px-6 md:px-12'} max-w-6xl mx-auto`}>
      {/* 2-Column Story + Circle Photo */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
        {/* Left Column (col-md-9): Bio & Headings */}
        <div className="md:col-span-8 lg:col-span-9 space-y-5">
          <div>
            {subheading && (
              <EditableText
                as="span"
                value={subheading}
                onSave={(val) => updateSectionField(sectionId, 'subheading', val)}
                singleLine
                className="text-xs uppercase tracking-widest font-mono font-semibold block mb-1 text-sky-400"
              />
            )}
            <EditableText
              as="h2"
              value={heading || "About Me"}
              onSave={(val) => updateSectionField(sectionId, 'heading', val)}
              singleLine
              className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white"
              style={{ fontFamily: 'var(--theme-heading-font)' }}
            />
          </div>

          <div className="space-y-4 text-slate-300 text-base sm:text-lg leading-relaxed font-light">
            {Array.isArray(bio) ? (
              bio.map((paragraph, idx) => (
                <EditableText
                  key={idx}
                  as="p"
                  value={paragraph}
                  onSave={(val) => handleBioChange(val, idx)}
                  className="block"
                />
              ))
            ) : (
              <EditableText
                as="p"
                value={bio || "Driven by an endless curiosity for solving complex distributed systems problems. Journey in tech spans competitive programming, multi-cloud infrastructure, and production ML pipelines."}
                onSave={(val) => updateSectionField(sectionId, 'bio', val)}
                className="block"
              />
            )}
          </div>
        </div>

        {/* Right Column (col-md-3): Circular Profile Photo with glowing ring */}
        <div className="md:col-span-4 lg:col-span-3 flex justify-center">
          <div className="relative group">
            <div 
              className="absolute -inset-1.5 rounded-full blur-md opacity-40 group-hover:opacity-75 transition duration-500"
              style={{ background: 'linear-gradient(45deg, #039be5, #38bdf8)' }}
            />
            <div className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-full overflow-hidden border-2 border-sky-400/30 p-1 bg-slate-900 shadow-2xl">
              <img 
                src={displayAvatar} 
                alt="Profile" 
                className="w-full h-full object-cover rounded-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom 4-Card Statistics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mt-14">
        {currentStats.slice(0, 4).map((stat, idx) => (
          <div 
            key={idx}
            className="aditya-stat-card p-6 text-center"
          >
            <div className="text-3xl sm:text-4xl font-extrabold text-sky-400 tracking-tight font-mono">
              <EditableText
                value={stat.value}
                onSave={(val) => handleStatChange(val, 'value', idx)}
                singleLine
                className="inline-block"
              />
            </div>
            <div className="mt-2 text-xs sm:text-sm text-slate-400 font-medium tracking-wide">
              <EditableText
                value={stat.label}
                onSave={(val) => handleStatChange(val, 'label', idx)}
                singleLine
                className="block"
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
