# DORAEMON Site

This repo contains the static public website for the DORAEMON open dataset challenge.

The public app lives in `site/`, documentation source lives in `documentation/`, and challenge and dataset records live in Quarto source at the repo root.

## Where To Edit

| I want to edit | Go here |
| --- | --- |
| Public website app | `site/` |
| General documentation | `documentation/` |
| Physics notes | `documentation/physics.qmd` and related `.qmd` files |
| Challenge rules or metrics | `documentation/challenge-reference.qmd`, `documentation/challenge-rules.qmd`, `documentation/metrics.qmd` |
| Challenge metadata and protocol | `challenges/<challenge-id>/challenge.qmd`; see `documentation/records.qmd` for the editing model |
| Dataset metadata and notes | `datasets/<dataset-id>/dataset.qmd`; see `documentation/records.qmd` for the editing model |
| Dataset schema notes | `documentation/dataset-*-schema.qmd` |
| Updates/news articles | `content/updates/*.yml` |
| Software repository cards | `content/software/repositories.yml` |

## Adding Documentation

Add a `.qmd` file under `documentation/`, then list it in `documentation/_quarto.yml` so it appears in the documentation sidebar.

```text
documentation/my-page.qmd
```

Start the file with:

```markdown
---
title: My Page
description: A short sentence about the page.
---

Write the page here.
```

Quarto renders documentation into `site/public/documentation/` during the build. That generated folder is intentionally ignored.

Documentation is for shared reference material: getting started, architecture, software, contribution notes, challenge rules, metrics, physics notes, and dataset schema notes. Do not create documentation pages that duplicate a single challenge or dataset record.

## Adding Dataset Or Challenge Metadata

For durable records, add or edit:

```text
challenges/<challenge-id>/challenge.qmd
datasets/<dataset-id>/dataset.qmd
```

The site discovers records by scanning `challenges/*/challenge.qmd` and `datasets/*/dataset.qmd`, then generates `/challenges`, `/challenges/<id>`, `/data-hub`, and `/data-hub/<id>` at static build time. Use the `order` field in front matter to control display order. Both challenge and dataset pages use YAML front matter for structured metadata, then render the Quarto body for links, citations, and math.

You can scaffold a new editable record with:

```sh
make new-dataset ID=my-dataset TITLE="My Dataset"
make new-challenge ID=my-challenge DATASET=my-dataset TITLE="My Challenge"
```

The scaffold commands create QMD templates with the fields required by validation. When a related record already exists, the script also updates the reciprocal relationship (`challenge.datasets` and `dataset.used_by`) so `make validate` catches real mismatches instead of routine bookkeeping.

Useful optional variables include `SUMMARY`, `ORDER`, `STATUS`, `MODALITY`, `DATA_FORMAT`, `DETECTOR_TYPE`, `TECHNICAL_AREA`, `TECHNICAL_METHOD`, and `METRIC`.

These record QMDs are the canonical source for status, summaries, datasets, access commands, baselines, validation details, and record-specific prose. Shared definitions should live in `documentation/` and be linked from the record.

## Adding Updates

Add one YAML file per article under `content/updates/`:

```text
content/updates/my-update.yml
```

Use this shape:

```yaml
slug: my-update
date: May 15, 2026
datetime: "2026-05-15"
category: Site
title: My update title
summary: One sentence shown on update lists and in the RSS feed.
body:
  - First paragraph.
  - Second paragraph.
```

The site uses these files for `/updates`, `/updates/<slug>`, the homepage latest-news section, and the RSS feed.

## Editing Software Cards

Edit `content/software/repositories.yml` to add, remove, or reorder repository cards on `/software`.

Each entry needs:

```yaml
- category: Training
  title: repository-name
  owner: GitHubOwner
  body: Short plain-language description.
  href: https://github.com/GitHubOwner/repository-name
```

The category defines the card color and icon through the `categories` map at the top of `content/software/repositories.yml`. Current categories are `Training`, `Evaluation`, and `Datasets`.

## Local Setup

Install the command-line tools:

```sh
node --version
yarn --version
uv --version
uvx --from quarto-cli quarto --version
```

The Makefile runs Quarto through `uvx --from quarto-cli`. GitHub Pages still uses the official Quarto setup action and passes `QUARTO=quarto` into the build. If you already have a system Quarto install, local builds can also use `make build QUARTO=quarto`.

Install the website packages:

```sh
yarn --cwd site install
```

## Local Checks

Run metadata validation:

```sh
make validate
```

Render documentation:

```sh
make documentation
```

Build the static site:

```sh
make site
```

Run the full build:

```sh
make build
```

Preview the exported site:

```sh
make serve
```

The deployed artifact is `site/out`.

## Build Internals

`make documentation` renders the Quarto book under `documentation/`, then applies `scripts/renumber_documentation.py` so generated section numbers match the public documentation grouping.

`make record-pages` renders challenge and dataset QMD records with Quarto, writes full HTML copies to `site/public/`, and extracts embeddable fragments into `site/.generated/`. Fragment extraction uses Python's standard HTML parser for the Quarto document body. The documentation renumbering pass is still a narrow post-processing step over Quarto HTML, so changes to Quarto's generated numbering markup should be checked with `make documentation`.
