import Link from 'next/link';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import {
  getChallenge,
  getChallengeHref,
  getChallenges,
} from '@/lib/challenges';
import { mdxComponents } from '@/lib/mdx-components';
import { withBasePath } from '@/lib/paths';
import { SiteTop } from '../../site-top';

type ChallengePageProps = {
  params: Promise<{ slug: string }>;
};

const DEFAULT_CHALLENGE_IMAGE = {
  src: 'https://jeremybernste.in/images/posts/2025-03-07/tracks.jpg',
  alt: 'Example particle tracks in a detector event',
  position: 'center center',
};

function LinkedValue({
  href,
  children,
}: {
  href?: string;
  children: ReactNode;
}) {
  if (!href) return children;

  return <Link href={href}>{children}</Link>;
}

export default async function ChallengePage(props: ChallengePageProps) {
  const { slug } = await props.params;
  const challenge = getChallenge(slug);
  if (!challenge) notFound();

  const MDX = challenge.body;
  const image = challenge.image ?? DEFAULT_CHALLENGE_IMAGE;

  return (
    <main className="site-shell">
      <SiteTop active="challenges" />
      <nav className="challenge-subnav" aria-label="Challenge sections">
        <Link href="#overview">Overview</Link>
        <Link href={challenge.physics.href}>Physics docs</Link>
        <Link href={challenge.metric.href}>Metric docs</Link>
        <Link href={challenge.dataset.href}>Dataset</Link>
        <Link href="#leaderboard">Leaderboard</Link>
      </nav>

      <article className="challenge-page" aria-labelledby="challenge-title">
        <header className="challenge-hero">
          <figure className="challenge-image-frame">
            <img
              src={withBasePath(image.src)}
              alt={image.alt}
              style={{ objectPosition: image.position }}
            />
          </figure>

          <div className="challenge-hero-main">
            <div>
              <div className="challenge-eyebrow">
                <span>{challenge.label}</span>
                <span className="challenge-slash">/</span>
                <strong>{challenge.challengeId}</strong>
              </div>
              <h1 className="challenge-title" id="challenge-title">
                <span className="challenge-track">{challenge.track}</span>
                <span className="challenge-name">{challenge.title}</span>
              </h1>
              <p className="challenge-description">{challenge.description}</p>
            </div>

            <aside className="challenge-brief" aria-label="Summary">
              <dl
                style={{
                  gridTemplateColumns: `repeat(${
                    challenge.currentBest ? 4 : 3
                  }, minmax(0, 1fr))`,
                }}
              >
                <div className="challenge-brief-row">
                  <dt>Status</dt>
                  <dd>
                    <span className="challenge-status">{challenge.status}</span>
                  </dd>
                </div>
                <div className="challenge-brief-row">
                  <dt>Metric</dt>
                  <dd>
                    <Link href={challenge.metric.href}>
                      {challenge.metric.goal} {challenge.metric.label}
                    </Link>
                  </dd>
                </div>
                <div className="challenge-brief-row">
                  <dt>Dataset</dt>
                  <dd>
                    <Link href={challenge.dataset.href}>
                      {challenge.dataset.label}
                    </Link>
                  </dd>
                </div>
                {challenge.currentBest ? (
                  <div className="challenge-brief-row">
                    <dt>Best</dt>
                    <dd>
                      <LinkedValue href={challenge.currentBest.href}>
                        {challenge.currentBest.label} · {challenge.currentBest.score}
                      </LinkedValue>
                    </dd>
                  </div>
                ) : null}
              </dl>
            </aside>
          </div>
        </header>

        <section
          className="challenge-facts"
          id="overview"
          aria-label="At a glance"
        >
          {challenge.facts.map((fact) => (
            <div className="challenge-fact" key={fact.label}>
              <span className="challenge-fact-label">{fact.label}</span>
              <span className="challenge-fact-value">
                <LinkedValue href={fact.href}>{fact.value}</LinkedValue>
              </span>
            </div>
          ))}
        </section>

        <div className="challenge-content">
          <div className="challenge-body prose">
            <MDX components={mdxComponents} />
          </div>
        </div>

        <footer className="challenge-footer">
          <Link href="/challenges">Challenge registry</Link>
          <span>{getChallengeHref(challenge)}</span>
        </footer>
      </article>
    </main>
  );
}

export function generateStaticParams() {
  return getChallenges().map((challenge) => ({
    slug: challenge.slug,
  }));
}

export async function generateMetadata(
  props: ChallengePageProps,
): Promise<Metadata> {
  const { slug } = await props.params;
  const challenge = getChallenge(slug);
  if (!challenge) notFound();

  return {
    title: `${challenge.track}: ${challenge.title}`,
    description: challenge.description,
  };
}
