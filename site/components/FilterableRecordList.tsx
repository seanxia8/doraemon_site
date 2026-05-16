'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/components/Icon';
import type { ChallengeImage } from '@/lib/doraemon-data';
import { withBasePath } from '@/lib/paths';

type FacetValue = string | string[];

export type FilterableRecord = {
  id: string;
  title: string;
  summary: string;
  status: string;
  eyebrow?: string;
  href: string;
  actionLabel: string;
  meta: string[];
  searchTerms: string[];
  facets: Record<string, FacetValue>;
  image?: ChallengeImage;
};

export type RecordFacet = {
  key: string;
  label: string;
  allLabel: string;
  values: string[];
};

type FilterableRecordListProps = {
  records: FilterableRecord[];
  facets: RecordFacet[];
  topFacetKey: string;
  topFacetLabel: string;
  topFacetAriaLabel: string;
  searchAriaLabel: string;
  searchPlaceholder: string;
  resultNounSingular: string;
  resultNounPlural: string;
};

const ALL_VALUES = 'All';

function flattenFacetValues(value: FacetValue | undefined) {
  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}

function recordMatchesFacet(record: FilterableRecord, key: string, activeValue: string) {
  return activeValue === ALL_VALUES || flattenFacetValues(record.facets[key]).includes(activeValue);
}

export function FilterableRecordList({
  records,
  facets,
  topFacetKey,
  topFacetLabel,
  topFacetAriaLabel,
  searchAriaLabel,
  searchPlaceholder,
  resultNounSingular,
  resultNounPlural,
}: FilterableRecordListProps) {
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [query, setQuery] = useState('');
  const topFacet = facets.find((facet) => facet.key === topFacetKey);
  const sidebarFacets = facets.filter((facet) => facet.key !== topFacetKey);
  const normalizedQuery = query.trim().toLocaleLowerCase();

  function recordMatchesQuery(record: FilterableRecord) {
    if (!normalizedQuery) {
      return true;
    }

    const searchableText = [
      record.title,
      record.summary,
      record.status,
      record.eyebrow,
      record.actionLabel,
      ...record.meta,
      ...record.searchTerms,
      ...Object.values(record.facets).flatMap(flattenFacetValues),
    ]
      .filter(Boolean)
      .join(' ')
      .toLocaleLowerCase();

    return searchableText.includes(normalizedQuery);
  }

  const visibleRecords = useMemo(() => {
    return records.filter(
      (record) =>
        recordMatchesQuery(record) &&
        facets.every((facet) =>
          recordMatchesFacet(record, facet.key, activeFilters[facet.key] ?? ALL_VALUES),
        ),
    );
  }, [activeFilters, facets, normalizedQuery, records]);

  function clearFilters() {
    setActiveFilters({});
    setQuery('');
  }

  function filterCount(facet: RecordFacet, value: string) {
    return records.filter((record) => {
      const nextFilters = {
        ...activeFilters,
        [facet.key]: value,
      };

      return (
        recordMatchesQuery(record) &&
        facets.every((candidateFacet) =>
          recordMatchesFacet(
            record,
            candidateFacet.key,
            nextFilters[candidateFacet.key] ?? ALL_VALUES,
          ),
        )
      );
    }).length;
  }

  const activeChips = facets
    .map((facet) => {
      const value = activeFilters[facet.key] ?? ALL_VALUES;
      return value === ALL_VALUES ? null : { ...facet, value };
    })
    .filter((chip): chip is RecordFacet & { value: string } => Boolean(chip));
  const resultLabel =
    visibleRecords.length === 1 ? resultNounSingular : resultNounPlural;

  return (
    <div className="challenge-browser">
      {topFacet ? (
        <nav
          className="challenge-detector-strip"
          aria-label={topFacetAriaLabel}
        >
          <span>{topFacetLabel}</span>
          <div className="challenge-detector-tabs">
            {[ALL_VALUES, ...topFacet.values].map((value) => {
              const label = value === ALL_VALUES ? topFacet.allLabel : value;
              const isActive = (activeFilters[topFacet.key] ?? ALL_VALUES) === value;
              const count = filterCount(topFacet, value);

              return (
                <button
                  aria-label={`${label} (${count})`}
                  aria-pressed={isActive}
                  className="challenge-detector-tab"
                  key={value}
                  onClick={() =>
                    setActiveFilters((current) => ({
                      ...current,
                      [topFacet.key]: value,
                    }))
                  }
                  type="button"
                >
                  <span>{label}</span>
                  <small>{count}</small>
                </button>
              );
            })}
          </div>
        </nav>
      ) : null}

      <div className="challenge-browser-body">
        <aside className="challenge-filter-rail">
          <div className="challenge-filter-rail-heading">
            <strong>Filter by</strong>
            <button onClick={clearFilters} type="button">
              Clear all filters
            </button>
          </div>
          {sidebarFacets.map((facet) => (
            <fieldset className="challenge-filter-group" key={facet.key}>
              <legend>{facet.label}</legend>
              {[ALL_VALUES, ...facet.values].map((value) => {
                const label = value === ALL_VALUES ? facet.allLabel : value;
                const count = filterCount(facet, value);

                return (
                  <label className="challenge-filter-option" key={value}>
                    <input
                      checked={(activeFilters[facet.key] ?? ALL_VALUES) === value}
                      name={facet.key}
                      onChange={() =>
                        setActiveFilters((current) => ({
                          ...current,
                          [facet.key]: value,
                        }))
                      }
                      type="radio"
                    />
                    <span>{label}</span>
                    <span>{count}</span>
                  </label>
                );
              })}
            </fieldset>
          ))}
        </aside>

        <div className="challenge-results">
          <div className="challenge-search-row">
            <div className="challenge-search-field">
              <input
                aria-label={searchAriaLabel}
                autoComplete="off"
                onChange={(event) => setQuery(event.currentTarget.value)}
                placeholder={searchPlaceholder}
                type="search"
                value={query}
              />
              {query ? (
                <button
                  aria-label={`Clear ${resultNounSingular} search`}
                  onClick={() => setQuery('')}
                  type="button"
                >
                  x
                </button>
              ) : null}
            </div>
            <button className="challenge-clear-button" onClick={clearFilters} type="button">
              Clear filters
            </button>
          </div>
          <div className="challenge-results-header">
            <p>
              Search results: {visibleRecords.length} {resultLabel}.
            </p>
            {activeChips.length ? (
              <div className="challenge-active-filters" aria-label="Active filters">
                {activeChips.map((chip) => (
                  <button
                    key={chip.key}
                    onClick={() =>
                      setActiveFilters((current) => ({
                        ...current,
                        [chip.key]: ALL_VALUES,
                      }))
                    }
                    type="button"
                  >
                    {chip.value}
                    <span aria-hidden="true">x</span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="record-list">
            {visibleRecords.map((record) => (
              <Link
                className={`panel record-row record-row-link${record.image ? '' : ' record-row-no-image'}`}
                href={record.href}
                key={record.id}
              >
                {record.image ? (
                  <span className="record-row-image-link">
                    <img
                      alt=""
                      className="record-row-image"
                      src={withBasePath(record.image.src)}
                      style={{ objectPosition: record.image.position ?? 'center' }}
                    />
                  </span>
                ) : null}
                <div className="record-row-main">
                  {record.eyebrow ? (
                    <div className="record-card-top">
                      <span>{record.eyebrow}</span>
                    </div>
                  ) : null}
                  <h2 className="type-h3">{record.title}</h2>
                  <p>{record.summary}</p>
                  <div className="record-meta">
                    {record.meta.map((item, index) => (
                      <span key={`${record.id}-${index}`}>{item}</span>
                    ))}
                  </div>
                </div>
                <div className="record-row-actions">
                  <span className="status-pill">{record.status}</span>
                  <span className="button button-ghost" aria-hidden="true">
                    {record.actionLabel}
                    <Icon name="arrow" size={14} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
