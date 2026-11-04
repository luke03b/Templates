// Esempio: scala tipografica di base (definita in styles/global.css e tokens.css).
import { ShowcaseSection } from './ShowcaseSection';

const CODE = `
<h1>Heading 1</h1>
<h2>Heading 2</h2>
<h3>Heading 3</h3>
<p>Body text with <strong>bold</strong>, <em>italic</em>, <a href="#">link</a> and <code>code</code>.</p>
`;

export function TypographyExample() {
  return (
    <ShowcaseSection id="typography" title="Typography" code={CODE}>
      <div>
        <h1>Heading 1</h1>
        <h2>Heading 2</h2>
        <h3>Heading 3</h3>
        <p>
          Body text with <strong>bold</strong>, <em>italic</em>, <a href="#typography">link</a> and{' '}
          <code>inline code</code>.
        </p>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-sm)' }}>
          Muted small text for secondary information.
        </p>
      </div>
    </ShowcaseSection>
  );
}
