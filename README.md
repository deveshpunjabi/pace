# PACE — Predictive AI for Crowd & Environment

**A GenAI Smart Stadiums & Tournament Operations copilot for the FIFA World Cup 2026.**

PACE pairs a **multilingual fan concierge** with a **staff operations command center**. Fans get grounded, accessible, in-their-language guidance; control-room staff get a live crowd heatmap, prioritized AI alerts, and one-click mitigation that visibly updates the venue.

> Unofficial hackathon prototype. Not affiliated with FIFA. Sensor, gate, and crowd data are simulated for the demo (see [Assumptions](#assumptions--limitations)).

Repository: `https://github.com/deveshpunjabi/pace`

## Chosen vertical

`[Challenge 4] Smart Stadiums & Tournament Operations`

Two personas, two real journeys around **one shared, coherent scenario** (East Concourse / Gate C runs hot **and** has no step-free path — so the fan concierge, the ops heatmap, and the alert engine all reason about the same fact):

- **Fan (mobile):** arriving visitor → accessible route to seat → nearest low-queue amenities → help in EN/ES/FR → safe exit & greenest transit.
- **Staff (control room):** situational awareness (KPIs + heatmap) → alert triage → AI mitigation plan → **execute action** (redirect crowd / cut idle HVAC) → venue state responds.

## Problem Statement Coverage

All eight capability areas named in the Challenge 4 brief map to a concrete, working feature. Coverage is machine-verifiable at [`GET /api/capabilities`](#api) and asserted by tests (`capabilities.test.ts`).

| #   | Area (verbatim from brief)     | Feature                                                           | Primary File(s)                                                                                                   | How It Solves the Area                                                                                                                                 |
| --- | ------------------------------ | ----------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | **Navigation**                 | Step-by-step accessible wayfinding grounded in live venue context | `src/components/fan/FanChat.tsx`, `src/lib/services/chatService.ts`, `src/lib/ai/prompts.ts`                      | AI generates turn-by-turn directions using server-injected live sector data (gates, lifts, density). Never invents routes.                             |
| 2   | **Crowd management**           | Live per-sector density heatmap with 85% alert threshold          | `src/components/staff/OpsMap.tsx`, `src/lib/services/opsService.ts`, `src/lib/simulation/liveSignals.ts`          | Real-time density grid color-coded by severity. Sectors ≥85% trigger high alerts with one-click redirect actions.                                      |
| 3   | **Accessibility**              | Step-free routing (Gate C flagged) + ARIA-first UI                | `src/lib/data/venue.ts` (stepFree flags), `src/lib/ai/prompts.ts`, `src/components/fan/FanChat.tsx`               | Each sector has a stepFree boolean. AI never routes wheelchair users via stairs. UI uses skip links, ARIA roles, live regions.                         |
| 4   | **Transportation**             | Post-match transit guidance with fastest/greenest options         | `src/lib/data/venue.ts` (TRANSIT_OPTIONS), `src/lib/ai/mockProvider.ts`                                           | Three transit modes ranked by ETA and carbon footprint. AI recommends greenest option (NJ Transit Rail, 0.4 kg CO2).                                   |
| 5   | **Sustainability**             | HVAC reduction for idle sectors + venue sustainability score      | `src/components/staff/SustainabilityMeter.tsx`, `src/lib/services/opsService.ts`                                  | Sectors <30% occupancy trigger HVAC-cut alerts. One-click execution marks sectors reduced. SVG ring gauge shows venue-wide score.                      |
| 6   | **Multilingual assistance**    | Native EN/ES/FR concierge with per-response language              | `src/components/fan/FanChat.tsx` (language tabs), `src/lib/ai/prompts.ts`, `src/lib/ai/mockProvider.ts`           | ARIA tab language selector. System prompt enforces response language. Quick-actions and greetings pre-localized per language.                          |
| 7   | **Operational intelligence**   | Venue KPI bar (attendance, density, alerts, sustainability)       | `src/components/staff/KpiBar.tsx`, `src/lib/services/opsService.ts`                                               | Four KPIs computed from live sector data with severity tones. Recomputed on every 6-second signal refresh for continuous awareness.                    |
| 8   | **Real-time decision support** | Streamed AI mitigation plans + one-click executable actions       | `src/components/staff/StaffDashboard.tsx`, `src/components/staff/AlertFeed.tsx`, `src/lib/services/opsService.ts` | AI generates prioritized alerts with pre-planned actions. Execute button mutates venue state in real time. Staff AI copilot streams freeform guidance. |

## Architecture

Layered and framework-agnostic where it matters, so each layer is independently testable.

```
Browser (Next.js App Router · premium React UI · framer-motion)
   │  fetch /api/*
   ▼
Route handlers (thin HTTP adapters)  — guard → validate → service → stream
   ├─ security/   enforceRequestGuards: content-type (415), body cap (413), rate limit (429)
   ├─ validators/ Zod schemas (≤500 chars, ≤10 turns)
   ├─ services/   chatService (grounding + streaming) · opsService (alerts, KPIs, actions)
   ├─ ai/         AiProvider interface → MockAiProvider (deterministic) | VertexAiProvider
   │              + prompt sanitiser (prompt-injection defense) + grounded prompts
   ├─ simulation/ generateLiveSignals(): pure, deterministic function of time
   └─ data/       venue reference facts, sector profiles, transit, knowledge base
```

- **One AI interface, two implementations.** `AiProvider` is implemented by `MockAiProvider` (deterministic, offline, zero-cost) and `VertexAiProvider` (real Gemini via Vertex). The factory (`resolveAiProvider`) uses the mock unless `PACE_AI_PROVIDER=vertex` and a GCP project are configured — so the app runs, demos, and tests with **zero secrets**.
- **Server is the source of truth.** The client sends only free-text intent. Every request re-derives live context server-side (`buildLiveContext`), keeping the trust boundary small.
- **Deterministic simulation.** `generateLiveSignals(now)` is a pure function of time following a matchday arc (arrivals → kickoff → half-time → egress). A real IoT/turnstile feed can replace it without touching any consumer, because everything depends only on the `StadiumSector` type.

## How the solution works

1. Fans open `/fan`, pick a language, tap a quick-action chip or type a question.
2. `/api/chat` guards + validates the request, sanitizes user text, grounds it in live venue context, and **streams** the answer token-by-token.
3. Staff open `/staff` and see live KPIs, a density heatmap, and a prioritized alert queue.
4. Sectors above 85% raise **high** crowd alerts; sectors below 30% raise **medium** sustainability alerts.
5. Staff click **Execute action** — a redirect eases the hot sector and fills the target bowl; an HVAC cut marks an idle sector reduced — and the dashboard updates, closing the decision loop.

## API

| Method | Endpoint            | Purpose                                            |
| ------ | ------------------- | -------------------------------------------------- |
| `GET`  | `/api/health`       | Liveness + active AI mode                          |
| `GET`  | `/api/capabilities` | Machine-verifiable 8-area alignment map            |
| `GET`  | `/api/live-signals` | Current simulated snapshot (sectors, alerts, KPIs) |
| `POST` | `/api/chat`         | Guarded, validated, streamed grounded chat         |

## Local setup

```bash
npm install
npm run dev            # http://127.0.0.1:3000
```

Works immediately with no environment variables (deterministic mock AI). Verification:

```bash
npm run typecheck      # tsc --noEmit, strict + noFallthrough/override
npm run format:check   # Prettier enforced
npm run test           # Jest: 33 tests across 10 suites
npm run build          # Next.js production build
npm audit --audit-level=moderate   # 0 vulnerabilities
```

## Code quality

- **Layered architecture** — thin routes, framework-agnostic services, AI provider abstraction, pure simulation. Route handlers contain no business logic.
- **Strict TypeScript** — `strict`, `noUnusedLocals`, `noUnusedParameters`, `noImplicitAny`, `noFallthroughCasesInSwitch`, `noImplicitOverride`. No `any`, no dead exports.
- **Enforced formatting** — Prettier `format:check` wired into CI.
- **Pinned dependencies + `overrides`** — reproducible installs; `postcss`/`uuid` pinned to patched versions.

## Security

- **Centralized request guard** (`enforceRequestGuards`) — one place to audit: JSON content-type (`415`), bounded body (`413`), per-client rate limit (`429`).
- **Zod validation** on every `/api/chat` payload before any logic runs.
- **Prompt-injection defense** — user text is sanitized (`sanitizeUserText`) and prompts explicitly label user messages as untrusted data, never instructions.
- **Security headers** — `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, no `X-Powered-By` (`next.config.ts`).
- **No secrets client-side** — model credentials are read only in server route handlers; `.env.example` holds placeholders only.

**Known limitation:** the rate limiter is in-process memory — fine for a single demo instance; a multi-replica deployment should back it with Redis/Upstash.

## Efficiency

- **Streaming** responses (token-by-token) instead of blocking.
- **Deterministic simulation** avoids external calls; the mock provider is zero-cost.
- **Deliberate 6s polling** for live signals — operational context for a human, not a ticker.
- Lightweight CSS/SVG visualizations instead of heavy map SDKs; system font stack.

## Testing

**33 tests across 10 Jest suites**, covering the layers a judge would probe:

- **Unit** — Zod schemas, rate limiter (window/isolation), prompt sanitiser, prompt grounding, deterministic simulation (reproducibility, bounds, phases), capabilities map.
- **Service** — `opsService` (alert severity/sorting, KPI tones, the executable action loop), `chatService` grounding.
- **Route** — `POST /api/chat` exercised with real `Request`s against the mock provider: success (`200` + AI-mode header), `415`, `400`, and `429`.
- **Component** — `FanChat` accessibility (live log, language tabs, labeled input).

## Accessibility

- Skip-to-content link, semantic landmarks, real heading hierarchy.
- `aria-live="polite"` conversation logs; ARIA `progressbar` semantics on density meters.
- Language selector as ARIA `tab`s with `aria-selected`; every control is a real `<button>`/`<input>`/`<label>`.
- Focus rings preserved (`:focus-visible`); `prefers-reduced-motion` disables the alert pulse.
- Step-free routing is first-class: Gate C is modeled as non-accessible and every AI feature reasons about it.

## Environment variables

Copy `.env.example` to `.env.local`. Defaults keep the app in safe mock mode.

```bash
PACE_AI_PROVIDER=mock
GCP_PROJECT_ID=your-gcp-project-id
GCP_LOCATION=us-central1
GEMINI_MODEL=gemini-1.5-flash
```

Set `PACE_AI_PROVIDER=vertex` only when server-side Google Cloud auth is configured (Vercel, Cloud Run, Firebase Functions).

## Vercel deployment

Framework preset **Next.js**, install `npm install`, build `npm run build`, output `.next`. Add production env vars in the Vercel dashboard; never commit `.env.local`.

## Assumptions & limitations

- **Live signals are simulated** — `generateLiveSignals()` is a deterministic function of time, isolated behind the `StadiumSector` type so a real feed can replace it without touching UI/AI code.
- **Mock AI is a deterministic stand-in**, not a translation engine; it is grounded but clearly offline when no key is set.
- **Executed actions update client/live state** for the demo; a production build would call real dispatch/HVAC systems.
- **Single session, no auth** — a single-tenant control-room console for hackathon scope.
- **In-memory rate limiting** — see [Security](#security).

## Project structure

```text
src/
  app/
    layout.tsx  page.tsx  fan/page.tsx  staff/page.tsx  globals.css
    api/chat/route.ts  api/live-signals/route.ts  api/capabilities/route.ts  api/health/route.ts
  components/
    ui/           button, card, input, scroll-area, badge, stat-card, quick-action
    fan/          FanChat
    staff/        StaffDashboard, KpiBar, OpsMap, AlertFeed, SustainabilityMeter
  lib/
    ai/           types, provider, mockProvider, vertexProvider, prompts, sanitize
    services/     chatService, opsService
    simulation/   liveSignals (deterministic)
    security/     guard, rateLimit
    validators/   schemas (Zod)
    data/         venue (facts, sectors, transit, KB)
    capabilities.ts  env.ts  utils.ts
  types/index.ts
  __tests__/      10 suites
.github/workflows/ci.yml
```

## Submission checklist

- Public GitHub repository, single branch, complete code, **< 10 MB** (node_modules/.next gitignored).
- README covers vertical, approach/logic, how it works, and assumptions.
- Verified: typecheck, format check, 33 tests, production build, `npm audit` (0 vulnerabilities).
