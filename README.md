# DORAEMON Site

This repo contains the website for the DORAEMON open dataset challenge.

Most contributors should only need to edit Markdown-like text files. You do not need to know React, Next.js, or Fumadocs to add information.

## Where To Edit

| I want to edit | Go here |
| --- | --- |
| General documentation | `sites/docs/content/docs/` |
| Physics notes | `sites/docs/content/docs/physics/` |
| Challenge rules or metrics | `sites/docs/content/docs/challenge-reference/` |
| Challenge pages | `sites/docs/content/challenges/` |
| Dataset pages | `sites/docs/app/data-hub/` |
| Challenge metadata | `challenges/<challenge-id>/challenge.yml` |
| Dataset metadata | `datasets/<dataset-id>/dataset.yml` |

## Adding A Documentation Page

Add a `.mdx` file under `sites/docs/content/docs/`.

For example:

```text
sites/docs/content/docs/getting-started/my-page.mdx
```

Start the file with:

```mdx
---
title: My Page
description: A short sentence about the page.
---

Write the page here.
```

To add a nested documentation section, make a folder with:

```text
index.mdx
meta.json
```

The `meta.json` file controls the order of pages in the left sidebar.

## Adding A Challenge Page

Add a file under `sites/docs/content/challenges/`.

Copy an existing challenge file and change the text and metadata. The optional `order` field controls the order of cards on `/challenges`.

Challenge pages should link to shared explanations in Documentation instead of copying the same background text into every challenge.

## Adding Dataset Or Challenge Metadata

For durable records, add or edit:

```text
challenges/<challenge-id>/challenge.yml
datasets/<dataset-id>/dataset.yml
registry/challenges.yml
registry/datasets.yml
```

The registry files are simple lists. Add the new ID there so validation tools can find it.

## Local Checks

First, make sure the required command-line tools are installed:

```sh
node --version
yarn --version
uv --version
```

If `node` is missing, install Node.js LTS from:

```text
https://nodejs.org/
```

After Node.js is installed, install Yarn with:

```sh
npm install --global yarn
```

If `uv` is missing, install it with one of these:

macOS or Linux:

```sh
curl -LsSf https://astral.sh/uv/install.sh | sh
```

Windows PowerShell:

```powershell
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```

If you already use a package manager, these are also fine:

```sh
# macOS
brew install node
brew install yarn
brew install uv

# Windows
winget install OpenJS.NodeJS.LTS
winget install Yarn.Yarn
winget install astral-sh.uv
```

Then install the website packages:

```sh
yarn --cwd sites/docs install
```

Run this before opening a pull request:

```sh
make validate
make docs
```

Run this to preview the site locally:

```sh
make docs-serve
```

Then open the local URL printed by the command.

## Notes

- Documentation pages support normal Markdown.
- Math works with `$...$` and `$$...$$`.
- Images used by docs should usually live in `sites/docs/public/docs/`.
- The built website is static for now.
