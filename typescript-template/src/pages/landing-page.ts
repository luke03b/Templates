import { getHeroContent } from '../services/hero-service';

export function renderLandingPage(): HTMLElement {
  const content = getHeroContent();

  const section = document.createElement('section');
  section.className = 'hero-card';
  section.setAttribute('aria-labelledby', 'hero-title');

  section.innerHTML = `
    <div class="hero-copy">
      <p class="eyebrow">${content.eyebrow}</p>
      <h1 id="hero-title">${content.title}</h1>
      <p class="lead">${content.lead}</p>
      <div class="actions">
        <button type="button" class="primary-action">${content.primaryAction}</button>
        <button type="button" class="secondary-action">${content.secondaryAction}</button>
      </div>
    </div>
    <aside class="feature-panel" aria-label="Template highlights">
      <h2>What this template gives you</h2>
      ${content.features
        .map(
          (feature) => `
            <article class="feature-card">
              <span class="feature-card__dot" aria-hidden="true"></span>
              <div>
                <h3>${feature.title}</h3>
                <p>${feature.description}</p>
              </div>
            </article>
          `,
        )
        .join('')}
    </aside>
  `;

  return section;
}
