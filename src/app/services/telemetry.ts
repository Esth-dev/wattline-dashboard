import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { interval } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import type { Alert, ConnectionState, Measurement, Site } from '../models/telemetry';

/** Période d'échantillonnage du flux temps réel simulé (ms). */
const TICK_MS = 2000;
/** Profondeur de la fenêtre glissante affichée (points). */
const WINDOW_SIZE = 40;
/** Tarif moyen utilisé pour le coût estimé (€/kWh). */
const EUR_PER_KWH = 0.1745;

const INITIAL_SITES: readonly Site[] = [
  { id: 'ben-01', name: 'Site industriel — Benfeld', city: 'Bas-Rhin', status: 'online', powerKw: 312, capacityKw: 400 },
  { id: 'str-02', name: 'Datacenter — Strasbourg', city: 'Bas-Rhin', status: 'online', powerKw: 244, capacityKw: 320 },
  { id: 'lyo-03', name: 'Campus tertiaire — Lyon', city: 'Rhône', status: 'online', powerKw: 176, capacityKw: 250 },
  { id: 'par-04', name: 'Siège social — Paris', city: 'Île-de-France', status: 'degraded', powerKw: 88, capacityKw: 120 },
  { id: 'lil-05', name: 'Entrepôt logistique — Lille', city: 'Nord', status: 'offline', powerKw: 0, capacityKw: 180 },
];

/**
 * Flux de télémétrie simulé côté client (aucun backend) : joue le rôle
 * d'un broker MQTT/WebSocket pour la démonstration.
 * RxJS produit le flux, les signals exposent l'état réactif aux composants.
 */
@Injectable({ providedIn: 'root' })
export class TelemetryService {
  private readonly destroyRef = inject(DestroyRef);

  /** État du canal temps réel. */
  readonly connection = signal<ConnectionState>('online');
  /** Parc des sites supervisés. */
  readonly sites = signal<readonly Site[]>(INITIAL_SITES);
  /** Fenêtre glissante des mesures agrégées. */
  readonly history = signal<readonly Measurement[]>(TelemetryService.seed());
  /** Énergie consolidée depuis minuit (kWh). */
  private readonly energyKwh = signal(872.4);

  /** Puissance instantanée agrégée (kW). */
  readonly currentPowerKw = computed(() =>
    this.sites().reduce((sum, s) => sum + s.powerKw, 0),
  );

  /** Énergie du jour (kWh). */
  readonly energyTodayKwh = computed(() => this.energyKwh());

  /** Coût estimé du jour (€). */
  readonly costTodayEur = computed(() => this.energyKwh() * EUR_PER_KWH);

  /** Sites joignables / total. */
  readonly sitesOnline = computed(() => ({
    online: this.sites().filter((s) => s.status !== 'offline').length,
    total: this.sites().length,
  }));

  /** Tendance de la fenêtre glissante (%). */
  readonly trendPct = computed(() => {
    const h = this.history();
    if (h.length < 2 || h[0].powerKw === 0) return 0;
    return ((h[h.length - 1].powerKw - h[0].powerKw) / h[0].powerKw) * 100;
  });

  /** Alarmes dérivées de l'état du parc (seuils 85 % / 95 %). */
  readonly alerts = computed<readonly Alert[]>(() => {
    const now = Date.now();
    const out: Alert[] = [];
    for (const site of this.sites()) {
      const ratio = site.capacityKw > 0 ? site.powerKw / site.capacityKw : 0;
      if (site.status === 'offline') {
        out.push({
          id: `${site.id}-off`,
          siteName: site.name,
          severity: 'critical',
          message: 'Passerelle edge hors ligne — aucune mesure reçue',
          raisedAt: now,
        });
      } else if (ratio > 0.95) {
        out.push({
          id: `${site.id}-crit`,
          siteName: site.name,
          severity: 'critical',
          message: `Puissance à ${(ratio * 100).toFixed(0)} % de la capacité souscrite`,
          raisedAt: now,
        });
      } else if (ratio > 0.85) {
        out.push({
          id: `${site.id}-warn`,
          siteName: site.name,
          severity: 'warning',
          message: `Puissance à ${(ratio * 100).toFixed(0)} % de la capacité souscrite`,
          raisedAt: now,
        });
      } else if (site.status === 'degraded') {
        out.push({
          id: `${site.id}-deg`,
          siteName: site.name,
          severity: 'warning',
          message: 'Liaison dégradée — mesures reçues en QoS 0',
          raisedAt: now,
        });
      }
    }
    return out;
  });

  constructor() {
    interval(TICK_MS)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.tick());
  }

  /** Bascule manuelle du canal (démo des états de connexion IoT). */
  toggleConnection(): void {
    this.connection.update((c) => (c === 'online' ? 'offline' : 'online'));
  }

  /** Force un site au-dessus du seuil critique (démo & tests). */
  simulateOverload(siteId: string): void {
    this.sites.update((sites) =>
      sites.map((s) => (s.id === siteId ? { ...s, powerKw: s.capacityKw * 0.98 } : s)),
    );
  }

  private tick(): void {
    if (this.connection() === 'offline') return; // canal perdu : données figées
    this.sites.update((sites) =>
      sites.map((site) => {
        if (site.status === 'offline') return site;
        const drift = (Math.random() - 0.5) * site.capacityKw * 0.06;
        const target = Math.min(site.capacityKw * 0.97, Math.max(site.capacityKw * 0.25, site.powerKw + drift));
        return { ...site, powerKw: Math.round(target) };
      }),
    );
    this.history.update((h) => {
      const next: Measurement[] = [...h, { timestamp: Date.now(), powerKw: this.currentPowerKw() }];
      return next.length > WINDOW_SIZE ? next.slice(next.length - WINDOW_SIZE) : next;
    });
    this.energyKwh.update((e) => e + (this.currentPowerKw() * TICK_MS) / 3_600_000);
  }

  /** Amorçage de la fenêtre glissante (80 s d'historique plausible). */
  private static seed(): readonly Measurement[] {
    const now = Date.now();
    const base = 820;
    return Array.from({ length: WINDOW_SIZE }, (_, i) => ({
      timestamp: now - (WINDOW_SIZE - 1 - i) * TICK_MS,
      powerKw: Math.round(base + Math.sin(i / 4) * 60 + Math.random() * 25),
    }));
  }
}
