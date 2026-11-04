// Smoke test dello showcase: tutte le sezioni vengono renderizzate.
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { ShowcasePage } from './showcase-page';

describe('ShowcasePage', () => {
  it('renders every section', async () => {
    await TestBed.configureTestingModule({
      imports: [ShowcasePage],
      providers: [provideRouter([])],
    }).compileComponents();
    const fixture = TestBed.createComponent(ShowcasePage);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;

    const ids = Array.from(element.querySelectorAll('app-showcase-section')).map((s) => s.id);
    expect(ids).toEqual([
      'typography',
      'buttons',
      'forms',
      'cards',
      'feedback',
      'dialog',
      'tabs',
      'lists',
      'navigation',
    ]);
  });
});
