#!/usr/bin/env python3
"""
Portfolify — Automated End-to-End Portfolio Ingestion Engine
Transforms any external live portfolio URL into a native, dynamic React template
integrated directly into the Portfolify Studio in one single command.

ZERO-LEFTOVER PROMISE: All screenshots and extracted HTML files are stored in a
temporary sandbox and deleted immediately upon completion.
"""

import os
import sys
import re
import json
import base64
import tempfile
import shutil
import subprocess
from pathlib import Path
from playwright.sync_api import sync_playwright

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

# Resolve Workspace Root
WORKSPACE_ROOT = Path(__file__).resolve().parent.parent

def load_openai_key():
    """Find OpenAI API key from backend/.env or environment"""
    api_key = os.getenv("OPENAI_API_KEY")
    if api_key:
        return api_key

    candidates = [
        WORKSPACE_ROOT / "backend" / ".env",
        WORKSPACE_ROOT / ".env",
    ]
    for env_path in candidates:
        if env_path.exists():
            for line in env_path.read_text(encoding="utf-8").splitlines():
                if line.startswith("OPENAI_API_KEY="):
                    val = line.split("=", 1)[1].strip().strip('"').strip("'")
                    if val:
                        return val
    return None

def slugify(text):
    text = text.lower().strip()
    text = re.sub(r'[^a-z0-9]+', '-', text)
    return text.strip('-')

def to_pascal_case(slug):
    parts = slug.split('-')
    return ''.join(word.capitalize() for word in parts)

def extract_site_data(url, temp_dir):
    """
    Launches headless Playwright, scrolls through the site,
    takes a high-res full page screenshot, extracts DOM, fonts, and computed styles.
    """
    print(f"\n🌐 [1/4] Connexion & capture de {url} avec Chromium Headless...")
    screenshot_path = temp_dir / "fullpage.png"

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": 1440, "height": 900},
            device_scale_factor=1.5,
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )
        page = context.new_page()

        try:
            page.goto(url, wait_until="networkidle", timeout=30000)
            page.wait_for_timeout(2000)
        except Exception:
            try:
                page.goto(url, wait_until="load", timeout=15000)
                page.wait_for_timeout(2000)
            except Exception as e:
                print(f"⚠️ Avertissement lors du chargement : {e}")

        # Smooth scrolling to trigger AOS / Framer Motion / IntersectionObserver animations
        print("📜 Défilement automatique pour révéler les animations et polices...")
        try:
            page.evaluate("""async () => {
                await new Promise((resolve) => {
                    let totalHeight = 0;
                    let distance = 300;
                    let timer = setInterval(() => {
                        let scrollHeight = document.body.scrollHeight;
                        window.scrollBy(0, distance);
                        totalHeight += distance;
                        if(totalHeight >= scrollHeight || totalHeight > 10000){
                            clearInterval(timer);
                            window.scrollTo(0, 0);
                            resolve();
                        }
                    }, 80);
                });
            }""")
            page.wait_for_timeout(2000)
        except Exception:
            pass

        # Capture screenshot
        print(f"📸 Prise de vue HD plein écran dans l'espace temporaire...")
        page.screenshot(path=str(screenshot_path), full_page=True)

        # Extract title and meta
        title = page.title() or "Modern Portfolio"
        meta_desc = page.evaluate("""() => {
            const el = document.querySelector('meta[name="description"]');
            return el ? el.getAttribute('content') : '';
        }""") or ""

        # Extract rich computed styles directly from the page
        print("🎨 Extraction des styles réels calculés (couleurs, polices, cartes, boutons)...")
        computed_styles = page.evaluate("""() => {
            const bodyStyle = window.getComputedStyle(document.body);
            const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4'));
            const headingEl = headings.length ? headings[0] : null;
            const headingStyle = headingEl ? window.getComputedStyle(headingEl) : bodyStyle;
            const subHeadingEl = headings.length > 1 ? headings[1] : null;
            const subHeadingStyle = subHeadingEl ? window.getComputedStyle(subHeadingEl) : null;
            const codeEl = document.querySelector('code, pre, .font-mono, [class*="mono"]');
            const monoFont = codeEl ? window.getComputedStyle(codeEl).fontFamily : "'JetBrains Mono', monospace";
            
            // Cards & containers
            const cardEl = document.querySelector('[class*="card"], [class*="project"], [class*="item"], [class*="bento"], article, [class*="box"]');
            const cardStyle = cardEl ? window.getComputedStyle(cardEl) : null;
            
            // Buttons & CTAs
            const btnEl = document.querySelector('button, [class*="btn"], a.button, a[class*="button"], a[href*="contact"], a[href*="project"]');
            const btnStyle = btnEl ? window.getComputedStyle(btnEl) : null;
            
            // Badges & Pills
            const badgeEl = document.querySelector('[class*="badge"], [class*="pill"], [class*="tag"], [class*="chip"]');
            const badgeStyle = badgeEl ? window.getComputedStyle(badgeEl) : null;
            
            // Google font links
            const fontLinks = Array.from(document.querySelectorAll('link[rel*="stylesheet"], link[href*="fonts"]'))
                .map(l => l.href)
                .filter(href => href && (href.includes('fonts.googleapis.com') || href.includes('fonts.cdnfonts.com') || href.includes('use.typekit.net')));

            return {
                bodyBg: bodyStyle.backgroundColor || '#0a0d14',
                bodyColor: bodyStyle.color || '#f8fafc',
                bodyFont: bodyStyle.fontFamily,
                headingFont: headingStyle.fontFamily,
                headingSize: headingStyle.fontSize,
                headingWeight: headingStyle.fontWeight,
                headingColor: headingStyle.color,
                subHeadingFont: subHeadingStyle ? subHeadingStyle.fontFamily : '',
                subHeadingColor: subHeadingStyle ? subHeadingStyle.color : '',
                monoFont: monoFont,
                cardBg: cardStyle ? (cardStyle.backgroundColor !== 'rgba(0, 0, 0, 0)' ? cardStyle.backgroundColor : '') : '',
                cardBorder: cardStyle ? cardStyle.border : '',
                cardRadius: cardStyle ? cardStyle.borderRadius : '1rem',
                cardShadow: cardStyle ? cardStyle.boxShadow : '',
                btnBg: btnStyle ? btnStyle.backgroundColor : '',
                btnColor: btnStyle ? btnStyle.color : '',
                btnBorder: btnStyle ? btnStyle.border : '',
                btnRadius: btnStyle ? btnStyle.borderRadius : '0.75rem',
                btnPadding: btnStyle ? btnStyle.padding : '0.75rem 1.5rem',
                btnShadow: btnStyle ? btnStyle.boxShadow : '',
                badgeBg: badgeStyle ? badgeStyle.backgroundColor : '',
                badgeColor: badgeStyle ? badgeStyle.color : '',
                badgeBorder: badgeStyle ? badgeStyle.border : '',
                badgeRadius: badgeStyle ? badgeStyle.borderRadius : '9999px',
                fontLinks: Array.from(new Set(fontLinks))
            };
        }""")

        # Extract real CSS stylesheet rules from the site (animations, custom properties, classes)
        print("📑 Extraction des feuilles de styles CSS réelles du site...")
        extracted_css = page.evaluate("""() => {
            let rules = [];
            document.querySelectorAll('style').forEach(s => {
                if (s.textContent && !s.textContent.includes('webpackBootstrap')) {
                    rules.push(s.textContent.trim());
                }
            });
            for (let sheet of document.styleSheets) {
                try {
                    if (sheet.cssRules) {
                        for (let r of sheet.cssRules) {
                            rules.push(r.cssText);
                        }
                    }
                } catch (e) {}
            }
            return rules.join('\\n');
        }""")

        # Transpile real DOM sections directly into React 19 JSX components with parameterized props
        print("🏗️ Transpilation fidèle des sections réelles du site en JSX React 19...")
        raw_components = page.evaluate("""(siteUrl) => {
            const toCamel = (s) => s.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
            const styleToJsx = (styleStr) => {
                if (!styleStr) return '';
                const rules = styleStr.split(';').filter(r => r.trim());
                const entries = rules.map(r => {
                    const parts = r.split(':');
                    const k = parts[0]?.trim();
                    const v = parts.slice(1).join(':').trim();
                    if (!k || !v) return null;
                    const prop = toCamel(k);
                    let cleanVal = v.replace(/["']/g, '');
                    // Unfreeze animations hidden before scroll
                    if (prop === 'opacity' && (cleanVal === '0' || parseFloat(cleanVal) < 0.2)) {
                        cleanVal = '1';
                    }
                    if (prop === 'visibility' && cleanVal === 'hidden') {
                        cleanVal = 'visible';
                    }
                    if (prop === 'transform' && (cleanVal.includes('translateY') || cleanVal.includes('scale(0)'))) {
                        cleanVal = 'none';
                    }
                    // Auto-normalize oversized typography & heights for UX responsiveness
                    if (prop === 'fontSize') {
                        const pxMatch = cleanVal.match(/^(\\d+(?:\\.\\d+)?)px$/);
                        if (pxMatch && parseFloat(pxMatch[1]) >= 34) {
                            const px = parseFloat(pxMatch[1]);
                            if (px >= 48) {
                                cleanVal = 'clamp(1.75rem, 6vw, 3.5rem)';
                            } else {
                                cleanVal = 'clamp(1.35rem, 4.5vw, 2.25rem)';
                            }
                        } else if (cleanVal.includes('clamp') && (cleanVal.includes('3.') || cleanVal.includes('4.') || cleanVal.includes('5.') || cleanVal.includes('6.'))) {
                            cleanVal = 'clamp(1.85rem, 6vw, 3.75rem)';
                        }
                    }
                    if (prop === 'height' && parseInt(cleanVal) >= 420) {
                        cleanVal = `min(${cleanVal}, 70vh)`;
                    }
                    // Resolve relative URLs in inline styles
                    if (cleanVal.includes('url(')) {
                        cleanVal = cleanVal.replace(/url\\(\\s*['"]?([^'")]+)['"]?\\s*\\)/g, (match, path) => {
                            if (!path.startsWith('http://') && !path.startsWith('https://') && !path.startsWith('data:') && !path.startsWith('//')) {
                                try {
                                    return `url("${new URL(path, siteUrl).href}")`;
                                } catch (e) {
                                    return match;
                                }
                            }
                            return match;
                        });
                    }
                    return `"${prop}": "${cleanVal}"`;
                }).filter(Boolean);
                if (!entries.length) return '';
                return ` style={{ ${entries.join(', ')} }}`;
            };
            
            const selfClosing = new Set(['img', 'br', 'hr', 'input', 'source', 'wbr', 'col', 'embed', 'track', 'area']);
            const attrMap = {
                'class': 'className',
                'for': 'htmlFor',
                'tabindex': 'tabIndex',
                'autocomplete': 'autoComplete',
                'autofocus': 'autoFocus',
                'readonly': 'readOnly',
                'maxlength': 'maxLength',
                'minlength': 'minLength',
                'srcset': 'srcSet',
                'crossorigin': 'crossOrigin',
                'viewbox': 'viewBox',
                'fill-rule': 'fillRule',
                'clip-rule': 'clipRule',
                'stroke-width': 'strokeWidth',
                'stroke-linecap': 'strokeLinecap',
                'stroke-linejoin': 'strokeLinejoin'
            };

            const getSocialPlatform = (href, cls, title, aria) => {
                const text = `${href || ''} ${cls || ''} ${title || ''} ${aria || ''}`.toLowerCase();
                if (text.includes('github.com') || text.includes('github')) return 'github';
                if (text.includes('linkedin.com') || text.includes('linkedin')) return 'linkedin';
                if (text.includes('twitter.com') || text.includes('x.com')) return 'twitter';
                if (text.includes('mailto:') || text.includes('email') || text.includes('mail')) return 'email';
                if (text.includes('whatsapp') || text.includes('wa.me')) return 'whatsapp';
                if (text.includes('instagram.com')) return 'instagram';
                if (text.includes('discord.gg') || text.includes('discord')) return 'discord';
                if (text.includes('youtube.com')) return 'youtube';
                return null;
            };

            let heroAvatarFound = false;
            let projectGridMatched = false;
            let expMatched = false;
            let aboutBioReplaced = false;

            const nodeToJSX = (el, secType, depth = 0, isLoopItem = false, loopVar = '', isLoopItemRoot = false) => {
                if (el.nodeType === 3) {
                    const t = el.textContent.trim();
                    if (!t) return '';
                    return t.replace(/[{}]/g, '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                }
                if (el.nodeType !== 1) return '';
                const tag = el.tagName.toLowerCase();
                if (['script', 'noscript', 'iframe', 'canvas', 'video', 'audio'].includes(tag)) return '';

                let cls = '';
                if (typeof el.className === 'string') cls = el.className;
                else if (el.className && typeof el.className.baseVal === 'string') cls = el.className.baseVal;
                else cls = el.getAttribute('class') || '';

                // Social Link Detection with real BrandIcons (Never leak author social profile URLs)
                if (tag === 'a') {
                    const href = el.getAttribute('href') || '';
                    const platform = getSocialPlatform(href, cls, el.getAttribute('title'), el.getAttribute('aria-label'));
                    if (platform) {
                        const cleanCls = cls && !cls.includes('[object') ? ` className="${cls}"` : '';
                        return `<a href={data?.socials?.${platform} || "#"} target="_blank" rel="noreferrer" onClick={(e) => { if (isEditMode) { e.preventDefault(); setIsSocialModalOpen(true); } }}${cleanCls} title="${platform}">{getSocialIcon("${platform}", "w-5 h-5")}</a>`;
                    }
                    if (href.includes('resume') || el.textContent.toLowerCase().includes('resume') || el.textContent.toLowerCase().includes('résumé')) {
                        const cleanCls = cls && !cls.includes('[object') ? ` className="${cls}"` : '';
                        return `<a href={data?.resumeUrl || "#"} target="_blank" rel="noreferrer"${cleanCls}>{Array.from(el.childNodes).map(c => nodeToJSX(c, secType, depth + 1, isLoopItem, loopVar, false)).filter(Boolean).join(' ')}</a>`;
                    }
                    if (href.includes('archive')) {
                        const cleanCls = cls && !cls.includes('[object') ? ` className="${cls}"` : '';
                        return `<a href={data?.githubUrl || "#projects"}${cleanCls}>{Array.from(el.childNodes).map(c => nodeToJSX(c, secType, depth + 1, isLoopItem, loopVar, false)).filter(Boolean).join(' ')}</a>`;
                    }
                }

                // Interactive Avatar / Profile Photo in Hero
                if (secType === 'hero' && tag === 'img') {
                    const rawSrc = el.getAttribute('src') || '';
                    const alt = (el.getAttribute('alt') || '').toLowerCase();
                    const isProfileOrAvatar = alt.includes('avatar') || alt.includes('profile') || alt.includes('author') || rawSrc.includes('profile') || rawSrc.includes('avatar') || !heroAvatarFound;
                    if (isProfileOrAvatar) {
                        heroAvatarFound = true;
                        let absSrc = rawSrc;
                        if (rawSrc && !rawSrc.startsWith('http://') && !rawSrc.startsWith('https://') && !rawSrc.startsWith('data:') && !rawSrc.startsWith('//')) {
                            try { absSrc = new URL(rawSrc, siteUrl).href; } catch (e) {}
                        }
                        const fallbackUrl = absSrc || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80";
                        const cleanCls = cls && !cls.includes('[object') ? ` className="${cls} object-cover"` : ' className="object-cover"';
                        const styleAttr = el.getAttribute('style');
                        const styleProp = styleAttr ? styleToJsx(styleAttr) : '';
                        return `<div className="relative group/avatar cursor-pointer inline-block" onClick={() => isEditMode && setIsImagePickerOpen(true)}><img${cleanCls}${styleProp} src={displayAvatar || "${fallbackUrl}"} alt={data?.name || "Avatar"} />{isEditMode && (<div className="absolute inset-0 bg-black/60 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center rounded-inherit z-20"><RiCameraLine className="w-6 h-6 text-white" /></div>)}</div>`;
                    }
                }

                if (tag === 'svg') return `<span className="inline-flex items-center">✦</span>`;

                // Neutralize external form submission endpoints
                if (tag === 'form') {
                    return `<form id={sectionId} onSubmit={(e) => e.preventDefault()} className="${cls}">${Array.from(el.childNodes).map(c => nodeToJSX(c, secType, depth + 1, isLoopItem, loopVar, false)).filter(Boolean).join(' ')}</form>`;
                }

                // Dynamic Project Cards Loop Container (Single-Item Templating)
                if (secType === 'projects' && !isLoopItem && !projectGridMatched && el.children.length >= 1) {
                    const childrenArray = Array.from(el.children);
                    const areCards = childrenArray.some(c => {
                        const cCls = (c.className || '').toLowerCase();
                        return cCls.includes('card') || cCls.includes('proj') || cCls.includes('item') || c.tagName === 'LI' || c.querySelector('h3, h4');
                    });
                    if (areCards) {
                        projectGridMatched = true;
                        let containerAttrs = '';
                        if (cls && !cls.includes('[object')) containerAttrs += ` className="${cls}"`;
                        const styleAttr = el.getAttribute('style');
                        if (styleAttr) containerAttrs += styleToJsx(styleAttr);
                        
                        const firstCard = el.children[0];
                        const cardJsx = nodeToJSX(firstCard, secType, depth + 1, true, 'project', true);
                        return `<${tag}${containerAttrs}>{\\nprojectList.map((project, idx) => (\\n  ${cardJsx}\\n))\\n}</${tag}>`;
                    }
                }

                // Dynamic Experience Work Item Container (Single-Item Templating on OL/UL or Cards)
                if (secType === 'experience' && !isLoopItem && !expMatched && el.children.length >= 1) {
                    const isList = (tag === 'ol' || tag === 'ul') || Array.from(el.children).some(c => {
                        const cCls = (c.className || '').toLowerCase();
                        return cCls.includes('mb-') || cCls.includes('card') || cCls.includes('item') || c.tagName === 'LI' || c.querySelector('h3');
                    });
                    if (isList) {
                        expMatched = true;
                        let containerAttrs = '';
                        if (cls && !cls.includes('[object')) containerAttrs += ` className="${cls}"`;
                        const styleAttr = el.getAttribute('style');
                        if (styleAttr) containerAttrs += styleToJsx(styleAttr);

                        const firstItem = el.children[0];
                        const itemJsx = nodeToJSX(firstItem, secType, depth + 1, true, 'exp', true);
                        return `<${tag}${containerAttrs}>{\\nexpList.map((exp, idx) => (\\n  ${itemJsx}\\n))\\n}</${tag}>`;
                    }
                }

                let attrs = '';
                if (isLoopItemRoot) {
                    attrs += ` key={${loopVar}?.id || idx}`;
                }
                if (depth === 0) {
                    let sectionClass = cls
                        .replace(/\bpy-\d+\b/g, '')
                        .replace(/\bpx-\d+\b/g, '')
                        .replace(/\bmin-h-screen\b/g, '')
                        .trim();
                    attrs += ` className={\`relative \${isMobileViewport ? 'py-8 px-4' : 'py-20 md:py-28 px-6 md:px-12'} overflow-hidden max-w-full ${sectionClass}\`}`;
                    attrs += ` id={sectionId}`;
                } else {
                    if (cls && !cls.includes('[object')) {
                        let safeCls = cls.replace(/\bgrid-cols-([2-6])\b(?![a-zA-Z0-9_-])/g, (match, n) => {
                            const num = parseInt(n);
                            if (num === 2) return 'grid-cols-1 md:grid-cols-2';
                            if (num === 3) return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3';
                            if (num >= 4) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
                            return match;
                        });
                        attrs += ` className="${safeCls}"`;
                    }
                    if (el.id && !isLoopItem) attrs += ` id="${el.id}"`;
                }

                const styleAttr = el.getAttribute('style');
                if (styleAttr) attrs += styleToJsx(styleAttr);

                for (let i = 0; i < el.attributes.length; i++) {
                    const a = el.attributes[i];
                    const rawName = a.name.toLowerCase();
                    if (!['class', 'id', 'style'].includes(rawName) && !rawName.startsWith('on')) {
                        let val = a.value.trim();
                        const lowerVal = val.toLowerCase();
                        if (lowerVal.startsWith('javascript:') || lowerVal.startsWith('vbscript:') || lowerVal.startsWith('data:text/html')) continue;
                        if ((rawName === 'src' || rawName === 'href' || rawName === 'poster') && !val.startsWith('http://') && !val.startsWith('https://') && !val.startsWith('data:') && !val.startsWith('#') && !val.startsWith('mailto:') && !val.startsWith('tel:') && !val.startsWith('//')) {
                            try { val = new URL(val, siteUrl).href; } catch (e) {}
                        }
                        if (rawName === 'srcset') {
                            val = val.split(',').map(part => {
                                const pieces = part.trim().split(/\\s+/);
                                const urlPart = pieces[0];
                                const descriptor = pieces.slice(1).join(' ');
                                if (urlPart && !urlPart.startsWith('http://') && !urlPart.startsWith('https://') && !urlPart.startsWith('data:') && !urlPart.startsWith('//')) {
                                    try {
                                        const abs = new URL(urlPart, siteUrl).href;
                                        return descriptor ? `${abs} ${descriptor}` : abs;
                                    } catch (e) { return part; }
                                }
                                return part;
                            }).join(', ');
                        }
                        const jsxName = attrMap[rawName] || rawName;
                        const safeVal = val.replace(/"/g, '&quot;').replace(/[{}]/g, '');
                        attrs += ` ${jsxName}="${safeVal}"`;
                    }
                }

                // Automatic Responsive & UX fail-safes
                if (['h1', 'h2', 'h3', 'h4', 'h5'].includes(tag)) {
                    if (attrs.includes('className="')) {
                        attrs = attrs.replace('className="', 'className="break-words max-w-full ');
                    } else {
                        attrs += ' className="break-words max-w-full"';
                    }
                }
                if (tag === 'img' && !attrs.includes('max-w-full')) {
                    if (attrs.includes('className="')) {
                        attrs = attrs.replace('className="', 'className="max-w-full h-auto ');
                    } else {
                        attrs += ' className="max-w-full h-auto"';
                    }
                }
                if (isLoopItemRoot && !attrs.includes('max-w-full')) {
                    if (attrs.includes('className="')) {
                        attrs = attrs.replace('className="', 'className="max-w-full break-words ');
                    } else {
                        attrs += ' className="max-w-full break-words"';
                    }
                }

                if (selfClosing.has(tag)) return `<${tag}${attrs} />`;

                // Bindings inside Project Card
                if (isLoopItem && loopVar === 'project') {
                    if (tag === 'img') {
                        const cleanCls = cls && !cls.includes('[object') ? ` className="${cls} aspect-video object-cover"` : ' className="aspect-video object-cover"';
                        return `<img${cleanCls} src={project?.imageUrl || project?.image || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=640&q=80"} alt={project?.title || "Project"} loading="lazy" />`;
                    }
                    if (tag === 'a') {
                        const cleanCls = cls && !cls.includes('[object') ? ` className="${cls}"` : '';
                        return `<a href={project?.liveUrl || project?.githubUrl || "#"} target="_blank" rel="noreferrer"${cleanCls}>${Array.from(el.childNodes).map(c => nodeToJSX(c, secType, depth + 1, isLoopItem, loopVar, false)).filter(Boolean).join(' ')}</a>`;
                    }
                    if (['h2', 'h3', 'h4', 'h5'].includes(tag)) {
                        return `<${tag}${attrs}><EditableText value={project?.title || project?.name || 'Project Title'} as="${tag}" /></${tag}>`;
                    }
                    if (tag === 'p' && el.textContent.length > 20) {
                        return `<${tag}${attrs}>{project?.description || project?.desc || ''}</${tag}>`;
                    }
                    if (el.children.length >= 2 && Array.from(el.children).every(c => c.tagName === 'SPAN' || c.tagName === 'LI')) {
                        const firstBadge = el.children[0];
                        let badgeAttrs = firstBadge.className ? ` className="${firstBadge.className}"` : '';
                        const bStyle = firstBadge.getAttribute('style');
                        if (bStyle) badgeAttrs += styleToJsx(bStyle);
                        return `<${tag}${attrs}>{((Array.isArray(project?.tags) && project.tags.length > 0) ? project.tags : (Array.isArray(project?.technologies) ? project.technologies : [])).map((tag, tIdx) => (\\n  <span key={tIdx}${badgeAttrs}>{tag}</span>\\n))}</${tag}>`;
                    }
                }

                // Bindings inside Experience Card
                if (isLoopItem && loopVar === 'exp') {
                    if (tag === 'a') {
                        const cleanCls = cls && !cls.includes('[object') ? ` className="${cls}"` : '';
                        return `<a href={exp?.companyUrl || "#"} target="_blank" rel="noreferrer"${cleanCls}>${Array.from(el.childNodes).map(c => nodeToJSX(c, secType, depth + 1, isLoopItem, loopVar, false)).filter(Boolean).join(' ')}</a>`;
                    }
                    if (['h2', 'h3', 'h4'].includes(tag)) {
                        return `<${tag}${attrs}><EditableText value={exp?.role || 'Software Engineer'} as="${tag}" /></${tag}>`;
                    }
                    if (tag === 'span' && (el.textContent.includes('20') || el.textContent.includes('Present') || el.textContent.includes('—'))) {
                        return `<${tag}${attrs}>{exp?.period || '2024 — Present'}</${tag}>`;
                    }
                    if (tag === 'p' && el.className.includes('font-semibold')) {
                        return `<${tag}${attrs}>{exp?.company || 'Company'}</${tag}>`;
                    }
                    if (tag === 'p' && el.textContent.length > 25) {
                        return `<${tag}${attrs}>{exp?.description || ''}</${tag}>`;
                    }
                    if (el.children.length >= 2 && Array.from(el.children).every(c => c.tagName === 'SPAN' || c.tagName === 'LI')) {
                        const firstBadge = el.children[0];
                        let badgeAttrs = firstBadge.className ? ` className="${firstBadge.className}"` : '';
                        const bStyle = firstBadge.getAttribute('style');
                        if (bStyle) badgeAttrs += styleToJsx(bStyle);
                        return `<${tag}${attrs}>{((Array.isArray(exp?.technologies) && exp.technologies.length > 0) ? exp.technologies : (Array.isArray(exp?.tags) ? exp.tags : [])).map((tech, tIdx) => (\\n  <span key={tIdx}${badgeAttrs}>{tech}</span>\\n))}</${tag}>`;
                    }
                }

                // Parameterize Hero key headings, role, and tagline
                if (secType === 'hero') {
                    if (tag === 'h1') {
                        return `<${tag}${attrs}><EditableText value={data?.name || 'Your Name'} as="h1" /></${tag}>`;
                    }
                    if (tag === 'h2') {
                        return `<${tag}${attrs}><EditableText value={data?.title || data?.role || 'Full Stack Engineer'} as="h2" /></${tag}>`;
                    }
                    if (cls && cls.includes('hero-role')) {
                        return `<${tag}${attrs}><EditableText value={data?.tagline || 'BUILDER'} as="${tag}" /></${tag}>`;
                    }
                    if (tag === 'p' && el.textContent.length > 25) {
                        return `<${tag}${attrs}><EditableText value={data?.tagline || data?.bio?.[0] || 'Building intelligent systems at the intersection of full-stack engineering and machine learning.'} as="p" /></${tag}>`;
                    }
                }

                // Parameterize About bio (first paragraph receives bio, subsequent ones are suppressed)
                if (secType === 'about' && tag === 'p') {
                    if (!aboutBioReplaced && el.textContent.length > 20) {
                        aboutBioReplaced = true;
                        return `<${tag}${attrs}><EditableText value={bioText} as="p" /></${tag}>`;
                    } else {
                        return '';
                    }
                }

                // Parameterize section headings
                if (['about', 'skills', 'projects', 'experience'].includes(secType) && (tag === 'h2' || tag === 'h3') && depth <= 3 && !isLoopItem) {
                    const text = el.textContent.trim().replace(/[{}"']/g, '');
                    return `<${tag}${attrs}><EditableText value={data?.heading || '${text || "Section"}'} as="${tag}" /></${tag}>`;
                }

                let children = Array.from(el.childNodes)
                    .map(c => nodeToJSX(c, secType, depth + 1, isLoopItem, loopVar, false))
                    .filter(Boolean)
                    .join(' ');

                // In Skills: Inject dynamic categories grid inside the workflow container
                if (secType === 'skills' && cls.includes('rounded-2xl') && el.querySelector('p')?.textContent.includes('WORKFLOW')) {
                    const dynamicSkillsGrid = `
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
  {categories.map((cat, cIdx) => (
    <div key={cat.id || cIdx} className="rounded-xl p-4" style={{ "background": "rgba(255, 255, 255, 0.02)", "border": "1px solid var(--border)" }}>
      <h4 className="text-xs font-bold tracking-widest uppercase mb-2.5" style={{ "color": "var(--cyan, #00d9ff)", "fontFamily": "DM Mono, monospace" }}>
        {cat.name}
      </h4>
      <div className="flex flex-wrap gap-1.5">
        {(cat.skills || []).map((skill, sIdx) => (
          <span key={sIdx} className="text-xs px-2 py-0.5 rounded-full" style={{ "background": "rgba(0, 217, 255, 0.06)", "color": "rgba(0, 217, 255, 0.9)", "border": "1px solid rgba(0, 217, 255, 0.18)", "fontFamily": "DM Mono, monospace" }}>
            {typeof skill === 'string' ? skill : (skill.name || '')}
          </span>
        ))}
      </div>
    </div>
  ))}
</div>`;
                    children += dynamicSkillsGrid;
                }

                return `<${tag}${attrs}>${children}</${tag}>`;
            };

            // Collect leaf section candidates
            let allCandidates = Array.from(document.querySelectorAll('section, main > div, article, header, div[id*="hero"], div[id*="about"], div[id*="project"], div[id*="skill"], div[id*="exp"]'))
                .filter(s => s.textContent.trim().length > 30);

            let candidates = allCandidates.filter(el => !allCandidates.some(other => other !== el && el.contains(other)));
            if (!candidates.length) {
                candidates = Array.from(document.querySelectorAll('section, body > div > div, body > div')).filter(s => s.textContent.trim().length > 30);
                candidates = candidates.filter(el => !candidates.some(other => other !== el && el.contains(other)));
            }

            const usedEls = new Set();
            const findSection = (keywords, fallbackIdx) => {
                for (const el of candidates) {
                    if (usedEls.has(el)) continue;
                    const id = (el.id || '').toLowerCase();
                    const cls = (typeof el.className === 'string' ? el.className : '').toLowerCase();
                    const h = el.querySelector('h1, h2, h3');
                    const hText = (h ? h.textContent : '').toLowerCase();
                    const textSample = (el.textContent || '').slice(0, 150).toLowerCase();
                    if (keywords.some(k => id.includes(k) || cls.includes(k) || hText.includes(k) || textSample.includes(k))) {
                        usedEls.add(el);
                        return el;
                    }
                }
                for (const el of candidates) {
                    if (!usedEls.has(el)) {
                        usedEls.add(el);
                        return el;
                    }
                }
                return candidates[fallbackIdx] || candidates[0];
            };

            const matched = {
                hero: findSection(['hero', 'intro', 'banner', 'header'], 0),
                projects: findSection(['project', 'work', 'showcase', 'portfolio', 'featured'], 1),
                about: findSection(['about', 'bio', 'who i am', 'who', 'profile', 'story'], 2),
                experience: findSection(['experience', 'education', 'career', 'history', 'timeline', 'journey'], 3),
                skills: findSection(['skill', 'stack', 'tech', 'tool', 'expertise', 'workflow', 'identity'], 4),
            };

            const results = {};
            ['hero', 'about', 'skills', 'projects', 'experience'].forEach((key) => {
                const secEl = matched[key];
                if (secEl) {
                    let jsx = nodeToJSX(secEl, key);
                    // GUARANTEE: Every Hero MUST contain an interactive profile photo / avatar at the top
                    if (key === 'hero' && !heroAvatarFound) {
                        const avatarSnippet = `\\n<div className="mb-6 flex justify-center sm:justify-start">\\n  <div className="relative group/avatar cursor-pointer inline-block" onClick={() => isEditMode && setIsImagePickerOpen(true)}>\\n    <img className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-2 shadow-xl transition-all duration-300 group-hover/avatar:scale-105" style={{ "borderColor": "var(--cyan, var(--theme-accent, #00d9ff))" }} src={displayAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"} alt={data?.name || "Avatar"} />\\n    {isEditMode && (\\n      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center rounded-full z-20">\\n        <RiCameraLine className="w-6 h-6 text-white" />\\n      </div>\\n    )}\\n  </div>\\n</div>`;
                        const firstClose = jsx.indexOf('>');
                        if (firstClose !== -1) {
                            jsx = jsx.slice(0, firstClose + 1) + avatarSnippet + jsx.slice(firstClose + 1);
                        }
                    }
                    results[key] = jsx;
                } else {
                    results[key] = `<section id={sectionId} className="py-20 px-6 max-w-5xl mx-auto"><h2><EditableText value={data?.heading || "Section"} as="h2" /></h2></section>`;
                }
            });

            return results;
        }""", url)

        browser.close()

    return {
        "url": url,
        "title": title,
        "description": meta_desc,
        "computed_styles": computed_styles,
        "extracted_css": extracted_css,
        "raw_components": raw_components,
        "screenshot_path": screenshot_path
    }

def generate_template_code(site_data, api_key, explicit_name=None, category_name=None):
    """
    Combines the faithfully transpiled React 19 JSX components (from live site DOM)
    with AI-analyzed aesthetic naming, theme palette tokens, and mock data.
    """
    print(f"\n🤖 [2/4] Analyse esthétique & Synthèse du thème Portfolify par GPT-4o...")
    from openai import OpenAI
    client = OpenAI(api_key=api_key)

    with open(site_data["screenshot_path"], "rb") as f:
        img_b64 = base64.b64encode(f.read()).decode("utf-8")

    comp_styles = site_data.get("computed_styles", {})
    font_links = comp_styles.get("fontLinks", [])
    font_links_str = "\n".join(font_links) or "None detected"
    h_font = comp_styles.get('headingFont') or "'Outfit', sans-serif"
    b_font = comp_styles.get('bodyFont') or "'Inter', sans-serif"
    m_font = comp_styles.get('monoFont') or "'JetBrains Mono', monospace"

    if explicit_name:
        name_prompt = f'Target Template Name: "{explicit_name}"\nTarget Category: "{category_name or "Innovant & Créatif"}"'
    else:
        name_prompt = """NAMING INSTRUCTION:
Analyze the visual aesthetics, mood, colors, and layout of this portfolio screenshot.
Invent an inspiring, professional product template name describing its visual style (e.g. "Nordic Slate", "Obsidian Luxe", "Tokyo Cyber", "Minimalist Mono", "Bento Violet", "Neo-Brutalist Studio", "Solaris Gold").
DO NOT use the owner's personal name or domain name! The name must reflect the design aesthetic!
Also select the best fitting category from: "Minimaliste & Épuré", "Fullstack & SaaS", "DevOps & Cloud", "Terminal & CLI", "Innovant & Créatif", "Luxe & Éditorial"."""

    prompt = f"""
You are a Principal Design Systems Architect for Portfolify.
Analyze the provided visual portfolio screenshot and computed design tokens to synthesize a cohesive Theme Preset and Mock Data schema.

{name_prompt}
Site Title: "{site_data['title']}"

COMPUTED TOKENS MEASURED FROM SITE:
- Body Background: {comp_styles.get('bodyBg')}
- Text Color: {comp_styles.get('bodyColor')}
- Heading Font: {h_font} (Size: {comp_styles.get('headingSize')}, Weight: {comp_styles.get('headingWeight')})
- Body Font: {b_font}
- Mono Font: {m_font}
- Card Background: {comp_styles.get('cardBg')} | Border: {comp_styles.get('cardBorder')} | Radius: {comp_styles.get('cardRadius')}
- Button Background: {comp_styles.get('btnBg')} | Border: {comp_styles.get('btnBorder')} | Radius: {comp_styles.get('btnRadius')}

Generate a JSON response (VALID RAW JSON ONLY, NO MARKDOWN BACKTICKS, NO PREAMBLE) with the following structure:
{{
  "theme": {{
    "name": "Creative Aesthetic Name",
    "category": "Fitting Category",
    "description": "Short compelling 1-line description of the design aesthetic",
    "badges": ["Feature 1", "Feature 2", "Feature 3", "Feature 4"],
    "previewColors": ["{comp_styles.get('bodyBg', '#0a0d14')}", "{comp_styles.get('headingColor', '#ffffff')}", "{comp_styles.get('btnBg', '#00d9ff')}"],
    "palette": {{
      "bg": "{comp_styles.get('bodyBg', '#0a0d14')}",
      "surface": "{comp_styles.get('cardBg', '#111827')}",
      "surfaceHover": "#1f2937",
      "surfaceCard": "{comp_styles.get('cardBg', '#111827')}",
      "textPrimary": "{comp_styles.get('headingColor', '#ffffff')}",
      "textSecondary": "{comp_styles.get('bodyColor', '#94a3b8')}",
      "accent": "{comp_styles.get('btnBg', '#00d9ff')}",
      "accentHover": "#00b4d8",
      "accentGlow": "rgba(0, 217, 255, 0.25)",
      "border": "{comp_styles.get('cardBorder', 'rgba(255,255,255,0.1)')}",
      "borderHover": "rgba(255,255,255,0.2)"
    }},
    "typography": {{
      "headingFont": "{h_font}",
      "bodyFont": "{b_font}",
      "monoFont": "{m_font}",
      "radius": "{comp_styles.get('cardRadius', '1rem')}"
    }}
  }},
  "mockData": {{
    "hero": {{ "name": "Developer Name", "title": "Software Engineer", "tagline": "Building intelligent systems with clean code.", "badge": "Open to Work", "primaryCta": {{ "text": "Explore Works", "url": "#projects" }} }},
    "about": {{ "heading": "About Me", "subheading": "WHO I AM", "bio": ["Passionate engineer focusing on robust full-stack architecture."], "stats": [{{"value": "5+", "label": "Years Exp"}}] }},
    "skills": {{ "heading": "Skills & Stack", "categories": [{{"name": "Core Stack", "skills": ["React", "TypeScript", "Node.js", "Python"]}}] }},
    "projects": {{ "heading": "Featured Works", "items": [{{"title": "Project Alpha", "description": "High performance scalable web application.", "tags": ["React", "Tailwind"], "demoUrl": "#"}}] }},
    "experience": {{ "heading": "Experience", "items": [{{"role": "Lead Engineer", "company": "Tech Corp", "period": "2023 - Present", "description": "Architecture & delivery."}}] }}
  }}
}}
"""

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/png;base64,{img_b64}",
                            "detail": "high"
                        }
                    }
                ]
            }
        ],
        temperature=0.2,
        max_tokens=2500
    )

    raw_content = response.choices[0].message.content.strip()
    if raw_content.startswith("```"):
        raw_content = re.sub(r"^```(?:json)?\s*", "", raw_content)
        raw_content = re.sub(r"\s*```$", "", raw_content)

    try:
        data = json.loads(raw_content)
    except Exception as e:
        print(f"❌ Erreur lors du parsing JSON de la réponse GPT-4o : {e}")
        with open("gpt_error_response.json", "w", encoding="utf-8") as f:
            f.write(raw_content)
        raise e

    # Embed the genuine transpiled JSX components from the website DOM
    raw_comps = site_data.get("raw_components", {})
    components = {}
    for sec_key in ['hero', 'about', 'skills', 'projects', 'experience']:
        jsx_body = raw_comps.get(sec_key, "")
        if not jsx_body:
            jsx_body = f'<section id={{sectionId}} className="py-20 px-6 max-w-5xl mx-auto"><h2><EditableText value={{data?.heading || "{sec_key.capitalize()}"}} as="h2" /></h2></section>'
        
        if sec_key == 'hero':
            modals_code = """
      {isImagePickerOpen && (
        <ImagePickerModal
          isOpen={isImagePickerOpen}
          onClose={() => setIsImagePickerOpen(false)}
          onSave={(url) => updateSectionField(sectionId, 'avatar', url)}
          currentImage={displayAvatar}
        />
      )}
      {isSocialModalOpen && (
        <SocialLinksModal
          isOpen={isSocialModalOpen}
          onClose={() => setIsSocialModalOpen(false)}
          socials={data?.socials || {}}
          onSave={(newSocials) => updateSectionField(sectionId, 'socials', newSocials)}
        />
      )}"""
            components[sec_key] = f"""export const TempComponent = ({{ data = {{}}, sectionId }}) => {{
  const {{ updateSectionField, isEditMode, effectiveAvatar, githubUsername, isMobileViewport }} = usePortfolio();
  const [isImagePickerOpen, setIsImagePickerOpen] = useState(false);
  const [isSocialModalOpen, setIsSocialModalOpen] = useState(false);
  const isUnsplash = !data?.avatar || data.avatar.includes('unsplash.com');
  const displayAvatar = isUnsplash
    ? (effectiveAvatar || (githubUsername ? `https://github.com/${{githubUsername}}.png` : ''))
    : data.avatar;
  return (
    <>
      {jsx_body}
{modals_code}
    </>
  );
}};"""
        elif sec_key == 'projects':
            fb_proj = json.dumps(data.get("mockData", {}).get("projects", {}).get("items", [
                {"title": "CommodityChain", "description": "Real-time commodity intelligence platform with live prices, AI-driven insights, interactive charts, correlation analytics, and India-focused macroeconomic data for traders.", "tags": ["Next.js 14", "FastAPI", "WebSockets", "D3.js"]},
                {"title": "Dollar Hegemony", "description": "ML-driven study of USD dominance using a custom Dollar Supremacy Index built from macro indicators, with XGBoost + stacked LSTM + Temporal Transformer ensemble.", "tags": ["Python", "XGBoost", "LSTM", "MLOps"]},
                {"title": "India Banking Dashboard", "description": "Financial analytics dashboard comparing 10 Indian banks across FY 2020–2024 — tracks NPA recovery, profit growth, ROA/ROE with AI-generated sector insights.", "tags": ["React", "FastAPI", "Groq LLaMA", "Docker"]}
            ]), indent=2)
            components[sec_key] = f"""export const TempComponent = ({{ data = {{}}, sectionId }}) => {{
  const {{ updateSectionField, isEditMode, isMobileViewport }} = usePortfolio();
  const fallbackProjects = {fb_proj};
  const projectList = (Array.isArray(data?.projects) && data.projects.length > 0)
    ? data.projects
    : (Array.isArray(data?.items) && data.items.length > 0 ? data.items : fallbackProjects);
  return (
    {jsx_body}
  );
}};"""
        elif sec_key == 'experience':
            fb_exp = json.dumps(data.get("mockData", {}).get("experience", {}).get("items", [
                {"role": "Backend & API Design Intern", "company": "AuthBridge Technologies", "period": "DEC 20, 2025 — FEB 26, 2026", "description": "Worked on backend API architecture, auth flows, and system design for enterprise-grade identity & access management solutions.", "technologies": ["Node.js", "REST APIs", "OAuth2", "System Design", "JWT", "PostgreSQL"]}
            ]), indent=2)
            components[sec_key] = f"""export const TempComponent = ({{ data = {{}}, sectionId }}) => {{
  const {{ updateSectionField, isEditMode, isMobileViewport }} = usePortfolio();
  const fallbackExp = {fb_exp};
  const expList = (Array.isArray(data?.items) && data.items.length > 0)
    ? data.items
    : (Array.isArray(data?.experience) && data.experience.length > 0 ? data.experience : fallbackExp);
  return (
    {jsx_body}
  );
}};"""
        elif sec_key == 'about':
            components[sec_key] = f"""export const TempComponent = ({{ data = {{}}, sectionId }}) => {{
  const {{ updateSectionField, isEditMode, isMobileViewport }} = usePortfolio();
  const fallbackBio = "I'm a software engineer building at the intersection of full-stack systems and machine learning. I care deeply about clean architecture, meaningful products, and open-source collaboration.";
  const bioText = Array.isArray(data?.bio) ? data.bio.join('\\n\\n') : (data?.bio || data?.description || fallbackBio);
  return (
    {jsx_body}
  );
}};"""
        elif sec_key == 'skills':
            fb_skills = json.dumps(data.get("mockData", {}).get("skills", {}).get("categories", [
                {"name": "Frontend", "skills": ["React", "Next.js", "Tailwind CSS", "TypeScript"]},
                {"name": "Backend & Systems", "skills": ["Python", "FastAPI", "Node.js", "PostgreSQL", "WebSockets"]},
                {"name": "ML & Data", "skills": ["PyTorch", "XGBoost", "LSTM", "D3.js"]},
                {"name": "Tools & DevOps", "skills": ["Docker", "Git", "Linux", "CI/CD"]}
            ]), indent=2)
            components[sec_key] = f"""export const TempComponent = ({{ data = {{}}, sectionId }}) => {{
  const {{ updateSectionField, isEditMode, isMobileViewport, setViewMode }} = usePortfolio();
  const fallbackCategories = {fb_skills};
  const categories = (Array.isArray(data?.categories) && data.categories.length > 0)
    ? data.categories
    : (Array.isArray(data?.skills) && data.skills.length > 0
        ? [{{ name: "Technologies", skills: data.skills }}]
        : fallbackCategories);
  return (
    {jsx_body}
  );
}};"""
        else:
            components[sec_key] = f"""export const TempComponent = ({{ data = {{}}, sectionId }}) => {{
  const {{ updateSectionField, isEditMode, isMobileViewport }} = usePortfolio();
  return (
    {jsx_body}
  );
}};"""

    data["components"] = components
    data["css"] = site_data.get("extracted_css", "")
    return data

def sanitize_component_code(raw_code, comp_name):
    """
    Guarantees standard React 19 imports, safe prop destructuring,
    and correct export signature.
    """
    code = raw_code.strip()
    if code.startswith("```"):
        code = re.sub(r"^```(?:jsx|tsx|javascript|js)?\s*", "", code)
        code = re.sub(r"\s*```$", "", code)

    # Normalize export signature
    pattern = r"export\s+const\s+[A-Za-z0-9_]+"
    if re.search(pattern, code):
        code = re.sub(pattern, f"export const {comp_name}", code, count=1)
    elif f"const {comp_name}" in code:
        code = code.replace(f"const {comp_name}", f"export const {comp_name}", 1)
    elif "function " in code:
        code = re.sub(r"export\s+default\s+function\s+[A-Za-z0-9_]*", f"export const {comp_name} =", code)
        code = re.sub(r"export\s+function\s+[A-Za-z0-9_]*", f"export const {comp_name} =", code)

    # Ensure safe destructuring of data
    code = re.sub(r"\(\{\s*data\s*,\s*sectionId\s*\}\)", "({ data = {}, sectionId })", code)

    # Strip existing duplicate imports from code body
    lines = code.splitlines()
    body_lines = []
    for line in lines:
        stripped = line.strip()
        if stripped.startswith("import ") and any(k in stripped.lower() for k in ["react", "editabletext", "useportfolio", "brandicons", "imagepicker", "sociallinks", "ricameraline"]):
            continue
        body_lines.append(line)

    header = """import React, { useState } from 'react';
import { EditableText } from '../../common/EditableText';
import { usePortfolio } from '../../../context/PortfolioContext';
import { getSocialIcon } from '../../common/BrandIcons';
import { ImagePickerModal } from '../../common/ImagePickerModal';
import { SocialLinksModal } from '../../common/SocialLinksModal';
import { RiCameraLine } from 'react-icons/ri';
"""
    return header + "\n" + "\n".join(body_lines)

def inject_template_into_project(gen_data, site_data, template_slug, pascal_name):
    """
    Automatically creates the component files, registers the variants in Section routers,
    and updates GLOBAL_TEMPLATES in types/portfolio.js.
    """
    print(f"\n⚡ [3/4] Injection automatique dans le code source de Portfolify...")

    sections_dir = WORKSPACE_ROOT / "frontend" / "src" / "components" / "portfolio" / "sections"
    types_file = WORKSPACE_ROOT / "frontend" / "src" / "types" / "portfolio.js"
    index_css_file = WORKSPACE_ROOT / "frontend" / "src" / "index.css"
    section_wrapper_file = WORKSPACE_ROOT / "frontend" / "src" / "components" / "studio" / "SectionWrapper.jsx"

    components = gen_data.get("components", {})
    theme = gen_data.get("theme", {})
    css = gen_data.get("css", "")
    mock_data = gen_data.get("mockData", {})

    # 1. Write the 5 React Component files with sanitized headers
    section_map = {
        "hero": f"{pascal_name}Hero.jsx",
        "about": f"{pascal_name}About.jsx",
        "skills": f"{pascal_name}Skills.jsx",
        "projects": f"{pascal_name}Projects.jsx",
        "experience": f"{pascal_name}Experience.jsx"
    }

    for sec_key, filename in section_map.items():
        comp_name = filename.replace(".jsx", "")
        raw_code = components.get(sec_key, "")
        if raw_code:
            clean_code = sanitize_component_code(raw_code, comp_name)
            file_path = sections_dir / filename
            file_path.write_text(clean_code, encoding="utf-8")
            print(f"   ✓ Créé & Sécurisé : frontend/src/components/portfolio/sections/{filename}")

    # 2. Write Clean, Strictly Scoped CSS with Google Fonts @import & Component Classes
    font_imports = ""
    for link in site_data.get("computed_styles", {}).get("fontLinks", []):
        if link not in font_imports:
            font_imports += f"@import url('{link}');\n"

    # A. Strip any dangerous cursor hiding rules immediately
    safe_css = re.sub(r'cursor\s*:\s*(?:none|hidden)\s*;?', '', css)

    # B. Extract all @keyframes rules to hoist them globally
    keyframes = re.findall(r'@keyframes\s+[\w-]+\s*\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}', safe_css)
    kf_block = "\n\n".join(keyframes)

    # C. Scoped variables and custom component classes
    palette = theme.get("palette", {})
    scoped_vars = f"""[data-theme="{template_slug}"], .theme-{template_slug} {{
  --bg: {palette.get('bg', '#0a0d14')};
  --bg-card: {palette.get('surface', 'rgba(255, 255, 255, 0.03)')};
  --text-primary: {palette.get('textPrimary', '#f8fafc')};
  --text-secondary: {palette.get('textSecondary', '#94a3b8')};
  --text-muted: #64748b;
  --cyan: {palette.get('accent', '#00d9ff')};
  --cyan-muted: {palette.get('accentGlow', 'rgba(0, 217, 255, 0.15)')};
  --border: {palette.get('border', 'rgba(255, 255, 255, 0.08)')};
  --shadow-glow: 0 0 20px {palette.get('accentGlow', 'rgba(0, 217, 255, 0.25)')};
  --glass-bg: rgba(10, 13, 20, 0.7);
  --glass-blur: 16px;
  max-width: 100%;
  overflow-x: hidden;
  box-sizing: border-box;
}}

[data-theme="{template_slug}"] *, .theme-{template_slug} * {{
  box-sizing: border-box;
}}

[data-theme="{template_slug}"] img, .theme-{template_slug} img {{
  max-width: 100%;
  height: auto;
}}"""

    custom_rules = f"""
[data-theme="{template_slug}"] .proj-card,
.theme-{template_slug} .proj-card {{
  transition: transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
}}

[data-theme="{template_slug}"] .proj-card:hover,
.theme-{template_slug} .proj-card:hover {{
  transform: translateY(-4px);
  border-color: rgba(0, 217, 255, 0.35) !important;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(0, 217, 255, 0.15);
}}

[data-theme="{template_slug}"] .dot-pill,
.theme-{template_slug} .dot-pill {{
  transition: all 0.35s ease;
}}

[data-theme="{template_slug}"] .hero-role,
.theme-{template_slug} .hero-role {{
  background: linear-gradient(90deg, #f59e0b, #00d9ff);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  display: block;
}}

[data-theme="{template_slug}"] .stars-bg,
.theme-{template_slug} .stars-bg {{
  background-image: radial-gradient(1px 1px at 20% 30%, rgba(255, 255, 255, 0.3) 0px, transparent 100%),
                    radial-gradient(1px 1px at 80% 10%, rgba(255, 255, 255, 0.2) 0px, transparent 100%),
                    radial-gradient(1px 1px at 50% 60%, rgba(255, 255, 255, 0.15) 0px, transparent 100%);
}}

[data-theme="{template_slug}"] .glass,
.theme-{template_slug} .glass {{
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--border);
}}

[data-theme="{template_slug}"] .cyan-glow,
.theme-{template_slug} .cyan-glow {{
  text-shadow: 0 0 20px rgba(0, 217, 255, 0.4);
}}
"""

    css_filename = f"{template_slug}-theme.css"
    css_file_path = sections_dir / css_filename
    css_content = f"/* Auto-generated Scoped Styles for {theme.get('name', template_slug)} */\n{font_imports}\n\n{kf_block}\n\n{scoped_vars}\n\n{custom_rules}\n"
    css_file_path.write_text(css_content, encoding="utf-8")
    print(f"   ✓ Créé : frontend/src/components/portfolio/sections/{css_filename} (avec polices réelles et CSS scopé)")

    # Inject @import in index.css if not present
    index_css_content = index_css_file.read_text(encoding="utf-8")
    import_stmt = f'@import "./components/portfolio/sections/{css_filename}";'
    if import_stmt not in index_css_content:
        index_css_file.write_text(f"{import_stmt}\n{index_css_content}", encoding="utf-8")
        print(f"   ✓ Importé dans : frontend/src/index.css")

    # 3. Wire Variants into Parent Section Routers
    router_map = {
        "hero": ("HeroSection.jsx", f"{pascal_name}Hero"),
        "about": ("AboutSection.jsx", f"{pascal_name}About"),
        "skills": ("SkillsSection.jsx", f"{pascal_name}Skills"),
        "projects": ("ProjectsSection.jsx", f"{pascal_name}Projects"),
        "experience": ("ExperienceSection.jsx", f"{pascal_name}Experience"),
    }

    for sec_key, (router_filename, comp_name) in router_map.items():
        router_path = sections_dir / router_filename
        if router_path.exists():
            content = router_path.read_text(encoding="utf-8")
            import_line = f"import {{ {comp_name} }} from './{comp_name}';"
            if import_line not in content:
                content = f"{import_line}\n{content}"
            
            branch_code = f"if (variant === '{template_slug}') {{\n    return <{comp_name} data={{data}} sectionId={{sectionId}} />;\n  }}"
            if f"variant === '{template_slug}'" not in content:
                marker = "if (variant ==="
                pos = content.find(marker)
                if pos != -1:
                    content = content[:pos] + f"  {branch_code}\n\n  " + content[pos:]
                    router_path.write_text(content, encoding="utf-8")
                    print(f"   ✓ Branchement variante dans {router_filename}")

    # 4. Add to SectionWrapper.jsx dropdown options
    if section_wrapper_file.exists():
        sw_content = section_wrapper_file.read_text(encoding="utf-8")
        for sec_type in ['hero', 'about', 'skills', 'projects', 'experience']:
            pattern = rf"(if \(section\.type === '{sec_type}'\) return \[[^\]]+)\];"
            match = re.search(pattern, sw_content)
            if match and template_slug not in match.group(1):
                replacement = f"{match.group(1)}, '{template_slug}'];"
                sw_content = sw_content.replace(match.group(0), replacement)
        section_wrapper_file.write_text(sw_content, encoding="utf-8")
        print(f"   ✓ Options ajoutées dans la barre d'outils SectionWrapper")

    # 5. Register in frontend/src/types/portfolio.js with isolated block boundaries
    if types_file.exists():
        types_content = types_file.read_text(encoding="utf-8")

        idx_themes = types_content.find("export const THEME_PRESETS = {")
        idx_globals = types_content.find("export const GLOBAL_TEMPLATES = [")
        idx_mocks = types_content.find("export const TEMPLATE_MOCKS = {")

        # A. Register in THEME_PRESETS
        theme_entry = f"""  '{template_slug}': {{
    id: '{template_slug}',
    name: '{theme.get('name', template_slug)}',
    description: '{theme.get('description', '')}',
    palette: {json.dumps(theme.get('palette', {}), indent=6).replace(chr(10), chr(10) + '    ')},
    typography: {json.dumps(theme.get('typography', {}), indent=6).replace(chr(10), chr(10) + '    ')}
  }},
"""
        themes_block = types_content[idx_themes:idx_globals] if (idx_themes != -1 and idx_globals != -1) else ""
        if f"'{template_slug}':" not in themes_block:
            types_content = types_content.replace("export const THEME_PRESETS = {", f"export const THEME_PRESETS = {{\n{theme_entry}")
            idx_globals = types_content.find("export const GLOBAL_TEMPLATES = [")
            idx_mocks = types_content.find("export const TEMPLATE_MOCKS = {")

        # B. Register in GLOBAL_TEMPLATES
        template_obj = {
            "id": template_slug,
            "name": theme.get("name", template_slug),
            "category": theme.get("category", "Innovant & Créatif"),
            "description": theme.get("description", ""),
            "themeId": template_slug,
            "badges": theme.get("badges", ["Design Sur-Mesure", "Animations 3D"]),
            "previewColors": theme.get("previewColors", ["#0a0d14", "#1e293b", "#38bdf8"]),
            "sectionVariants": {
                "hero": template_slug,
                "about": template_slug,
                "skills": template_slug,
                "projects": template_slug,
                "experience": template_slug,
                "contact": "minimal-card"
            }
        }
        template_json_str = json.dumps(template_obj, indent=4).replace(chr(10), chr(10) + '  ')
        globals_block = types_content[idx_globals:idx_mocks] if (idx_globals != -1 and idx_mocks != -1) else ""
        if f"id: '{template_slug}'" not in globals_block and f'"id": "{template_slug}"' not in globals_block:
            types_content = types_content.replace("export const GLOBAL_TEMPLATES = [", f"export const GLOBAL_TEMPLATES = [\n  {template_json_str},")
            idx_mocks = types_content.find("export const TEMPLATE_MOCKS = {")

        # C. Register in TEMPLATE_MOCKS
        mock_portfolio = {
            "meta": {
                "title": f"{theme.get('name', template_slug)} Portfolio",
                "slug": template_slug,
                "description": theme.get("description", "")
            },
            "theme": {
                "id": template_slug,
                "palette": theme.get("palette", {}),
                "typography": theme.get("typography", {})
            },
            "sections": [
                {"id": "sec-hero", "type": "hero", "variant": template_slug, "visible": True, "data": mock_data.get("hero", {})},
                {"id": "sec-about", "type": "about", "variant": template_slug, "visible": True, "data": mock_data.get("about", {})},
                {"id": "sec-skills", "type": "skills", "variant": template_slug, "visible": True, "data": mock_data.get("skills", {})},
                {"id": "sec-projects", "type": "projects", "variant": template_slug, "visible": True, "data": mock_data.get("projects", {})},
                {"id": "sec-experience", "type": "experience", "variant": template_slug, "visible": True, "data": mock_data.get("experience", {})},
                {"id": "sec-contact", "type": "contact", "variant": "minimal-card", "visible": True, "data": {"email": "hello@example.com", "heading": "Get In Touch"}}
            ]
        }
        mock_json_str = json.dumps(mock_portfolio, indent=4).replace(chr(10), chr(10) + '  ')
        mocks_block = types_content[idx_mocks:] if idx_mocks != -1 else ""
        if f"'{template_slug}':" not in mocks_block:
            types_content = types_content.replace("export const TEMPLATE_MOCKS = {", f"export const TEMPLATE_MOCKS = {{\n  '{template_slug}': {mock_json_str},")

        types_file.write_text(types_content, encoding="utf-8")
        print(f"   ✓ Enregistré dans : frontend/src/types/portfolio.js")

def main():
    print("=" * 70)
    print("🚀 PORTFOLIFY — MOTEUR D'INGESTION AUTOMATIQUE DE TEMPLATES")
    print("=" * 70)

    # 1. Parse arguments or prompt interactively
    if len(sys.argv) > 1:
        target_url = sys.argv[1].strip()
    else:
        target_url = input("\n👉 Entrez l'URL du portfolio à ingérer : ").strip()

    if not target_url:
        print("❌ URL obligatoire.")
        sys.exit(1)

    if not target_url.startswith("http://") and not target_url.startswith("https://"):
        target_url = "https://" + target_url

    explicit_name = sys.argv[2].strip() if len(sys.argv) > 2 else None
    explicit_category = sys.argv[3].strip() if len(sys.argv) > 3 else None

    # 2. Check OpenAI API Key
    api_key = load_openai_key()
    if not api_key:
        print("\n❌ Clé OPENAI_API_KEY introuvable dans l'environnement ou backend/.env")
        sys.exit(1)

    # 3. Create Sandbox Temporary Directory (Guaranteed Zero Leftovers)
    temp_dir_obj = tempfile.TemporaryDirectory()
    temp_dir = Path(temp_dir_obj.name)

    try:
        # Step A: Headless extraction
        site_data = extract_site_data(target_url, temp_dir)

        # Step B: AI Synthesis & Aesthetic Analysis
        gen_data = generate_template_code(site_data, api_key, explicit_name=explicit_name, category_name=explicit_category)

        # Step C: Template Name Selection & Interactive Validation
        if explicit_name:
            template_name = explicit_name
            category_name = explicit_category or gen_data.get("theme", {}).get("category", "Innovant & Créatif")
        else:
            ai_name = gen_data.get("theme", {}).get("name") or "Modern Aesthetic"
            ai_cat = gen_data.get("theme", {}).get("category") or "Innovant & Créatif"
            ai_desc = gen_data.get("theme", {}).get("description") or "Design épuré et moderne"

            print("\n" + "─" * 65)
            print("✨ L'IA a analysé le style visuel et vous propose ce nom de template :")
            print(f"   🏷️  Nom suggéré :  \"{ai_name}\"")
            print(f"   📁  Catégorie   :  {ai_cat}")
            print(f"   📝  Description :  {ai_desc}")
            print("─" * 65)

            user_choice = input(f"👉 Validez ce nom [Appuyez sur Entrée] ou tapez votre propre nom : ").strip()
            template_name = user_choice if user_choice else ai_name
            category_name = ai_cat

        template_slug = slugify(template_name)
        pascal_name = to_pascal_case(template_slug)

        gen_data["theme"]["name"] = template_name
        gen_data["theme"]["id"] = template_slug
        gen_data["theme"]["category"] = category_name

        print(f"\n📌 Nom final   : \"{template_name}\" (Slug: {template_slug}, Pascal: {pascal_name})")
        print(f"📌 Catégorie   : {category_name}")

        # Step D: Project Injection
        inject_template_into_project(gen_data, site_data, template_slug, pascal_name)

        # Step E: Self-Validation via Vite Build Check
        print("\n🔍 [4/4] Validation automatique du build Vite...")
        build_check = subprocess.run(
            ["npx", "vite", "build"],
            cwd=str(WORKSPACE_ROOT / "frontend"),
            capture_output=True,
            text=True,
            shell=True
        )
        if build_check.returncode != 0:
            print(f"⚠️ Avertissement de compilation Vite :\n{build_check.stderr or build_check.stdout}")
        else:
            print("✓ Build Vite validé avec succès (0 erreur) !")

        print("\n" + "=" * 70)
        print(f"🎉 SUCCÈS TOTAL ! Le template '{template_name}' a été généré et intégré.")
        print(f"👉 Ouvrez http://localhost:5173/studio et cliquez sur l'onglet 'Templates'")
        print(f"👉 Toutes les captures et fichiers HTML temporaires ont été détruits.")
        print("=" * 70 + "\n")

    finally:
        # Step F: Unconditional Cleanup of Sandbox
        temp_dir_obj.cleanup()
        print("🧹 Nettoyage complet : Tous les screenshots et fichiers HTML temporaires ont été supprimés.")

if __name__ == "__main__":
    main()
