# PACE - Predictive AI for Crowd & Environment

PACE is a GenAI-enabled Smart Stadiums & Tournament Operations product for FIFA World Cup 2026. It combines a multilingual fan concierge, a staff operations dashboard, crowd-flow intelligence, and sustainability actions for stadium teams.

Repository: https://github.com/deveshpunjabi/pace

## Chosen Vertical

`[Challenge 4] Smart Stadiums & Tournament Operations`

PACE is designed for fans, organizers, volunteers, and venue staff who need real-time multilingual help, crowd redirection guidance, accessibility routing, transportation support, and environmental optimization during tournament operations.

## Approach and Logic

PACE uses a strict Next.js App Router architecture:

- `/` role selection for fan or staff workflows.
- `/fan` mobile-first fan concierge with EN/ES/FR support and streaming chat.
- `/staff` desktop-first operations dashboard with live mock density fluctuation, alerts, and sustainability recommendations.
- `/api/chat` secure streaming endpoint that validates every request with Zod before processing.
- `src/lib/ai/prompts.ts` contains explicit multilingual, crowd management, sustainability, navigation, and safety directives.
- `src/lib/ai/tools.ts` defines function-calling tools for HVAC reduction and crowd redirection.
- The default model mode is safe `mock` streaming for demo reliability. Vertex AI can be enabled server-side with environment variables.

## How the Solution Works

1. Fans choose the fan view and ask questions in English, Spanish, or French.
2. PACE validates the chat payload, streams a concise answer, and prioritizes accessibility and safe navigation.
3. Staff open the operations dashboard and see density across six stadium sectors.
4. High-density sectors trigger red operational alerts when density exceeds 85%.
5. Low-density sectors trigger sustainability guidance when occupancy is below 30%.
6. Staff can ask PACE for mitigation plans; the API streams structured action guidance.

## Assumptions

- Stadium sensor, queue, and HVAC data are simulated locally for the hackathon demo.
- Production sensor data would come from Firestore, BigQuery, Pub/Sub, or a venue operations platform.
- Production AI calls should run from a server runtime only. Browser code must never receive raw model credentials.
- Google Maps indoor routing and Vertex AI Search can replace the typed mock navigation and RAG data later.

## Evaluation Criteria Coverage

| Criterion | Implementation evidence |
| --- | --- |
| Code quality | Strict TypeScript, modular App Router files, explicit interfaces, typed components, separated prompts/tools/data/validators. |
| Security | Zod validates `/api/chat`, no hardcoded secrets, `.env.example` placeholders only, server-side env for model credentials, no unsafe HTML rendering. |
| Efficiency | Streaming API responses, capped message history, memoized alert derivation, lightweight CSS grid maps instead of heavy map SDKs for the demo. |
| Testing | Jest tests in `src/__tests__` validate Zod schema security, prompt directives, function tools, and alert logic. |
| Accessibility | Chat logs use `role="log"` and `aria-live="polite"`, buttons have accessible labels, density meters use ARIA progress semantics, native keyboard controls are used. |
| Problem alignment | Explicit support for multilingual assistance, crowd management, accessibility, transportation, sustainability, operational intelligence, and real-time decision support. |

## Project Structure

```text
src/
  app/
    layout.tsx
    page.tsx
    fan/page.tsx
    staff/page.tsx
    globals.css
    api/chat/route.ts
  components/
    ui/
    fan/FanChat.tsx
    staff/OpsMap.tsx
    staff/AlertFeed.tsx
    staff/SustainabilityMeter.tsx
    staff/StaffDashboard.tsx
  lib/
    ai/prompts.ts
    ai/tools.ts
    data/mockData.ts
    validators/schemas.ts
    utils.ts
  types/index.ts
  __tests__/
    schemas.test.ts
    pace.test.ts
```

## Local Setup

```bash
npm install
npm run dev
```

Open:

```text
http://127.0.0.1:3000
```

Verification:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
npm audit --audit-level=moderate
```

## Environment Variables

Copy `.env.example` to `.env.local` for local development.

```bash
PACE_AI_PROVIDER=mock
GCP_PROJECT_ID=your-gcp-project-id
GCP_LOCATION=us-central1
GEMINI_MODEL=gemini-1.5-flash
GOOGLE_MAPS_API_KEY=replace-with-server-or-browser-restricted-key
```

Use `PACE_AI_PROVIDER=mock` for the submitted demo. Use `PACE_AI_PROVIDER=vertex` only when server-side Google Cloud authentication is configured in Vercel, Firebase Functions, or Cloud Run.

## Vercel Deployment

Recommended settings:

```text
Framework Preset: Next.js
Install Command: npm install
Build Command: npm run build
Output Directory: .next
```

For GitHub import, connect:

```text
https://github.com/deveshpunjabi/pace
```

Add production environment variables in the Vercel dashboard. Do not commit `.env.local`.

## Submission Checklist

- Public GitHub repository: `https://github.com/deveshpunjabi/pace`
- Repository contains complete project code.
- Repository should remain under 10 MB by excluding `node_modules/`, `.next/`, `dist/`, coverage, and local env files.
- Keep work on a single branch for submission.
- README explains the chosen vertical, approach, logic, assumptions, setup, testing, and deployment.
- Maximum attempts rule is external to the codebase; verify before submitting.

## Demo Script

1. Open PACE and choose `Fan Entrance`.
2. Keep Spanish selected and submit: `Necesito una ruta accesible desde North Gate a Section 142.`
3. Confirm PACE streams accessible route guidance.
4. Return home and choose `Staff Operations`.
5. Review high-density alerts, sustainability meter, and live sector grid.
6. Ask staff copilot to generate mitigation and sustainability actions.

## Production AI Path

The submitted app has a production-shaped streaming API with safe mock fallback. For a live deployment:

- Configure server-side Google Cloud credentials in Vercel or a backend runtime.
- Set `PACE_AI_PROVIDER=vertex`.
- Keep request validation in `src/lib/validators/schemas.ts`.
- Expand `paceTools` with real operations integrations for alerts, HVAC, and routing.
- Replace mock sector data with authenticated venue telemetry.
