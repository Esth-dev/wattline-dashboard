/**
 * Wattline — modèles de données du dashboard de supervision énergétique.
 * TypeScript strict : toutes les structures sont immuables (readonly).
 */

/** État de liaison d'un site avec la plateforme (passerelle edge). */
export type SiteStatus = 'online' | 'degraded' | 'offline';

/** Site supervisé (bâtiment / usine raccordée). */
export interface Site {
  readonly id: string;
  readonly name: string;
  readonly city: string;
  readonly status: SiteStatus;
  /** Puissance instantanée mesurée (kW). */
  readonly powerKw: number;
  /** Capacité souscrite (kW). */
  readonly capacityKw: number;
}

/** Point de mesure agrégé toutes plateformes. */
export interface Measurement {
  readonly timestamp: number;
  readonly powerKw: number;
}

/** Alarme remontée par la supervision. */
export interface Alert {
  readonly id: string;
  readonly siteName: string;
  readonly severity: 'warning' | 'critical';
  readonly message: string;
  readonly raisedAt: number;
}

/** État du canal temps réel vers les passerelles. */
export type ConnectionState = 'online' | 'offline';
