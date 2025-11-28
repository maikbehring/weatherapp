#!/bin/bash

echo "🔍 Prüfe TanStack Start / SSR Setup..."
echo "---------------------------------------"

# 1. Prüfe tsconfig.json
if grep -R "\"ssr\"" tsconfig.json >/dev/null 2>&1; then
    echo "⚠️  tsconfig.json enthält eine SSR-Einstellung:"
    grep -R "\"ssr\"" -n tsconfig.json
else
    echo "✔ tsconfig.json enthält KEINE SSR-Einstellung (gut)"
fi

# 2. Prüfe vite.config.ts
if grep -R "ssr:" vite.config.ts >/dev/null 2>&1; then
    echo "⚠️  vite.config.ts enthält eine SSR-Einstellung:"
    grep -R "ssr:" -n vite.config.ts
else
    echo "✔ vite.config.ts enthält KEINE SSR-Einstellung"
fi

# 3. Prüfe TanStack Config
if [ -f ".tanstack/start/config.json" ]; then
    if grep -R "\"ssr\"" .tanstack/start/config.json >/dev/null 2>&1; then
        echo "⚠️  .tanstack/start/config.json enthält SSR-Einstellungen:"
        grep -R "\"ssr\"" -n .tanstack/start/config.json
    else
        echo "✔ .tanstack/start/config.json enthält KEINE SSR-Einstellung"
    fi
else
    echo "✔ Keine TanStack Config gefunden (gut)"
fi

# 4. Prüfe ob Nitro gebaut wurde
if [ -d ".output/server" ]; then
    echo "❌ Nitro Server-Build gefunden (.output/server) → SSR AKTIV!"
else
    echo "✔ Kein Nitro Build (.output/server) → SSR OFF"
fi

# 5. Prüfe ob Netlify Functions-Internal benutzt wird
if [ -d ".netlify/functions-internal" ]; then
    echo "⚠️ Netlify functions-internal existiert → SSR wurde zumindest versucht"
else
    echo "✔ Kein .netlify/functions-internal → SSR wurde NICHT gebaut"
fi

# 6. Prüfe netlify.toml
if grep -R "directory" netlify.toml >/dev/null 2>&1; then
    echo "ℹ️ netlify.toml Functions Directory:"
    grep -R "directory" -n netlify.toml
else
    echo "✔ netlify.toml enthält kein Functions-Verzeichnis"
fi

# 7. Prüfe nach SSR-Hinweisen im Build
if grep -R "nitro" .tanstack/start/build >/dev/null 2>&1; then
    echo "❌ Nitro Hinweise im Build gefunden → SSR aktiv"
else
    echo "✔ Keine Nitro Hinweise im Build → SSR OFF"
fi

echo "---------------------------------------"
echo "🧪 Prüfung abgeschlossen."

