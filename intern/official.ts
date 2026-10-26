// Vervangt deep-roon-mcp's core/official.ts in de kopie: Deep Roon's eigen extensie (en koppeling) hoeft niet mee — de
// toestemming is Stacks' eigen koppeling in Roon › Settings › Extensions. Het interne protocol opent alleen als Stacks
// gekoppeld is, zoals Deep Roon het doet.
let gekoppeld = false;
export function zetGekoppeld(aan: boolean): void { gekoppeld = aan; }
export function startOfficial(_target: unknown): void { /* Stacks koppelt zelf */ }
export async function paired(): Promise<true> {
  if (gekoppeld) return true;
  throw new Error('Stacks is not enabled in Roon yet (Roon › Settings › Extensions)');
}
