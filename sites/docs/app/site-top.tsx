import Link from 'next/link';
import { ThemeSwitch } from 'fumadocs-ui/layouts/shared/slots/theme-switch';

type SiteTopProps = {
  active?: 'docs' | 'challenges' | 'data-hub';
};

export function SiteTop({ active }: SiteTopProps) {
  return (
    <header className="site-top">
      <Link href="/" className="brand-lockup">
        DORAEMON
      </Link>
      <div className="site-top-actions">
        <nav aria-label="main navigation">
          <Link href="/docs" aria-current={active === 'docs' ? 'page' : undefined}>
            Documentation
          </Link>
          <Link
            href="/challenges"
            aria-current={active === 'challenges' ? 'page' : undefined}
          >
            Challenges
          </Link>
          <Link
            href="/data-hub"
            aria-current={active === 'data-hub' ? 'page' : undefined}
          >
            Data Hub
          </Link>
        </nav>
        <ThemeSwitch className="site-theme-switch" mode="light-dark" />
      </div>
    </header>
  );
}
