import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('affiche le shell Wattline avec ses KPI', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('h1')?.textContent).toContain('Wattline');
    expect(el.querySelectorAll('app-kpi-card').length).toBe(4);
    expect(el.querySelector('app-consumption-chart')).toBeTruthy();
  });
});
