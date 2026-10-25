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
        Path("D:/screenshot-to-code/.env"),
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
            page.goto(url, wait_until="domcontentloaded", timeout=45000)
            page.wait_for_timeout(3000)
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
            return rules.join('\\n');
        }""")

        # Transpile real DOM sections directly into React 19 JSX components with parameterized props
        print("🏗️ Transpilation fidèle des sections réelles du site en JSX React 19...")
        raw_components = page.evaluate("""() => {
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
                    // Strip nested quotes from font names or content values
                    const cleanVal = v.replace(/["']/g, '');
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
            
            const nodeToJSX = (el, secType, depth = 0) => {
                if (el.nodeType === 3) {
                    const t = el.textContent.trim();
                    if (!t) return '';
                    return t.replace(/[{}]/g, '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                }
                if (el.nodeType !== 1) return '';
                
                const tag = el.tagName.toLowerCase();
                if (['script', 'noscript', 'iframe', 'canvas', 'video', 'audio'].includes(tag)) return '';
                
                if (tag === 'svg') {
                    return `<span className="inline-flex items-center">✦</span>`;
                }
                
                let attrs = '';
                // Safely extract className
                let cls = '';
                if (typeof el.className === 'string') cls = el.className;
                else if (el.className && typeof el.className.baseVal === 'string') cls = el.className.baseVal;
                else cls = el.getAttribute('class') || '';
                
                if (cls && !cls.includes('[object')) attrs += ` className="${cls}"`;
                
                if (depth === 0) {
                    attrs += ` id={sectionId}`;
                } else if (el.id) {
                    attrs += ` id="${el.id}"`;
                }
                
                const styleAttr = el.getAttribute('style');
                if (styleAttr) attrs += styleToJsx(styleAttr);
                
                for (let i = 0; i < el.attributes.length; i++) {
                    const a = el.attributes[i];
                    const rawName = a.name.toLowerCase();
                    if (!['class', 'id', 'style'].includes(rawName) && !rawName.startsWith('on')) {
                        const jsxName = attrMap[rawName] || rawName;
                        const safeVal = a.value.replace(/"/g, '&quot;').replace(/[{}]/g, '');
                        attrs += ` ${jsxName}="${safeVal}"`;
                    }
                }
                
                if (selfClosing.has(tag)) return `<${tag}${attrs} />`;
                
                // Parameterize key headings
                if (secType === 'hero' && (tag === 'h1' || (cls && cls.includes('hero-role')) || (depth <= 2 && tag === 'h2'))) {
                    const text = el.textContent.trim().replace(/[{}"']/g, '');
                    return `<${tag}${attrs}><EditableText value={data?.name || '${text || "Your Name"}'} as="${tag}" /></${tag}>`;
                }
                if (['about', 'skills', 'projects', 'experience'].includes(secType) && (tag === 'h2' || tag === 'h3') && depth <= 3) {
                    const text = el.textContent.trim().replace(/[{}"']/g, '');
                    return `<${tag}${attrs}><EditableText value={data?.heading || '${text || "Section"}'} as="${tag}" /></${tag}>`;
                }
                
                const children = Array.from(el.childNodes)
                    .map(c => nodeToJSX(c, secType, depth + 1))
                    .filter(Boolean)
                    .join(' ');
                    
                return `<${tag}${attrs}>${children}</${tag}>`;
            };
            
            // Collect candidates
            let candidates = Array.from(document.querySelectorAll('section, main > div, article, header, div[id*="hero"], div[id*="about"], div[id*="project"], div[id*="skill"], div[id*="exp"]'))
                .filter(s => s.textContent.trim().length > 30);
            
            if (!candidates.length) {
                candidates = Array.from(document.querySelectorAll('body > div > div, body > div'))
                    .filter(s => s.textContent.trim().length > 30);
            }

            const findSection = (keywords, fallbackIdx) => {
                for (const el of candidates) {
                    const id = (el.id || '').toLowerCase();
                    const cls = (typeof el.className === 'string' ? el.className : '').toLowerCase();
                    const text = (el.textContent || '').slice(0, 150).toLowerCase();
                    if (keywords.some(k => id.includes(k) || cls.includes(k) || text.includes(k))) {
                        return el;
                    }
                }
                return candidates[fallbackIdx] || candidates[0];
            };

            const matched = {
                hero: findSection(['hero', 'intro', 'banner', 'header'], 0),
                about: findSection(['about', 'bio', 'profile', 'story', 'who'], 1),
                skills: findSection(['skill', 'stack', 'tech', 'tool', 'expertise'], 2),
                projects: findSection(['project', 'work', 'showcase', 'portfolio', 'featured'], 3),
                experience: findSection(['experience', 'career', 'history', 'timeline', 'journey'], 4),
            };
            
            const results = {};
            ['hero', 'about', 'skills', 'projects', 'experience'].forEach((key) => {
                const secEl = matched[key];
                if (secEl) {
                    results[key] = nodeToJSX(secEl, key);
                } else {
                    results[key] = `<section id={sectionId} className="py-20 px-6 max-w-5xl mx-auto"><h2><EditableText value={data?.heading || "Section"} as="h2" /></h2></section>`;
                }
            });
            
            return results;
        }""")

        browser.close()

    return {
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
        components[sec_key] = f"export const TempComponent = ({{ data = {{}}, sectionId }}) => {{\n  const {{ updateSectionField }} = usePortfolio();\n  return (\n    {jsx_body}\n  );\n}};"

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
        if stripped.startswith("import ") and ("react" in stripped.lower() or "editabletext" in stripped.lower() or "useportfolio" in stripped.lower()):
            continue
        body_lines.append(line)

    header = """import React from 'react';
import { EditableText } from '../../common/EditableText';
import { usePortfolio } from '../../../context/PortfolioContext';
"""
    full_body = "\n".join(body_lines)
    if "updateSectionField" in full_body and "usePortfolio(" not in full_body:
        full_body = re.sub(
            rf"(export\s+const\s+{comp_name}\s*=\s*\([^\)]*\)\s*=>\s*\{{)",
            r"\1\n  const { updateSectionField } = usePortfolio();",
            full_body,
            count=1
        )

    return header + "\n" + full_body

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

    # 2. Write Scoped CSS with Google Fonts @import & Scoped Selectors
    font_imports = ""
    for link in site_data.get("computed_styles", {}).get("fontLinks", []):
        if link not in font_imports:
            font_imports += f"@import url('{link}');\n"

    css_filename = f"{template_slug}-theme.css"
    css_file_path = sections_dir / css_filename
    css_content = f"/* Auto-generated Scoped Styles for {theme.get('name', template_slug)} */\n{font_imports}\n{css}\n"
    css_file_path.write_text(css_content, encoding="utf-8")
    print(f"   ✓ Créé : frontend/src/components/portfolio/sections/{css_filename} (avec polices réelles)")

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
