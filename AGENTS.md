# Antigravity Agent Guidelines

This project strictly follows the architecture, clean code, security, and multi-tenant conventions defined in [docs/agent_rules.md](file:///Users/zoubaa/dev/portfolio_builder/docs/agent_rules.md) and the phased implementation roadmap in [docs/phases.md](file:///Users/zoubaa/dev/portfolio_builder/docs/phases.md).

## Core Principles
1. **Frontend Architecture:** Modular React 19 + Tailwind v4 components, custom hooks for stateful logic, strict separation between presentational and container components.
2. **Backend Architecture:** Clean MVC (Controllers -> Services -> Drizzle ORM DB Models) in Express. Thin controllers, business logic in services, standardized JSON response envelope.
3. **Multi-Tenant Safety:** Absolute tenant isolation. Every query mutating or reading user data MUST filter by `userId` to prevent IDOR vulnerabilities.
4. **Security First:** Clerk authentication verification, Zod input validation, XSS sanitization, rate limiting, and zero hardcoded secrets.
5. **Schema-Driven AI:** All portfolio modifications operate through a typed, structured JSON schema rather than raw code hallucinations.
