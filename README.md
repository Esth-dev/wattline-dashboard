# ⚡ Wattline — Energy Monitoring Dashboard

**FR** · Dashboard IoT de supervision énergétique multi-sites : puissance temps réel,
alarmes de dépassement de capacité, état des passerelles edge.
**Projet de démonstration front-end — données 100 % simulées côté client (aucun backend).**

**EN** · Multi-site energy monitoring IoT dashboard: real-time power, capacity
threshold alarms, edge gateway status. **Front-end demo project — 100 % client-side
simulated data (no backend).**

> Démo réalisée par **Esther Franco** — développeuse front-end (TypeScript, Angular, React).
> Live demo: <https://esth-dev.github.io/wattline-dashboard/> _(activée par le workflow Pages)_

---

## Pourquoi ce projet / Why this project

Les plateformes IoT posent au front-end des défis précis : flux temps réel,
volumétrie de mesures, états de connexion dégradés, lisibilité d'information
dense. Wattline les traite de bout en bout, avec les technologies cibles des
plateformes industrielles connectées : **Angular 20, TypeScript strict, Signals + RxJS**.

IoT platforms challenge the front-end: real-time streams, measurement volume,
degraded connection states, dense information readability. Wattline addresses
all of them with the stack of modern connected industrial platforms:
**Angular 20, strict TypeScript, Signals + RxJS**.

## Fonctionnalités / Features

- **KPI temps réel** — puissance agrégée, énergie du jour, coût estimé, sites en ligne
- **Courbe SVG native** (aucune librairie de charts) — fenêtre glissante 80 s, recalcul
  par `computed()` uniquement quand les mesures changent
- **Alarmes dérivées** — seuils 85 % / 95 % de la capacité souscrite, passerelle hors ligne,
  liaison dégradée (QoS 0) — avec état vide soigné
- **États IoT réels** — bouton *« Simuler une panne »* : canal perdu, données figées,
  bannière informative, reprise au retour de liaison
- **Design system** — tokens CSS (`styles.css`), composants présentatifs réutilisables
  (`KpiCard`, `ConsumptionChart`, `SiteTable`, `AlertsPanel`), tous en `OnPush`
- **Qualité** — TypeScript strict, tests unitaires (service + shell), CI GitHub Actions
  (build + tests), déploiement automatique GitHub Pages

## Architecture

```
src/app/
├── models/telemetry.ts            # contrats immuables (Site, Measurement, Alert…)
├── services/telemetry.ts          # flux simulé : RxJS interval → signals, takeUntilDestroyed
├── components/
│   ├── kpi-card/                  # carte KPI présentative (design system)
│   ├── consumption-chart/         # courbe SVG pure (computed, OnPush)
│   ├── site-table/                # parc + badges de liaison (@for track site.id)
│   └── alerts-panel/              # alarmes + état vide
├── app.ts / app.html / app.css    # shell : topbar, grille responsive, footer
└── styles.css                     # tokens du design system
```

**Choix techniques / key decisions**

| Décision | Raison |
|---|---|
| RxJS `interval` → `signal()` | le flux est asynchrone (RxJS), l'état rendu est synchrone et fin (signals) |
| `takeUntilDestroyed` | zéro fuite mémoire : désabonnement garanti à la destruction |
| `computed()` pour géométrie SVG | recalcul minimal, cohérent avec `OnPush` |
| SVG hand-made, zéro dépendance | bundle léger, maîtrise du rendu |
| Composants présentatifs / service métier | réutilisabilité type design system, testabilité |
| États loading / empty / offline traités | exigence UX des dashboards IoT |

## Lancer le projet / Run it

```bash
npm install
npm start          # http://localhost:4200
npm test           # tests unitaires (Karma + ChromeHeadless)
npm run build      # build de production dans dist/
```

## CI/CD

- `ci.yml` — à chaque push/PR : `npm ci`, build production, tests headless
- `deploy.yml` — push sur `main` : build `--base-href=/wattline-dashboard/`
  puis déploiement **GitHub Pages**

## Roadmap (idées)

- Brancher un vrai broker : WebSocket / MQTT over WebSocket (ex. mosquitto)
- Virtualisation de liste pour historiques longs (`@angular/cdk/scrolling`)
- Mode clair du design system (tokens déjà structurés pour)
- Tests e2e Playwright du parcours « panne passerelle »

---

© 2026 Esther Franco — [github.com/Esth-dev](https://github.com/Esth-dev) · MIT License
