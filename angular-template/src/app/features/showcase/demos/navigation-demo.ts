// Demo: elementi di navigazione (menu a tendina, button toggle, paginator, toolbar).
import { Component, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatToolbarModule } from '@angular/material/toolbar';

import { ShowcaseSection } from '../../../shared/ui/showcase-section/showcase-section';

const CODE = `<mat-toolbar>
  <span>Title</span>
  <button matIconButton [matMenuTriggerFor]="menu" aria-label="More"><mat-icon>more_vert</mat-icon></button>
</mat-toolbar>
<mat-menu #menu="matMenu">
  <button mat-menu-item>Profile</button>
</mat-menu>

<mat-button-toggle-group [(value)]="view" aria-label="View">
  <mat-button-toggle value="list">List</mat-button-toggle>
  <mat-button-toggle value="grid">Grid</mat-button-toggle>
</mat-button-toggle-group>

<mat-paginator [length]="120" [pageSize]="10" [pageSizeOptions]="[10, 25, 50]"
               (page)="onPage($event)" />`;

@Component({
  selector: 'app-navigation-demo',
  imports: [
    MatButtonModule,
    MatButtonToggleModule,
    MatIconModule,
    MatMenuModule,
    MatPaginatorModule,
    MatToolbarModule,
    ShowcaseSection,
  ],
  template: `
    <app-showcase-section
      anchor="navigation"
      title="Navigation"
      description="Toolbar, menu, button toggle and paginator. See also the app navbar."
      [code]="code"
    >
      <div class="app-stack">
        <mat-toolbar class="demo-toolbar">
          <span>Toolbar</span>
          <span class="spacer"></span>
          <button matIconButton [matMenuTriggerFor]="menu" aria-label="More options">
            <mat-icon>more_vert</mat-icon>
          </button>
        </mat-toolbar>
        <mat-menu #menu="matMenu">
          <button mat-menu-item><mat-icon>person</mat-icon><span>Profile</span></button>
          <button mat-menu-item><mat-icon>settings</mat-icon><span>Settings</span></button>
        </mat-menu>

        <div class="app-row">
          <mat-button-toggle-group [(value)]="view" aria-label="View mode">
            <mat-button-toggle value="list">List</mat-button-toggle>
            <mat-button-toggle value="grid">Grid</mat-button-toggle>
          </mat-button-toggle-group>
          <span class="app-text-muted">Selected: {{ view() }}</span>
        </div>

        <mat-paginator
          [length]="120"
          [pageSize]="10"
          [pageSizeOptions]="[10, 25, 50]"
          (page)="page.set($event)"
          aria-label="Select page"
        />
        <span class="app-text-muted"
          >Page {{ page().pageIndex + 1 }}, size {{ page().pageSize }}</span
        >
      </div>
    </app-showcase-section>
  `,
  styles: `
    .demo-toolbar {
      border-radius: var(--app-radius-sm);
    }
    .spacer {
      flex: 1;
    }
  `,
})
export class NavigationDemo {
  protected readonly code = CODE;
  protected readonly view = signal('list');
  protected readonly page = signal<PageEvent>({ pageIndex: 0, pageSize: 10, length: 120 });
}
