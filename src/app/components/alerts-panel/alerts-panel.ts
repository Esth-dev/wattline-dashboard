import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { Alert } from '../../models/telemetry';

/**
 * Panneau des alarmes de supervision, avec état vide soigné
 * (loading / empty / error : les trois états d'un dashboard IoT).
 */
@Component({
  selector: 'app-alerts-panel',
  imports: [],
  templateUrl: './alerts-panel.html',
  styleUrl: './alerts-panel.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlertsPanel {
  readonly alerts = input.required<readonly Alert[]>();

  protected timeOf(ts: number): string {
    return new Date(ts).toLocaleTimeString('fr-FR', { hour12: false });
  }
}
