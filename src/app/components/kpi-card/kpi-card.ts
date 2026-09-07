import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Icônes disponibles du design system Wattline. */
export type KpiIcon = 'bolt' | 'energy' | 'euro' | 'plug';

/**
 * Carte KPI présentative, réutilisable : aucune logique métier,
 * uniquement des inputs — pensée pour un design system.
 */
@Component({
  selector: 'app-kpi-card',
  imports: [],
  templateUrl: './kpi-card.html',
  styleUrl: './kpi-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KpiCard {
  readonly label = input.required<string>();
  readonly value = input.required<string>();
  readonly unit = input<string>('');
  readonly icon = input<KpiIcon>('bolt');
  /** Évolution en % sur la fenêtre glissante (optionnelle). */
  readonly trend = input<number | null>(null);
  readonly hint = input<string>('');
}
