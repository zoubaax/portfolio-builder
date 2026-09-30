# AI Agent Role, Architecture Guidelines & Engineering Standards

This document establishes the mandatory engineering standards, architectural patterns, and security best practices for the AI agent (and any developer) building the **AI Portfolio Builder**.

---

## 1. Agent Role & Core Directives

* **Role:** Senior Full-Stack Architect & Security-Minded Engineer.
* **Core Goal:** Build a robust, production-grade, maintainable web application with clean separation of concerns, high aesthetic polish, airtight security, and zero technical debt.
* **Working Principle:** Never write hasty, monolithic, or insecure code. Every component, endpoint, and query must follow structured design patterns.

---

## 2. Frontend Engineering & React Architecture

### 2.1 Component Structure & Separation of Concerns
1. **No Monolithic Files:** Break large interfaces into small, single-responsibility components:
   * **Presentational (UI):** Pure rendering, receives props, zero business logic.
   * **Container / Feature:** Manages state, connects hooks, orchestrates UI components.
2. **Directory Conventions:**
   ```
   frontend/src/
   ├── components/
   │   ├── common/         # Buttons, inputs, modals, tooltips, skeletons
   │   ├── studio/         # Studio shell, preview canvas, device frames
   │   ├── chat/           # AI message bubbles, prompt inputs, suggestion chips
   │   └── portfolio/      # Reusable portfolio section components (Hero, Bento, etc.)
   ├── hooks/              # Custom React hooks for data fetching, canvas resizing, etc.
   ├── context/ or store/  # Global state (active portfolio, preview mode, theme tokens)
   ├── services/           # API client layer (Axios / Fetch wrappers)
   ├── types/ or schemas/  # Portfolio JSON schema and TypeScript / Zod definitions
   └── utils/              # Pure helpers, formatters, color calculations
   ```

### 2.2 React Best Practices
* **State Colocation:** Keep state as close to where it is used as possible. Avoid lifting state up unless multiple distant consumers require it.
* **Custom Hooks for Logic:** Encapsulate complex stateful logic (e.g., SSE streaming, undo/redo history, canvas zoom) into dedicated custom hooks (`usePortfolioHistory`, `useAiChat`, `useDevicePreview`).
* **Performance & Rendering:**
  * Avoid unnecessary re-renders with `React.memo` or `useCallback` on heavy canvas elements.
  * Use skeleton loaders and smooth transitions for asynchronous operations.
* **Design Token Adherence:** Never hardcode arbitrary hex colors inside components; use CSS variables or Tailwind utility classes derived from the active portfolio theme tokens.

---

## 3. Backend Engineering & Clean MVC Architecture

### 3.1 Layered Architecture Pattern
The Express backend must strictly maintain separation between HTTP routing, business logic, and database access:

```
backend/src/
├── controllers/    # Handles HTTP requests, extracts parameters, returns responses
├── services/       # Core business logic, LLM orchestrations, PDF parsing, GitHub sync
├── routes/         # Route definitions and middleware chaining
├── middleware/     # Auth verification (Clerk), error handling, rate limiting, validation
├── db/             # Neon connection, Drizzle schema, migrations, queries
│   ├── schema/     # Drizzle table definitions
│   └── index.ts    # DB client instance with connection pooling
└── utils/          # Logging, response helpers, OpenAI client abstraction
```

### 3.2 Backend Clean Code Rules
1. **Controllers Must Be Thin:** Controllers only validate input, call the appropriate Service method, and return standardized JSON responses.
2. **Services Contain Business Logic:** Services are framework-agnostic functions or classes that perform operations (e.g., generate portfolio diff, calculate version hash, call AI APIs).
3. **Standardized API Response Envelope:**
   ```json
   // Success
   {
     "success": true,
     "data": { ... },
     "message": "Portfolio updated successfully"
   }

   // Error
   {
     "success": false,
     "error": {
       "code": "PORTFOLIO_NOT_FOUND",
       "message": "No portfolio found matching this ID or slug"
     }
   }
   ```
4. **Streaming for AI (SSE):** AI chat and real-time generation endpoints must use Server-Sent Events (SSE) with proper headers (`Content-Type: text/event-stream`, `Cache-Control: no-cache`, `Connection: keep-alive`) for responsive feedback.

---

## 4. Multi-Tenant Architecture & Data Isolation

### 4.1 Strict Tenant Boundary Enforcement
Because the platform hosts multiple users and public subdomains (`*.platform.com`), data leakage between tenants is unacceptable:

1. **User-Scoped Queries:** Every mutating or sensitive query (`UPDATE`, `DELETE`, `SELECT` for private drafts) must explicitly include the authenticated `userId`:
   ```typescript
   // CORRECT: Tenant-isolated
   await db.select().from(portfolios).where(
     and(eq(portfolios.id, portfolioId), eq(portfolios.userId, authUserId))
   );

   // WRONG / DANGEROUS: Susceptible to IDOR (Insecure Direct Object Reference)
   await db.select().from(portfolios).where(eq(portfolios.id, portfolioId));
   ```
2. **Subdomain Resolution Isolation:**
   * Public subdomain requests (`slug.platform.com`) must **only** query rows where `is_published = true`.
   * Never expose draft states, user API keys, or private settings in the public subdomain payload.

---

## 5. Security & Safety Best Practices

### 5.1 Authentication & Authorization
* Use `@clerk/express` to authenticate all `/api/v1/protected/*` routes.
* Extract `req.auth.userId` safely; reject any request missing a valid session token with `401 Unauthorized`.

### 5.2 Input Validation & Schema Sanitization
* Validate all incoming request bodies using **Zod** schemas before reaching service logic.
* **Sanitize User Content:** Any rich text, user bio, or external GitHub content rendered into the portfolio preview or export must be sanitized to prevent Stored XSS attacks (e.g., stripping `<script>` tags or malicious attributes).

### 5.3 Secrets & API Key Protection
* **Zero Secrets in Code:** Never commit or hardcode API keys, database URLs, or Clerk secret keys.
* **BYOK Protection:** User-supplied API keys (Groq/Mistral) must be encrypted at rest in the database or stored in an ephemeral, secure session. Never log API keys in server console logs.

### 5.4 Defense-in-Depth Middleware
* Enable **Helmet** on Express for security headers (`X-Content-Type-Options`, `X-Frame-Options`, etc.).
* Configure strict **CORS** (only permit the frontend domain in production).
* Implement **Rate Limiting** (e.g. `express-rate-limit`) on AI generation and public portfolio lookup routes to avoid abuse and cost overruns.

---

## 6. Coding Hygiene & Verification Checklist

Before finishing any feature or milestone, the agent must ensure:
- [ ] Code is free of unused imports, dead variables, and leftover debugging `console.log` statements.
- [ ] No monolithic single-file components (> 250 lines should be evaluated for sub-component extraction).
- [ ] Proper error handling with `try/catch` in services and global Express error middleware.
- [ ] Dynamic styling utilizes the unified theme token contract, not brittle one-off inline CSS.
- [ ] All database queries against private user data strictly enforce tenant isolation (`userId`).
