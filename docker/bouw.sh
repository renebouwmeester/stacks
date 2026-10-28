#!/usr/bin/env bash
# Bouwt het Stacks-image voor linux/amd64 en linux/arm64 met docker buildx (28 okt 2026).
#   docker/bouw.sh            → alleen bouwen (laden kan niet bij twee platforms; dit controleert dat het bouwt)
#   docker/bouw.sh lokaal     → alleen voor dit platform, geladen als stacks:proef (om meteen te proberen)
#   docker/bouw.sh push       → bouwen en naar Docker Hub (renebouwmeester/stacks:<versie> en :latest)
set -euo pipefail
cd "$(dirname "$0")/.."
VERSIE=$(node -p "require('./package.json').version")
IMAGE=${STACKS_IMAGE:-renebouwmeester/stacks}
docker buildx inspect stacks-bouwer >/dev/null 2>&1 || docker buildx create --name stacks-bouwer --use >/dev/null
docker buildx use stacks-bouwer
case "${1:-}" in
  lokaal) docker buildx build --load -t stacks:proef . ;;
  push)   docker buildx build --platform linux/amd64,linux/arm64 -t "$IMAGE:$VERSIE" -t "$IMAGE:latest" --push . ;;
  *)      docker buildx build --platform linux/amd64,linux/arm64 -t "$IMAGE:$VERSIE" . ;;
esac
