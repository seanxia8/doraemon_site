import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Script from 'next/script';
import { ButtonLink, Container } from '@/components/UI';
import { Icon } from '@/components/Icon';
import {
  getChallenge,
  getChallenges,
  getDatasetsByIds,
} from '@/lib/doraemon-data';
import { getChallengeImage } from '@/lib/challenge-images';
import { withBasePath } from '@/lib/paths';

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return getChallenges().map((challenge) => ({ slug: challenge.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const challenge = getChallenge(slug);
  return {
    title: challenge?.title ?? 'OpenDC Task',
    description: challenge?.summary,
  };
}

export default async function ChallengeDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const challenge = getChallenge(slug);
  if (!challenge) notFound();

  const datasets = getDatasetsByIds(challenge.dataset_ids ?? challenge.datasets ?? []);
  const image = getChallengeImage(challenge);
  const baselineHref = challenge.links?.baseline;
  const validationDataset = datasets[0];
  const validationDatasetId = validationDataset?.id ?? '<dataset>';
  const validationSchemaHref = validationDataset?.links?.schema;

  return (
    <>
      <section className="page-hero detail-hero">
        <Container className="page-hero-inner">
          <div className="page-hero-copy">
            <p className="eyebrow">{challenge.label ?? 'Open Dataset Challenge'}</p>
            <h1 className="type-h1">{challenge.title}</h1>
            <p>{challenge.summary}</p>
            <div className="hero-actions">
              {challenge.bodyHtml ? (
                <ButtonLink href="#protocol">Read protocol</ButtonLink>
              ) : challenge.links?.docs ? (
                <ButtonLink href={challenge.links.docs}>Read protocol</ButtonLink>
              ) : null}
              <ButtonLink href="/challenges" variant="secondary">
                All OpenDC
              </ButtonLink>
            </div>
          </div>
          <div className="page-hero-visual">
            <figure className="detail-figure">
              <img
                alt={image.alt}
                className="detail-image"
                src={withBasePath(image.src)}
                style={{ objectPosition: image.position ?? 'center' }}
              />
              {image.caption ? (
                <figcaption className="detail-caption">{image.caption}</figcaption>
              ) : null}
            </figure>
          </div>
        </Container>
      </section>

      <section className="section">
        <Container className="detail-layout">
          <aside className="detail-sidebar">
            <div className="panel detail-summary">
              <span className="status-pill">{challenge.status}</span>
              <dl>
                <div>
                  <dt>Track</dt>
                  <dd>{challenge.track ?? challenge.category}</dd>
                </div>
                {challenge.detector_type ? (
                  <div>
                    <dt>Detector type</dt>
                    <dd>{challenge.detector_type}</dd>
                  </div>
                ) : null}
                {challenge.technical_method ? (
                  <div>
                    <dt>Technical method</dt>
                    <dd>{challenge.technical_method}</dd>
                  </div>
                ) : null}
                <div>
                  <dt>Technical area</dt>
                  <dd>{challenge.technical_area}</dd>
                </div>
                <div>
                  <dt>Metric</dt>
                  <dd>{challenge.metric?.label ?? challenge.metric_ids?.[0]}</dd>
                </div>
                {challenge.current_best ? (
                  <div>
                    <dt>{challenge.current_best.label}</dt>
                    <dd>{challenge.current_best.score}</dd>
                  </div>
                ) : null}
              </dl>
            </div>
          </aside>
          <div className="detail-main">
            {challenge.bodyHtml ? (
              <>
                <Script id="mathjax-config" strategy="afterInteractive">
                  {`window.MathJax = { tex: { inlineMath: [['$', '$'], ['\\\\(', '\\\\)']] } };`}
                </Script>
                <Script
                  id="mathjax-script"
                  src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js"
                  strategy="afterInteractive"
                />
              </>
            ) : null}

            {challenge.facts?.length ? (
              <div className="fact-grid">
                {challenge.facts.map((fact) => (
                  <div className="fact-card" key={fact.label}>
                    <span>{fact.label}</span>
                    <strong>{fact.value}</strong>
                  </div>
                ))}
              </div>
            ) : null}

            {challenge.bodyHtml ? (
              <article className="panel challenge-protocol-shell" id="protocol">
                <p className="eyebrow">Protocol</p>
                <div
                  className="challenge-protocol quarto-content"
                  dangerouslySetInnerHTML={{ __html: challenge.bodyHtml }}
                />
              </article>
            ) : challenge.sections?.length ? (
              <div className="section-stack">
                {challenge.sections.map((section) => (
                  <article className="text-panel" key={section.title}>
                    <h2 className="type-h3">{section.title}</h2>
                    <p>{section.body}</p>
                  </article>
                ))}
              </div>
            ) : (
              <article className="text-panel">
                <h2 className="type-h3">Protocol source</h2>
                <p>
                  This task has a protocol source file, but the public protocol
                  body has not been rendered yet.
                </p>
              </article>
            )}

            <article className="panel baseline-solution">
              <div>
                <p className="eyebrow">Baseline</p>
                <h2 className="type-h3">Baseline solution</h2>
                <p>
                  Repository location for the minimal reproducible script (MRS)
                  used to reproduce the baseline score for this task.
                </p>
              </div>
              {baselineHref ? (
                <ButtonLink href={baselineHref} variant="ghost">
                  View baseline source
                  <Icon name="arrow" size={14} />
                </ButtonLink>
              ) : (
                <span className="status-pill">MRS pending</span>
              )}
            </article>

            <article className="panel validation-panel">
              <div className="validation-panel-copy">
                <p className="eyebrow">Validation</p>
                <h2 className="type-h3">Validation</h2>
                <p>
                  Fetch the evaluation bundle for this dataset, then send an HDF5
                  submission shaped according to the dataset schema.
                </p>
                {validationSchemaHref ? (
                  <ButtonLink href={validationSchemaHref} variant="ghost">
                    Submission schema
                    <Icon name="arrow" size={14} />
                  </ButtonLink>
                ) : (
                  <span className="status-pill">Schema pending</span>
                )}
              </div>
              <pre aria-label="Validation commands"><code>{`opendc eval get ${validationDatasetId}
opendc eval send <submission.h5>`}</code></pre>
            </article>

            <article className="panel data-table-wrap">
              <div className="table-heading">
                <div>
                  <p className="eyebrow">Datasets</p>
                  <h2 className="type-h3">Dataset used by this task</h2>
                </div>
                <ButtonLink href="/data-hub" variant="ghost">
                  Data hub
                  <Icon name="arrow" size={14} />
                </ButtonLink>
              </div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Dataset</th>
                    <th>Status</th>
                    <th>Modality</th>
                  </tr>
                </thead>
                <tbody>
                  {datasets.map((dataset) => (
                    <tr key={dataset.id}>
                      <td>
                        <Link href={`/data-hub/${dataset.id}`}>{dataset.title}</Link>
                      </td>
                      <td>{dataset.status}</td>
                      <td>{dataset.modality}</td>
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
