import { createElement } from 'react';
import { ButtonLink, Container } from '@/components/UI';
import { Icon } from '@/components/Icon';

function NotFoundBackground() {
  return (
    <div aria-hidden="true" className="not-found-background">
      <div className="not-found-ascii-shell">
        {createElement(
          'wc-cherenkov',
          {
            fps: '25',
            rotation: '24',
          },
          <pre aria-hidden="true" className="ascii-lartpc-fallback" />,
        )}
      </div>
    </div>
  );
}

export default function NotFound() {
  return (
    <section className="not-found-page">
      <NotFoundBackground />
      <Container className="not-found-inner">
        <div className="not-found-copy">
          <p className="eyebrow">404</p>
          <h1 className="type-display">Page not found</h1>
          <div className="hero-actions">
            <ButtonLink href="/">Return home</ButtonLink>
          </div>
        </div>
      </Container>
    </section>
  );
}
