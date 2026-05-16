from __future__ import annotations

import json
import re
from pathlib import Path

import yaml
from jsonschema import Draft202012Validator


ROOT = Path(__file__).resolve().parents[1]


def load_yaml(path: Path) -> object:
    with path.open("r", encoding="utf-8") as handle:
        return yaml.safe_load(handle)


def load_qmd_frontmatter(path: Path) -> tuple[object, str]:
    source = path.read_text(encoding="utf-8")
    match = re.match(r"^---\r?\n(.*?)\r?\n---(?:\r?\n|$)(.*)", source, flags=re.S)
    if not match:
        raise ValueError("missing YAML front matter")
    return yaml.safe_load(match.group(1)), match.group(2).strip()


def load_json(path: Path) -> object:
    with path.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def validate_with_schema(data: object, schema: object, label: str) -> list[str]:
    validator = Draft202012Validator(schema)
    errors = []
    for error in sorted(validator.iter_errors(data), key=lambda item: item.path):
        location = ".".join(str(part) for part in error.path) or "<root>"
        errors.append(f"{label}: {location}: {error.message}")
    return errors


def ensure_unique_ids(items: list[dict], label: str) -> list[str]:
    seen: set[str] = set()
    errors = []
    for item in items:
        item_id = item.get("id")
        if not isinstance(item_id, str):
            continue
        if item_id in seen:
            errors.append(f"{label}: duplicate id '{item_id}'")
        seen.add(item_id)
    return errors


def discover_record_files(directory: str, filename: str) -> list[Path]:
    return sorted((ROOT / directory).glob(f"*/{filename}"))


def load_records(
    directory: str,
    filename: str,
    schema: object,
    label: str,
    require_body: bool = True,
) -> tuple[list[dict], list[str]]:
    records: list[dict] = []
    errors: list[str] = []

    for metadata_path in discover_record_files(directory, filename):
        relative_path = metadata_path.relative_to(ROOT)
        try:
            record, body = load_qmd_frontmatter(metadata_path)
        except ValueError as exc:
            errors.append(f"{relative_path}: {exc}")
            continue

        if not isinstance(record, dict):
            errors.append(f"{relative_path}: YAML front matter must be an object")
            continue

        errors.extend(validate_with_schema(record, schema, str(relative_path)))

        if require_body and not body:
            errors.append(f"{relative_path}: body must not be empty")

        if record.get("id") != metadata_path.parent.name:
            errors.append(f"{relative_path}: id must match folder name")

        record["_metadata_path"] = metadata_path
        records.append(record)

    if not records:
        errors.append(f"{label}: no {filename} files found under {directory}/")

    errors.extend(ensure_unique_ids(records, label))
    return records, errors


def flatten_quarto_chapters(items: object) -> list[str]:
    if not isinstance(items, list):
        return []

    paths: list[str] = []
    for item in items:
        if isinstance(item, str):
            paths.append(item)
        elif isinstance(item, dict):
            paths.extend(flatten_quarto_chapters(item.get("chapters")))
    return paths


def validate_documentation_sources(challenge_ids: set[str], dataset_ids: set[str]) -> list[str]:
    errors: list[str] = []
    quarto_config_path = ROOT / "documentation" / "_quarto.yml"
    if not quarto_config_path.exists():
        return errors

    quarto_config = load_yaml(quarto_config_path)
    if not isinstance(quarto_config, dict):
        errors.append("documentation/_quarto.yml: must be a YAML object")
        return errors

    book_config = quarto_config.get("book", {})
    if not isinstance(book_config, dict):
        errors.append("documentation/_quarto.yml: book must be a YAML object")
        return errors

    chapters = flatten_quarto_chapters(book_config.get("chapters"))
    for chapter in chapters:
        chapter_path = Path(chapter)
        is_challenge_record_page = chapter_path.name in {
            f"challenge-{challenge_id}.qmd" for challenge_id in challenge_ids
        }
        is_dataset_record_page = chapter_path.name in {
            f"dataset-{dataset_id}.qmd" for dataset_id in dataset_ids
        }
        if is_challenge_record_page or is_dataset_record_page:
            errors.append(
                "documentation/_quarto.yml: "
                f"'{chapter}' duplicates a canonical record; "
                "edit challenges/*/challenge.qmd or datasets/*/dataset.qmd instead"
            )

    duplicate_record_pages = [
        ROOT / "documentation" / f"challenge-{challenge_id}.qmd"
        for challenge_id in challenge_ids
    ]
    duplicate_record_pages.extend(
        ROOT / "documentation" / f"dataset-{dataset_id}.qmd"
        for dataset_id in dataset_ids
    )

    forbidden_frontmatter_keys = {
        "challengeId",
        "currentBest",
        "dataset",
        "facts",
        "image",
        "metric",
        "physics",
        "status",
        "track",
    }
    for page_path in duplicate_record_pages:
        if not page_path.exists():
            continue

        try:
            metadata, _ = load_qmd_frontmatter(page_path)
        except ValueError as exc:
            errors.append(f"{page_path.relative_to(ROOT)}: {exc}")
            continue
        if not isinstance(metadata, dict):
            errors.append(f"{page_path.relative_to(ROOT)}: YAML front matter must be an object")
            continue

        duplicate_keys = sorted(forbidden_frontmatter_keys.intersection(metadata))
        if duplicate_keys:
            keys = ", ".join(duplicate_keys)
            errors.append(
                f"{page_path.relative_to(ROOT)}: duplicated record front matter ({keys}); "
                "move record-specific metadata to the canonical challenge or dataset QMD"
            )

    return errors


def main() -> int:
    errors: list[str] = []

    challenge_schema = load_json(ROOT / "schemas/challenge.schema.json")
    dataset_schema = load_json(ROOT / "schemas/dataset.schema.json")

    challenges, challenge_errors = load_records(
        "challenges",
        "challenge.qmd",
        challenge_schema,
        "challenges",
    )
    datasets, dataset_errors = load_records(
        "datasets",
        "dataset.qmd",
        dataset_schema,
        "datasets",
    )
    errors.extend(challenge_errors)
    errors.extend(dataset_errors)

    dataset_by_id = {dataset["id"]: dataset for dataset in datasets}
    dataset_ids = set(dataset_by_id)
    challenge_ids = {challenge["id"] for challenge in challenges}
    errors.extend(validate_documentation_sources(challenge_ids, dataset_ids))

    for challenge in challenges:
        metadata_path = challenge["_metadata_path"]

        challenge_dataset_modalities: set[str] = set()
        for dataset_id in challenge.get("datasets", []):
            if dataset_id not in dataset_ids:
                errors.append(f"{metadata_path.relative_to(ROOT)}: unknown dataset '{dataset_id}'")
                continue

            dataset_modality = dataset_by_id[dataset_id].get("modality")
            if dataset_modality:
                challenge_dataset_modalities.add(dataset_modality)

        if len(challenge_dataset_modalities) > 1:
            modalities = ", ".join(sorted(challenge_dataset_modalities))
            errors.append(
                f"{metadata_path.relative_to(ROOT)}: challenge references multiple dataset types: {modalities}"
            )

    challenge_datasets = {
        challenge["id"]: set(challenge.get("datasets", []))
        for challenge in challenges
        if isinstance(challenge.get("id"), str)
    }
    dataset_used_by = {
        dataset["id"]: set(dataset.get("used_by", []))
        for dataset in datasets
        if isinstance(dataset.get("id"), str)
    }

    for challenge in challenges:
        challenge_id = challenge["id"]
        metadata_path = challenge["_metadata_path"]
        for dataset_id in challenge.get("datasets", []):
            if dataset_id in dataset_ids and challenge_id not in dataset_used_by.get(dataset_id, set()):
                errors.append(
                    f"{metadata_path.relative_to(ROOT)}: dataset '{dataset_id}' must list "
                    f"'{challenge_id}' in used_by"
                )

    for dataset in datasets:
        metadata_path = dataset["_metadata_path"]
        dataset_path = metadata_path.parent
        dataset_id = dataset["id"]

        schema_doc = dataset.get("schema_doc")
        if schema_doc and not (dataset_path / schema_doc).exists():
            errors.append(f"{metadata_path.relative_to(ROOT)}: schema_doc '{schema_doc}' does not exist")

        for challenge_id in dataset.get("used_by", []):
            if challenge_id not in challenge_ids:
                errors.append(f"{metadata_path.relative_to(ROOT)}: unknown used_by challenge '{challenge_id}'")
                continue

            if dataset_id not in challenge_datasets.get(challenge_id, set()):
                errors.append(
                    f"{metadata_path.relative_to(ROOT)}: used_by challenge '{challenge_id}' must list "
                    f"'{dataset_id}' in datasets"
                )

    if errors:
        for error in errors:
            print(f"ERROR: {error}")
        return 1

    print("Metadata validation passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
