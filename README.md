# DORAEMON Site

This repo contains the static public website for the DORAEMON open dataset challenge.

Website app: `site/`. Documentation source: `documentation/`. Challenge and dataset records: Quarto files in `challenges/` and `datasets/`.

## Where To Edit

| I want to edit | Go here |
| --- | --- |
| Public website app | `site/` |
| General documentation | `documentation/` |
| Getting started and maintenance docs | `documentation/getting-started/` |
| Physics notes | `documentation/physics/` |
| Challenge rules or metrics | `documentation/opendc/` |
| Software notes | `documentation/software/` |
| Challenge metadata and protocol | `challenges/<challenge-id>/challenge.qmd`; see `documentation/getting-started/records.qmd` for the editing model |
| Dataset metadata and notes | `datasets/<dataset-id>/dataset.qmd`; see `documentation/getting-started/records.qmd` for the editing model |
| Dataset schema notes | `documentation/datasets/` |
| Updates/news articles | `content/updates/*.yml` |
| Software repository cards | `content/software/repositories.yml` |

## Adding Documentation

Add a `.qmd` file under the relevant `documentation/` subdirectory, then add the file path to `documentation/_quarto.yml` for the documentation sidebar.

```text
documentation/physics/my-page.qmd
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

Static routes are generated from `challenges/*/challenge.qmd` and `datasets/*/dataset.qmd`: `/challenges`, `/challenges/<id>`, `/data-hub`, and `/data-hub/<id>`. Use the `order` field in front matter to control display order. Structured metadata goes in YAML front matter; links, citations, and math go in the Quarto body.

You can scaffold a new editable record with:

```sh
make new-dataset ID=my-dataset TITLE="My Dataset"
make new-challenge ID=my-challenge DATASET=my-dataset TITLE="My Challenge"
```

The scaffold commands create QMD templates with the fields required by validation. When a related record already exists, the script also updates the reciprocal relationship (`challenge.datasets` and `dataset.used_by`) so `make validate` catches real mismatches instead of routine bookkeeping.

Useful optional variables include `SUMMARY`, `ORDER`, `STATUS`, `MODALITY`, `DATA_FORMAT`, `DETECTOR_TYPE`, `TECHNICAL_AREA`, `TECHNICAL_METHOD`, and `METRIC`.

These record QMDs are the canonical source for status, summaries, datasets, access commands, baselines, validation details, and record-specific prose. Shared definitions: relevant `documentation/` subdirectory, linked from the record.

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
summary: Short sentence for update pages and the RSS feed.
body:
  - First paragraph.
  - Second paragraph.
```

Used for `/updates`, `/updates/<slug>`, the homepage latest-news section, and the RSS feed.

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

Card color and icon are set by the `categories` map at the top of `content/software/repositories.yml`. Current categories are `Training`, `Evaluation`, and `Datasets`.

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

`make documentation` renders the Quarto book under `documentation/`, then applies `scripts/renumber_documentation.py` so generated section numbers match the public documentation grouping across nested documentation folders.

`make record-pages` renders challenge and dataset QMD records with Quarto, writes full HTML copies to `site/public/`, and extracts embeddable fragments into `site/.generated/`. Fragment extraction uses Python's standard HTML parser for the Quarto document body. The documentation renumbering pass is still a narrow post-processing step over Quarto HTML, so changes to Quarto's generated numbering markup should be checked with `make documentation`.
