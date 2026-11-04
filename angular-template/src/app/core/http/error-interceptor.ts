// Interceptor HTTP funzionale: intercetta TUTTE le risposte di HttpClient, converte gli errori
// in ApiError e mostra un toast per gli errori "imprevisti" (rete assente o 5xx).
// Gli errori 4xx (validazione, 404) vengono lasciati alle pagine, che sanno come mostrarli.
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

import { NotificationService } from '../notifications/notification-service';
import { SKIP_ERROR_TOAST } from './http-context';
import { toApiError } from './problem-details';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  // Gli interceptor funzionali girano in un "injection context": inject() e' disponibile qui.
  const notifications = inject(NotificationService);

  return next(req).pipe(
    catchError((error: unknown) => {
      const apiError = toApiError(error);
      const unexpected = apiError.isNetworkError || apiError.status >= 500;

      if (unexpected) {
        // Log diagnostico: i dettagli restano in console, all'utente un messaggio leggibile.
        console.error(`[http] ${req.method} ${req.urlWithParams} failed`, apiError);
        if (!req.context.get(SKIP_ERROR_TOAST)) {
          notifications.error(apiError.message);
        }
      }

      return throwError(() => apiError);
    }),
  );
};
