import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { TelemetryService } from './services/telemetry';
import { KpiCard } from './components/kpi-card/kpi-card';
import { ConsumptionChart } from './components/consumption-chart/consumption-chart';
import { SiteTable } from './components/site-table/site-table';
import { AlertsPanel } from './components/alerts-panel/alerts-panel';

/**
 * Wattline — dashboard de supervision énergétique (démo front-end).
 * Shell applicatif : compose les composants du design system et expose
 * les signals du TelemetryService, formatés pour la vue.
 */
@Component({
  selector: 'app-root',
  imports: [KpiCard, ConsumptionChart, SiteTable, AlertsPanel],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly telemetry = inject(TelemetryService);

  protected readonly connected = computed(() => this.telemetry.connection() === 'online');
  protected readonly power = computed(() =>
    this.telemetry.currentPowerKw().toLocaleString('fr-FR'),
  );
  protected readonly energy = computed(() =>
    this.telemetry.energyTodayKwh().toLocaleString('fr-FR', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }),
  );
  protected readonly cost = computed(() =>
    Math.round(this.telemetry.costTodayEur()).toLocaleString('fr-FR'),
  );
  protected readonly sitesOnline = computed(() => {
    const s = this.telemetry.sitesOnline();
    return `${s.online}/${s.total}`;
  });
  protected readonly trend = computed(() => this.telemetry.trendPct());
}
