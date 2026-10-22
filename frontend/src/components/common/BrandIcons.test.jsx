import React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import {
  GithubIcon,
  LinkedinIcon,
  TwitterIcon,
  XIcon,
  WhatsappIcon,
  InstagramIcon,
  TelegramIcon,
  DiscordIcon,
  MailIcon,
  PhoneIcon,
  YoutubeIcon,
  WebsiteIcon,
  getSocialIcon,
} from './BrandIcons';

describe('BrandIcons Components', () => {
  it('renders all SVG icon components without crashing', () => {
    const icons = [
      <GithubIcon key="gh" />,
      <LinkedinIcon key="li" />,
      <TwitterIcon key="tw" />,
      <XIcon key="x" />,
      <WhatsappIcon key="wa" />,
      <InstagramIcon key="ig" />,
      <TelegramIcon key="tg" />,
      <DiscordIcon key="dc" />,
      <MailIcon key="mail" />,
      <PhoneIcon key="phone" />,
      <YoutubeIcon key="yt" />,
      <WebsiteIcon key="web" />,
    ];

    icons.forEach((icon) => {
      const { container } = render(icon);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveClass('w-4');
    });
  });

  describe('getSocialIcon helper', () => {
    it('returns the correct icon element for known platforms', () => {
      const platforms = ['github', 'linkedin', 'twitter', 'x', 'whatsapp', 'instagram', 'telegram', 'discord', 'email', 'phone', 'youtube'];
      
      platforms.forEach((platform) => {
        const { container } = render(getSocialIcon(platform, 'w-5 h-5'));
        const svg = container.querySelector('svg');
        expect(svg).toBeInTheDocument();
        expect(svg).toHaveClass('w-5');
      });
    });

    it('falls back to WebsiteIcon for unknown platform names', () => {
      const { container } = render(getSocialIcon('unknown_platform'));
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });
});
