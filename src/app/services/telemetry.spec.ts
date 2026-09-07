import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { TelemetryService } from './telemetry';

describe('TelemetryService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it("n'agrège que les sites joignables dans la puissance instantanée", () => {
    const service = TestBed.inject(TelemetryService);
    const offline = service.sites().find((s) => s.status === 'offline');
    expect(offline?.powerKw).toBe(0);
    expect(service.currentPowerKw()).toBeGreaterThan(0);
  });

  it('fige le flux lorsque la liaison passerelle est perdue', fakeAsync(() => {
    const service = TestBed.inject(TelemetryService);
    service.toggleConnection();
    const before = service.history();
    tick(6000);
    expect(service.history()).toBe(before); // aucune nouvelle mesure publiée
    service.toggleConnection();
  }));

  it('déclenche une alarme critique au-delà de 95 % de la capacité souscrite', () => {
    const service = TestBed.inject(TelemetryService);
    service.simulateOverload('ben-01');
    const alert = service.alerts().find((a) => a.siteName.includes('Benfeld'));
    expect(alert?.severity).toBe('critical');
  });

  it('signale la passerelle hors ligne comme alarme critique', () => {
    const service = TestBed.inject(TelemetryService);
    const alert = service.alerts().find((a) => a.siteName.includes('Lille'));
    expect(alert?.severity).toBe('critical');
    expect(alert?.message).toContain('hors ligne');
  });
});
