#!/usr/bin/env bash
set -euo pipefail

# ── SagaDrop Deploy Script ──────────────────────────────────────────────────
# Prerequisites: docker, docker-compose

ENV_FILE="${1:-.env}"
if [ -f "$ENV_FILE" ]; then
    echo "→ Loading $ENV_FILE"
    set -a; source "$ENV_FILE"; set +a
fi

echo "→ Building images"
docker-compose build

echo "→ Starting stack"
docker-compose up -d

echo "→ Waiting for healthcheck"
for i in $(seq 1 30); do
    if curl -sf http://localhost:8000/api/health > /dev/null 2>&1; then
        echo "✓ Backend healthy"
        break
    fi
    sleep 2
done

echo "→ Applying database indexes & seed"
docker-compose exec -T backend python -m scripts.seed_db

echo "✓ Deploy complete — http://localhost:5000"
