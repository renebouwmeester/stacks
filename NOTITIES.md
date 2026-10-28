# Stacks for Roon — notities (Nederlands, intern)

Basso's Stacks voor een Roon-bibliotheek: albums als liggende ruggen in de kleuren van de hoes. Een kleine Roon-extensie
in Node die een webpagina serveert, zodat het op een Core, Pi of in Docker draait en in elke browser opent.

## Principe (René, 26 okt 2026)
**Official API first, internal protocol where needed.** Alles wat de officiële Roon API kan, komt daaruit. Deep Roon
(het interne protocol) alleen voor wat de officiële API niet geeft: speelduur, release- en toevoegdatum,
catalogusnummer, barcode, formaat, credits. Breekt het interne protocol ooit bij een Roon-update, dan werkt Stacks
door met minder: die volgordes en gegevens verdwijnen stil uit het scherm, de stapel zelf blijft.

| Wat | Bron |
|---|---|
| albumlijst, titel, artiest, hoes | officieel (browse, image) |
| rugkleuren | zelf berekend uit de hoes (`lib/kleur.js`) |
| afspelen, zones | officieel (browse-acties, transport) |
| speelduur (dikte), datums, catalogusnummer, barcode, tracktijden, credits | Roon's interne protocol: twee functies uit Deep Roon, gekopieerd (`lib/intern.js`) |

## Docker (28 okt 2026)
Eén image voor linux/amd64 en linux/arm64 (`Dockerfile`, bouwen met `docker/bouw.sh`; `lokaal` laadt het als `stacks:proef`,
`push` zet het op Docker Hub). Alles wat moet blijven staat in `/data`: de koppeling met Roon (`config.json`), de kleuren en
de Deep Roon-cache.

**Linux of NAS** — Stacks zoekt de Core zelf (SOOD, UDP-multicast op poort 9003); dat kan alleen met het netwerk van de host:
```
docker run -d --name stacks --network host --restart unless-stopped -v stacks-data:/data renebouwmeester/stacks
```

**Docker Desktop (Mac, Windows)** — de containers draaien daar in een Linux-VM waar de multicast niet doorkomt; geef de Core
met de hand op (`ROON_CORE`, het adres van de Core en poort 9330), dan verbindt Stacks rechtstreeks over TCP:
```
docker run -d --name stacks -p 9360:9360 --restart unless-stopped -v stacks-data:/data \
  -e ROON_CORE=192.168.1.10:9330 -e STACKS_URL=http://mijn-mac.local:9360 renebouwmeester/stacks
```
`STACKS_URL` is optioneel: het adres dat Roon's statusregel noemt (in een container ziet Stacks alleen zijn interne adres).
Of `--network host` op Docker Desktop (4.34+) multicast wél doorlaat, is niet getest; `ROON_CORE` werkt overal.

**Getest 28 okt in Docker Desktop op Dylan** (Apple silicon): `docker/bouw.sh lokaal` (image 239 MB) en de bouw voor
amd64+arm64 slagen; de container met `ROON_CORE=192.168.1.99:9330` en `-p 9360:9360` koppelt, leest 1857 albums, de kopie van
Deep Roon verbindt over het LAN, de pagina antwoordt, `docker stop` sluit schoon. Bouwen kan niet over ssh: Docker Desktop
vraagt zelf de sleutelhanger (ook voor anonieme downloads) — bouwen in een Terminal-venster op de Mac. De klok in de
container is UTC; `-e TZ=Europe/Amsterdam` voor de log. Niet getest: `--network host` op Docker Desktop.

`ROON_CORE` werkt ook zonder Docker (`ROON_CORE=… node stacks.js`) — op Dylan getest 28 okt: gekoppeld, bibliotheek, en de
kopie van Deep Roon gebruikt hetzelfde adres (als `ROON_HOST`).

## Licenties
`lib/intern.js` bevat code uit deep-roon-mcp (Apache-2.0) en Arthur Soares' roon-api-reverse-engineering (MIT): zie
`intern/NOTICE-deep-roon-mcp` en de LICENSE-bestanden in `intern/`.

## Draaien
```
npm install
node stacks.js            # poort 9360 (PORT=…), gegevens in ./data (STACKS_DATA=…)
```
Daarna in Roon › Settings › Extensions "Stacks on <host>" aanzetten, en `http://<host>:9360` openen.
Vaste dienst op Dylan: `./uitrol.sh` (launchd `com.rene.stacks`, log in ~/Library/Logs/stacks.log op Dylan).
De rugkleuren worden één keer per hoes berekend en bewaard in `data/kleuren.json` (per image_key).

## Stand
1. ✔ Tekening: berekende kleuren naast Apple's (`tekening/`, zie LEESMIJ daar)
2. ✔ Kale webpagina met ruggen uit de officiële API — sorteren: By Artist, A-Z, Shuffled. De kleuren zijn feller dan
   Apple's; René (26 okt): "wat heftiger, maar dat is juist wel leuk — mooi zo". Afgekaart, niet temperen.
3. Album openklappen + afspelen op een zone, de klapper als het boekje van Stacks Full Screen op de Mac (René, 26 okt) — draait op Dylan (http://192.168.1.99:9360) sinds 26 okt; afspelen nog door René te proberen
4. ✔ Deep Roon-laag (26 okt): dikte naar speelduur, duur en HI-RES op de rug, Release Date / Date Added / Catalogue
   Number, tracktijden, credits (musici met instrument, Produced by, Engineer) en een feitenregel in het boekje.
   Eerst via een draaiende Deep Roon MCP; sinds 26 okt avond (René: "isoleren — de mug en de olifant") met alleen
   `album()` en `library()` en het protocol eronder, gekopieerd uit deep-roon-mcp naar `lib/intern.js` door
   `node intern/kopieer-intern.mjs` (commit van deep-roon-mcp in de kop; Deep Roon's eigen extensie vervangen door
   `intern/official.ts`: de toestemming is Stacks' koppeling). Breekt een Roon-update het protocol: Deep Roon repareren,
   opnieuw kopiëren. Aan/uit in Roon › Settings › Extensions › Stacks ("Richer data"). Eén keer per album
   `roon_album` (rustig, 40 ms ertussen; cache data/deep.json), de Date Added-volgorde uit `roon_library sort=added`.
   Gemeten op René's bibliotheek: 1858/1858 gekoppeld, speelduur 1858, releasedatum 1314 (anders het jaar),
   catalogusnummer 769, barcode 1836, hi-res 368. Koppelen op titel + artiest, eerst letterlijk.
5. ✔ Verborgen albums als ruggen (29 okt). Eerste gebruiker (Mark): Stacks 2,990, Roon 3,101 — hij heeft "Show hidden
   tracks and albums" aan om zijn MOFI-rip naast de Qobuz-versie van Blood on the Tracks te zien. De officiële API én een
   standaard Focus-vraag geven alleen de zichtbare albums. René: "die hidden versies gewoon als Spine tonen", gekoppeld
   aan Richer data; Brian reageerde twee keer niet op de vraag over het interne protocol: "wie zwijgt stemt toe".
   Deep Roon kreeg `hidden: 'include' | 'only'` (AlbumQueryCriteria IncludeHidden/RequireHidden) en `play(…, includeHidden)`
   (c5abf1d). De lijst komt nu mét verborgen albums (Date Added over alles); een tweede vraag zegt welke verborgen zijn;
   die koppelen aan geen enkel officieel album. Ruggen zonder `n`; boekje uit `roon_album`; hoes en kleur via de Core
   (`/image/<sleutel>.jpg`, `.300.jpg`); afspelen via het interne protocol (Play From Here = de tracks vanaf daar).
   Feitenregel "Hidden in Roon", filterwoord `hidden`. Gemeten op Dylan: 2211 albums (= Roon's Home), 353 verborgen,
   alle gekleurd en gelezen. Stacks speelt dus niet meer alleen-lezend via het interne protocol (README zegt het).
   Dezelfde avond (René: "volgt de setting in Roon?"): Roon bewaart "Show hidden tracks and albums" NIET in de Core —
   elke vraag van de app geeft IncludeHidden zelf mee (AlbumQueryCriteria, SearchParameters, …; niets in
   LibrarySettingsInfo of het profiel). Dus een eigen schakelaar "Show hidden albums" in de groep Richer data, standaard
   No; aan → de bibliotheek opnieuw lezen mét verborgen. Op Dylan nu uit: 1858 ruggen.

## Stap 3: wat de officiële API geeft (gemeten 26 okt)
Een album in browse (`albums` › album): "Play Album" plus per track `"3. Titel"` met de uitvoerenden als subtitle — geen
speelduur. Acties onder Play Album en onder een track: Play Now, Add Next, Queue, Start Radio — ook met een zone erbij
geen Play From Here en geen Shuffle. Play From Here doet Stacks als "album Play Now, dan transport.play_from_here naar
die track in de wachtrij"; Shuffle als "shuffle aan op de zone + Play Now" (de zone blijft daarna op shuffle staan).
Albums vindt de extensie terug op hun plek `n` in Roon's lijst, met de image_key als controle (item_keys gelden maar
één browse-sessie); veranderde de bibliotheek, dan leest hij opnieuw en probeert de pagina het nog eens.
Het inlegvel toont de tracks en de uitvoerenden uit de tracks (zonder de albumartiest) — credits zijn Deep Roon.
