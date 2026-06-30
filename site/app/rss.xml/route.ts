import { buildUpdatesRss, rssHeaders } from '@/lib/rss';

export const dynamic = 'force-static';

export function GET() {
  return new Response(buildUpdatesRss(), {
    headers: rssHeaders,
  });
}
