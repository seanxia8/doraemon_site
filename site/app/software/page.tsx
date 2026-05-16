import type { Metadata } from 'next';
import { Icon } from '@/components/Icon';
import { ButtonLink } from '@/components/UI';
import { getSoftwareRepositories } from '@/lib/content-data';
import { site } from '@/lib/site-data';

export const metadata: Metadata = {
  title: 'Software',
  description:
    'Model code, baselines, and data-loading utilities used for DORAEMON tasks.',
};

export default function SoftwarePage() {
  const repositories = getSoftwareRepositories();

  return (
    <>
      <section className="software-hero">
        <div className="container software-hero-inner">
          <div className="software-hero-copy">
            <p className="eyebrow">Software</p>
            <h1 className="software-title">Tools used for DORAEMON datasets.</h1>
            <p>
              Model code, baselines, and data-loading utilities for DORAEMON tasks.
            </p>
          </div>
          <div className="software-hero-actions">
            <ButtonLink href={site.githubUrl} variant="secondary">
              GitHub
            </ButtonLink>
            <ButtonLink href="/documentation/software-stack.html" variant="ghost">
              Software docs
              <Icon name="arrow" size={14} />
            </ButtonLink>
          </div>
        </div>
      </section>
      <section className="software-libraries">
        <div className="container">
          <p className="eyebrow software-libraries-label">Repositories</p>
          <div className="software-grid">
            {repositories.map((repo) => (
              <article
                className={`panel software-card panel-accent-${repo.accent} software-card-${repo.accent}`}
                key={repo.title}
              >
                <div className="software-card-top">
                  <span className={`icon-chip accent-${repo.accent}`}>
                    <Icon name={repo.icon} size={20} />
                  </span>
                  <p className={`eyebrow text-${repo.accent}`}>{repo.category}</p>
                </div>
                <div className="software-card-copy">
                  <h2 className="type-h3">{repo.title}</h2>
                  <p className="software-repo-owner">{repo.owner}</p>
                  <p>{repo.body}</p>
                </div>
                <ButtonLink href={repo.href} variant="ghost">
                  View source
                  <Icon name="github" size={14} />
                </ButtonLink>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
