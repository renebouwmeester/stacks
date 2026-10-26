// De ingang van lib/intern.js (26 okt 2026, René: "als we maar twee commando's via Deep Roon doen — kunnen we die niet
// isoleren?"): precies wat Stacks van Deep Roon gebruikt, gekopieerd uit deep-roon-mcp (kopieer-intern.mjs bundelt het).
// Niet met de hand aan lib/intern.js werken: repareer Deep Roon en kopieer opnieuw.
export { album } from 'deep/roon/library';
export { library } from 'deep/roon/focus';
export { closeSoon, shutdown } from 'deep/core/session';
export { zetGekoppeld } from './official';
