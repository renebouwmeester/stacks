# Roon's bladwijzers in Stacks — bevindingen (29 okt 2026)

Aanleiding: Ander op het forum ("Is it possible to have a drop down? for our bookmarks?") en de lijst van Mark (Tidal,
Qobuz, Classical (local), DVD Audio Collections, Music 2.0 (local), DSD, Streaming, Classical, PGGB Classical, PGGB,
Multichannel): vakken in de bibliotheek, kisten om in te graven — past bij Stacks. Nog NIET gebouwd (René: "eerst samen
bekijken of dat zinvol is"); dit is wat er gemeten is, voor als we gaan bouwen. Schatting: een middag.

## Waar ze staan
- In de Core: `Broker.ClientData.Data`, een `DataDictionary<string, string>` dat alle Roon-apps delen (daarom staan
  bladwijzers op elke installatie). Methode van de app: `ClientData::Put(string key, string value)` — Stacks schrijft
  NIETS, alleen lezen.
- Sleutel per bladwijzer: `bookmark_<uuid>`; verder `ran_wizard` en wat de app nog meer bewaart.
- Het Broker-object komt mee bij het verbinden (Deep Roon heeft het al in de graph); geen extra aanroep nodig.
- **Deep Roon pakt `DataDictionary` niet uit**: het valt in `objects.ts › pushObj` in de tak voor gewone objecten (geen
  members → meteen stop → `fields: {}`). Het lichaam is: `integer(aantal)`, dan per paar `string(sleutel)`,
  `string(waarde)`. Fix: een tak voor `DataDictionary<…>` naast die voor `DataList<…>` (in deep-roon-mcp).

## Het formaat van een bladwijzer
JSON:
```json
{"mode": "<uuid>", "type": "albumbrowser", "name": "Jarrett",
 "data": {"focus": {"type": "album", "focusdata": "<base64>"}}}
```
Gemeten soorten (`type`):
| type | data | voor Stacks |
|---|---|---|
| `albumbrowser` + `focus.type = "album"` | Focus op albums | **ja** |
| `genrebrowser` | `{"genre": "Jazz"}` | later misschien (genre-stapel) |
| `artistdetails` | `{"performer_id": "<base64 id>"}` | nee |
| `tagbrowser` + `focus.type = "tag"` | het overzicht My Tags (`MusicQuery.TagCriteria`) | nee |
Roon laat ook playlists, TIDAL/Qobuz-pagina's enz. bookmarken: **een lijst van wat wél mag** (alleen albumbrowser met
album-Focus), niet van wat niet mag — een nieuw soort komt dan nooit per ongeluk in de keuzelijst. Een bladwijzer met
een veld dat de vertaler niet kent: helemaal weglaten, niet half toepassen.

## focusdata
Base64 van de app's eigen vraag, `MusicQuery.AlbumCriteria` (niet de Core's `AlbumQueryCriteria`!):
- kop `00 00 00 01 00 01`, dan de typenaam met een lengtebyte (`18 'MusicQuery.AlbumCriteria'`), dan regels
  `[lengte][soort][naamlengte|0x80][naam][waarde]`, en aan het eind `05 03 05 03`.
- lengte = de bytes erna + 4 (Version: `11 82 07 'Version' 00 00 00 03` — 13 bytes, 0x11 = 17). Nog niet tot op de
  laatste byte zeker; bij het bouwen met de testset hieronder nameten.
- soort: `0x81` tekst (`00 00 00 <len>` + bytes), `0x82` getal / lijst van getallen, `0x84` opslag-id, `0x89` tag-id.
- Altijd aanwezig: Version, UiLanguage, LanguagePreferences, Direction, RandomSeed, en de `…Mode`-velden (GenresMode
  And, LabelsMode Or, MainPerformersMode/PerformersMode/ProductionMode/ComposersMode/ConductorsMode And).

Gemeten filters:
| bladwijzer | regel in focusdata | wat de Core wil (AlbumQueryCriteria) |
|---|---|---|
| Jarrett | `TextFilter` 0x81 "jarrett" | `TextFilter` (string) — gelijk |
| ECM | `RequireLabels` 0x81 "ECM Records" | `RequireLabels` (IList<string>) — gelijk |
| 96 | `RequireSampleRates` 0x82 `00 01 77 00` (= 96000) | `RequireSampleRates` (IList<int>) — gelijk |
| Classical | `RequireGenres` 0x81 "Classical" | `RequireGenres` (IList<string>) — gelijk |
| Tidal / Local | `RequireLocations` 0x84 + 16 bytes id | `RequireLocations` (IList<Location>) — **objecten**: id → Location |
| Hund albums | `RequireTagIds` 0x89 + 18 bytes (17-byte id?) | `RequireTags` (IList<TagLite>) — **andere naam én objecten**: id → TagLite |
| (Multichannel, Mark) | niet gemeten | vermoedelijk `RequireChannelLayout` (IList<string>) |

Dus: tekst en getallen kunnen ongezien door; opslag en tags hebben een opzoekstap nodig. Opslag: Deep Roon zoekt de
Location-objecten al op in het Focus-paneel (`albumInfo(c, [])` › Locations, zie `storage` in focus.ts); hun id nog
koppelen aan de 16 bytes. Tags: nog uitzoeken waar de Core de tags geeft (er zijn `TagLite`-objecten; de app heeft
`get_tag_by_bookmark_id`).

## Bouwplan (als René ja zegt)
1. deep-roon-mcp: `DataDictionary` uitpakken; `bookmarks()` → `[{ id, name, type, focus }]`.
2. Een vertaler focusdata → criteria-members (tekst, lijsten, getallen direct; Locations en Tags opzoeken); onbekend
   veld → bladwijzer weg. De members gaan naar dezelfde `virtualQuery` als `library()`.
3. Stacks (alleen met Richer data): keuzelijst "Bookmarks" naast het filter, in Roon's volgorde; een keuze toont de
   albums die Roon voor die Focus geeft (koppelen aan de ruggen op Deep Roon-sleutel); "All albums" terug. Nieuwe
   bladwijzers bij de volgende lading van de bibliotheek.
4. README: welke bladwijzers meedoen (Focus op albums), dat het alleen leest, en dat een Roon-update de keuzelijst kan
   laten verdwijnen.

## Testset in René's Roon
Jarrett (tekst), ECM (label), 96 (sample rate), Classical (genre), Tidal (opslag), Local (map), Hund albums (tag Hund op
3 albums), en als tegenvoorbeelden Jazz (genrebrowser), Keith (artistdetails), Hund (tagbrowser).

## Meten
`intern/proef-bladwijzers.ts` leest `ClientData` en drukt elke bladwijzer als `JSON {…}` af (alleen lezen, naast Stacks,
geen koppeling nodig — het interne protocol leent niets van Stacks' toestemming). Bouwen en draaien op Dylan:
```
node intern/proef-bladwijzers.mjs                       # bouwt intern/proef-bladwijzers.js (niet in git)
scp intern/proef-bladwijzers.js dylan:/tmp/ && ssh dylan 'cd /tmp && ROON_HOST=127.0.0.1:9330 node proef-bladwijzers.js; rm proef-bladwijzers.js'
```
