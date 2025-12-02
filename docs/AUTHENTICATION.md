# Authentifizierung der mittwald API

Diese Dokumentation erklärt, wie die mittwald API-Authentifizierung in dieser Extension funktioniert.

## Überblick

Die Authentifizierung erfolgt in **zwei Schritten**:

1. **Session-Token** wird vom mStudio abgerufen und verifiziert
2. **Access-Token** wird aus dem Session-Token + Extension Secret generiert

## Schritt-für-Schritt Ablauf

### 1. Client-Seite: Session-Token abrufen

Im Browser (Client) holt die Extension das Session-Token vom mStudio:

```typescript
// src/middlewares/verify-access-to-instance.ts
import { getSessionToken } from "@mittwald/ext-bridge/browser";

const sessionToken = await getSessionToken();
```

- `getSessionToken()` kommuniziert mit dem mStudio über das mittwald Extension Bridge
- Das Token wird automatisch vom mStudio bereitgestellt, wenn die Extension geladen wird
- Keine manuelle Anmeldung erforderlich - der Benutzer ist bereits im mStudio eingeloggt

### 2. Server-Seite: Session-Token verifizieren

Der Server verifiziert das Session-Token:

```typescript
// src/middlewares/verify-access-to-instance.ts
import { verify } from "@mittwald/ext-bridge/node";

const res = await verify(context.sessionToken);
```

**Was passiert hier:**
- Das Session-Token wird kryptografisch verifiziert
- Es wird validiert, dass es von mittwald stammt
- Es werden Informationen extrahiert:
  - `extensionInstanceId` - ID dieser Extension-Instanz
  - `extensionId` - ID der Extension
  - `userId` - ID des eingeloggten Benutzers
  - `contextId` - ID des Kontexts (Organisation oder Projekt)
  - `projectId` - ID des Projekts (falls vorhanden)

### 3. Server-Seite: Access-Token generieren

Für API-Aufrufe wird aus dem Session-Token ein Access-Token generiert:

```typescript
// src/server/api/getOrganization.ts
import { getAccessToken } from "@mittwald/ext-bridge/node";

const { publicToken: accessToken } = await getAccessToken(
    context.sessionToken,
    env.EXTENSION_SECRET,
);
```

**Wichtige Parameter:**
- `context.sessionToken` - Das verifizierte Session-Token aus Schritt 2
- `env.EXTENSION_SECRET` - Das Extension Secret aus der `.env` Datei

**Was passiert:**
- Das Extension Secret wird verwendet, um das Token zu signieren
- Es wird ein `publicToken` (Access-Token) generiert
- Dieses Token hat Berechtigungen basierend auf dem Extension Secret und Session-Token

### 4. API-Client erstellen

Mit dem Access-Token wird der mittwald API-Client erstellt:

```typescript
import { MittwaldAPIV2Client } from "@mittwald/api-client";

const client = await MittwaldAPIV2Client.newWithToken(accessToken);
```

### 5. API-Aufrufe machen

Jetzt können API-Aufrufe gemacht werden:

```typescript
const result = await client.customer.getCustomer({
    customerId: organizationId,
});
```

## Sicherheitsaspekte

### ✅ Was sicher ist:

1. **Session-Token** wird nur zwischen Extension und Server übertragen (nicht im Browser gespeichert)
2. **Extension Secret** bleibt immer server-side (niemals im Browser)
3. **Access-Token** wird nur server-side verwendet (nie an den Client gesendet)
4. **Verifizierung** erfolgt bei jedem Request

### 🔒 Sicherheitsmerkmale:

- **Kryptografische Signatur**: Session-Token werden von mittwald signiert und können verifiziert werden
- **Scoped Tokens**: Access-Token haben nur die Berechtigungen, die für die Extension definiert sind
- **Time-Limited**: Tokens haben eine begrenzte Gültigkeitsdauer
- **Server-Side Only**: Alle API-Calls müssen server-side gemacht werden

## Middleware-Pattern

Die Extension verwendet ein Middleware-Pattern für die Authentifizierung:

```typescript
export const getOrganization = createServerFn({ method: "POST" })
    .middleware([verifyAccessToInstance])  // ← Authentifizierung hier
    .handler(async ({ context }) => {
        // context.sessionToken ist jetzt verfügbar
        // context.userId, context.contextId, etc. sind verfügbar
    });
```

**Vorteile:**
- Authentifizierung ist zentralisiert
- Jeder Server-Function kann das Middleware verwenden
- Konsistente Fehlerbehandlung

## Umgebungsvariablen

Folgende Umgebungsvariablen werden benötigt:

```env
EXTENSION_ID=deine-extension-id
EXTENSION_SECRET=dein-extension-secret
```

**Woher bekommt man diese:**
- `EXTENSION_ID` und `EXTENSION_SECRET` werden beim Registrieren der Extension im mittwald Marketplace erhalten
- Sie sind einzigartig für jede Extension
- Das Secret darf **niemals** öffentlich gemacht werden

## Fehlerbehandlung

Typische Fehler und ihre Ursachen:

### ❌ "Invalid session token"
- Session-Token ist abgelaufen oder ungültig
- Extension wird nicht im mStudio-Kontext ausgeführt

### ❌ "Invalid extension secret"
- `EXTENSION_SECRET` ist falsch oder fehlt
- Extension wurde nicht korrekt registriert

### ❌ "Unauthorized"
- Access-Token hat nicht die benötigten Berechtigungen
- Extension hat nicht die richtigen Scopes

## Zusammenfassung

```
Browser (mStudio)
    ↓
Session-Token abrufen (getSessionToken)
    ↓
Server
    ↓
Session-Token verifizieren (verify)
    ↓
Access-Token generieren (getAccessToken + EXTENSION_SECRET)
    ↓
API-Client erstellen (MittwaldAPIV2Client.newWithToken)
    ↓
API-Aufrufe machen
```

## Weitere Ressourcen

- [mittwald Extension Documentation](https://developer.mittwald.de/docs/v2/contribution/)
- [mittwald API Documentation](https://developer.mittwald.de/docs/v2/reference/)

