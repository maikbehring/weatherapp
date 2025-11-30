# Deployment auf Render.com

Diese Anleitung beschreibt, wie du die Weather App auf Render.com deployst.

## Voraussetzungen

- Render.com Account
- GitHub Repository mit der App
- Environment Variables (siehe unten)

## Schritt-für-Schritt Anleitung

### 1. Repository mit Render verbinden

1. Gehe zu [dashboard.render.com](https://dashboard.render.com)
2. Klicke auf "New" → "Web Service"
3. Wähle "Connect a repository" und verbinde dein GitHub Repository
4. Wähle das Repository `maikbehring/weatherapp` aus

### 2. Service-Konfiguration

Render.com verwendet automatisch die `render.yaml` Datei, wenn sie im Repository vorhanden ist. Alternativ kannst du die Einstellungen manuell in der Render-UI konfigurieren:

**Build Settings:**
- **Build Command:** `pnpm install && NITRO_PRESET=node-server pnpm run build`
- **Start Command:** `node .output/server/index.mjs`

**Environment Variables:**
- `NODE_ENV=production`
- `NITRO_PRESET=node-server`
- `DATABASE_URL` (deine PostgreSQL Connection String)
- `EXTENSION_SECRET` (dein mittwald Extension Secret)
- `OPEN_METEO_API_URL=https://api.open-meteo.com/v1` (optional, Standardwert)

### 3. Manuelle Konfiguration (falls render.yaml nicht verwendet wird)

Falls du die `render.yaml` nicht verwendest, konfiguriere folgendes in der Render-UI:

**Service Settings:**
- **Name:** weatherapp
- **Environment:** Node
- **Region:** Wähle die nächstgelegene Region
- **Branch:** main (oder dein Standard-Branch)
- **Root Directory:** (leer lassen)
- **Build Command:** `pnpm install && NITRO_PRESET=node-server pnpm run build`
- **Start Command:** `node .output/server/index.mjs`

**Advanced Settings:**
- **Auto-Deploy:** Yes (automatisches Deployment bei Git Push)

### 4. Environment Variables setzen

In der Render-UI unter "Environment":
- Füge alle benötigten Environment Variables hinzu
- Markiere sensible Variablen (z.B. `EXTENSION_SECRET`) als "Secret"

### 5. Database Setup (falls benötigt)

Falls du eine PostgreSQL-Datenbank benötigst:
1. Gehe zu "New" → "PostgreSQL"
2. Erstelle eine neue Datenbank
3. Kopiere die `DATABASE_URL` und füge sie als Environment Variable hinzu
4. Führe Migrations aus: `pnpm db:migrate:deploy` (kann als Build-Step hinzugefügt werden)

### 6. Deploy

1. Klicke auf "Create Web Service"
2. Render startet automatisch den Build-Prozess
3. Warte, bis der Build abgeschlossen ist
4. Die App ist unter `https://weatherapp.onrender.com` verfügbar (oder deinem benutzerdefinierten Domain)

## Unterschiede zu Netlify

- **Keine Edge Functions:** Render.com unterstützt keine Edge Functions. Die CSP-Header werden über Nitro `routeRules` gesetzt.
- **Node.js Server:** Render.com läuft als Node.js-Server (nicht als Serverless Functions).
- **Port:** Render.com setzt automatisch die `PORT` Environment Variable.

## Troubleshooting

### Build schlägt fehl

- Prüfe die Build-Logs in der Render-UI
- Stelle sicher, dass `NITRO_PRESET=node-server` gesetzt ist
- Prüfe, ob alle Dependencies korrekt installiert werden

### App startet nicht

- Prüfe die Runtime-Logs
- Stelle sicher, dass der Start-Command korrekt ist: `node .output/server/index.mjs`
- Prüfe, ob alle Environment Variables gesetzt sind

### CSP-Header werden nicht gesetzt

- Die CSP-Header werden über Nitro `routeRules` gesetzt
- Prüfe die `nitro.config.ts` Datei
- Stelle sicher, dass `NITRO_PRESET=node-server` verwendet wird

## Weitere Ressourcen

- [Render.com Documentation](https://render.com/docs)
- [TanStack Start Documentation](https://tanstack.com/router/latest/docs/framework/react/start/overview)
- [Nitro Documentation](https://nitro.unjs.io/)

