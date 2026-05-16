from __future__ import annotations

import argparse
import re
from pathlib import Path
from typing import Any

import yaml


ROOT = Path(__file__).resolve().parents[1]
SLUG_RE = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
FRONTMATTER_RE = re.compile(r"^---\r?\n(.*?)\r?\n---(?:\r?\n|$)(.*)", flags=re.S)


def title_from_slug(slug: str) -> str:
    return " ".join(part.capitalize() for part in slug.replace("_", "-").split("-"))


def split_values(values: list[str]) -> list[str]:
    result: list[str] = []
    for value in values:
        result.extend(part.strip() for part in value.split(",") if part.strip())
    return result


def validate_slug(slug: str, label: str) -> None:
    if not SLUG_RE.match(slug):
        raise SystemExit(
            f"{label} must use lowercase letters, numbers, and hyphens: {slug!r}"
        )


def qmd_text(metadata: dict[str, Any], body: str) -> str:
    yaml_text = yaml.safe_dump(metadata, sort_keys=False, allow_unicode=False).strip()
    return f"---\n{yaml_text}\n---\n\n{body.strip()}\n"


def write_qmd(path: Path, metadata: dict[str, Any], body: str, force: bool) -> None:
    if path.exists() and not force:
        raise SystemExit(f"{path.relative_to(ROOT)} already exists. Use --force to overwrite it.")

    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(qmd_text(metadata, body), encoding="utf-8")
    print(f"Created {path.relative_to(ROOT)}")


def load_qmd(path: Path) -> tuple[dict[str, Any], str]:
    source = path.read_text(encoding="utf-8")
    match = FRONTMATTER_RE.match(source)
    if not match:
        raise SystemExit(f"{path.relative_to(ROOT)} is missing YAML front matter")

    metadata = yaml.safe_load(match.group(1))
    if not isinstance(metadata, dict):
        raise SystemExit(f"{path.relative_to(ROOT)} front matter must be a mapping")

    return metadata, match.group(2).lstrip()


def sync_list_field(path: Path, field_name: str, value: str) -> None:
    metadata, body = load_qmd(path)
    existing = metadata.get(field_name, [])
    if existing is None:
        existing = []
    if not isinstance(existing, list):
        raise SystemExit(f"{path.relative_to(ROOT)} field {field_name!r} must be a list")

    if value in existing:
        return

    metadata[field_name] = [*existing, value]
    path.write_text(qmd_text(metadata, body), encoding="utf-8")
    print(f"Updated {path.relative_to(ROOT)}: added {value!r} to {field_name}")


def require_related(path: Path, label: str, allow_missing: bool) -> bool:
    if path.exists():
        return True

    message = f"{label} does not exist: {path.relative_to(ROOT)}"
    if allow_missing:
        print(f"Warning: {message}")
        return False
    raise SystemExit(f"{message}. Create it first or pass --allow-missing-related.")


def challenge_metadata(args: argparse.Namespace, dataset_ids: list[str]) -> dict[str, Any]:
    title = args.title or title_from_slug(args.id)
    detector_type = args.detector_type or "TODO detector type"
    technical_method = args.technical_method or "TODO technical method"
    category = args.category or "TODO category"
    technical_area = args.technical_area or "TODO technical area"
    metric = args.metric or "TODO metric"

    return {
        "id": args.id,
        "order": args.order,
        "title": title,
        "short_title": args.short_title or title,
        "status": args.status,
        "summary": args.summary or f"TODO: describe the benchmark task for {title}.",
        "category": category,
        "technical_area": technical_area,
        "physics_area": args.physics_area or "TODO physics area",
        "detector_type": detector_type,
        "technical_method": technical_method,
        "track": args.track or "TODO track",
        "label": "Open Dataset Challenge",
        "datasets": dataset_ids,
        "metrics": [metric],
        "metric": {
            "label": args.metric_label or title_from_slug(metric),
            "goal": args.metric_goal,
            "documentation": args.metric_docs,
        },
        "facts": [
            {"label": "Category", "value": category},
            {"label": "Detector type", "value": detector_type},
            {"label": "Technical method", "value": technical_method},
            {"label": "Timeframe", "value": "Protocol pending"},
            {"label": "Dataset type", "value": "TODO dataset type"},
            {"label": "Challenge type", "value": "Open dataset benchmark"},
            {"label": "Technical problem", "value": technical_area},
        ],
        "links": {
            "docs": None,
            "baseline": None,
            "leaderboard": None,
        },
        "bibliography": "../../bibliography.bib",
        "format": {
            "html": {
                "toc": True,
                "number-sections": False,
                "html-math-method": "mathjax",
            }
        },
    }


def challenge_body(title: str) -> str:
    return f"""## Scope

TODO: Explain what {title} measures, what inputs are allowed, and what outputs participants submit.

## Protocol needs

TODO: Define the train, validation, and hold-out splits. State the baseline, metric, and any detector-response assumptions.

## Leaderboard

TODO: Describe when submissions open, how validation is run, and what reproducibility information is required.
"""


def dataset_metadata(args: argparse.Namespace, used_by: list[str]) -> dict[str, Any]:
    title = args.title or title_from_slug(args.id)
    modality = args.modality or "TODO modality"
    data_format = args.data_format or "TODO data format"

    return {
        "id": args.id,
        "order": args.order,
        "title": title,
        "status": args.status,
        "summary": args.summary or f"TODO: describe the dataset record for {title}.",
        "modality": modality,
        "version": args.version,
        "data_format": data_format,
        "access": {
            "type": args.access_type,
            "url": None,
        },
        "schema_doc": "schema.md",
        "example_paths": [],
        "facts": [
            {"label": "Status", "value": title_from_slug(args.status)},
            {"label": "Modality", "value": data_format},
            {"label": "Version", "value": args.version},
            {"label": "Access", "value": title_from_slug(args.access_type)},
        ],
        "used_by": used_by,
        "links": {
            "docs": None,
            "schema": None,
        },
        "bibliography": "../../bibliography.bib",
        "format": {
            "html": {
                "toc": True,
                "number-sections": False,
                "html-math-method": "mathjax",
            }
        },
    }


def dataset_body(dataset_id: str, title: str) -> str:
    return f"""## Record status

TODO: Explain what {title} contains and which benchmark tasks it supports.

## Access

The intended package command is:

```bash
pimm-data save {dataset_id}
```

TODO: Replace this placeholder when public access is ready.

## Schema notes

TODO: Describe record fields, split names, labels or targets, and example loading code.
"""


def schema_body(dataset_id: str) -> str:
    return f"""# {title_from_slug(dataset_id)} Schema

TODO: Define the dataset fields, dtypes, coordinate conventions, target labels, and split names.
"""


def scaffold_challenge(args: argparse.Namespace) -> None:
    validate_slug(args.id, "challenge id")
    dataset_ids = split_values(args.dataset)
    if not dataset_ids:
        raise SystemExit("At least one --dataset value is required.")

    for dataset_id in dataset_ids:
        validate_slug(dataset_id, "dataset id")

    existing_dataset_paths: list[Path] = []
    for dataset_id in dataset_ids:
        dataset_path = ROOT / "datasets" / dataset_id / "dataset.qmd"
        if require_related(dataset_path, f"Dataset {dataset_id!r}", args.allow_missing_related):
            existing_dataset_paths.append(dataset_path)

    path = ROOT / "challenges" / args.id / "challenge.qmd"
    metadata = challenge_metadata(args, dataset_ids)
    write_qmd(path, metadata, challenge_body(metadata["title"]), args.force)

    if not args.no_sync_related:
        for dataset_path in existing_dataset_paths:
            sync_list_field(dataset_path, "used_by", args.id)


def scaffold_dataset(args: argparse.Namespace) -> None:
    validate_slug(args.id, "dataset id")
    used_by = split_values(args.used_by)
    for challenge_id in used_by:
        validate_slug(challenge_id, "challenge id")

    existing_challenge_paths: list[Path] = []
    for challenge_id in used_by:
        challenge_path = ROOT / "challenges" / challenge_id / "challenge.qmd"
        if require_related(challenge_path, f"Challenge {challenge_id!r}", args.allow_missing_related):
            existing_challenge_paths.append(challenge_path)

    dataset_dir = ROOT / "datasets" / args.id
    metadata = dataset_metadata(args, used_by)
    write_qmd(dataset_dir / "dataset.qmd", metadata, dataset_body(args.id, metadata["title"]), args.force)

    schema_path = dataset_dir / "schema.md"
    if not schema_path.exists() or args.force:
        schema_path.write_text(schema_body(args.id), encoding="utf-8")
        print(f"Created {schema_path.relative_to(ROOT)}")

    if not args.no_sync_related:
        for challenge_path in existing_challenge_paths:
            sync_list_field(challenge_path, "datasets", args.id)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Create editable QMD templates for DORAEMON challenge and dataset records."
    )
    subparsers = parser.add_subparsers(dest="record_type", required=True)

    common_options = argparse.ArgumentParser(add_help=False)
    common_options.add_argument("id", help="Record id, e.g. lartpc-fm-v2.")
    common_options.add_argument("--title", help="Display title. Defaults to a title-cased id.")
    common_options.add_argument("--summary", help="One-sentence summary.")
    common_options.add_argument("--order", type=int, default=100, help="Display order. Default: 100.")
    common_options.add_argument("--force", action="store_true", help="Overwrite an existing record file.")
    common_options.add_argument(
        "--allow-missing-related",
        action="store_true",
        help="Allow references to challenge or dataset ids that do not exist yet.",
    )
    common_options.add_argument(
        "--no-sync-related",
        action="store_true",
        help="Do not update reciprocal challenge.datasets or dataset.used_by fields.",
    )

    challenge = subparsers.add_parser("challenge", parents=[common_options])
    challenge.add_argument("--dataset", action="append", default=[], help="Dataset id. Repeat or comma-separate.")
    challenge.add_argument("--status", choices=["planned", "active"], default="planned")
    challenge.add_argument("--short-title")
    challenge.add_argument("--category")
    challenge.add_argument("--technical-area")
    challenge.add_argument("--physics-area")
    challenge.add_argument("--detector-type")
    challenge.add_argument("--technical-method")
    challenge.add_argument("--track")
    challenge.add_argument("--metric", default="todo-metric")
    challenge.add_argument("--metric-label")
    challenge.add_argument("--metric-goal", choices=["Maximize", "Minimize"], default="Maximize")
    challenge.add_argument("--metric-docs", default="/documentation/metrics.html")
    challenge.set_defaults(func=scaffold_challenge)

    dataset = subparsers.add_parser("dataset", parents=[common_options])
    dataset.add_argument("--status", choices=["planned", "draft", "released", "deprecated"], default="planned")
    dataset.add_argument("--modality")
    dataset.add_argument("--version", default="v0")
    dataset.add_argument("--data-format")
    dataset.add_argument("--access-type", default="pending")
    dataset.add_argument("--used-by", action="append", default=[], help="Challenge id. Repeat or comma-separate.")
    dataset.set_defaults(func=scaffold_dataset)

    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()
    args.func(args)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
