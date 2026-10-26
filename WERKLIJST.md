# Werklijst Stacks for Roon

Bovenaan wat eerst moet; afgevinkt gaat naar het logboek in README.md.

## Deep Roon zuiniger (René, 26 okt 2026)
- [ ] **Niet elk kwartier de hele bibliotheek.** Nu leest `deep.ververs` bij elke lading van de officiële lijst (start + elke
      15 min) heel `roon_library sort=added` opnieuw: 19 verzoeken bij 1858 albums, 250 bij 25.000 — ook als er niets
      veranderde. Alleen opnieuw lezen als het aantal albums (of de officiële lijst) veranderde; anders hooguit de eerste
      pagina (nieuwste toevoegingen).
- [ ] **Bewaarde albums af en toe verversen.** `roon_album` per album wordt nu één keer gelezen en voorgoed bewaard
      (`data/deep.json`); voegt Roon later een catalogusnummer of releasedatum toe, dan ziet Stacks dat nooit. Elke dag
      een kleine portie van de oudste bewaarde albums opnieuw lezen (met een datum per album in de cache).

## Release-klaar (gesprek 26 okt 2026)
- [ ] Engelse README met schermafbeeldingen; licentie (Apache, zoals Deep Roon?); icoon voor de extensie; versienummer.
      `uitrol.sh` blijft van ons, buiten de release.
- [ ] Docker-image (amd64 + arm64; puur JS, geen native onderdelen), `data/` als volume; daarnaast `npx stacks-for-roon`.
- [ ] Grote bibliotheken: zichtbare voortgang bij de eerste keer (kleuren ~9 hoezen/s, Deep Roon ~14 albums/s); nagaan
      of 25.000 ruggen soepel scrollen (content-visibility, niet gemeten).
- [x] ~~Deep Roon als losse server ernaast~~ — opgelost door de kopie (`lib/intern.js`, 26 okt): één installatie.
- [ ] "Richer data" standaard aan of uit bij een release? (René, samen met het gesprek met Roon Labs.)
- [ ] Na elke Roon-update: deep-roon-mcp bijwerken en `node intern/kopieer-intern.mjs` opnieuw.
- [ ] Zeggen dat iedereen op het netwerk kan afspelen (geen login), zoals bij Roon Web Controller.
- [ ] René: Deep Roon in een openbare extensie eerst met Roon Labs (Brian) bespreken.
- [ ] Volgorde: release-klaar → repo openbaar + Docker + bèta met de forumvragers → post in Roon Extensions → Extension
      Manager.

## Omwegen die bij anderen anders kunnen uitvallen
- Play From Here: album Play Now, dan `play_from_here` naar de track in de wachtrij (Roon biedt het bij albumtracks niet
  aan); track 1 klinkt even.
- Shuffle: shuffle aan op de zone + Play Now; de zone blijft daarna op shuffle staan.
- Albums terugvinden op hun plek `n` in Roon's lijst, met de image_key als controle.
- Koppelen aan Deep Roon op titel + artiest (eerst letterlijk).

## Ooit
- Letterbalk voor aanraken (iPad zonder toetsenbord), zoals Basso op iOS.
- De kop op telefoonbreedte valt in drie regels (titel, zone, volgorde).
