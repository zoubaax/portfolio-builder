# Unit Testing Guide & Best Practices

This guide documents how to execute, write, and maintain unit tests across the **Portfolify** frontend and backend using **Vitest**.

---

## 1. Quick Start: How to Run the Tests

### 1.1 Frontend (React 19 + Vitest + React Testing Library)

Navigate to the `frontend/` directory:

```bash
cd frontend
```

| Action | Command | Description |
| :--- | :--- | :--- |
| **Run all tests once** | `npm test` | Executes all `*.test.js` and `*.test.jsx` test suites and exits (CI mode). |
| **Watch mode (TDD)** | `npm run test:watch` | Keeps tests running and re-executes automatically when you save code changes. |
| **Code Coverage** | `npm run test:coverage` | Computes branch/statement coverage and outputs `lcov.info` for SonarQube/SonarCloud. |
| **Run a single test file** | `npx vitest run src/components/studio/ExportModal.test.jsx` | Executes only the targeted test file. |
| **Filter by test name** | `npx vitest run -t "switches tabs"` | Runs only tests matching the name pattern. |

> [!TIP]
> **View Visual Coverage in Browser:**
> After running `npm run test:coverage`, you can open the generated visual HTML report:
> ```bash
> open coverage/index.html
> ```

---

### 1.2 Backend (Express + TypeScript + Vitest)

Navigate to the `backend/` directory:

```bash
cd backend
```

| Action | Command | Description |
| :--- | :--- | :--- |
| **Run all tests once** | `npm test` | Executes all `*.test.ts` suites and exits. |
| **Code Coverage** | `npm run test:coverage` | Generates coverage summary and `lcov.info` for Sonar. |
| **Run a single test file** | `npx vitest run src/utils/response.test.ts` | Runs only the specified test file. |

---

### 1.3 Run All Tests Across the Entire Project (From Root)

You can run both frontend and backend tests in parallel or sequence directly from the project root:

```bash
# Run backend tests then frontend tests
npm --prefix backend test && npm --prefix frontend test

# Run full coverage reports across both
npm --prefix backend run test:coverage && npm --prefix frontend run test:coverage
```

---

## 2. Testing Architecture & File Structure

We follow the **Co-location Pattern** (keeping tests right beside the code they verify):

```text
portfolio_builder/
├── sonar-project.properties         # Ingests frontend & backend lcov.info
│
├── frontend/
│   ├── vitest.config.js             # Vitest config (JSDOM, v8 coverage)
│   ├── src/
│   │   ├── test/setup.js            # Extends @testing-library/jest-dom matchers
│   │   ├── services/
│   │   │   ├── codeExportService.js
│   │   │   └── codeExportService.test.js    # <-- Pure export logic unit test
│   │   ├── data/
│   │   │   ├── colorPalettes.js
│   │   │   └── colorPalettes.test.js        # <-- Luminance & prompt detection
│   │   ├── types/
│   │   │   ├── portfolio.js
│   │   │   └── portfolio.test.js            # <-- Schema & preset validation
│   │   ├── components/common/
│   │   │   ├── BrandIcons.test.jsx          # <-- SVG icon helpers (100% coverage)
│   │   │   ├── EditableText.test.jsx        # <-- In-place editing behavior
│   │   │   ├── ImagePickerModal.test.jsx    # <-- Modal tabs, URL and file picker
│   │   │   └── SocialLinksModal.test.jsx    # <-- Contact link configuration
│   │   ├── components/portfolio/sections/
│   │   │   ├── HeroSection.test.jsx         # <-- Hero variants and CTAs
│   │   │   ├── AboutSection.test.jsx        # <-- Bento and story variants
│   │   │   ├── SkillsSection.test.jsx       # <-- Category cards & pill clouds (100%)
│   │   │   └── ContactSection.test.jsx      # <-- Email mailto & copy actions
│   │   └── components/studio/
│   │       ├── ExportModal.test.jsx         # <-- Code export modal & tabs
│   │       └── StudioHeader.test.jsx        # <-- Device toggling, undo/redo
│   └── coverage/
│       └── lcov.info                        # Generated coverage report
│
└── backend/
    ├── vitest.config.ts             # Vitest config (Node environment)
    ├── src/
    │   ├── utils/
    │   │   ├── response.ts
    │   │   └── response.test.ts             # <-- API helper unit test (100%)
    │   ├── middleware/
    │   │   ├── auth.ts
    │   │   ├── auth.test.ts                 # <-- Clerk security middleware (100%)
    │   │   ├── validate.ts
    │   │   └── validate.test.ts             # <-- Zod validation middleware (89%)
    │   └── services/
    │       ├── imageService.ts
    │       └── imageService.test.ts         # <-- AI image generation pipeline (85%)
    └── coverage/
        └── lcov.info                        # Generated coverage report
```

---

## 3. Why No "Classes" Are Needed

In modern functional React 19 and Express, we test **units of behavior**, not OOP classes:

1. **Pure Functions & Services:** Testing deterministic logic (inputs $\rightarrow$ expected outputs).
2. **React Components:** Testing rendering, user interactions (clicks, typing), and state updates in JSDOM.
3. **Middleware & Handlers:** Testing request interception, validation rejection, and pipeline flow (`next()`).

---

## 4. How to Write New Unit Tests

### Example A: Testing a Pure Function / Service

```javascript
// src/services/mathHelper.test.js
import { describe, it, expect } from 'vitest';
import { calculateDiscount } from './mathHelper';

describe('calculateDiscount', () => {
  it('applies 20% discount correctly', () => {
    const result = calculateDiscount(100, 0.2);
    expect(result).toBe(80);
  });
});
```

### Example B: Testing a React Component with Mocks

Always mock external third-party hooks (Clerk, Context, Router) so the component renders in isolation without network calls:

```jsx
// src/components/MyComponent.test.jsx
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MyButton } from './MyButton';

// Mock an external service or hook
vi.mock('@clerk/react', () => ({
  useUser: () => ({ user: { id: 'test_123' }, isSignedIn: true }),
}));

describe('MyButton Component', () => {
  it('renders label and triggers onClick', () => {
    const handleClick = vi.fn();
    render(<MyButton label="Click Me" onClick={handleClick} />);

    const button = screen.getByRole('button', { name: /Click Me/i });
    expect(button).toBeInTheDocument();

    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Example C: Testing Backend Middleware with Mock `req` and `res`

```typescript
// src/middleware/myMiddleware.test.ts
import { describe, it, expect, vi } from 'vitest';
import { myMiddleware } from './myMiddleware';
import { Request, Response, NextFunction } from 'express';

describe('myMiddleware', () => {
  it('calls next() when authorized', () => {
    const req = { headers: { authorization: 'Bearer valid_token' } } as Request;
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as unknown as Response;
    const next = vi.fn() as NextFunction;

    myMiddleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });
});
```

---

## 5. SonarQube & SonarCloud Coverage

When running `npm run test:coverage`, Vitest generates:
- An **LCOV file** at `coverage/lcov.info`
- An **interactive HTML report** at `coverage/index.html`

The root configuration file [`sonar-project.properties`](file:///Users/zoubaa/dev/portfolio_builder/sonar-project.properties) automatically links these coverage files:
```properties
sonar.javascript.lcov.reportPaths=frontend/coverage/lcov.info,backend/coverage/lcov.info
```
When GitHub Actions triggers the SonarCloud scan, Sonar automatically parses these files to evaluate your project's **Quality Gate** (coverage percentage, code smells, and security hotspots).
