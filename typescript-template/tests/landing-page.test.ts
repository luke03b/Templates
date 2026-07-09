import { describe, expect, it } from 'vitest';

import { renderLandingPage } from '../src/pages/landing-page';

describe('renderLandingPage', () => {
  it('renders the hero title and actions', () => {
    const page = renderLandingPage();

    expect(page.textContent).toContain('Build a modular experience with clear contracts.');
    expect(page.textContent).toContain('Get started');
    expect(page.textContent).toContain('View docs');
  });
});
