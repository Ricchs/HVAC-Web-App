# ADR-0001: Serve frontend as static files from FastAPI

**Date:** 2026-06-23

## Context

The app is a multi-page dashboard (Inventory, Sales, Jobs, etc.) with a FastAPI + Postgres backend. I needed a way to deliver the HTML/CSS/Js pages to the browser and let them call the API. Options considered:

1. Server-side templating with Jinja2 (FastAPI renders HTML per request).
2. Static HTML/CSS/JS files served by FastAPI, with a separate JSON API the JS calls.
3. A separate frontend framework/host (React on Vercel, etc.).

## Decision

Serve the frontend as plain static files mounted in FastAPI (`StaticFiles`), and keep the API as JSON-only endpoints. The browser loads `inventory.html` over HTTP from the same origin and fetches data from `/inventory`, etc.

Routers are registered before the static mount so `/inventory` (API) is not shadowed by the `/` catch-all static mount.

## Consequences

- **Good:** One server. Simple to run and deploy for a small app. Frontend stays plain HTML/CSS/JS (no build step, easy to debug).
- **Good:** Clear separation. API returns data, frontend owns rendering.
- **Trade-off:** No server-side templating. shared UI (e.g., the sidebar) must be injected client-side via `fetch('/sidebar.html')` instead of a template include.
- **Trade-off:** Won't scale as elegantly as a dedicated static host/CDN if the app grows large; would revisit and split frontend/backend hosting at that point.