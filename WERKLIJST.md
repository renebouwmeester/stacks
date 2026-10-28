# Werklijst Stacks for Roon

Bovenaan wat eerst moet; afgevinkt gaat naar het logboek in NOTITIES.md (README.md is sinds 28 okt de Engelse, openbare).

## Deep Roon zuiniger (René, 26 okt 2026)
- [x] **Niet elk kwartier de hele bibliotheek.** (26 okt: eerst één pagina; totaal en nieuwste gelijk → klaar.) Nu leest `deep.ververs` bij elke lading van de officiële lijst (start + elke
      15 min) heel `roon_library sort=added` opnieuw: 19 verzoeken bij 1858 albums, 250 bij 25.000 — ook als er niets
      veranderde. Alleen opnieuw lezen als het aantal albums (of de officiële lijst) veranderde; anders hooguit de eerste
      pagina (nieuwste toevoegingen).
- [x] **Bewaarde albums af en toe verversen.** (26 okt: per dag een dertigste, langst niet gelezen eerst, hooguit eens per week.) `roon_album` per album wordt nu één keer gelezen en voorgoed bewaard
      (`data/deep.json`); voegt Roon later een catalogusnummer of releasedatum toe, dan ziet Stacks dat nooit. Elke dag
      een kleine portie van de oudste bewaarde albums opnieuw lezen (met een datum per album in de cache).

## Release-klaar (gesprek 26 okt 2026)
- [x] Engelse README, licentie Apache-2.0 + NOTICE, versie 0.1.0 (28 okt).
- [x] Schermafbeeldingen in de README (docs/stack.jpg, docs/booklet.jpg, 29 okt).
- [ ] Een icoon voor de extensie.
- [x] Docker-image (amd64 + arm64), `/data` als volume, `ROON_CORE` — gebouwd en getest in Docker Desktop op Dylan (28 okt).
- [x] Op Docker Hub, OPENBAAR: `renebouwmeester/stacks` 0.1.0 + latest, amd64 + arm64 (29 okt).
- [ ] `npx stacks-for-roon` (npm).
- [ ] Grote bibliotheken: zichtbare voortgang bij de eerste keer (kleuren ~9 hoezen/s, Deep Roon ~14 albums/s); nagaan
      of 25.000 ruggen soepel scrollen (content-visibility, niet gemeten).
- [x] ~~Deep Roon als losse server ernaast~~ — opgelost door de kopie (`lib/intern.js`, 26 okt): één installatie.
- [x] "Richer data" staat bij een nieuwe installatie AAN (René, 29 okt: "minimaal readonly werk, raakt aan de core
      promise"; 28 okt nog uit); een opgeslagen keuze blijft.
- [ ] Na elke Roon-update: deep-roon-mcp bijwerken en `node intern/kopieer-intern.mjs` opnieuw.
- [x] Zeggen dat iedereen op het netwerk kan afspelen (geen login) — staat in de README.
- [ ] René: Deep Roon in een openbare extensie eerst met Roon Labs (Brian) bespreken.
- [x] De GitHub-repo openbaar (29 okt), na een geschiedenis zonder het Worker-adres (tekenscripts eruit, lokaal in .gitignore).
- [ ] Volgorde: release-klaar → repo openbaar + Docker + bèta met de forumvragers → post in Roon Extensions → Extension
      Manager.

## Omwegen die bij anderen anders kunnen uitvallen
- Play From Here: album Play Now, dan `play_from_here` naar de track in de wachtrij (Roon biedt het bij albumtracks niet
  aan); track 1 klinkt even. Roon antwoordt op `play_from_here` niet (log 26 okt): Stacks kijkt of het item vooraan staat.
- Shuffle: shuffle aan op de zone + Play Now; de zone blijft daarna op shuffle staan.
- Albums terugvinden op hun plek `n` in Roon's lijst, met de image_key als controle.
- Koppelen aan Deep Roon op titel + artiest (eerst letterlijk).

## Ooit
- Letterbalk voor aanraken (iPad zonder toetsenbord), zoals Basso op iOS.
- De kop op telefoonbreedte valt in drie regels (titel, zone, volgorde).
