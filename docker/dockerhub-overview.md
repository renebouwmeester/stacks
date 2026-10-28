# Stacks for Roon

Your Roon library as a stack of CD spines. Every album is a horizontal spine in the colours of its cover, as thick as the
album is long. Click a spine and it opens like a booklet, with the cover on the left and the track list, musicians and
facts on the right. Play it on any Roon zone.

![The stack, by artist: every album a spine in its cover's colours, with format, play time and year](https://raw.githubusercontent.com/renebouwmeester/stacks/main/docs/stack.jpg)

![An album opened as a booklet: the cover, the tracks with their times, the musicians and the facts](https://raw.githubusercontent.com/renebouwmeester/stacks/main/docs/booklet.jpg)

Stacks is a small Roon extension that serves a web page. Run it on any computer on the same network as your Roon Core
(a NAS, a Raspberry Pi, a Mac or a Linux box), then open the page in any browser: desktop, iPad or phone.

It is based on Stacks in Basso, my music app for Apple Music.

> **Beta.** Stacks for Roon is new. Expect rough edges, and please report what you find.

## What it does

- **The stack.** Every album in your library as a spine, coloured from its cover. Stacks computes the colours itself;
  Roon doesn't provide them.
- **Orders.** Release Date, A-Z, By Artist (each artist's albums oldest first), Date Added, Shuffled and **Catalog #**.
  Albums without a catalogue number go to the end of the Catalog # order.
- **The booklet.** Click a spine to open the album: the cover, the tracks (click one to play from there), the musicians
  with their instruments, producer and engineer, and a line of facts: year, label, catalogue number, source, tracks, length.
- **Playing.** Play, Shuffle, Play Next and Play Later on the zone you choose.
- **Now Playing.** A panel that slides in from the right, with the cover, a seek bar, transport buttons, shuffle, repeat,
  volume, mute and What's Next, plus the full queue. When the panel is hidden, an optional mini player sits at the bottom.
- **Filter.** Every word you type must match the title, artist, label, catalogue number, barcode, year, format or source.
  `ecm 24/96` finds your ECM albums in 24/96; `1975 jarrett` finds The Köln Concert.
- **Keys.**

  | Key | What it does |
  |---|---|
  | ⌘F / Ctrl+F | Filter |
  | ⌥N / Alt+N | Show or hide Now Playing |
  | Any letter | Jump in the stack (A-Z, By Artist, Catalog #) |
  | Esc | Close the open album, or clear the filter |

## Richer data (on by default)

Roon's official extension API gives the album list, covers and playback. It doesn't give play times, release dates,
catalogue numbers, barcodes, formats or credits. With **Richer data**, Stacks reads those from Roon's
**internal protocol**, the one Roon's own apps use. It does this through code copied from
[Deep Roon MCP](https://github.com/renebouwmeester/deep-roon-mcp), which builds on Arthur Soares'
[roon-api-reverse-engineering](https://github.com/arthursoares/roon-api-reverse-engineering).

With Richer data, the spines get their thickness, play time, year and format, the booklet gets track times and credits,
and Release Date, Date Added and Catalog # are added to the orders.

**This is unofficial.** It isn't made, endorsed or supported by Roon Labs, and a Roon update can break it until Stacks is
updated. Stacks uses it carefully:
- it only reads: it never changes anything in your library;
- it reads each album once, one at a time;
- it then refreshes a small share each day;
- it closes the connection when idle or when Stacks stops.

If Richer data breaks or is switched off, Stacks keeps working with the official API.

Richer data is on from the start, because it is what makes Stacks Stacks. To use only the official API, switch it off in
Roon › Settings › Extensions › Stacks › Richer data.

## Install

### Docker on Linux or a NAS

Stacks finds the Core by itself. That only works on the host's network:

```bash
docker run -d --name stacks --network host --restart unless-stopped \
  -v stacks-data:/data renebouwmeester/stacks
```

### Docker Desktop on a Mac or Windows

Docker Desktop runs containers in a virtual machine, and Roon's discovery doesn't reach into it. Give Stacks the address
of your Core instead (its IP address and port 9330):

```bash
docker run -d --name stacks -p 9360:9360 --restart unless-stopped \
  -v stacks-data:/data \
  -e ROON_CORE=192.168.1.10:9330 \
  -e STACKS_URL=http://my-computer.local:9360 \
  renebouwmeester/stacks
```

The image runs on Intel and ARM (Apple silicon, Raspberry Pi 4 and 5, most NAS models).

### From source

You need Node.js 18 or newer.

```bash
git clone https://github.com/renebouwmeester/stacks
cd stacks
npm install
node stacks.js
```

### Then

1. In Roon, open Settings › Extensions and click **Enable** next to "Stacks on …".
2. Open `http://<the computer running Stacks>:9360` in a browser. On an iPad or iPhone, Add to Home Screen opens it full
   screen.

The first time, Stacks computes the colours of all your covers, about ten per second. With Richer data on, it also reads
each album once, about fourteen per second. The spines fill in while you look.

## Settings

All settings are in Roon › Settings › Extensions › Stacks:

| Setting | What it does |
|---|---|
| Richer data | On or off (see above) |
| Catalog # order uses | Catalogue number or barcode |
| Catalog # on the spines | Only in the Catalog # order, or always |
| Mini player when Now Playing is hidden | Show or hide |

Environment variables:

| Variable | Default | What it does |
|---|---|---|
| `PORT` | `9360` | The port of the web page |
| `STACKS_DATA` | `./data` (`/data` in Docker) | Where Stacks keeps its pairing with Roon, the colours and the Richer data cache |
| `ROON_CORE` | none | Connect to this Core (`host` or `host:port`) instead of finding it |
| `STACKS_URL` | the computer's address | The address Roon's status line shows for the page |
| `TZ` | UTC in Docker | The time zone of the log, e.g. `Europe/Amsterdam` |

## Good to know

- **No login.** Anyone on your network can open the page and play music, as with other Roon web remotes. Keep port 9360
  on your own network; don't forward it to the internet.
- **"Open in Roon" isn't possible.** As far as we know, an extension can't make the Roon app show an album.
- **Two copies of an album** (say one from Qobuz and one from TIDAL) show their source on the spine, so you can tell them
  apart.

## License

Apache License 2.0. See [LICENSE](https://github.com/renebouwmeester/stacks/blob/main/LICENSE) and [NOTICE](https://github.com/renebouwmeester/stacks/blob/main/NOTICE). `lib/intern.js` includes code under Apache-2.0
(Deep Roon MCP) and MIT (roon-api-reverse-engineering); their licences are in [`intern/`](https://github.com/renebouwmeester/stacks/tree/main/intern).

Stacks for Roon is not made, endorsed or supported by Roon Labs. Roon is a trademark of Roon Labs LLC.
