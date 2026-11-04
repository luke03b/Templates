// Tabella generica e tipizzata: le colonne descrivono come estrarre/disegnare ogni cella.
// Il generico <T> e' il tipo di una riga: TypeScript controlla che `render` riceva il tipo giusto.
import type { ReactNode } from 'react';

import styles from './Table.module.css';

export interface TableColumn<T> {
  /** Chiave univoca della colonna. */
  key: string;
  header: ReactNode;
  render: (row: T) => ReactNode;
  align?: 'left' | 'right';
}

export interface TableProps<T> {
  /** Descrizione della tabella per screen reader (e visibile se captionVisible). */
  caption: string;
  captionVisible?: boolean;
  columns: TableColumn<T>[];
  rows: T[];
  getRowKey: (row: T) => string;
  emptyMessage?: string;
}

export function Table<T>({
  caption,
  captionVisible = false,
  columns,
  rows,
  getRowKey,
  emptyMessage = 'No data.',
}: TableProps<T>) {
  return (
    // Il wrapper scorre in orizzontale su schermi stretti invece di rompere il layout.
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <caption className={captionVisible ? styles.caption : 'visually-hidden'}>{caption}</caption>
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={column.align === 'right' ? styles.right : undefined}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className={styles.empty}>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row) => (
              <tr key={getRowKey(row)}>
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={column.align === 'right' ? styles.right : undefined}
                  >
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
