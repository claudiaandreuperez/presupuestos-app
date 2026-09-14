# Pressupostos App (PWA)

PWA Angular per controlar pressupostos i despeses mensuals per categoria. Dades locals (IndexedDB), offline-first, desplegable gratis a GitHub Pages.

**Idioma de la interfície: català** (`lang="ca"`).

## Requisits

- Node.js 20+
- npm

## Desenvolupament local

```bash
npm install
npm start
```

Obre `http://localhost:4200/`.

## Build de producció (GitHub Pages)

El build per a Pages usa `baseHref` i `deployUrl` a `/presupuestos-app/` (nom del repositori).

```bash
npm run build:pages
```

Sortida: `dist/presupuestos-app/browser/`

## Desplegament a GitHub Pages

1. Crea un repositori a GitHub anomenat `presupuestos-app` (o ajusta `baseHref` a `angular.json` si uses un altre nom).
2. Puja el codi a la branca `main`.
3. A **Settings → Pages**, selecciona **GitHub Actions** com a origen.
4. Cada push a `main` executa `.github/workflows/deploy.yml` i publica l'app.

URL esperada: `https://<usuari>.github.io/presupuestos-app/`

### Instal·lar al mòbil (iOS)

Safari → compartir → **Afegeix a la pantalla d'inici**.

## Estructura

```
src/app/
├── pages/       # Pantalles (dashboard, historial, gràfics…)
├── components/  # Components reutilitzables
├── services/    # Lògica de negoci i emmagatzematge
└── models/      # Tipus i interfícies
```

## Stack

- Angular 19 + PWA (`@angular/pwa`)
- IndexedDB (Dexie.js, propera fase)
- Chart.js (propera fase)
- GitHub Pages (hosting estàtic)
