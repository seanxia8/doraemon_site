import Link from 'next/link';
import { getChallengeHref, getChallenges } from '@/lib/challenges';
import { SiteTop } from '../site-top';

function metricCode(label: string) {
  const words = label.match(/[A-Za-z0-9]+/g) ?? [];
  const code = words.map((word) => word[0]).join('');

  return code.length > 1 && code.length <= 5 ? code.toUpperCase() : label;
}

function pluralize(count: number, singular: string, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

export default function ChallengesPage() {
  const challenges = getChallenges();
  const draftCount = challenges.filter((challenge) =>
    challenge.status.toLowerCase().includes('draft'),
  ).length;
  const openCount = challenges.filter((challenge) =>
    challenge.status.toLowerCase().includes('open'),
  ).length;

  return (
    <main className="site-shell">
      <SiteTop active="challenges" />
      <nav className="challenge-index-links" aria-label="Challenge references">
        <Link href="/docs/challenge-reference/challenge-rules">
          Challenge rules
        </Link>
        <Link href="/docs/challenge-reference/metrics">
          Metric definitions
        </Link>
        <Link href="/data-hub">Dataset records</Link>
        <span>
          {pluralize(challenges.length, 'record')} /{' '}
          {pluralize(draftCount, 'draft')} /{' '}
          {pluralize(openCount, 'open', 'open')}
        </span>
      </nav>

      <article className="challenge-index">
        <header className="challenge-index-intro">
          <h1>Open dataset challenges</h1>
          <p>
            A compact registry of benchmark tasks. Each record links to a
            generated challenge page, with shared definitions in Docs and
            dataset details in the Data Hub.
          </p>
        </header>

        <section className="challenge-card-grid" aria-label="Challenge registry">
          {challenges.map((challenge) => (
            <article className="challenge-index-card" key={challenge.slug}>
              <Link
                className="challenge-card-primary"
                href={getChallengeHref(challenge)}
              >
                <span className="challenge-card-top">
                <span className="challenge-card-id">
                  {challenge.challengeId}
                </span>
                  <span className="challenge-card-status">
                    {challenge.status}
                  </span>
                </span>
                <span className="challenge-card-main">
                  <span className="challenge-card-task">
                    <span className="challenge-card-track">
                      {challenge.track}
                    </span>
                    {challenge.title}
                  </span>
                  <span className="challenge-card-description">
                    {challenge.description}
                  </span>
                </span>
              </Link>
              <span className="challenge-card-bottom">
                <span className="challenge-card-meta">
                  <span>Dataset</span>
                  <Link href={challenge.dataset.href}>
                    {challenge.dataset.label}
                  </Link>
                </span>
                <span className="challenge-card-meta">
                  <span>Metric</span>
                  <Link href={challenge.metric.href}>
                    {metricCode(challenge.metric.label)}
                  </Link>
                </span>
              </span>
            </article>
          ))}
        </section>
      </article>
    </main>
  );
}
