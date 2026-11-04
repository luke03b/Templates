// Rotte della feature "items", caricate in lazy loading da app.routes.ts.
import { Routes } from '@angular/router';

import { ItemEditPage } from './item-edit-page';
import { ItemsListPage } from './items-list-page';
import { ItemsStore } from './items-store';

export const ITEMS_ROUTES: Routes = [
  {
    path: '',
    // Lo store e' condiviso da tutte le rotte figlie.
    providers: [ItemsStore],
    children: [
      { path: '', title: 'Items · Angular Template', component: ItemsListPage },
      { path: 'new', title: 'New item · Angular Template', component: ItemEditPage },
      // ":id" arriva nell'input `id` di ItemEditPage grazie a withComponentInputBinding().
      { path: ':id/edit', title: 'Edit item · Angular Template', component: ItemEditPage },
    ],
  },
];
