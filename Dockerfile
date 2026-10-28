# Stacks for Roon in een container (28 okt 2026): één image voor linux/amd64 en linux/arm64 (Apple silicon, Intel-NAS, Pi),
# te bouwen met docker/bouw.sh. Ook de vorm die de Roon Extension Manager installeert.
#
#   Linux/NAS (de Core zelf zoeken, multicast):
#     docker run -d --name stacks --network host --restart unless-stopped -v stacks-data:/data renebouwmeester/stacks
#   Docker Desktop (Mac/Windows: geen multicast in de VM) — de Core met de hand:
#     docker run -d --name stacks -p 9360:9360 --restart unless-stopped -v stacks-data:/data \
#       -e ROON_CORE=192.168.1.10:9330 -e STACKS_URL=http://<deze computer>:9360 renebouwmeester/stacks

# De node_modules: twee pakketten van Roon Labs komen van GitHub, dus git is nodig — alleen in deze bouwstap.
FROM node:22-bookworm-slim AS bouw
RUN apt-get update && apt-get install -y --no-install-recommends git ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /usr/src/app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --no-audit --no-fund

FROM node:22-alpine
WORKDIR /usr/src/app
COPY --from=bouw /usr/src/app/node_modules ./node_modules
COPY package.json stacks.js LICENSE NOTICE ./
COPY intern/LICENSE-* intern/NOTICE-* ./intern/
COPY lib ./lib
COPY web ./web
# Alles wat moet blijven — de koppeling met Roon (config.json), de kleuren, de Deep Roon-cache — staat in /data.
ENV STACKS_DATA=/data PORT=9360 NODE_ENV=production
VOLUME /data
EXPOSE 9360
# node vangt SIGTERM zelf af (stacks.js sluit de verbinding van het interne protocol netjes): docker stop is schoon.
CMD ["node", "stacks.js"]
