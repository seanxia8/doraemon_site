import Link from 'next/link';
import { SiteTop } from './site-top';

const surfaceLinks = [
  {
    title: 'Documentation',
    href: '/docs',
    detail: 'Physics, rules, metrics, software, validation, and contribution notes.',
  },
  {
    title: 'Challenges',
    href: '/challenges',
    detail: 'Benchmark tasks with method area, dataset, score, and leaderboard state.',
  },
  {
    title: 'Data Hub',
    href: '/data-hub',
    detail: 'Dataset definitions, schemas, access notes, and loading tutorials.',
  },
];

export default function HomePage() {
  return (
    <main className="site-shell">
      <SiteTop />

      <article className="home-document">
        <section className="landing-hero" aria-labelledby="home-title">
          <div>
            <p className="kicker">Open dataset challenge</p>
            <h1 id="home-title">DORAEMON Open Dataset Challenge</h1>
            <p>
              A benchmark site for AI/ML in neutrino physics: challenge rules,
              detector datasets, scoring metrics, baselines, validators, and
              submission contracts.
            </p>
          </div>
        </section>

        <section className="surface-list" aria-label="Primary site sections">
          {surfaceLinks.map((item) => (
            <Link href={item.href} key={item.href}>
              <span>{item.title}</span>
              <small>{item.detail}</small>
            </Link>
          ))}
        </section>

        <section aria-labelledby="preview-title" className="command-section">
          <h2 id="preview-title">Local Preview</h2>
          <pre>
            <code>{'make validate\nmake docs\nmake docs-serve'}</code>
          </pre>
        </section>
      </article>
    </main>
  );
}
