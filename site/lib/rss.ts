import { getUpdates } from './content-data';
import { site } from './site-data';

function escapeXml(value: string) {
  return value.replace(/[<>&'"]/g, (character) => {
    switch (character) {
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '&':
        return '&amp;';
      case "'":
        return '&apos;';
      case '"':
        return '&quot;';
      default:
        return character;
    }
  });
}

function formatRssDate(date: string) {
  return new Date(`${date}T12:00:00.000Z`).toUTCString();
}

export function buildUpdatesRss() {
  const updateItems = getUpdates();
  const newestItem = updateItems[0];
  const lastBuildDate = newestItem
    ? formatRssDate(newestItem.datetime)
    : new Date().toUTCString();

  const items = updateItems
    .map((item) => {
      const link = `${site.url}/updates/${item.slug}/`;

      return `
    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
      <pubDate>${formatRssDate(item.datetime)}</pubDate>
      <category>${escapeXml(item.category)}</category>
      <description>${escapeXml(item.summary)}</description>
    </item>`;
    })
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(site.name)} Updates</title>
    <link>${escapeXml(`${site.url}/updates/`)}</link>
    <atom:link href="${escapeXml(`${site.url}/rss.xml`)}" rel="self" type="application/rss+xml" />
    <description>${escapeXml(site.description)}</description>
    <language>en-us</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>${items}
  </channel>
</rss>
`;
}

export const rssHeaders = {
  'Content-Type': 'application/rss+xml; charset=utf-8',
};
