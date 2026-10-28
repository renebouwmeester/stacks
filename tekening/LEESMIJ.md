# Tekening 1 — rugkleuren uit Roon-hoezen (26 okt 2026)

`ruggen.png`: 16 albums uit René's Roon-bibliotheek. Links de rug met kleuren die `lib/kleur.js` uit de Roon-hoes
berekent, rechts Apple's eigen `bg`/`t1`/`t2` (Basso's `/kast/ruggen`) voor hetzelfde album. Onderaan dezelfde ruggen
als stapel, gesorteerd op catalogusnummer.

Opnieuw: `python3 tekening/verzamel.py tekening/keuze.json && node tekening/bereken.js && swift tekening/teken.swift tekening`
(`verzamel.py` haalt via Basso's Roon-MCP het album, de hoes en het Apple-tegenstuk; `verzamel.py`, `mcp.sh`, `keuze.json`
en de hoezen staan alleen lokaal, niet in de openbare repo — ze praten met Basso's Worker.)

## De methode (lib/kleur.js, puur JS met jpeg-js — draait straks zo in de extensie)
1. hoes → 48×48 (blokgemiddelde);
2. pixels in emmers van 4 bits/kanaal, emmers die in OKLab < 0.06 uit elkaar liggen samengevoegd tot een palet;
3. **bg** = de kleur die ≥ 30% van de rand (buitenste 4 px) beslaat; anders de kleur die de hele hoes domineert;
4. **t1/t2** = de twee "karaktervolste" andere paletkleuren (aandeel^0.35 × (1 + 20·chroma)), de kleurigste op de
   artiest; elk in OKLab *alleen in lichtheid* opgetild (verzadiging blijft zo lang het in sRGB past) tot WCAG-contrast
   11 (artiest) en 7 (titel). Op een middentoon, waar dat niet haalbaar is: 95% / 80% van het haalbare.

## Waar het faalt / afwijkt
- **Gespleten hoezen** (End To End: donkere zee boven, witte rots onder): de rand is 50/50, de 30%-drempel valt net mis,
  ik kies donker, Apple licht. Beide verdedigbaar; een rug kan maar één kleur hebben.
- **Zwart-wit / grijze ECM-hoezen** (Travel Guide, Reflections, Vagabond, Kind Of Blue): de bg klopt goed, maar er is
  geen kleur voor de letters → bijna-wit. Apple vindt soms een tint die ik niet zie (Reflections mint, Kind Of Blue
  warm-bruin met een roodzwarte rug): Apple kijkt waarschijnlijk naar een kleiner, opvallend detail (het Columbia-logo).
- **Middentonen** (Travel Guide 5c5f62, Helge Lien 10, Hanging Gardens): wit haalt maar contrast 5–6.5. Leesbaar, niet
  ruim. Apple heeft precies hetzelfde.
- **Witte randen** (Amandla, Ida Lupino): bg wit; de letters pakken een kleur uit het beeld (bruin, olijf) waar Apple
  bijna-zwart neemt. Smaakkwestie.
- **Drukke hoezen** (Spin, Vulture Prince, Canvas): bg goed; letterkleur nu dicht bij Apple (Spin zand/oranje, Vulture
  Prince roze, maar zwakker). Canvas krijgt een roze artiest waar Apple wit houdt — het "kleurigste" is daar een huidtint.

## Catalogusnummers in Roon (gemeten 26 okt, `roon_album.catalogue_number`)
- **ECM: 0 van 40** willekeurige ECM-albums in de bibliotheek (allemaal TIDAL/Qobuz). Qobuz: 0 van 30. TIDAL: 17 van 30.
  Lokale bestanden: 20 van 30 (uit de tags).
- TIDAL's nummers zijn soms rommel: Sony/Columbia geeft een interne id (`G010001367577U`, Kind Of Blue), Naïve
  `NJ620611)8000000007`, Excelsior een getal van 10 cijfers. Lokale tags: "47", "5/6", "0012".
- Gevolg voor "sorteren op catalogusnummer": voor een ECM-verzamelaar op streaming levert Roon het nummer **niet**. Dat
  moet dan van elders komen (MusicBrainz op barcode — Roon geeft wél bijna altijd de barcode/UPC), of de functie werkt
  alleen voor eigen bestanden.

## Besluit: sorteren (René, 26 okt 2026)
Eén sorteermenu, dezelfde volgordes als Basso's Stacks (Browse.swift `albumOrderings`) plus één extra:
**Release Date · A-Z · By Artist · Date Added · Shuffled · Catalogue Number** (of **Barcode**, volgens één instelling
"Sort key": catalogue number of barcode; standaard catalogue number).
- A-Z en By Artist zonder lidwoord (The/A/An/De/Het/Een), zoals Basso (`zonderLidwoord` in cloud/src/apple.js).
- Op catalogue number: albums zonder nummer onderaan in een eigen groep, op artiest, met de barcode stil op de rug.
- Barcode als volgorde is grof (het voorvoegsel is de distributeur: 0602 = Universal zet Verve tussen ECM, oudere ECM
  heeft 0731 van PolyGram), maar altijd gevuld; daarom een keuze en niet de standaard.
- Let op: de officiële Roon API geeft in browse alleen titel, artiest en hoes. Release Date, Date Added, catalogue number
  en barcode komen uit Deep Roon. Op alleen de officiële laag blijven A-Z, By Artist en Shuffled over.
