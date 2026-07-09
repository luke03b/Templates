import { Component } from '@angular/core';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  template: `
    <main class="page-shell">
      <section class="hero-card">
        <div class="hero-copy">
          <p class="eyebrow">Starter template</p>
          <h1>Build something clean from day one.</h1>
          <p class="lead">
            A minimal Angular landing page with a strong visual hierarchy, responsive layout and a
            clean base to extend with routing, services and state.
          </p>

          <div class="actions">
            <button type="button" class="primary-action">Get started</button>
            <button type="button" class="secondary-action">View docs</button>
          </div>
        </div>

        <aside class="feature-panel">
          <h2>What this template gives you</h2>

          <article class="feature-item">
            <span class="dot"></span>
            <div>
              <h3>Landing page base</h3>
              <p>A clean hero layout with supporting copy and clear call to action.</p>
            </div>
          </article>

          <article class="feature-item">
            <span class="dot"></span>
            <div>
              <h3>Responsive composition</h3>
              <p>A layout that adapts naturally to mobile and desktop widths.</p>
            </div>
          </article>

          <article class="feature-item">
            <span class="dot"></span>
            <div>
              <h3>Ready to extend</h3>
              <p>Add routes, services, forms and components without changing the base structure.</p>
            </div>
          </article>
        </aside>
      </section>
    </main>
  `,
  styles: [
    `
      :host {
        display: block;
        min-height: 100vh;
      }

      .page-shell {
        min-height: 100vh;
        display: grid;
        place-items: center;
        padding: 24px;
      }

      .hero-card {
        width: min(1120px, 100%);
        display: grid;
        grid-template-columns: 1.15fr 0.85fr;
        gap: 28px;
        padding: 28px;
        border-radius: 28px;
        background: rgba(255, 255, 255, 0.86);
        backdrop-filter: blur(10px);
        box-shadow: 0 24px 60px rgba(15, 23, 42, 0.1);
      }

      .hero-copy {
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 16px;
      }

      .eyebrow {
        width: fit-content;
        margin: 0;
        padding: 6px 12px;
        border-radius: 999px;
        background: #dbeafe;
        color: #1d4ed8;
        font-size: 0.85rem;
        font-weight: 700;
        letter-spacing: 0.02em;
      }

      h1 {
        margin: 0;
        font-size: clamp(2.6rem, 5vw, 4.7rem);
        line-height: 1;
        letter-spacing: -0.05em;
        color: #0f172a;
      }

      .lead {
        margin: 0;
        max-width: 56ch;
        color: rgba(15, 23, 42, 0.72);
        font-size: 1.05rem;
        line-height: 1.7;
      }

      .actions {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        margin-top: 8px;
      }

      button {
        border: 0;
        border-radius: 999px;
        padding: 14px 20px;
        font: inherit;
        font-weight: 700;
        cursor: pointer;
      }

      .primary-action {
        color: #fff;
        background: linear-gradient(135deg, #2563eb, #0ea5e9);
      }

      .secondary-action {
        color: #0f172a;
        background: #e2e8f0;
      }

      .feature-panel {
        padding: 24px;
        border-radius: 24px;
        background: #f8fafc;
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 18px;
      }

      .feature-panel h2 {
        margin: 0;
        font-size: 1.35rem;
        letter-spacing: -0.03em;
      }

      .feature-item {
        display: grid;
        grid-template-columns: auto 1fr;
        gap: 12px;
        align-items: start;
      }

      .dot {
        margin-top: 6px;
        width: 10px;
        height: 10px;
        border-radius: 999px;
        background: #2563eb;
      }

      .feature-item h3 {
        margin: 0 0 4px;
        font-size: 1rem;
      }

      .feature-item p {
        margin: 0;
        color: rgba(15, 23, 42, 0.72);
        line-height: 1.55;
      }

      @media (max-width: 860px) {
        .hero-card {
          grid-template-columns: 1fr;
        }

        .page-shell {
          padding: 16px;
        }
      }
    `,
  ],
})
export class LandingPageComponent {}
