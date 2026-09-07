import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import type { Measurement } from '../../models/telemetry';

/** Géométrie SVG pré-calculée (fonction pure de l'historique). */
interface ChartGeom {
  readonly line: string;
  readonly area: string;
  readonly grid: readonly { y: number; label: string }[];
  readonly lastX: number;
  readonly lastY: number;
  readonly lastLabel: string;
}

const W = 640;
const H = 240;
const PAD_L = 46;
const PAD_R = 12;
const PAD_T = 16;
const PAD_B = 26;

/**
 * Courbe de puissance agrégée : SVG dessiné à la main (aucune dépendance),
 * recalculé uniquement quand le signal d'entrée change (OnPush + computed).
 */
@Component({
  selector: 'app-consumption-chart',
  imports: [],
  templateUrl: './consumption-chart.html',
  styleUrl: './consumption-chart.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConsumptionChart {
  readonly history = input.required<readonly Measurement[]>();
  readonly connected = input.required<boolean>();

  protected readonly geom = computed<ChartGeom | null>(() => {
    const data = this.history();
    if (data.length < 2) return null;
    const max = Math.max(...data.map((d) => d.powerKw)) * 1.15 || 1;
    const x = (i: number) => PAD_L + (i / (data.length - 1)) * (W - PAD_L - PAD_R);
    const y = (v: number) => PAD_T + (1 - v / max) * (H - PAD_T - PAD_B);
    const line = data
      .map((d, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(d.powerKw).toFixed(1)}`)
      .join(' ');
    const area = `${line} L${x(data.length - 1).toFixed(1)},${H - PAD_B} L${x(0).toFixed(1)},${H - PAD_B} Z`;
    const grid = [0.25, 0.5, 0.75, 1].map((f) => ({
      y: y(max * f),
      label: `${Math.round(max * f)}`,
    }));
    const last = data[data.length - 1];
    return {
      line,
      area,
      grid,
      lastX: x(data.length - 1),
      lastY: y(last.powerKw),
      lastLabel: `${last.powerKw}`,
    };
  });

  protected readonly width = W;
  protected readonly height = H;
}
