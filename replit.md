# SagaDrop

AI-powered story book marketplace. White editorial aesthetic, cinematic Three.js 3D hero, AI book recommendations (Claude), AI cover generation (Gemini), curated collections, newsletter, and custom book builder.

## Stack

- **Backend**: FastAPI + Motor (async MongoDB), Python 3.12 — runs on port 8000
- **Frontend**: React 19 + CRA (craco), Tailwind v3, shadcn/ui, Three.js / `@react-three/fiber`, Framer Motion, Lenis — runs on port 5000

## Running locally on Replit

Two workflows are configured:

| Workflow | Command | Port |
|---|---|---|
| `Backend API` | `cd backend && uvicorn server:app --host 0.0.0.0 --port 8000 --reload` | 8000 (console) |
| `Start application` | `cd frontend && PORT=5000 yarn start` | 5000 (webview) |

The frontend dev server proxies `/api/*` to the backend via `frontend/src/setupProxy.js`.

## Required secrets

| Secret | Description |
|---|---|
| `MONGO_URL` | MongoDB connection string (`mongodb+srv://user:pass@cluster.mongodb.net`) |

## Optional env vars (set in Replit)

| Variable | Default | Description |
|---|---|---|
| `DB_NAME` | `sagadrop` | MongoDB database name |
| `EMERGENT_LLM_KEY` | — | API key for AI features (recommendations + cover generation) |
| `CORS_ORIGINS` | `*` | Comma-separated allowed origins |

> **Note**: Without `MONGO_URL`, the server starts but auth, newsletter, and share features return 503. The book catalog (40 hardcoded books) and AI recommendation routes still work.

## Project structure

```
backend/
  server.py          # FastAPI app + startup/shutdown
  config.py          # Env var loading
  database.py        # Motor client (None-safe if MONGO_URL missing)
  catalog.py         # 40 hardcoded books across 8 genres
  models.py          # Pydantic models
  auth_utils.py      # JWT + bcrypt helpers
  routes/
    books.py         # GET /api/books, /api/books/trending, /api/categories
    auth.py          # POST /api/auth/register|login|logout|refresh
    ai.py            # POST /api/ai/recommend, /api/ai/generate-cover
    newsletter.py    # POST /api/newsletter
    share.py         # POST/GET /api/share/:id

frontend/src/
  pages/             # Route-level pages
  components/        # UI components (hero, navbar, catalog, etc.)
  context/           # Cart & wishlist context
  hooks/             # Custom React hooks
  lib/api.js         # Axios client + all API call helpers
```

## User preferences

- Keep existing project structure and stack
