import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Script from 'next/script';
import { ButtonLink, Container } from '@/components/UI';
import { Icon } from '@/components/Icon';
import {
  getChallengesForDataset,
  getDataset,
  getDatasets,
} from '@/lib/doraemon-data';

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export function generateStaticParams() {
  return getDatasets().map((dataset) => ({ id: dataset.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const dataset = getDataset(id);
  return {
    title: dataset?.title ?? 'Dataset',
    description: dataset?.summary,
  };
}

export default async function DatasetDetailPage({ params }: PageProps) {
  const { id } = await params;
  const dataset = getDataset(id);
  if (!dataset) notFound();

  const challenges = getChallengesForDataset(dataset.id);
  const accessCommand = `pimm-data save ${dataset.id}`;

  return (
    <>
      <section className="page-hero detail-hero">
        <Container className="page-hero-inner">
          <div className="page-hero-copy">
            <p className="eyebrow">Dataset record</p>
            <h1 className="type-h1">{dataset.title}</h1>
            <p>{dataset.summary}</p>
            <div className="hero-actions">
              {dataset.links?.docs ? (
                <ButtonLink href={dataset.links.docs}>Dataset docs</ButtonLink>
              ) : null}
              <ButtonLink href="/data-hub" variant="secondary">
                All datasets
              </ButtonLink>
            </div>
          </div>
          <div className="page-hero-visual">
            <div className="access-command-card">
              <span className="eyebrow">Access</span>
              <pre><code>{accessCommand}</code></pre>
            </div>
          </div>
        </Container>
      </section>

      <section className="section">
        <Container className="detail-layout">
          <aside className="detail-sidebar">
            <div className="panel detail-summary">
              <span className="status-pill">{dataset.status}</span>
              <dl>
                <div>
                  <dt>Modality</dt>
                  <dd>{dataset.modality}</dd>
                </div>
                <div>
                  <dt>Version</dt>
                  <dd>{dataset.version}</dd>
                </div>
                <div>
                  <dt>Format</dt>
                  <dd>{dataset.format}</dd>
                </div>
                <div>
                  <dt>Schema</dt>
                  <dd>
                    {dataset.links?.schema ? (
                      <Link href={dataset.links.schema}>{dataset.schema_doc}</Link>
                    ) : (
                      dataset.schema_doc
                    )}
                  </dd>
                </div>
              </dl>
            </div>
          </aside>
          <div className="detail-main">
            {dataset.bodyHtml ? (
              <>
                <Script id="dataset-mathjax-config" strategy="afterInteractive">
                  {`window.MathJax = { tex: { inlineMath: [['$', '$'], ['\\\\(', '\\\\)']] } };`}
                </Script>
                <Script
                  id="dataset-mathjax-script"
                  src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js"
                  strategy="afterInteractive"
                />
              </>
            ) : null}

            {dataset.facts?.length ? (
              <div className="fact-grid">
                {dataset.facts.map((fact) => (
                  <div className="fact-card" key={fact.label}>
                    <span>{fact.label}</span>
                    <strong>{fact.value}</strong>
                  </div>
                ))}
              </div>
            ) : null}

            {dataset.bodyHtml ? (
              <article className="panel challenge-protocol-shell">
                <p className="eyebrow">Dataset notes</p>
                <div
                  className="challenge-protocol quarto-content"
                  dangerouslySetInnerHTML={{ __html: dataset.bodyHtml }}
                />
              </article>
            ) : (
              <article className="text-panel">
                <h2 className="type-h3">Dataset source</h2>
                <p>
                  This dataset has a Quarto source file, but the public notes have
                  not been rendered yet.
                </p>
              </article>
            )}

            <article className="panel data-table-wrap">
              <div className="table-heading">
                <div>
                  <h2 className="type-h3">Used by</h2>
                </div>
                <ButtonLink href="/challenges" variant="ghost">
                  OpenDC
                  <Icon name="arrow" size={14} />
                </ButtonLink>
              </div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Task</th>
                    <th>Status</th>
                    <th>Metric</th>
                  </tr>
                </thead>
                <tbody>
                  {challenges.map((challenge) => (
                    <tr key={challenge.id}>
                      <td>
                        <div className="used-by-task">
                          <Link href={`/challenges/${challenge.id}`}>{challenge.title}</Link>
                          <span>{challenge.summary}</span>
                        </div>
                      </td>
                      <td>{challenge.status}</td>
                      <td>{challenge.metric?.label ?? challenge.metric_ids?.[0]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </article>
          </div>
        </Container>
      </section>
    </>
  );
}
