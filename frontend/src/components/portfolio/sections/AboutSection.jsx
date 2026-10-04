import React from 'react';
import { MapPin, Sparkles } from 'lucide-react';
import { EditableText } from '../../common/EditableText';
import { usePortfolio } from '../../../context/PortfolioContext';

export const AboutSection = ({ data, variant = 'bento', sectionId }) => {
  const { updateSectionField, updateSection, isMobileViewport } = usePortfolio();
  const { heading, subheading, bio, stats, location } = data || {};

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
    const newStats = [...(stats || [])];
    newStats[index] = { ...newStats[index], [field]: newVal };
    updateSectionField(sectionId, 'stats', newStats);
  };

  return (
    <section id="about" className={`${isMobileViewport ? 'py-10 px-4' : 'py-16 px-6 md:px-12'} max-w-6xl mx-auto`}>
      <div className="mb-8 sm:mb-10">
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
          value={heading || 'About Me'}
          onSave={(val) => updateSectionField(sectionId, 'heading', val)}
          singleLine
          className={`${isMobileViewport ? 'text-2xl sm:text-3xl' : 'text-3xl sm:text-4xl'} font-extrabold tracking-tight block`}
          style={{ fontFamily: 'var(--theme-heading-font)', color: 'var(--theme-text-primary)' }}
        />
      </div>

      {variant === 'bento' ? (
        <div className={isMobileViewport ? "flex flex-col gap-5" : "grid grid-cols-1 md:grid-cols-12 gap-6"}>
          {/* Main Story Bento Card */}
          <div className={`${isMobileViewport ? 'w-full p-5 rounded-2xl' : 'md:col-span-8 p-8 rounded-3xl'} border flex flex-col justify-between`}
               style={{
                 backgroundColor: 'var(--theme-surface)',
                 borderColor: 'var(--theme-border)',
               }}>
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border"
                   style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-accent)' }}>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Background & Journey</span>
              </div>
              {Array.isArray(bio) ? (
                bio.map((paragraph, idx) => (
                  <EditableText
                    key={idx}
                    as="p"
                    value={paragraph}
                    onSave={(val) => handleBioChange(val, idx)}
                    className="text-base sm:text-lg leading-relaxed block"
                    style={{ color: 'var(--theme-text-secondary)', fontFamily: 'var(--theme-body-font)' }}
                  />
                ))
              ) : (
                <EditableText
                  as="p"
                  value={bio}
                  onSave={(val) => updateSectionField(sectionId, 'bio', val)}
                  className="text-base sm:text-lg leading-relaxed block"
                  style={{ color: 'var(--theme-text-secondary)' }}
                />
              )}
            </div>

            {location && (
              <div className="mt-8 pt-4 border-t flex items-center gap-2 text-sm"
                   style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-text-secondary)' }}>
                <MapPin className="w-4 h-4" style={{ color: 'var(--theme-accent)' }} />
                <span>Based in </span>
                <EditableText
                  value={location}
                  onSave={(val) => updateSectionField(sectionId, 'location', val)}
                  singleLine
                />
              </div>
            )}
          </div>

          {/* Stats Bento Column */}
          <div className={isMobileViewport ? "grid grid-cols-2 gap-3" : "md:col-span-4 grid grid-cols-2 md:grid-cols-1 gap-4"}>
            {stats?.map((stat, idx) => (
              <div key={idx} className={`${isMobileViewport ? 'p-4 rounded-2xl' : 'p-6 rounded-3xl'} border transition-all hover:scale-[1.02]`}
                   style={{
                     backgroundColor: 'var(--theme-surface)',
                     borderColor: 'var(--theme-border)',
                   }}>
                <EditableText
                  as="div"
                  value={stat.value}
                  onSave={(val) => handleStatChange(val, 'value', idx)}
                  singleLine
                  className={`${isMobileViewport ? 'text-2xl sm:text-3xl' : 'text-3xl sm:text-4xl'} font-extrabold tracking-tight mb-1`}
                  style={{ color: 'var(--theme-accent)', fontFamily: 'var(--theme-heading-font)' }}
                />
                <EditableText
                  as="div"
                  value={stat.label}
                  onSave={(val) => handleStatChange(val, 'label', idx)}
                  singleLine
                  className="text-xs sm:text-sm font-medium"
                  style={{ color: 'var(--theme-text-secondary)' }}
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Classic Story Variant */
        <div className={isMobileViewport ? "flex flex-col gap-6 items-start" : "grid grid-cols-1 md:grid-cols-2 gap-8 items-start"}>
          <div className="space-y-4">
            {Array.isArray(bio) ? (
              bio.map((p, idx) => (
                <EditableText
                  key={idx}
                  as="p"
                  value={p}
                  onSave={(val) => handleBioChange(val, idx)}
                  className="text-base leading-relaxed block"
                  style={{ color: 'var(--theme-text-secondary)' }}
                />
              ))
            ) : (
              <EditableText
                as="p"
                value={bio}
                onSave={(val) => updateSectionField(sectionId, 'bio', val)}
                className="text-base leading-relaxed block"
                style={{ color: 'var(--theme-text-secondary)' }}
              />
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {stats?.map((stat, idx) => (
              <div key={idx} className="p-5 rounded-2xl border"
                   style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)' }}>
                <EditableText
                  as="div"
                  value={stat.value}
                  onSave={(val) => handleStatChange(val, 'value', idx)}
                  singleLine
                  className="text-2xl font-bold"
                  style={{ color: 'var(--theme-accent)' }}
                />
                <EditableText
                  as="div"
                  value={stat.label}
                  onSave={(val) => handleStatChange(val, 'label', idx)}
                  singleLine
                  className="text-xs"
                  style={{ color: 'var(--theme-text-secondary)' }}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
