// Token di HttpContext: metadati che viaggiano con una singola richiesta e che gli
// interceptor possono leggere (non vengono inviati al server).
import { HttpContext, HttpContextToken } from '@angular/common/http';

/** Se true, l'interceptor degli errori NON mostra il toast (l'errore viene gestito dal chiamante). */
export const SKIP_ERROR_TOAST = new HttpContextToken<boolean>(() => false);

/** Scorciatoia per creare un contesto "silenzioso". */
export function silentErrors(): HttpContext {
  return new HttpContext().set(SKIP_ERROR_TOAST, true);
}
