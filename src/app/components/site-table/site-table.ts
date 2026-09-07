import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { Site, SiteStatus } from '../../models/telemetry';

/** Libellés français des états de liaison (design system). */
const STATUS_LABELS: Record<SiteStatus, string> = {
  online: 'En ligne',
  degraded: 'Dégradé',
  offline: 'Hors ligne',
};

/**
 * Tableau du parc : composants présentatif, `track site.id` pour
 * un rendu minimal à chaque tick du flux.
 */
@Component({
  selector: 'app-site-table',
  imports: [],
  templateUrl: './site-table.html',
  styleUrl: './site-table.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SiteTable {
  readonly sites = input.required<readonly Site[]>();

  protected loadRatio(site: Site): number {
    return site.capacityKw > 0 ? Math.min(1, site.powerKw / site.capacityKw) : 0;
  }

  protected loadPct(site: Site): string {
    return `${Math.round(this.loadRatio(site) * 100)} %`;
  }

  protected barWidth(site: Site): string {
    return `${(this.loadRatio(site) * 100).toFixed(1)}%`;
  }

  protected statusLabel(status: SiteStatus): string {
    return STATUS_LABELS[status];
  }
}
