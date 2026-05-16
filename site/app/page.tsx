import Link from 'next/link';
import { createElement, type ReactNode } from 'react';
import { Icon } from '@/components/Icon';
import {
  ButtonLink,
  Container,
  LinkCard,
  NumberedCard,
  SectionHeader,
} from '@/components/UI';
import {
  ForceGraphBackground,
  VoronoiTessellationBackground,
  WaveInterferenceBackground,
} from '@/components/Visuals';
import { getChallenges, getDatasets } from '@/lib/doraemon-data';
import { getUpdates } from '@/lib/content-data';
import { isStaticHref, withBasePath } from '@/lib/paths';
import {
  buildCards,
  homeHighlights,
  principles,
  protocolModules,
  whyCards,
} from '@/lib/site-data';

function HighlightLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  if (isStaticHref(href) || href.startsWith('http')) {
    return (
      <a
        className="highlight-card"
        href={withBasePath(href)}
        rel={href.startsWith('http') ? 'noreferrer' : undefined}
        target={href.startsWith('http') ? '_blank' : undefined}
      >
        {children}
      </a>
    );
  }

  return (
    <Link className="highlight-card" href={href}>
      {children}
    </Link>
  );
}

function AsciiLartpcDisplay() {
  return (
    <div
      aria-hidden="true"
      className="ascii-lartpc-shell"
    >
      {createElement(
        'ascii-lartpc',
        {
          fps: '25',
          rotation: '18',
        },
        <pre aria-hidden="true" className="ascii-lartpc-fallback" />,
      )}
    </div>
  );
}

export default function HomePage() {
  const challenges = getChallenges();
  const datasets = getDatasets();
  const updateItems = getUpdates();
  const featuredChallenges = challenges.slice(0, 3);

  return (
    <>
      <section className="home-hero">
        <Container className="home-hero-inner">
          <div className="home-hero-copy">
            <h1 className="type-display">
              DORAEMON
              <br />
              Open Dataset
              <br />
              <span className="highlight-red">Challenge</span>
            </h1>
            <p>
              Public simulated datasets and shared evaluation tasks for AI methods
              in neutrino physics.
            </p>
            <div className="hero-actions">
              <ButtonLink href="/challenges">Explore OpenDC</ButtonLink>
              <ButtonLink href="/documentation/" variant="secondary">
                Read documentation
              </ButtonLink>
            </div>
          </div>
          <div className="home-hero-visual">
            <AsciiLartpcDisplay />
          </div>
        </Container>

      </section>

      <section className="section">
        <Container>
          <SectionHeader
            title="Compare methods on the same neutrino-detector tasks."
            body="DORAEMON keeps the dataset, task definition, metric, baseline, and notes together."
          />
          <div className="three-grid">
            {whyCards.map((card) => (
              <NumberedCard
                accent={card.accent}
                body={card.body}
                icon={card.icon}
                key={card.title}
                number={card.number}
                title={card.title}
              />
            ))}
          </div>
        </Container>
      </section>

      <section className="section">
        <Container>
          <SectionHeader
            eyebrow="Project pieces"
            title="OpenDC, Data Hub, and notes in one place."
            body="The public site lists AI-ready datasets, task protocols, baselines, and lessons as they become available."
          />
          <div className="cards-grid">
            {buildCards.map((card) => (
              <LinkCard
                accent={card.accent}
                body={card.body}
                eyebrow={card.eyebrow}
                href={card.href}
                icon={card.icon}
                key={card.title}
                label={card.label}
                title={card.title}
              />
            ))}
          </div>
        </Container>
      </section>

      <section className="section">
        <Container>
          <div className="updates-list-header">
            <SectionHeader
              eyebrow="Latest news"
              title="Recent updates."
              body="Dataset releases, OpenDC status, workshop notes, and baseline model updates."
            />
            <ButtonLink href="/updates" variant="secondary" className="updates-header-action">
              View all news
            </ButtonLink>
          </div>
          <div className="news-list">
            {updateItems.map((item) => (
              <article className="news-row news-row-aims" key={item.slug}>
                <div className="news-row-meta">
                  <time className="news-date" dateTime={item.datetime}>
                    {item.date}
                  </time>
                  <p className="news-category">{item.category}</p>
                </div>
                <div>
                  <h3 className="type-h3">{item.title}</h3>
                  <p>{item.summary}</p>
                </div>
                <ButtonLink href={`/updates/${item.slug}`} variant="ghost">
                  Read article
                  <Icon name="arrow" size={14} />
                </ButtonLink>
              </article>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
