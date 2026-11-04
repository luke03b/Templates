// Test della Home: indicatore di stato del backend Online/Offline.
import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { jsonResponse, renderWithProviders } from '@/test/renderWithProviders';

import { HomePage } from './HomePage';

describe('HomePage', () => {
  it('shows "Online" when /api/health answers', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve(
          jsonResponse({
            status: 'ok',
            service: 'nodejs-backend-template',
            timestamp: '2026-11-03T18:00:00Z',
          }),
        ),
      ),
    );

    renderWithProviders(<HomePage />);

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(await screen.findByText('Online')).toBeInTheDocument();
    expect(screen.getByText(/nodejs-backend-template/)).toBeInTheDocument();
  });

  it('shows "Offline" when the backend is unreachable', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.reject(new TypeError('Failed to fetch'))),
    );

    renderWithProviders(<HomePage />);

    expect(await screen.findByText('Offline')).toBeInTheDocument();
  });
});
