echo "🔍 Prüfe Netlify-SSR-Setup..."

# 1) Functions-Verzeichnis vorhanden?
if [ -d ".netlify/functions-internal" ]; then
  echo "✔ .netlify/functions-internal existiert"
else
  echo "❌ .netlify/functions-internal FEHLT"
fi

# 2) .gitkeep vorhanden?
if [ -f ".netlify/functions-internal/.gitkeep" ]; then
  echo "✔ .gitkeep existiert"
else
  echo "❌ .gitkeep FEHLT"
fi

# 3) Ist das Verzeichnis im Git-Index?
if git ls-files --error-unmatch .netlify/functions-internal/.gitkeep >/dev/null 2>&1; then
  echo "✔ Functions-Verzeichnis ist in Git getrackt"
else
  echo "❌ Functions-Verzeichnis ist NICHT in Git!"
fi

# 4) netlify.toml existiert?
if [ -f "netlify.toml" ]; then
  echo "✔ netlify.toml existiert"
else
  echo "❌ netlify.toml fehlt"
fi

# 5) Prüfen: enthält netlify.toml ein Functions-Directory?
if grep -q "directory = \".netlify/functions-internal\"" netlify.toml 2>/dev/null; then
  echo "✔ netlify.toml definiert functions-directory korrekt"
else
  echo "❌ netlify.toml definiert KEIN functions-directory oder falsches!"
fi

# 6) Konflikt: existiert ein src/server/functions Ordner?
if [ -d "src/server/functions" ]; then
  echo "⚠️ WARNUNG: src/server/functions existiert → könnte Netlify verwirren!"
else
  echo "✔ Kein src/server/functions → gut!"
fi

echo "🔍 Prüfung abgeschlossen."

