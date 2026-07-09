import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LandingPageComponent } from './landing-page.component';

describe('LandingPageComponent', () => {
  let fixture: ComponentFixture<LandingPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingPageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LandingPageComponent);
    fixture.detectChanges();
  });

  it('renders the hero title and actions', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain('Build something clean from day one.');
    expect(compiled.textContent).toContain('Get started');
    expect(compiled.textContent).toContain('View docs');
  });
});
