// Pagina "Components": indice + una sezione per ogni gruppo di componenti Material.
// Ogni sezione e' un componente in ./demos: copialo come punto di partenza per i tuoi.
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatChipsModule } from '@angular/material/chips';

import { PageHeader } from '../../shared/ui/page-header/page-header';
import { ButtonsDemo } from './demos/buttons-demo';
import { CardsDemo } from './demos/cards-demo';
import { DialogDemo } from './demos/dialog-demo';
import { FeedbackDemo } from './demos/feedback-demo';
import { FormFieldsDemo } from './demos/form-fields-demo';
import { ListTableDemo } from './demos/list-table-demo';
import { NavigationDemo } from './demos/navigation-demo';
import { TabsDemo } from './demos/tabs-demo';
import { TypographyDemo } from './demos/typography-demo';

@Component({
  selector: 'app-showcase-page',
  imports: [
    RouterLink,
    MatChipsModule,
    PageHeader,
    TypographyDemo,
    ButtonsDemo,
    FormFieldsDemo,
    CardsDemo,
    FeedbackDemo,
    DialogDemo,
    TabsDemo,
    ListTableDemo,
    NavigationDemo,
  ],
  template: `
    <div class="app-container">
      <app-page-header
        title="Components"
        subtitle="Angular Material building blocks with copy-ready code"
      />

      <nav aria-label="Sections" class="toc">
        <mat-chip-set>
          @for (section of sections; track section.anchor) {
            <a mat-chip routerLink="." [fragment]="section.anchor">{{ section.label }}</a>
          }
        </mat-chip-set>
      </nav>

      <div class="app-stack">
        <app-typography-demo />
        <app-buttons-demo />
        <app-form-fields-demo />
        <app-cards-demo />
        <app-feedback-demo />
        <app-dialog-demo />
        <app-tabs-demo />
        <app-list-table-demo />
        <app-navigation-demo />
      </div>
    </div>
  `,
  styles: `
    .toc {
      margin-bottom: var(--app-space-5);
    }
    .toc a {
      text-decoration: none;
    }
  `,
})
export class ShowcasePage {
  protected readonly sections = [
    { anchor: 'typography', label: 'Typography' },
    { anchor: 'buttons', label: 'Buttons' },
    { anchor: 'forms', label: 'Form fields' },
    { anchor: 'cards', label: 'Cards' },
    { anchor: 'feedback', label: 'Feedback' },
    { anchor: 'dialog', label: 'Dialog' },
    { anchor: 'tabs', label: 'Tabs' },
    { anchor: 'lists', label: 'Lists and tables' },
    { anchor: 'navigation', label: 'Navigation' },
  ];
}
