import type { Metadata } from 'next';
import { createElement } from 'react';
import { ButtonLink, Container, PageHero, SectionHeader } from '@/components/UI';
import { FilterableRecordList } from '@/components/FilterableRecordList';
import { getChallenges, getDatasetsByIds } from '@/lib/doraemon-data';
import { getChallengeImage } from '@/lib/challenge-images';

export const metadata: Metadata = {
  title: 'OpenDC',
};

const facetOrders: Record<string, string[]> = {
  detector_type: ['LArTPC', 'Water Cherenkov', 'IceCube', 'Cross-detector'],
  technical_method: [
    'Computer vision',
    'Representation learning',
    'Statistics',
    'Unfolding',
  ],
};

function sortFacetValues(key: string, values: string[]) {
  const order = facetOrders[key] ?? [];
  return values.sort((first, second) => {
    const firstIndex = order.indexOf(first);
    const secondIndex = order.indexOf(second);

    if (firstIndex !== -1 || secondIndex !== -1) {
      return (
        (firstIndex === -1 ? Number.MAX_SAFE_INTEGER : firstIndex) -
        (secondIndex === -1 ? Number.MAX_SAFE_INTEGER : secondIndex)
      );
    }

    return first.localeCompare(second);
  });
}

function WcCherenkovDisplay() {
  return (
    <div
      aria-hidden="true"
      className="wc-cherenkov-shell"
    >
      {createElement(
        'wc-cherenkov',
        {
          fps: '25',
          rotation: '18',
        },
        <pre aria-hidden="true" className="ascii-lartpc-fallback" />,
      )}
    </div>
  );
}

export default function ChallengesPage() {
  const challenges = getChallenges();
  const challengeCards = challenges.map((challenge) => {
    const datasets = getDatasetsByIds(challenge.dataset_ids ?? []);
    const detectorType = challenge.detector_type ?? 'Unspecified';
    const technicalMethod = challenge.technical_method ?? 'Unspecified';

    return {
      id: challenge.id,
      title: challenge.title,
      summary: challenge.summary,
      status: challenge.status,
      track: challenge.track,
      category: challenge.category,
      metricLabel: challenge.metric?.label ?? challenge.metric_ids?.[0],
      datasetTitles: datasets.map((dataset) => dataset.title),
      facets: {
        detector_type: detectorType,
        technical_method: technicalMethod,
      },
      href: `/challenges/${challenge.id}`,
      eyebrow: challenge.track ?? challenge.category,
      actionLabel: 'Open task',
      meta: [
        detectorType,
        technicalMethod,
        challenge.metric?.label ?? challenge.metric_ids?.[0],
        datasets.map((dataset) => dataset.title).join(', '),
      ].filter((item): item is string => Boolean(item)),
      searchTerms: [
        challenge.track,
        challenge.category,
        challenge.metric?.label,
        challenge.metric_ids?.join(' '),
        ...datasets.map((dataset) => dataset.title),
      ].filter((item): item is string => Boolean(item)),
      image: getChallengeImage(challenge),
    };
  });
  const facets = [
    {
      key: 'detector_type',
      label: 'Detector',
      allLabel: 'All detectors',
      values: sortFacetValues(
        'detector_type',
        Array.from(
          new Set(challengeCards.map((challenge) => challenge.facets.detector_type)),
        ),
      ),
    },
    {
      key: 'technical_method',
      label: 'Method',
      allLabel: 'All methods',
      values: sortFacetValues(
        'technical_method',
        Array.from(
          new Set(
            challengeCards.map((challenge) => challenge.facets.technical_method),
          ),
        ),
      ),
    },
  ];

  return (
    <>
      <PageHero
        className="opendc-hero"
        actions={
          <>
            <ButtonLink href="/documentation/challenge-reference.html">
              Challenge documentation
            </ButtonLink>
            {/* <ButtonLink href="/documentation/metrics.html" variant="secondary">
              Metrics
            </ButtonLink> */}
          </>
        }
        body="Tasks for comparing AI methods on shared neutrino-detector datasets."
        eyebrow="OpenDC"
        title="Open Data Challenges"
        titleClassName="open-dc-title"
        visual={<WcCherenkovDisplay />}
      />
      <section className="section">
        <Container>
          <SectionHeader
            eyebrow="Tasks"
            title="Public OpenDC index."
            body="Browse planned and active tasks by detector type and method."
          />
          <FilterableRecordList
            facets={facets}
            records={challengeCards}
            resultNounPlural="tasks"
            resultNounSingular="task"
            searchAriaLabel="Search OpenDC tasks"
            searchPlaceholder="Search by task, detector, dataset, or method"
            topFacetAriaLabel="Search OpenDC tasks by detector"
            topFacetKey="detector_type"
            topFacetLabel="Search by detector:"
          />
        </Container>
      </section>
    </>
  );
}
