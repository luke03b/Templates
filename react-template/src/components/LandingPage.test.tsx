import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { LandingPage } from './LandingPage';

describe('LandingPage', () => {
  it('renders the hero copy and actions', () => {
    render(<LandingPage />);

    expect(screen.getByRole('heading', { name: /build a clean product front end/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /get started/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /view docs/i })).toBeInTheDocument();
  });
});
