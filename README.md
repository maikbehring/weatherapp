# Weather App - mittwald Extension

Eine Wetter-App als mittwald Extension, die aktuelle Wetterdaten und eine 7-Tage-Vorschau anzeigt. Die App nutzt mittwald Flow Remote React Components für eine konsistente UI-Erfahrung im mStudio.

## Features

- 🌤️ **Aktuelle Wetterdaten** für ausgewählte Städte (Berlin, Hamburg, München, Köln)
- 📍 **Adresssuche** - Wetter für beliebige Adressen abrufen
- 📊 **7-Tage-Vorschau** mit interaktivem Chart (CartesianChart)
- 🎨 **mittwald Flow Components** - Native UI-Komponenten für konsistentes Design
- 🌡️ **Temperatur-Badges** - Farbcodierte Anzeige je nach Temperatur
- 📈 **Min/Max-Übersicht** - Höchste und niedrigste Temperaturen der Woche

## Wetterdatenquelle

Die App nutzt die [Open-Meteo API](https://open-meteo.com/) für kostenlose Wetterdaten ohne API-Key.

## Getting Started

### Prerequisites

- Node.js v20.11.1 or higher
- pnpm v10.4.1 or higher
- PostgreSQL database (non-pooling connection)

### Installation

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Set up your environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   ```

3. Generate Prisma client and run migrations:
   ```bash
   pnpm db:generate
   pnpm db:migrate:deploy
   ```

4. Start the development server:
   ```bash
   pnpm dev
   ```

Your extension will be available at `http://localhost:5173`

## Project Structure

```
src/
├── components/         # React components
├── hooks/             # Custom React hooks
├── middlewares/       # TanStack middleware
├── routes/            # TanStack Router routes
│   ├── api/          # API endpoints
│   └── __root.tsx    # Root layout
├── server/           # Server functions
│   └── functions/    # Server-side functions
├── client.tsx        # Client entry point
├── db.ts            # Prisma client configuration
├── env.ts           # Environment validation
├── global-middleware.ts  # Global middleware
└── router.tsx       # Router configuration
```

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm check` - Run Biome checks
- `pnpm lint` - Lint code
- `pnpm format` - Format code
- `pnpm test` - Run tests
- `pnpm db:generate` - Generate Prisma client
- `pnpm db:migrate:dev` - Run migrations in development
- `pnpm db:migrate:deploy` - Deploy migrations
- `pnpm db:studio` - Open Prisma Studio

## Extension Setup

### For Contributors

1. **Configure Webhooks**: Set your webhook URL in mStudio Contributor UI
2. **Set Scopes**: Configure required scopes and extension context
3. **Configure Anchors**: Point anchors to `http://localhost:5173`
4. **Install Extension**: Perform first installation via API
5. **Start Development**: Run `pnpm dev` and open your extension

### Documentation

- [mittwald API Documentation](https://api.mittwald.de/v2/docs/)
- [Extension Development Guide](https://developer.mittwald.de/docs/v2/contribution/)
- [Frontend Fragment Anchors](https://developer.mittwald.de/de/docs/v2/contribution/reference/frontend-fragment-anchors/)

## Technology Stack

- **Framework**: TanStack Start (React-based full-stack framework)
- **Database**: PostgreSQL with Prisma ORM
- **UI Components**: mittwald Flow Remote React Components
- **Authentication**: mittwald Extension Bridge
- **Webhooks**: mitthooks library
- **Code Quality**: Biome (linting & formatting)
- **Testing**: Vitest

## Deployment auf Netlify

1. **Repository verbinden**:
   - Auf [app.netlify.com](https://app.netlify.com) → "Add new site" → "Import an existing project"
   - GitHub-Repo `maikbehring/weatherapp` auswählen

2. **Build Settings**:
   - Build command: `pnpm build`
   - Publish directory: `dist`
   - Node version: `20.11.1` (optional, in Environment Variables setzen)

3. **Environment Variables** (in Netlify Settings):
   ```
   DATABASE_URL=postgresql://...
   PRISMA_FIELD_ENCRYPTION_KEY=...
   EXTENSION_ID=...
   EXTENSION_SECRET=...
   NODE_ENV=production
   ```

4. **Deploy**: Netlify baut und deployed automatisch bei jedem Push zu `main`

5. **mStudio konfigurieren**:
   - Webhook URL: `https://deine-app.netlify.app/api/webhooks/mittwald`
   - Anchor URLs: `https://deine-app.netlify.app`

## Contributing

This project was generated with mittvibes CLI by mittwald.

For issues with the CLI tool itself, please report them at the mittvibes repository.