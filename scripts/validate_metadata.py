from __future__ import annotations

import json
from pathlib import Path

import yaml
from jsonschema import Draft202012Validator


ROOT = Path(__file__).resolve().parents[1]


def load_yaml(path: Path) -> object:
    with path.open("r", encoding="utf-8") as handle:
        return yaml.safe_load(handle)


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
        item_id = item["id"]
        if item_id in seen:
            errors.append(f"{label}: duplicate id '{item_id}'")
        seen.add(item_id)
    return errors


def main() -> int:
    errors: list[str] = []

    challenge_schema = load_json(ROOT / "schemas/challenge.schema.json")
    dataset_schema = load_json(ROOT / "schemas/dataset.schema.json")
    registry_schemas = load_json(ROOT / "schemas/registries.schema.json")["$defs"]

    challenge_registry = load_yaml(ROOT / "registry/challenges.yml")
    dataset_registry = load_yaml(ROOT / "registry/datasets.yml")

    errors.extend(
        validate_with_schema(
            challenge_registry,
            registry_schemas["challengeRegistry"],
            "registry/challenges.yml",
        )
    )
    errors.extend(
        validate_with_schema(
            dataset_registry,
            registry_schemas["datasetRegistry"],
            "registry/datasets.yml",
        )
    )
    challenges = challenge_registry.get("challenges", []) if isinstance(challenge_registry, dict) else []
    datasets = dataset_registry.get("datasets", []) if isinstance(dataset_registry, dict) else []

    errors.extend(ensure_unique_ids(challenges, "registry/challenges.yml"))
    errors.extend(ensure_unique_ids(datasets, "registry/datasets.yml"))

    dataset_ids = {dataset["id"] for dataset in datasets}

    for entry in challenges:
        challenge_path = ROOT / entry["path"]
        metadata_path = challenge_path / "challenge.yml"
        if not metadata_path.exists():
            errors.append(f"{entry['path']}: missing challenge.yml")
            continue

        challenge = load_yaml(metadata_path)
        errors.extend(validate_with_schema(challenge, challenge_schema, str(metadata_path.relative_to(ROOT))))

        if challenge.get("id") != entry["id"]:
            errors.append(f"{metadata_path.relative_to(ROOT)}: id does not match registry entry")

        for dataset_id in challenge.get("datasets", []):
            if dataset_id not in dataset_ids:
                errors.append(f"{metadata_path.relative_to(ROOT)}: unknown dataset '{dataset_id}'")

    for entry in datasets:
        dataset_path = ROOT / entry["path"]
        metadata_path = dataset_path / "dataset.yml"
        if not metadata_path.exists():
            errors.append(f"{entry['path']}: missing dataset.yml")
            continue

        dataset = load_yaml(metadata_path)
        errors.extend(validate_with_schema(dataset, dataset_schema, str(metadata_path.relative_to(ROOT))))

        if dataset.get("id") != entry["id"]:
            errors.append(f"{metadata_path.relative_to(ROOT)}: id does not match registry entry")

        schema_doc = dataset.get("schema_doc")
        if schema_doc and not (dataset_path / schema_doc).exists():
            errors.append(f"{metadata_path.relative_to(ROOT)}: schema_doc '{schema_doc}' does not exist")

    if errors:
        for error in errors:
            print(f"ERROR: {error}")
        return 1

    print("Metadata validation passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
