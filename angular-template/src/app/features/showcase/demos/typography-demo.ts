// Demo: scala tipografica (classi utility definite in styles.scss sulle variabili Material 3).
import { Component } from '@angular/core';

import { ShowcaseSection } from '../../../shared/ui/showcase-section/showcase-section';

const CODE = `<p class="app-text-display">Display</p>
<p class="app-text-headline">Headline</p>
<p class="app-text-title">Title</p>
<p class="app-text-body">Body text</p>
<p class="app-text-label">Label</p>
<p class="app-text-body app-text-muted">Muted text</p>

/* In un tuo file SCSS: */
.my-title { font: var(--mat-sys-title-large); }`;

@Component({
  selector: 'app-typography-demo',
  imports: [ShowcaseSection],
  template: `
    <app-showcase-section
      anchor="typography"
      title="Typography"
      description="Utility classes mapped to the Material 3 type scale"
      [code]="code"
    >
      <div class="samples">
        <p class="app-text-display">Display</p>
        <p class="app-text-headline">Headline</p>
        <p class="app-text-title">Title</p>
        <p class="app-text-body">Body text for paragraphs and descriptions.</p>
        <p class="app-text-label">Label</p>
        <p class="app-text-body app-text-muted">Muted secondary text</p>
      </div>
    </app-showcase-section>
  `,
  styles: `
    .samples p {
      margin: 0 0 var(--app-space-2);
    }
  `,
})
export class TypographyDemo {
  protected readonly code = CODE;
}
