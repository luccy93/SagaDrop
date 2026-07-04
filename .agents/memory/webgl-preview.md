---
name: WebGL error in Replit preview
description: Three.js hero scene fails to render in Replit's containerized screenshot environment
---

**Rule:** The "Error creating WebGL context" / THREE.WebGLRenderer crash in preview screenshots is a pre-existing environment limitation — Replit containers have no GPU. The app works correctly in a real browser.

**Why:** The hero section uses a Three.js 3D scene that requires WebGL hardware acceleration, which is unavailable in headless/containerized environments.

**How to apply:** Do not attempt to fix this via code — it is not a bug in the app. The app renders and functions correctly for end users. Ignore WebGL errors in screenshot-based validation.
