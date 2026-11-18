#!/usr/bin/env python3
"""Writes src/data/app.json from the app's Swift sources (../truethings).

Reads the game catalogue (Models/Game.swift), the question decks
(Models/QuestionGame.swift, QuestionGameDE.swift) and the German strings
(Localizable.xcstrings). Run it whenever games or decks change in the app,
then rebuild the site:

    python3 src/tools/export-app-data.py
    python3 src/build.py --check
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent
APP = ROOT.parent / "truethings" / "TrueThings"
OUT = ROOT / "src" / "data" / "app.json"

STRING = r'"((?:[^"\\]|\\.)*)"'


def unescape(text: str) -> str:
    text = re.sub(r"\\u\{([0-9a-fA-F]+)\}", lambda m: chr(int(m.group(1), 16)), text)
    return text.replace('\\"', '"').replace("\\n", "\n").replace("\\\\", "\\")


def blocks(source: str, type_name: str) -> list[tuple[str, str]]:
    """Every `static let name = Type( … )` with its body, in source order."""
    found = []
    for m in re.finditer(rf"static let (\w+) = {type_name}\(\n", source):
        end = source.index("\n    )\n", m.end())
        found.append((m.group(1), source[m.end():end]))
    return found


def field(body: str, name: str) -> str:
    m = re.search(rf'\b{name}: (?:String\(localized: )?{STRING}', body)
    if not m:
        raise SystemExit(f"field {name} not found")
    return unescape(m.group(1))


def enum_case(body: str, name: str) -> str:
    return re.search(rf"\b{name}: \.(\w+)", body).group(1)


def string_list(body: str, name: str) -> list[str]:
    m = re.search(rf"\b{name}: \[\n(.*?)\n\s*\]", body, re.S)
    return [unescape(s) for s in re.findall(STRING, m.group(1))]


def catalog(source: str, type_name: str) -> list[str]:
    m = re.search(rf"static let catalog: \[{type_name}\] = \[(.*?)\]", source, re.S)
    return re.findall(r"\w+", m.group(1))


def main() -> int:
    strings = json.loads((APP / "Localizable.xcstrings").read_text(encoding="utf-8"))["strings"]

    def both(english: str) -> dict:
        german = strings.get(english, {}).get("localizations", {}).get("de", {}).get("stringUnit", {}).get("value")
        if german is None:
            print(f"warning: no German string for {english!r}")
        return {"en": english, "de": german or english}

    game_src = (APP / "Models" / "Game.swift").read_text(encoding="utf-8")
    by_name = dict(blocks(game_src, "Game"))
    games = []
    for name in catalog(game_src, "Game"):
        body = by_name[name]
        games.append({
            "id": field(body, "id"),
            "title": both(field(body, "title")),
            "tagline": both(field(body, "tagline")),
            "description": both(field(body, "description")),
            "players": both(field(body, "players")),
            "pace": both(field(body, "pace")),
            "tint": enum_case(body, "tint"),
            "status": enum_case(body, "status"),
            "howItWorks": [both(s) for s in string_list(body, "howItWorks")],
        })

    deck_src = (APP / "Models" / "QuestionGame.swift").read_text(encoding="utf-8")
    german_src = (APP / "Models" / "QuestionGameDE.swift").read_text(encoding="utf-8")
    german = {m.group(1): [unescape(s) for s in re.findall(STRING, m.group(2))]
              for m in re.finditer(r"static let (\w+): \[String\] = \[\n(.*?)\n    \]", german_src, re.S)}
    by_name = dict(blocks(deck_src, "QuestionGame"))
    decks = []
    for name in catalog(deck_src, "QuestionGame"):
        body = by_name[name]
        cards_en = string_list(body, "cards")
        cards_de = german[re.search(r"cardsDE: QuestionGameDE\.(\w+)", body).group(1)]
        if len(cards_en) != len(cards_de):
            raise SystemExit(f"{name}: {len(cards_en)} English cards, {len(cards_de)} German")
        decks.append({
            "key": name,
            "id": field(body, "id"),
            "title": both(field(body, "title")),
            "tagline": both(field(body, "tagline")),
            "instruction": both(field(body, "instruction")),
            "symbol": field(body, "symbol"),
            "tint": enum_case(body, "tint"),
            "cards_en": cards_en,
            "cards_de": cards_de,
        })

    OUT.write_text(json.dumps({"games": games, "decks": decks}, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(f"{len(games)} games, {len(decks)} decks, {sum(len(d['cards_en']) for d in decks)} questions -> {OUT.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
