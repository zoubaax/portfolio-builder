import React, { useState } from 'react';
import { Mail, Copy, Check, Send, MapPin } from 'lucide-react';
import { EditableText } from '../../common/EditableText';
import { usePortfolio } from '../../../context/PortfolioContext';

export const ContactSection = ({ data, variant = 'minimal-card', sectionId }) => {
  const { updateSectionField } = usePortfolio();
  const { heading, subheading, text, email, location, buttonText } = data || {};
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!email) return;
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="contact" className="py-20 px-6 md:px-12 max-w-4xl mx-auto">
      <div className="relative rounded-3xl border overflow-hidden p-8 sm:p-12 text-center"
           style={{
             backgroundColor: 'var(--theme-surface)',
             borderColor: 'var(--theme-border)',
           }}>
        {/* Glow backdrop */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-36 blur-3xl opacity-20 pointer-events-none"
             style={{ backgroundColor: 'var(--theme-accent)' }} />

        {subheading && (
          <EditableText
            as="p"
            value={subheading}
            onSave={(val) => updateSectionField(sectionId, 'subheading', val)}
            singleLine
            className="text-xs uppercase tracking-widest font-bold mb-3 block"
            style={{ color: 'var(--theme-accent)' }}
          />
        )}

        <EditableText
          as="h2"
          value={heading || 'Get In Touch'}
          onSave={(val) => updateSectionField(sectionId, 'heading', val)}
          singleLine
          className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-4 block"
          style={{ fontFamily: 'var(--theme-heading-font)', color: 'var(--theme-text-primary)' }}
        />

        <EditableText
          as="p"
          value={text}
          onSave={(val) => updateSectionField(sectionId, 'text', val)}
          className="text-base sm:text-lg max-w-xl mx-auto mb-8 leading-relaxed block"
          style={{ color: 'var(--theme-text-secondary)', fontFamily: 'var(--theme-body-font)' }}
        />

        {email && (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a href={`mailto:${email}`}
               className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm transition-all duration-200 shadow-lg hover:scale-105"
               style={{
                 backgroundColor: 'var(--theme-accent)',
                 color: '#ffffff'
               }}>
              <Send className="w-4 h-4" />
              <span>{buttonText || 'Send Message'}</span>
            </a>

            <button type="button" onClick={handleCopy}
                    className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl text-sm font-medium border transition-all hover:bg-white/5 active:scale-95"
                    style={{
                      borderColor: 'var(--theme-border)',
                      color: 'var(--theme-text-primary)',
                      backgroundColor: 'rgba(255, 255, 255, 0.02)'
                    }}>
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span className="font-mono text-xs">{email}</span>
            </button>
          </div>
        )}

        {location && (
          <div className="mt-8 flex items-center justify-center gap-1.5 text-xs"
               style={{ color: 'var(--theme-text-secondary)' }}>
            <MapPin className="w-3.5 h-3.5" style={{ color: 'var(--theme-accent)' }} />
            <EditableText
              value={location}
              onSave={(val) => updateSectionField(sectionId, 'location', val)}
              singleLine
            />
          </div>
        )}
      </div>
    </section>
  );
};
