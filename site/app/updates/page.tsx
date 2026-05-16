import type { Metadata } from 'next';
import { Icon } from '@/components/Icon';
import { UpdateSignup } from '@/components/UpdateSignup';
import { ButtonLink, Container, SectionHeader } from '@/components/UI';
import { getUpdates } from '@/lib/content-data';

export const metadata: Metadata = {
  title: 'Updates',
};

export default function UpdatesPage() {
  const updateItems = getUpdates();

  return (
    <>
      <UpdateSignup />
      <section className="section">
        <Container>
          <div className="updates-list-header">
            <SectionHeader
              eyebrow="Updates"
              title="Updates and milestones."
            />
            <ButtonLink href="/rss.xml" variant="ghost">
              Feed
              <Icon name="rss" size={14} />
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
                  <h2 className="type-h3">{item.title}</h2>
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
