from __future__ import annotations

import argparse
from dataclasses import dataclass
from html.parser import HTMLParser
import re
import shutil
import shlex
import subprocess
from pathlib import Path

import yaml


ROOT = Path(__file__).resolve().parents[1]
CHALLENGE_PUBLIC_DIR = ROOT / "site/public/challenge-protocols"
CHALLENGE_FRAGMENT_DIR = ROOT / "site/.generated/challenge-protocols"
DATASET_PUBLIC_DIR = ROOT / "site/public/dataset-records"
DATASET_FRAGMENT_DIR = ROOT / "site/.generated/dataset-records"

SITE_LIB_RE = re.compile(r"(?P<attr>\b(?:href|src)=)(?P<quote>[\"'])site_libs/")


@dataclass(frozen=True)
class ElementBounds:
    start: int
    start_tag_end: int
    end_start: int
    end: int


class ElementBoundsParser(HTMLParser):
    def __init__(self, source: str, tag_name: str, element_id: str):
        super().__init__(convert_charrefs=False)
        self.source = source
        self.tag_name = tag_name
        self.element_id = element_id
        self.line_offsets = self._line_offsets(source)
        self.start: int | None = None
        self.start_tag_end: int | None = None
        self.end_start: int | None = None
        self.end: int | None = None
        self.depth = 0

    @staticmethod
    def _line_offsets(source: str) -> list[int]:
        offsets = [0]
        for match in re.finditer(r"\n", source):
            offsets.append(match.end())
        return offsets

    def _absolute_position(self) -> int:
        line, offset = self.getpos()
        return self.line_offsets[line - 1] + offset

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if self.end is not None:
            return

        if self.depth:
            if tag == self.tag_name:
                self.depth += 1
            return

        if tag != self.tag_name:
            return

        attributes = dict(attrs)
        if attributes.get("id") != self.element_id:
            return

        start_tag = self.get_starttag_text() or ""
        self.start = self._absolute_position()
        self.start_tag_end = self.start + len(start_tag)
        self.depth = 1

    def handle_startendtag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if self.end is not None or tag != self.tag_name:
            return

        attributes = dict(attrs)
        if attributes.get("id") != self.element_id:
            return

        start_tag = self.get_starttag_text() or ""
        self.start = self._absolute_position()
        self.start_tag_end = self.start + len(start_tag)
        self.end_start = self.start_tag_end
        self.end = self.start_tag_end

    def handle_endtag(self, tag: str) -> None:
        if not self.depth or tag != self.tag_name:
            return

        self.depth -= 1
        if self.depth:
            return

        self.end_start = self._absolute_position()
        closing_end = self.source.find(">", self.end_start)
        if closing_end == -1:
            self.end = self.end_start
        else:
            self.end = closing_end + 1

    @property
    def bounds(self) -> ElementBounds | None:
        if (
            self.start is None
            or self.start_tag_end is None
            or self.end_start is None
            or self.end is None
        ):
            return None
        return ElementBounds(self.start, self.start_tag_end, self.end_start, self.end)


def find_element_bounds(source: str, tag_name: str, element_id: str) -> ElementBounds | None:
    parser = ElementBoundsParser(source, tag_name, element_id)
    parser.feed(source)
    parser.close()
    return parser.bounds


def load_qmd_frontmatter(path: Path) -> dict:
    source = path.read_text(encoding="utf-8")
    match = re.match(r"^---\r?\n(.*?)\r?\n---(?:\r?\n|$)", source, flags=re.S)
    if not match:
        raise RuntimeError(f"{path.relative_to(ROOT)}: missing YAML front matter")
    data = yaml.safe_load(match.group(1))
    return data if isinstance(data, dict) else {}


def record_entries(directory: str, filename: str) -> list[dict]:
    entries: list[dict] = []
    for qmd_path in sorted((ROOT / directory).glob(f"*/{filename}")):
        metadata = load_qmd_frontmatter(qmd_path)
        if "id" not in metadata:
            raise RuntimeError(f"{qmd_path.relative_to(ROOT)}: missing id")
        entries.append(
            {
                "id": metadata["id"],
                "title": metadata.get("title", ""),
                "order": metadata.get("order"),
                "path": qmd_path.parent.relative_to(ROOT),
                "qmd_path": qmd_path,
            }
        )
    return sorted(
        entries,
        key=lambda entry: (
            entry["order"] if isinstance(entry.get("order"), (int, float)) else 1_000_000,
            entry["title"],
            entry["id"],
        ),
    )


def extract_fragment(html: str, label: str, public_prefix: str) -> str:
    main_bounds = find_element_bounds(html, "main", "quarto-document-content")
    if not main_bounds:
        raise RuntimeError(f"{label}: could not find Quarto document content")

    fragment = html[main_bounds.start_tag_end : main_bounds.end_start].strip()
    title_bounds = find_element_bounds(fragment, "header", "title-block-header")
    if title_bounds:
        fragment = (
            fragment[: title_bounds.start].rstrip()
            + "\n"
            + fragment[title_bounds.end :].lstrip()
        ).strip()

    return SITE_LIB_RE.sub(
        lambda match: (
            f"{match.group('attr')}{match.group('quote')}../../"
            f"{public_prefix}/site_libs/"
        ),
        fragment,
    )


def render_record(
    quarto_cmd: list[str],
    entry: dict,
    public_dir: Path,
    fragment_dir: Path,
    public_prefix: str,
) -> None:
    record_id = entry["id"]
    qmd_path = entry["qmd_path"]
    if not qmd_path.exists():
        raise RuntimeError(f"{entry['path']}: missing {qmd_path.name}")

    output_file = f"{record_id}.html"
    output_path = ROOT / output_file
    public_output_path = public_dir / output_file
    subprocess.run(
        [
            *quarto_cmd,
            "render",
            str(qmd_path),
            "--to",
            "html",
            "--output",
            output_file,
        ],
        cwd=ROOT,
        check=True,
    )

    rendered_html = output_path.read_text(encoding="utf-8")
    output_path.unlink()

    for asset_dir in [ROOT / f"{record_id}_files", qmd_path.parent / f"{qmd_path.stem}_files"]:
        if asset_dir.exists():
            destination_name = (
                f"{record_id}_files"
                if asset_dir.name == f"{qmd_path.stem}_files"
                else asset_dir.name
            )
            rendered_html = rendered_html.replace(
                f"{asset_dir.name}/",
                f"{destination_name}/",
            )
            destination = public_dir / destination_name
            if destination.exists():
                shutil.rmtree(destination)
            shutil.copytree(asset_dir, destination)
            shutil.rmtree(asset_dir)

    generated_gitignore = qmd_path.parent / ".gitignore"
    if generated_gitignore.exists() and generated_gitignore.read_text(encoding="utf-8") == "/.quarto/\n**/*.quarto_ipynb\n":
        generated_gitignore.unlink()

    public_output_path.write_text(rendered_html, encoding="utf-8")
    fragment = extract_fragment(rendered_html, output_file, public_prefix)
    (fragment_dir / output_file).write_text(fragment + "\n", encoding="utf-8")


def clear_directory(directory: Path) -> None:
    directory.mkdir(parents=True, exist_ok=True)
    for existing in directory.iterdir():
        if existing.is_dir():
            shutil.rmtree(existing)
        else:
            existing.unlink()


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--quarto",
        default="quarto",
        help="Quarto command to run, for example 'conda run -n base quarto'.",
    )
    args = parser.parse_args()

    quarto_cmd = shlex.split(args.quarto)
    if not quarto_cmd:
        raise SystemExit("--quarto must not be empty")

    for directory in [
        CHALLENGE_PUBLIC_DIR,
        CHALLENGE_FRAGMENT_DIR,
        DATASET_PUBLIC_DIR,
        DATASET_FRAGMENT_DIR,
    ]:
        clear_directory(directory)

    challenge_entries = record_entries("challenges", "challenge.qmd")
    dataset_entries = record_entries("datasets", "dataset.qmd")

    for entry in challenge_entries:
        render_record(
            quarto_cmd,
            entry,
            CHALLENGE_PUBLIC_DIR,
            CHALLENGE_FRAGMENT_DIR,
            "challenge-protocols",
        )
    for entry in dataset_entries:
        render_record(
            quarto_cmd,
            entry,
            DATASET_PUBLIC_DIR,
            DATASET_FRAGMENT_DIR,
            "dataset-records",
        )

    print(
        f"Rendered {len(challenge_entries)} challenge protocol pages "
        f"and {len(dataset_entries)} dataset record pages."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
