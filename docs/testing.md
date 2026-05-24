# Testing

## Layers

| Layer | Tool | What it covers |
|---|---|---|
| Unit | Vitest | Components, lib utilities (`blog.ts`, `dates.ts`, `utils.ts`), hooks |
| E2E — local | Playwright (Chromium) | Homepage render, blog list, post render, theme switching, Mermaid diagrams |
| E2E — preview | Playwright + Vercel | Same suite run against a real deployed URL before any merge |

## Commands

```sh
npm test                         # unit tests (vitest run)
npm run test:coverage            # unit tests + coverage report
npm run test:e2e                 # e2e against local dev server (auto-starts on port 4321)
bash scripts/test-preview.sh    # e2e against vercel preview URL
```

## CI / CD

| Workflow | Fires on | Jobs in order |
|---|---|---|
| `ci.yml` | PR to `master` | unit → E2E local → E2E Vercel preview → build check |
| `deploy.yml` | push to `master` | unit → E2E local → build → deploy to GitHub Pages |

### How the Vercel preview E2E works

Vercel automatically creates a preview deployment for every PR. The `test-e2e-preview` CI job:
1. Polls for the Vercel preview URL using the GitHub token
2. Waits up to 2 minutes for the deployment to be ready
3. Runs the full Playwright suite against that URL (via `BASE_URL` env var)

The build job only runs after all three test jobs pass. Nothing merges without a green E2E run against a real deployment.

## Test file locations

| What | Where |
|---|---|
| Unit test setup | `src/test/setup.ts` |
| Component unit tests | `src/components/__tests__/` |
| Global unit tests | `src/test/__tests__/` |
| E2E specs | `e2e/*.spec.ts` |
| Playwright config | `playwright.config.ts` |
| Vitest config | `vitest.config.ts` |
