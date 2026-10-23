# Portfolify — AI Portfolio Builder

[![CI Quality Gate & Tests](https://github.com/zoubaax/portfolio-builder/actions/workflows/ci.yml/badge.svg)](https://github.com/zoubaax/portfolio-builder/actions/workflows/ci.yml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=zoubaax_portfolio-builder&metric=alert_status)](https://sonarcloud.io/summary/overall?id=zoubaax_portfolio-builder)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=zoubaax_portfolio-builder&metric=coverage)](https://sonarcloud.io/summary/overall?id=zoubaax_portfolio-builder)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=zoubaax_portfolio-builder&metric=security_rating)](https://sonarcloud.io/summary/overall?id=zoubaax_portfolio-builder)
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=zoubaax_portfolio-builder&metric=bugs)](https://sonarcloud.io/summary/overall?id=zoubaax_portfolio-builder)

> Build, customize, and export production-ready developer portfolios using React 19, Tailwind CSS v4, Express, and AI-assisted layout design.

---

## 🛠️ Architecture & Tech Stack

- **Frontend:** React 19, Tailwind CSS v4, Vite, Clerk Authentication, Lucide & Remix Icons.
- **Backend:** Node.js, Express, TypeScript, Neon Serverless PostgreSQL, Drizzle ORM, Zod.
- **Testing & Quality:** Vitest, React Testing Library, JSDOM, v8 Coverage, SonarCloud, GitHub Actions.

---

## 🧪 Testing & Code Quality

Full unit testing and coverage commands are documented in the [Unit Testing Guide](docs/testing_guide.md).

```bash
# Run all backend & frontend tests
npm --prefix backend test && npm --prefix frontend test

# Generate coverage reports
npm --prefix backend run test:coverage && npm --prefix frontend run test:coverage
```

---

## 🚀 CI / CD Pipeline

Every push and pull request triggers an automated GitHub Actions workflow (`.github/workflows/ci.yml`):
1. **Parallel Execution:** Runs backend and frontend test suites in parallel with `npm` caching.
2. **Quality Gate:** Scans code with **SonarCloud** and verifies security, reliability, and coverage.
3. **Visual Reporting:** Uploads interactive HTML coverage artifacts and posts a Markdown job summary directly to GitHub.
