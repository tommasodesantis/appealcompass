from __future__ import annotations

import json
from datetime import date
from pathlib import Path

from appeal_tool.config import CCAO_CALENDAR, CCAO_WINDOWS, canonical_township

AUTHORITY_DATA = Path("reports/deadline_crosscheck_2026-07-06.json")


def _parse_date(value: str | None) -> date | None:
    return date.fromisoformat(value) if value else None


def test_authority_crosscheck_json_matches_ccao_config() -> None:
    raw = json.loads(AUTHORITY_DATA.read_text(encoding="utf-8"))
    rows = raw["ccao_rows"]
    assert len(rows) == 38
    assert CCAO_CALENDAR.session_label == raw["ccao_session"]["label"]
    assert CCAO_CALENDAR.session_end == date.fromisoformat(raw["ccao_session"]["session_end"])

    for row in rows:
        township = canonical_township(row["township"])
        assert township in CCAO_WINDOWS
        windows = CCAO_WINDOWS[township]
        authority_opens = _parse_date(row["appeal_open_date"])
        authority_closes = _parse_date(row["last_file_date"])
        if authority_opens and authority_closes:
            assert len(windows) == 1
            assert windows[0].opens == authority_opens
            assert windows[0].closes == authority_closes
        else:
            assert windows == []


def test_ccao_config_has_full_township_coverage() -> None:
    raw = json.loads(AUTHORITY_DATA.read_text(encoding="utf-8"))
    authority_townships = {canonical_township(row["township"]) for row in raw["ccao_rows"]}
    assert set(CCAO_WINDOWS) == authority_townships
