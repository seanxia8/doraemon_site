import fs from 'fs';
import path from 'path';
import { parse } from 'yaml';

type RecordSource = {
  filePath: string;
  relativePath: string;
};

type OrderedRecord = {
  id: string;
  title: string;
  order?: number;
};

export type Fact = {
  label: string;
  value: string;
};

export type DetailSection = {
  title: string;
  body: string;
};

export type ChallengeImage = {
  src: string;
  alt: string;
  position?: string;
  caption?: string;
};

export type ChallengeRecord = OrderedRecord & {
  status: string;
  category?: string;
  technical_area?: string;
  physics_area?: string;
  detector_type?: string;
  technical_method?: string;
  short_title?: string;
  summary: string;
  track?: string;
  label?: string;
  datasets?: string[];
  dataset_ids: string[];
  metrics?: string[];
  metric_ids: string[];
  metric?: {
    label: string;
    goal: string;
    documentation?: string;
  };
  image?: ChallengeImage;
  hero_image?: ChallengeImage;
  current_best?: {
    label: string;
    score: string;
  };
  facts?: Fact[];
  sections?: DetailSection[];
  bodyHtml?: string;
  links?: Record<string, string | null>;
  path: string;
};

export type DatasetRecord = OrderedRecord & {
  status: string;
  summary: string;
  modality: string;
  version?: string;
  data_format?: string;
  format?: string;
  access?: {
    type: string;
    url?: string | null;
  };
  schema_doc?: string;
  example_paths?: string[];
  facts?: Fact[];
  used_by?: string[];
  bodyHtml?: string;
  links?: Record<string, string | null>;
  path: string;
};

const repoRoot =
  path.basename(process.cwd()) === 'site' ? path.resolve(process.cwd(), '..') : process.cwd();

function readQmdFrontMatter<T>(filePath: string): T {
  const source = fs.readFileSync(filePath, 'utf8');
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);

  if (!match) {
    throw new Error(`${filePath} is missing YAML front matter`);
  }

  return parse(match[1]) as T;
}

function recordSources(directory: 'challenges' | 'datasets', filename: string): RecordSource[] {
  const root = path.join(repoRoot, directory);
  if (!fs.existsSync(root)) {
    return [];
  }

  return fs
    .readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const relativePath = `${directory}/${entry.name}`;
      return {
        filePath: path.join(root, entry.name, filename),
        relativePath,
      };
    })
    .filter((entry) => fs.existsSync(entry.filePath));
}

function sortRecords<T extends OrderedRecord>(records: T[]) {
  return records.sort((a, b) => {
    const orderDelta = (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER);
    if (orderDelta !== 0) return orderDelta;
    return a.title.localeCompare(b.title) || a.id.localeCompare(b.id);
  });
}

function readGeneratedBody(kind: 'challenge-protocols' | 'dataset-records', id: string) {
  const generatedPath = path.join(repoRoot, `site/.generated/${kind}`, `${id}.html`);

  if (!fs.existsSync(generatedPath)) {
    return undefined;
  }

  return fs.readFileSync(generatedPath, 'utf8');
}

function loadChallenge(source: RecordSource): ChallengeRecord {
  const detail = readQmdFrontMatter<Omit<ChallengeRecord, 'dataset_ids' | 'metric_ids' | 'path'>>(
    source.filePath,
  );

  return {
    ...detail,
    dataset_ids: detail.datasets ?? [],
    metric_ids: detail.metrics ?? [],
    bodyHtml: readGeneratedBody('challenge-protocols', detail.id),
    path: source.relativePath,
  };
}

function loadDataset(source: RecordSource): DatasetRecord {
  const detail = readQmdFrontMatter<Omit<DatasetRecord, 'path'>>(source.filePath);
  return {
    ...detail,
    format: detail.data_format ?? detail.format,
    bodyHtml: readGeneratedBody('dataset-records', detail.id),
    path: source.relativePath,
  };
}

export function getChallenges() {
  return sortRecords(recordSources('challenges', 'challenge.qmd').map(loadChallenge));
}

export function getChallenge(id: string) {
  return getChallenges().find((challenge) => challenge.id === id);
}

export function getDatasets() {
  return sortRecords(recordSources('datasets', 'dataset.qmd').map(loadDataset));
}

export function getDataset(id: string) {
  return getDatasets().find((dataset) => dataset.id === id);
}

export function getDatasetsByIds(ids: string[] = []) {
  const datasets = getDatasets();
  return ids
    .map((id) => datasets.find((dataset) => dataset.id === id))
    .filter((dataset): dataset is DatasetRecord => Boolean(dataset));
}

export function getChallengesByIds(ids: string[] = []) {
  const challenges = getChallenges();
  return ids
    .map((id) => challenges.find((challenge) => challenge.id === id))
    .filter((challenge): challenge is ChallengeRecord => Boolean(challenge));
}

export function getChallengesForDataset(datasetId: string) {
  return getChallenges().filter((challenge) => challenge.dataset_ids.includes(datasetId));
}
