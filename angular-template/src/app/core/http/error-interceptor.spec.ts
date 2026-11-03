// Test dell'interceptor: conversione in ApiError e toast solo per errori imprevisti.
import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';

import { NotificationService } from '../notifications/notification-service';
import { errorInterceptor } from './error-interceptor';
import { silentErrors } from './http-context';
import { ApiError } from './problem-details';

describe('errorInterceptor', () => {
  let http: HttpClient;
  let backend: HttpTestingController;
  const notifications = { error: vi.fn() };

  beforeEach(() => {
    notifications.error.mockReset();
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
        { provide: NotificationService, useValue: notifications },
      ],
    });
    http = TestBed.inject(HttpClient);
    backend = TestBed.inject(HttpTestingController);
  });

  afterEach(() => backend.verify());

  it('rethrows 4xx as ApiError without a toast', async () => {
    const result = firstValueFrom(http.get('/api/items/x'));
    backend
      .expectOne('/api/items/x')
      .flush({ title: 'Item not found', status: 404 }, { status: 404, statusText: 'Not Found' });

    await expect(result).rejects.toBeInstanceOf(ApiError);
    expect(notifications.error).not.toHaveBeenCalled();
  });

  it('shows a toast for 5xx errors', async () => {
    const result = firstValueFrom(http.get('/api/items'));
    backend
      .expectOne('/api/items')
      .flush({ title: 'Internal Server Error', status: 500 }, { status: 500, statusText: 'Error' });

    await expect(result).rejects.toMatchObject({ status: 500 });
    expect(notifications.error).toHaveBeenCalledWith('Internal Server Error');
  });

  it('skips the toast when the request asks for silent errors', async () => {
    const result = firstValueFrom(http.get('/api/health', { context: silentErrors() }));
    backend.expectOne('/api/health').error(new ProgressEvent('error'), { status: 0 });

    await expect(result).rejects.toMatchObject({ status: 0 });
    expect(notifications.error).not.toHaveBeenCalled();
  });
});
