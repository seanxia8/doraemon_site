from __future__ import annotations

import re
from pathlib import Path

import yaml


CONFIG_PATH = Path("documentation/_quarto.yml")
DOCS_DIR = Path("site/public/documentation")

SectionMap = dict[str, str | None]


def section_numbers() -> SectionMap:
    config = yaml.safe_load(CONFIG_PATH.read_text(encoding="utf-8"))
    chapters = config["book"]["chapters"]

    numbers: SectionMap = {}
    quarto_chapter = 0
    part_number = 0

    for item in chapters:
        if isinstance(item, str):
            quarto_chapter += 1
            numbers[str(quarto_chapter)] = (
                None if item == "index.qmd" else str(quarto_chapter)
            )
            continue

        if not isinstance(item, dict) or "part" not in item:
            continue

        part_number += 1
        for subsection_number, _chapter in enumerate(item.get("chapters", []), start=1):
            quarto_chapter += 1
            numbers[str(quarto_chapter)] = f"{part_number}.{subsection_number}"

    return numbers


def replace_chapter_number(match: re.Match[str], numbers: SectionMap) -> str:
    number = match.group("number")
    replacement = numbers.get(number, number)
    if replacement is None:
        return ""

    return f'<span class="chapter-number">{replacement}</span>&nbsp; '


def replace_title_number(match: re.Match[str], numbers: SectionMap) -> str:
    number = match.group("number")
    replacement = numbers.get(number, number)
    if replacement is None:
        return "<title>"

    return f"<title>{replacement}&nbsp; "


def replace_header_number(match: re.Match[str], numbers: SectionMap) -> str:
    number = match.group("number")
    suffix = match.group("suffix")
    original = f"{number}.{suffix}"
    if is_renumbered_header(original, numbers):
        return match.group(0)

    replacement = numbers.get(number, number)
    if replacement is None:
        return ""

    return f'<span class="header-section-number">{replacement}.{suffix}</span> '


def replace_data_number(match: re.Match[str], numbers: SectionMap) -> str:
    number = match.group("number")
    suffix = match.group("suffix")
    original = f"{number}.{suffix}"
    if is_renumbered_header(original, numbers):
        return match.group(0)

    replacement = numbers.get(number, number)
    if replacement is None:
        return ""

    return f'data-number="{replacement}.{suffix}" '


def is_renumbered_header(number: str, numbers: SectionMap) -> bool:
    return any(
        replacement is not None and number.startswith(f"{replacement}.")
        for replacement in numbers.values()
    )


def renumber_html(html: str, numbers: SectionMap) -> str:
    html = re.sub(
        r'<span class="chapter-number">(?P<number>\d+)</span>&nbsp;\s*',
        lambda match: replace_chapter_number(match, numbers),
        html,
    )
    html = re.sub(
        r"<title>(?P<number>\d+)&nbsp;\s*",
        lambda match: replace_title_number(match, numbers),
        html,
    )
    html = re.sub(
        r'<span class="header-section-number">0\.\d+(?:\.\d+)*</span>\s*',
        "",
        html,
    )
    html = re.sub(
        r'<span class="header-section-number">(?P<number>\d+)\.(?P<suffix>\d+(?:\.\d+)*)</span>\s*',
        lambda match: replace_header_number(match, numbers),
        html,
    )
    html = re.sub(
        r'data-number="0\.\d+(?:\.\d+)*"\s*',
        "",
        html,
    )
    html = re.sub(
        r'data-number="(?P<number>\d+)\.(?P<suffix>\d+(?:\.\d+)*)"\s*',
        lambda match: replace_data_number(match, numbers),
        html,
    )
    return html


def main() -> None:
    if not DOCS_DIR.exists():
        raise SystemExit(f"Documentation output directory not found: {DOCS_DIR}")

    numbers = section_numbers()
    for path in DOCS_DIR.glob("*.html"):
        path.write_text(
            renumber_html(path.read_text(encoding="utf-8"), numbers),
            encoding="utf-8",
        )


if __name__ == "__main__":
    main()
