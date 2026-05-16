import type { Metadata } from 'next';
import { ButtonLink, Container, PageHero, SectionHeader } from '@/components/UI';
import { FilterableRecordList } from '@/components/FilterableRecordList';
import { getChallengesForDataset, getDatasets } from '@/lib/doraemon-data';

export const metadata: Metadata = {
  title: 'Data Hub',
};

const detectorLabels: Record<string, string> = {
  icecube: 'IceCube',
  lartpc: 'LArTPC',
  'mixed-detector': 'Cross-detector',
  'water-cherenkov': 'Water Cherenkov',
};

const facetOrders: Record<string, string[]> = {
  detector_type: ['LArTPC', 'Water Cherenkov', 'IceCube', 'Cross-detector'],
  status: ['released', 'draft', 'planned', 'deprecated'],
  access: ['open', 'restricted', 'pending'],
};

function detectorLabel(modality?: string) {
  if (!modality) {
    return 'Unspecified';
  }

  return detectorLabels[modality] ?? modality;
}

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

export default function DataHubPage() {
  const datasets = getDatasets();
  const datasetCards = datasets.map((dataset) => {
    const challenges = getChallengesForDataset(dataset.id);
    const detectorType = detectorLabel(dataset.modality);
    const accessType = dataset.access?.type ?? 'pending';
    const relatedChallengeLabels = challenges.map(
      (challenge) => challenge.short_title ?? challenge.title,
    );

    return {
      id: dataset.id,
      title: dataset.title,
      summary: dataset.summary,
      status: dataset.status,
      facets: {
        detector_type: detectorType,
        status: dataset.status,
        access: accessType,
      },
      href: `/data-hub/${dataset.id}`,
      eyebrow: dataset.modality,
      actionLabel: 'Open dataset',
      meta: [
        detectorType,
        dataset.version,
        dataset.format,
        accessType,
        relatedChallengeLabels.length
          ? `Used by ${relatedChallengeLabels.join(', ')}`
          : 'No linked tasks',
      ].filter((item): item is string => Boolean(item)),
      searchTerms: [
        dataset.id,
        dataset.modality,
        dataset.schema_doc,
        dataset.access?.url,
        ...relatedChallengeLabels,
      ].filter((item): item is string => Boolean(item)),
    };
  });
  const facets = [
    {
      key: 'detector_type',
      label: 'Detector',
      allLabel: 'All detectors',
      values: sortFacetValues(
        'detector_type',
        Array.from(new Set(datasetCards.map((dataset) => dataset.facets.detector_type))),
      ),
    },
    {
      key: 'status',
      label: 'Status',
      allLabel: 'All statuses',
      values: sortFacetValues(
        'status',
        Array.from(new Set(datasetCards.map((dataset) => dataset.facets.status))),
      ),
    },
    {
      key: 'access',
      label: 'Access',
      allLabel: 'All access states',
      values: sortFacetValues(
        'access',
        Array.from(new Set(datasetCards.map((dataset) => dataset.facets.access))),
      ),
    },
  ];

  return (
    <>
      <PageHero
        actions={
          <>
            <ButtonLink href="/documentation/records.html">
              Record guide
            </ButtonLink>
            <ButtonLink href="/documentation/dataset-lartpc-fm-v1-schema.html" variant="secondary">
              Schema notes
            </ButtonLink>
          </>
        }
        body="Public or planned samples, formats, access status, and links to the tasks that use them."
        eyebrow="Data Hub"
        title="Dataset records for OpenDC."
      />
      <section className="section">
        <Container>
          <SectionHeader
            eyebrow="Datasets"
            title="Public dataset records."
            body="Each record says what detector sample it describes, how to access it, and which task uses it."
          />
          <FilterableRecordList
            facets={facets}
            records={datasetCards}
            resultNounPlural="datasets"
            resultNounSingular="dataset"
            searchAriaLabel="Search datasets"
            searchPlaceholder="Search by dataset, detector, format, or task"
            topFacetAriaLabel="Search datasets by detector"
            topFacetKey="detector_type"
            topFacetLabel="Search by detector:"
          />
        </Container>
      </section>
    </>
  );
}
