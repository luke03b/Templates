// Test della shell: navbar con i link principali e indicatore di stato del backend.
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';

import { App } from './app';
import { BackendStatus, BackendStatusStore } from './core/state/backend-status-store';

describe('App', () => {
  const store = { status: signal<BackendStatus>('online'), check: vi.fn() };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([]), { provide: BackendStatusStore, useValue: store }],
    }).compileComponents();
  });

  it('renders the navigation and checks the backend on start', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;

    const links = Array.from(element.querySelectorAll('.desktop-nav a')).map((a) =>
      a.textContent?.trim(),
    );
    expect(links).toEqual(['Home', 'Components', 'Items']);
    expect(element.querySelector('app-status-indicator')?.textContent).toContain('Online');
    expect(store.check).toHaveBeenCalled();
  });
});
