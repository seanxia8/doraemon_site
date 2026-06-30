import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { UpdateSignup } from '@/components/UpdateSignup';
import { ButtonLink } from '@/components/UI';
import { Icon } from '@/components/Icon';
import { getUpdate, getUpdates } from '@/lib/content-data';

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  const updateItems = getUpdates();
  return updateItems.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getUpdate(slug);

  return {
    title: article?.title ?? 'Update',
    description: article?.summary,
  };
}

export default async function UpdateArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const updateItems = getUpdates();
  const article = updateItems.find((item) => item.slug === slug);
  if (!article) notFound();

  const index = updateItems.findIndex((item) => item.slug === article.slug);
  const previous = updateItems[index + 1];
  const next = updateItems[index - 1];

  return (
    <div className="article-shell">
      <article>
        <header className="panel article-card article-title-card">
          <p className="eyebrow">
            {article.category} / {article.date}
          </p>
          <h1 className="type-h1">{article.title}</h1>
          <p className="article-lede">{article.summary}</p>
        </header>

        <div className="panel article-card article-body-card">
          <div className="article-body">
            {article.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <nav className="article-nav article-nav-grid" aria-label="Article navigation">
            {previous ? (
              <ButtonLink href={`/updates/${previous.slug}`} variant="secondary">
                <Icon name="arrowLeft" size={14} />
                {previous.title}
              </ButtonLink>
            ) : <span />}
            {next ? (
              <ButtonLink href={`/updates/${next.slug}`} variant="secondary">
                {next.title}
                <Icon name="arrow" size={14} />
              </ButtonLink>
            ) : <span />}
            <ButtonLink href="/updates" variant="secondary">
              Back to updates
            </ButtonLink>
          </nav>
        </div>
      </article>
      <div className="panel article-card">
        <UpdateSignup />
      </div>
    </div>
  );
}
