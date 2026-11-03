// Demo: lista Material e tabella Material con ordinamento lato client.
import { Component, computed, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';

import { ShowcaseSection } from '../../../shared/ui/showcase-section/showcase-section';

interface Product {
  name: string;
  category: string;
  price: number;
}

const PRODUCTS: Product[] = [
  { name: 'Keyboard', category: 'Hardware', price: 79 },
  { name: 'IDE license', category: 'Software', price: 199 },
  { name: 'Monitor', category: 'Hardware', price: 249 },
];

const CODE = `<mat-list>
  @for (product of products; track product.name) {
    <mat-list-item>
      <mat-icon matListItemIcon>inventory_2</mat-icon>
      <span matListItemTitle>{{ product.name }}</span>
      <span matListItemLine>{{ product.category }}</span>
    </mat-list-item>
  }
</mat-list>

<table mat-table [dataSource]="sorted()" matSort (matSortChange)="sort.set($event)">
  <ng-container matColumnDef="name">
    <th mat-header-cell *matHeaderCellDef mat-sort-header>Name</th>
    <td mat-cell *matCellDef="let row">{{ row.name }}</td>
  </ng-container>
  <tr mat-header-row *matHeaderRowDef="columns"></tr>
  <tr mat-row *matRowDef="let row; columns: columns"></tr>
</table>`;

@Component({
  selector: 'app-list-table-demo',
  imports: [
    CurrencyPipe,
    MatIconModule,
    MatListModule,
    MatSortModule,
    MatTableModule,
    ShowcaseSection,
  ],
  template: `
    <app-showcase-section
      anchor="lists"
      title="Lists and tables"
      description="Material list and sortable table"
      [code]="code"
    >
      <div class="layout">
        <mat-list>
          @for (product of products; track product.name) {
            <mat-list-item>
              <mat-icon matListItemIcon aria-hidden="true">inventory_2</mat-icon>
              <span matListItemTitle>{{ product.name }}</span>
              <span matListItemLine>{{ product.category }}</span>
            </mat-list-item>
          }
        </mat-list>

        <table mat-table [dataSource]="sorted()" matSort (matSortChange)="sort.set($event)">
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Name</th>
            <td mat-cell *matCellDef="let row">{{ row.name }}</td>
          </ng-container>
          <ng-container matColumnDef="category">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Category</th>
            <td mat-cell *matCellDef="let row">{{ row.category }}</td>
          </ng-container>
          <ng-container matColumnDef="price">
            <th mat-header-cell *matHeaderCellDef mat-sort-header>Price</th>
            <td mat-cell *matCellDef="let row">{{ row.price | currency: 'EUR' }}</td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="columns"></tr>
          <tr mat-row *matRowDef="let row; columns: columns"></tr>
        </table>
      </div>
    </app-showcase-section>
  `,
  styles: `
    .layout {
      display: grid;
      gap: var(--app-space-4);
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      overflow-x: auto;
    }
  `,
})
export class ListTableDemo {
  protected readonly code = CODE;
  protected readonly products = PRODUCTS;
  protected readonly columns = ['name', 'category', 'price'];
  protected readonly sort = signal<Sort>({ active: '', direction: '' });

  /** Righe ordinate in base allo stato di ordinamento (signal) scelto dall'utente. */
  protected readonly sorted = computed(() => {
    const { active, direction } = this.sort();
    if (!active || !direction) {
      return PRODUCTS;
    }
    const key = active as keyof Product;
    const factor = direction === 'asc' ? 1 : -1;
    return [...PRODUCTS].sort((a, b) => (a[key] > b[key] ? 1 : -1) * factor);
  });
}
