# AI Portfolio Builder — Project Phases & Architecture Roadmap

This document outlines the architectural blueprint, technology choices, and step-by-step implementation phases for building the AI Portfolio Builder.

---

## 1. System Overview & Technology Stack

| Layer | Technology | Rationale |
| :--- | :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS v4 | Ultra-fast development, modern reactivity, responsive styling |
| **Backend** | Node.js + Express (TypeScript/ESM) | Lightweight, high-throughput, easy streaming (SSE/WebSockets) |
| **Authentication** | Clerk (`@clerk/clerk-react`, `@clerk/express`) | Early auth setup, turnkey OAuth (GitHub, Google), session security |
| **Database** | Neon Serverless PostgreSQL | Auto-scaling, instant branching, serverless connection pooling |
| **ORM** | Drizzle ORM (`drizzle-kit`) | Zero-overhead, 100% type-safe SQL, clean migrations |
| **AI Engine** | Unified OpenAI-Compatible Router | Groq (ultra-fast chat), Mistral ($50 credits), NVIDIA NIM (free tier), + BYOK |
| **Hosting & DNS** | Vercel + Cloudflare Wildcard DNS | Multi-tenant dynamic subdomain routing (`*.platform.com`) |

---

## 2. Core Architectural Philosophy: Schema-Driven Engine

Instead of having an LLM generate brittle, arbitrary raw HTML/CSS from scratch on every turn, the system uses a **JSON-based Portfolio Schema**:

1. **State & Tokens**: AI modifies a structured document containing content data, section orders, component variants, and theme tokens (colors, typography, spacing, border-radius).
2. **Instant Preview**: The frontend dynamically renders the schema using a curated, high-design component library with zero compilation lag or broken syntax.
3. **Compilation on Export**: When exporting or publishing, the schema compiles into clean, standalone React + Tailwind or static code.

---

## 3. Implementation Phases

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│     Phase 1     │ ──> │     Phase 2     │ ──> │     Phase 3     │ ──> │     Phase 4     │ ──> │     Phase 5     │
│   Schema &      │     │  Clerk Auth,    │     │  CV & GitHub    │     │  Subdomains &   │     │   Code Export   │
│   Studio UI     │     │  Backend & AI   │     │  Ingestion      │     │  Version Roll   │     │   & GH Sync     │
└─────────────────┘     └─────────────────┘     └─────────────────┘     └─────────────────┘     └─────────────────┘
```

---

### Phase 1: Core Portfolio Schema & Interactive Studio UI
**Goal:** Build the visual builder experience where users can see, customize, and edit a live portfolio in real time.

- [ ] **1.1 Portfolio Schema & Type Definitions**
  - Define TypeScript/JSON schema for:
    - `Theme`: Presets, color palette, typography font pairings, border radius.
    - `Sections`: Hero, About, Experience, Projects, Skills, Contact, and custom sections.
    - `Variants`: e.g. Bento grid, minimal timeline, split-screen portrait, card grid.
  - Create default initial mock portfolios (Developer, Designer, Minimalist).

- [ ] **1.2 High-Aesthetic Component Library**
  - Modern Hero variants (split-screen with portrait, minimalist centered, dev terminal).
  - Projects variants (Bento grid with tags, interactive cards, list view).
  - Experience & Education variants (clean timeline, card rows).
  - Skills display (tag pills, grouped categories, animated badges).
  - Contact section (social links, contact card, quick message).

- [ ] **1.3 Interactive Studio Layout**
  - Split-screen workspace:
    - **Left Panel:** Tabbed interface with AI Chat interface, Section manager/tree, and Theme customizer.
    - **Right Canvas:** Responsive live preview container with Desktop, Tablet, and Mobile viewport toggles.
  - Inline editing capability (click to tweak text directly or ask the AI).

---

### Phase 2: Full Backend Foundation (Clerk Auth, Neon + Drizzle, & Unified AI)
**Goal:** Establish user authentication early, connect the serverless database with user-scoped tables, and wire up the multi-provider AI hub.

- [ ] **2.1 Clerk Authentication Setup**
  - Configure `@clerk/clerk-react` in the frontend (Sign-in / Sign-up modals, User button, session state).
  - Set up `@clerk/express` middleware on the backend to authenticate protected API routes.

- [ ] **2.2 Express Backend & Database (Neon + Drizzle ORM)**
  - Initialize Express backend with TypeScript/ESM, CORS, and environment configuration.
  - Configure Neon serverless database connection.
  - Set up user-scoped Drizzle ORM schema:
    - `users`: Clerk user ID, email, username, custom API keys (BYOK), plan.
    - `portfolios`: ID, user ID (foreign key), subdomain slug, title, schema JSON, published status.
    - `portfolio_versions`: Portfolio ID, snapshot JSON, prompt note, created timestamp.
  - Run initial migrations using `drizzle-kit`.

- [ ] **2.3 Unified AI Engine (OpenAI-Compatible Abstraction)**
  - Implement a flexible provider router that supports:
    - **Groq API** (Llama 3.3 70B for ultra-fast chat responses).
    - **Mistral API** (Codestral / Mistral Large for deep structured reasoning).
    - **NVIDIA NIM API** (Free tier inference).
    - **User BYOK** (Custom key passed from user settings).
  - Structured output generator (guarantees valid schema diffs and JSON updates).
  - Server-Sent Events (SSE) streaming endpoint for conversational AI edits.

---

### Phase 3: CV Parsing & GitHub Ingestion
**Goal:** Allow users to bootstrap their portfolio in seconds from existing resumes or GitHub profiles.

- [ ] **3.1 CV / Resume Extraction**
  - File upload endpoint for PDF and DOCX files.
  - Text extraction pipeline (e.g. `pdf-parse`).
  - LLM extraction prompt to parse unstructured resume text into the structured `PortfolioSchema`.

- [ ] **3.2 GitHub Profile & Repository Import**
  - Fetch user profile, bio, avatar, top pinned repositories, stars, and language stats.
  - Transform GitHub projects directly into the portfolio's Projects section.

---

### Phase 4: Subdomain Publishing & Version History
**Goal:** Serve user portfolios live on custom subdomains and provide rollback version control.

- [ ] **4.1 Multi-Tenant Subdomain Publishing**
  - Subdomain validation and reservation (e.g., `username.platform.com`).
  - Dynamic edge/server resolver that reads the `Host` header and serves the published portfolio data from Neon.
  - Cloudflare Wildcard CNAME (`*.platform.com`) + Vercel deployment configuration.

- [ ] **4.2 Version Control & Rollback**
  - Automatic snapshot creation on every major AI prompt or manual edit.
  - Version history drawer in the Studio UI allowing one-click rollback to any previous version.

---

### Phase 5: Code Export (ZIP & GitHub Sync)
**Goal:** Ensure 100% user code ownership — users can download source code or push to their own GitHub.

- [ ] **5.1 Source Code Generator**
  - Compile the `PortfolioSchema` JSON into a clean, standalone React + Vite + Tailwind project.
  - Include an auto-generated `README.md` with setup instructions and credits.

- [ ] **5.2 Export Distribution**
  - **ZIP Download:** Bundle and stream the project files via `JSZip` / backend archiver.
  - **GitHub Export:** Integrate with GitHub API to create a new personal repository on the user's account and push the complete generated code.

---

## 4. Current Status & Next Actions

- [x] Initial design discussion and architecture alignment.
- [x] Stack selection (React 19 + Vite, Tailwind CSS v4, Express, Neon, Drizzle, Clerk, Groq/Mistral/NIM).
- [x] Phase plan documented with Auth integrated early into Phase 2.
- [ ] **Ready for Phase 1:** Build the core schema definitions and high-aesthetic Studio UI.
