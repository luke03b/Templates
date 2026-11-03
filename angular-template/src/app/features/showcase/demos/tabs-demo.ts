// Demo: tab Material.
import { Component } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';

import { ShowcaseSection } from '../../../shared/ui/showcase-section/showcase-section';

const CODE = `<mat-tab-group>
  <mat-tab label="Overview">Overview content</mat-tab>
  <mat-tab label="Details">Details content</mat-tab>
  <mat-tab label="Disabled" disabled>...</mat-tab>
</mat-tab-group>`;

@Component({
  selector: 'app-tabs-demo',
  imports: [MatTabsModule, ShowcaseSection],
  template: `
    <app-showcase-section anchor="tabs" title="Tabs" description="Tab group" [code]="code">
      <mat-tab-group>
        <mat-tab label="Overview"><p class="tab">Overview content.</p></mat-tab>
        <mat-tab label="Details"><p class="tab">Details content.</p></mat-tab>
        <mat-tab label="Disabled" disabled><p class="tab">Unavailable.</p></mat-tab>
      </mat-tab-group>
    </app-showcase-section>
  `,
  styles: `
    .tab {
      margin: 0;
      padding: var(--app-space-4) 0;
    }
  `,
})
export class TabsDemo {
  protected readonly code = CODE;
}
