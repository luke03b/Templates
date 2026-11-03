// Test del routing: pagine lazy, navbar e pagina 404.
import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { jsonResponse, renderWithProviders } from '@/test/renderWithProviders';

import { routes } from './routes';

beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn(() => Promise.resolve(jsonResponse([]))),
  );
});

describe('routes', () => {
  it('renders the 404 page for unknown URLs', async () => {
    renderWithProviders(<></>, { routes, route: '/does-not-exist' });
    expect(await screen.findByRole('heading', { name: 'Page not found' })).toBeInTheDocument();
  });

  it('navigates to the components page from the navbar', async () => {
    const { user } = renderWithProviders(<></>, { routes, route: '/' });
    await screen.findByRole('heading', { level: 1 });

    await user.click(screen.getByRole('link', { name: 'Components' }));

    expect(
      await screen.findByRole('heading', { name: 'Components', level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Components' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });
});
