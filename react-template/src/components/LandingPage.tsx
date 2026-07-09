import './LandingPage.css';

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <article className="feature-card">
      <span className="feature-card__dot" aria-hidden="true" />
      <div>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </article>
  );
}

export function LandingPage() {
  return (
    <main className="page-shell">
      <section className="hero-card" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow">React starter</p>
          <h1 id="hero-title">Build a clean product front end from day one.</h1>
          <p className="lead">
            A focused React landing page with a strong visual direction, responsive layout and a
            clean base for routing, state and API integration.
          </p>

          <div className="actions">
            <button type="button" className="primary-action">
              Get started
            </button>
            <button type="button" className="secondary-action">
              View docs
            </button>
          </div>
        </div>

        <aside className="feature-panel" aria-label="Template highlights">
          <h2>What this template gives you</h2>
          <FeatureCard
            title="Minimal bootstrap"
            description="The app entry point only mounts React and global styles."
          />
          <FeatureCard
            title="Composable UI"
            description="A landing page split into small, reusable presentational pieces."
          />
          <FeatureCard
            title="Ready to extend"
            description="Add router, state and API services without reshaping the base layout."
          />
        </aside>
      </section>
    </main>
  );
}
