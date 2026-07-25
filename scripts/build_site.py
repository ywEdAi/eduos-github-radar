#!/usr/bin/env python3
"""Export the compact JSONL registry into the dependency-free static site."""

from __future__ import annotations

import argparse
import json
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def public_record(record: dict) -> dict:
    """Allowlist public fields; never publish local paths or internal source refs."""
    return {
        "github_repo_id": record.get("github_repo_id"),
        "owner": {
            "login": (record.get("owner") or {}).get("login"),
            "html_url": (record.get("owner") or {}).get("html_url"),
        }
        if record.get("owner")
        else None,
        "name": record.get("name"),
        "full_name": record.get("full_name"),
        "html_url": record.get("html_url"),
        "homepage": record.get("homepage"),
        "description": record.get("description"),
        "topics": record.get("topics", []),
        "languages": record.get("languages", {}),
        "languages_status": record.get("languages_status"),
        "primary_language": record.get("primary_language"),
        "metrics": record.get("metrics", {}),
        "license_spdx": record.get("license_spdx"),
        "default_branch": record.get("default_branch"),
        "created_at": record.get("created_at"),
        "updated_at": record.get("updated_at"),
        "pushed_at": record.get("pushed_at"),
        "latest_release": record.get("latest_release"),
        "latest_release_status": record.get("latest_release_status"),
        "archived": record.get("archived"),
        "fork": record.get("fork"),
        "is_template": record.get("is_template"),
        "verification_status": record.get("verification_status"),
        "lead_match_status": record.get("lead_match_status"),
        "entity_kind": record.get("entity_kind"),
        "gold_seed": bool(record.get("gold_seed")),
        "first_seen": record.get("first_seen"),
        "last_seen": record.get("last_seen"),
        "fetched_at": record.get("fetched_at"),
        "discovery_sources": sorted(
            {
                item.get("source")
                for item in record.get("provenance", [])
                if item.get("source")
            }
        ),
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--registry", default=str(ROOT / "data" / "registry.jsonl"))
    parser.add_argument("--output", default=str(ROOT / "site" / "data" / "registry.json"))
    args = parser.parse_args()
    registry_path = Path(args.registry)
    records = []
    if registry_path.exists():
        with registry_path.open("r", encoding="utf-8") as handle:
            records = [json.loads(line) for line in handle if line.strip()]
    records.sort(
        key=lambda record: (
            -(record.get("metrics", {}).get("stars") or -1),
            (record.get("full_name") or record.get("name") or "").casefold(),
        )
    )
    public_records = [public_record(record) for record in records]
    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    payload = {
        "generated_at": datetime.now(timezone.utc)
        .replace(microsecond=0)
        .isoformat()
        .replace("+00:00", "Z"),
        "count": len(records),
        "counts": {
            "verification_status": dict(Counter(record["verification_status"] for record in records)),
            "entity_kind": dict(Counter(record["entity_kind"] for record in records)),
        },
        "records": public_records,
    }
    temporary = output_path.with_suffix(".json.tmp")
    with temporary.open("w", encoding="utf-8") as handle:
        json.dump(payload, handle, ensure_ascii=False, separators=(",", ":"))
        handle.write("\n")
    temporary.replace(output_path)
    print(f"wrote {len(records)} records to {output_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
