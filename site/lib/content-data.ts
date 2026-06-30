import fs from 'fs';
import path from 'path';
import { parse } from 'yaml';

const repoRoot =
  path.basename(process.cwd()) === 'site' ? path.resolve(process.cwd(), '..') : process.cwd();

export type UpdateItem = {
  slug: string;
  date: string;
  datetime: string;
  category: string;
  title: string;
  summary: string;
  body: string[];
};

export type SoftwareRepository = {
  category: string;
  title: string;
  owner: string;
  body: string;
  href: string;
  accent: string;
  icon: string;
};

type SoftwareRepositorySource = {
  category: string;
  title: string;
  owner: string;
  body: string;
  href: string;
};

type SoftwareCategoryTheme = Pick<SoftwareRepository, 'accent' | 'icon'>;

function softwareThemeForCategory(
  category: string,
  categories: Record<string, SoftwareCategoryTheme>,
) {
  const theme = categories[category];

  if (!theme) {
    const categoryNames = Object.keys(categories).join(', ');
    throw new Error(`Unknown software category "${category}". Expected one of: ${categoryNames}.`);
  }

  return theme;
}

function softwareRepositoryFromSource(
  source: SoftwareRepositorySource,
  categories: Record<string, SoftwareCategoryTheme>,
): SoftwareRepository {
  return {
    ...source,
    ...softwareThemeForCategory(source.category, categories),
  };
}

function readYamlFile<T>(filePath: string): T {
  return parse(fs.readFileSync(filePath, 'utf8')) as T;
}

function contentPath(...segments: string[]) {
  return path.join(repoRoot, 'content', ...segments);
}

function ensureStringArray(value: unknown, label: string) {
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) {
    throw new Error(`${label} must be a list of strings`);
  }

  return value;
}

export function getUpdates() {
  const updatesRoot = contentPath('updates');

  if (!fs.existsSync(updatesRoot)) {
    return [];
  }

  return fs
    .readdirSync(updatesRoot)
    .filter((filename) => filename.endsWith('.yml') || filename.endsWith('.yaml'))
    .map((filename) => {
      const filePath = path.join(updatesRoot, filename);
      const item = readYamlFile<UpdateItem>(filePath);
      item.body = ensureStringArray(item.body, `${path.relative(repoRoot, filePath)} body`);
      return item;
    })
    .sort((a, b) => b.datetime.localeCompare(a.datetime) || a.title.localeCompare(b.title));
}

export function getUpdate(slug: string) {
  return getUpdates().find((item) => item.slug === slug);
}

export function getSoftwareRepositories() {
  const softwarePath = contentPath('software', 'repositories.yml');

  if (!fs.existsSync(softwarePath)) {
    return [];
  }

  const content = readYamlFile<{
    categories?: Record<string, SoftwareCategoryTheme>;
    repositories?: SoftwareRepositorySource[];
  }>(softwarePath);
  const categories = content.categories ?? {};
  return (content.repositories ?? []).map((repository) =>
    softwareRepositoryFromSource(repository, categories),
  );
}
