#!/usr/bin/env bash
# Stacks naar Dylan (26 okt 2026): de extensie draait daar als launchd-agent com.rene.stacks, poort 9360, gegevens in
# ~/Basso/stacks/data. Bronnen staan hier letterlijk — nooit uit een variabele (rsync-bronwacht).
set -euo pipefail
DOEL=${DYLAN_HOST:-dylan}
HIER="$(cd "$(dirname "$0")" && pwd)"
[ -f "$HIER/stacks.js" ] && [ -f "$HIER/web/index.html" ] && [ -f "$HIER/lib/kleur.js" ] || { echo "verkeerde map: $HIER"; exit 1; }
ssh "rene@$DOEL" 'mkdir -p ~/Basso/stacks/data ~/Library/Logs'
rsync -az "$HIER/stacks.js" "$HIER/package.json" "$HIER/package-lock.json" "rene@$DOEL:Basso/stacks/"
rsync -az --delete "$HIER/lib/" "rene@$DOEL:Basso/stacks/lib/"
rsync -az --delete "$HIER/web/" "rene@$DOEL:Basso/stacks/web/"
# De berekende kleuren één keer mee, zodat Dylan niet opnieuw 1800 hoezen hoeft te lezen (alleen als hij er nog geen heeft).
if [ -f "$HIER/data/kleuren.json" ]; then rsync -az --ignore-existing "$HIER/data/kleuren.json" "rene@$DOEL:Basso/stacks/data/"; fi
ssh "rene@$DOEL" 'export PATH=/opt/homebrew/bin:$PATH; cd ~/Basso/stacks && npm install --omit=dev --silent --no-audit --no-fund 2>&1 | tail -1
cat > ~/Library/LaunchAgents/com.rene.stacks.plist <<PL
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>Label</key><string>com.rene.stacks</string>
  <key>ProgramArguments</key><array><string>/opt/homebrew/bin/node</string><string>/Users/rene/Basso/stacks/stacks.js</string></array>
  <key>WorkingDirectory</key><string>/Users/rene/Basso/stacks</string>
  <key>RunAtLoad</key><true/><key>KeepAlive</key><true/>
  <key>StandardOutPath</key><string>/Users/rene/Library/Logs/stacks.log</string>
  <key>StandardErrorPath</key><string>/Users/rene/Library/Logs/stacks.log</string>
</dict></plist>
PL
# Draait hij al: kickstart -k. Bootout + meteen bootstrap liet het huis op 18 okt uit launchd verdwijnen.
if launchctl print gui/501/com.rene.stacks >/dev/null 2>&1; then launchctl kickstart -k gui/501/com.rene.stacks
else launchctl bootstrap gui/501 ~/Library/LaunchAgents/com.rene.stacks.plist; fi
sleep 3; tail -n 3 ~/Library/Logs/stacks.log | cut -c1-160'
