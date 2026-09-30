import React from 'react';
import { Briefcase, Building2 } from 'lucide-react';
import { EditableText } from '../../common/EditableText';
import { usePortfolio } from '../../../context/PortfolioContext';

export const ExperienceSection = ({ data, variant = 'timeline', sectionId }) => {
  const { updateSectionField } = usePortfolio();
  const { heading, subheading, items = [] } = data || {};

  const handleItemUpdate = (itemIndex, field, newVal) => {
    const updatedItems = [...items];
    updatedItems[itemIndex] = { ...updatedItems[itemIndex], [field]: newVal };
    updateSectionField(sectionId, 'items', updatedItems);
  };

  return (
    <section id="experience" className="py-16 px-6 md:px-12 max-w-5xl mx-auto">
      <div className="mb-12">
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
          value={heading || 'Work Experience'}
          onSave={(val) => updateSectionField(sectionId, 'heading', val)}
          singleLine
          className="text-3xl sm:text-4xl font-extrabold tracking-tight block"
          style={{ fontFamily: 'var(--theme-heading-font)', color: 'var(--theme-text-primary)' }}
        />
      </div>

      {variant === 'timeline' ? (
        <div className="relative pl-6 sm:pl-8 border-l space-y-12"
             style={{ borderColor: 'var(--theme-border)' }}>
          {items.map((item, idx) => (
            <div key={item.id || idx} className="relative group">
              {/* Timeline Glowing Node */}
              <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-4 h-4 rounded-full border-2 transition-transform duration-300 group-hover:scale-125"
                   style={{
                     backgroundColor: 'var(--theme-bg)',
                     borderColor: 'var(--theme-accent)',
                     boxShadow: '0 0 12px var(--theme-accent)'
                   }} />

              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-xs font-mono px-3 py-1 rounded-full border font-semibold"
                        style={{
                          backgroundColor: 'var(--theme-surface)',
                          borderColor: 'var(--theme-border)',
                          color: 'var(--theme-accent)'
                        }}>
                    <EditableText
                      value={item.period}
                      onSave={(val) => handleItemUpdate(idx, 'period', val)}
                      singleLine
                    />
                  </span>
                  <span className="text-sm font-medium flex items-center gap-1.5"
                        style={{ color: 'var(--theme-text-secondary)' }}>
                    <Building2 className="w-3.5 h-3.5" />
                    <EditableText
                      value={item.company}
                      onSave={(val) => handleItemUpdate(idx, 'company', val)}
                      singleLine
                    />
                  </span>
                </div>

                <EditableText
                  as="h3"
                  value={item.role}
                  onSave={(val) => handleItemUpdate(idx, 'role', val)}
                  singleLine
                  className="text-xl sm:text-2xl font-bold tracking-tight block"
                  style={{ color: 'var(--theme-text-primary)', fontFamily: 'var(--theme-heading-font)' }}
                />

                <EditableText
                  as="p"
                  value={item.description}
                  onSave={(val) => handleItemUpdate(idx, 'description', val)}
                  className="text-sm sm:text-base leading-relaxed max-w-2xl block"
                  style={{ color: 'var(--theme-text-secondary)', fontFamily: 'var(--theme-body-font)' }}
                />

                {item.technologies?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {item.technologies.map((tech, tIdx) => (
                      <span key={tIdx} className="text-xs font-mono px-2 py-0.5 rounded border"
                            style={{
                              backgroundColor: 'color-mix(in srgb, var(--theme-text-primary) 4%, transparent)',
                              borderColor: 'var(--theme-border)',
                              color: 'var(--theme-text-secondary)'
                            }}>
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Clean Cards Variant */
        <div className="space-y-4">
          {items.map((item, idx) => (
            <div key={item.id || idx}
                 className="p-6 rounded-2xl border transition-all hover:translate-x-1"
                 style={{ backgroundColor: 'var(--theme-surface)', borderColor: 'var(--theme-border)' }}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <h3 className="text-lg font-bold" style={{ color: 'var(--theme-text-primary)' }}>
                  <EditableText
                    value={item.role}
                    onSave={(val) => handleItemUpdate(idx, 'role', val)}
                    singleLine
                  />{' '}
                  <span style={{ color: 'var(--theme-accent)' }}>@ {item.company}</span>
                </h3>
                <span className="text-xs font-mono" style={{ color: 'var(--theme-text-secondary)' }}>
                  <EditableText
                    value={item.period}
                    onSave={(val) => handleItemUpdate(idx, 'period', val)}
                    singleLine
                  />
                </span>
              </div>
              <EditableText
                as="p"
                value={item.description}
                onSave={(val) => handleItemUpdate(idx, 'description', val)}
                className="text-sm leading-relaxed block"
                style={{ color: 'var(--theme-text-secondary)' }}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
