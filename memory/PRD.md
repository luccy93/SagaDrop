# SagaDrop — Product Requirements

## Original problem
Build an enterprise-grade "AI-powered Story Book Marketplace" named **SagaDrop** ("Every Story Begins Here.") that visually mirrors the HyperFit reference (luxury editorial ecommerce). White background, black typography, red accent `#D90429`, fullscreen cinematic 3D hero, sticky floating nav, editorial book grid, AI recommendation studio, AI book cover customizer, curated collections, author showcase, reviews, newsletter, footer. Full-stack.

## User personas
- **Aesthete Reader** — buys hardcovers and collector editions for shelf-worthy design.
- **Mood Shopper** — describes a vibe, expects an AI to surface the right book.
- **Bespoke Gifter** — customizes a book cover, foil, and packaging as a present.
- **Casual Browser** — arrives from social, converts on cinematic hero + trending grid.

## Architecture
- **Backend**: FastAPI + Motor (MongoDB). AI via `emergentintegrations` — Claude Sonnet 4.5 (`claude-sonnet-4-5-20250929`) for recommendations, Gemini Nano Banana (`gemini-3.1-flash-image-preview`) for cover generation. `EMERGENT_LLM_KEY` in `.env`.
- **Frontend**: React 19 + CRA (craco), Tailwind v3, shadcn/ui components, Framer Motion, Three.js + `@react-three/fiber@9` + `@react-three/drei@9`, Lenis smooth scroll, sonner toasts, Playfair Display + Outfit fonts.

## Implemented (Feb 2026)
- Cinematic Three.js hero: opening book, castle with red-foil roofs, floating books, dust particles, orbiting camera, light rays, play/pause 3D toggle.
- Sticky glassmorphism navbar with search overlay, wishlist/cart badges, hamburger fullscreen menu.
- Trending Books rail (horizontal snap scroll) with real Open Library book covers via ISBN.
- Categories grid — 9 genres with hover invert.
- AI Recommendation Studio — mood selector (Fantasy/Romance/Adventure/Mystery) + optional vibe input → Claude returns editorial summary + 4 picks.
- Book Customizer — CSS 3D live preview, title/author input, material (Hardcover/Paperback/Special), foil color, title font, addon toggles (Bookmark/Gift Box/Dust Jacket), price recalculation, "Generate AI Cover" via Nano Banana with base64 image applied to preview, "Add to Cart" for custom edition.
- Collections switcher across 5 curated shelves.
- Authors, Reader Reviews, Newsletter (persists to Mongo), massive typographic Footer.
- Client-side Cart & Wishlist drawers with localStorage persistence.
- Full `data-testid` coverage.
- Testing agent E2E 100% pass on iteration 1.

## Prioritized backlog
### P0 — none blocking

### P1
- Product detail page with reviews + related books.
- Real checkout (Stripe integration).
- User account / order history.
- Persistent server-side cart & wishlist (auth-gated).

### P2
- Author profile page & follow.
- Reviews write flow with moderation.
- Category deep pages with filters (price, rating, format).
- Book preview modal (quick view) with pages carousel.
- CMS-style admin for adding books.
- SSR / SEO metadata per book.

## Deferred (not in v1)
- Auth (was flagged as not requested by user).
- Payment.
- Search backend (search UI is present but stubbed).

## Update — Jul 2, 2026 (fork session)
- Hero 3D scene redesigned per user request: replaced castle/ancient-book scene with "Endless White Library" — infinite instanced bookshelves receding into soft white fog, slow forward camera dolly (seamless segment loop), 6 floating books that fly out into the aisle and return, floating gold dust particles. Text overlay unchanged. Verified via screenshot.

## Update — Jul 2, 2026 (cont.)
- Catalog rebalanced to exactly 40 books: 5 per category across 8 genres (Fantasy, Mystery, Romance, Sci-Fi, Adventure, Horror, Classics, Children). Manga removed. All covers are real OpenLibrary images (every ISBN verified 200).
- Trending endpoint now returns top 6 books (was 8).
- "Share Custom Book" feature shipped and fully tested (iteration_2: 100% pass): POST /api/share stores AI cover in MongoDB; public OG page /api/share/{id}/page (og:title/og:image/redirect); cover served at /api/share/{id}/cover; ShareModal in customizer (copy link, X/WhatsApp/Facebook); public SharePage at /share/:id with views counter, 404 state.
