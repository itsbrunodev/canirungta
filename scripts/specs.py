"""Fetch BuildCores OpenDB CPU and GPU records and write normalized JSON files.

Source: https://github.com/buildcores/buildcores-open-db (one JSON per product under open-db/<Kind>/).

Usage (from the project root):
  python3 scripts/specs.py                  # CPUs and GPUs
  python3 scripts/specs.py --cpus           # CPUs only
  python3 scripts/specs.py --gpus           # GPUs only
  python3 scripts/specs.py --archive x.zip  # reuse a downloaded archive, skip the network
  pnpm specs -- --gpus                      # same, through package.json

Outputs: data/buildcores-cpu-specs.json and data/buildcores-gpu-specs.json.
"""

from __future__ import annotations

import argparse
import io
import json
import re
import sys
import urllib.error
import urllib.request
import zipfile
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Callable

ARCHIVE_URL = (
    "https://github.com/buildcores/buildcores-open-db/archive/refs/heads/main.zip"
)
PROJECT_ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = PROJECT_ROOT / "data"
# Trimmed, deduplicated copies bundled into the app for spec-based estimates.
ESTIMATE_DIR = PROJECT_ROOT / "src" / "data" / "hardware"
TIMEOUT_SECONDS = 120

# Packaging words that make one CPU appear as several records (e.g. "Ryzen 5 3600 OEM/Tray").
PACKAGING_SUFFIX = re.compile(r"\s*(OEM/Tray|OEM|Tray|Boxed|Box)\s*$", re.IGNORECASE)


def as_dict(value: Any) -> dict[str, Any]:
    return value if isinstance(value, dict) else {}


def as_list(value: Any) -> list[Any]:
    return value if isinstance(value, list) else []


def unknown_if_zero(value: Any) -> Any:
    # OpenDB writes 0 for "not published" on clocks, bus width and TDP.
    return None if value in (0, "0", "", "None") else value


def clean_name(value: str) -> str:
    previous = None
    while previous != value:
        previous = value
        value = PACKAGING_SUFFIX.sub("", value).strip()
    return value


def normalize_cpu(raw: dict[str, Any]) -> dict[str, Any] | None:
    meta = as_dict(raw.get("metadata"))
    name = meta.get("name")
    if not name:
        return None

    cores = as_dict(raw.get("cores"))
    clocks = as_dict(raw.get("clocks"))
    perf_clocks = as_dict(clocks.get("performance"))
    eff_clocks = as_dict(clocks.get("efficiency"))
    cache = as_dict(raw.get("cache"))
    specs = as_dict(raw.get("specifications"))
    memory = as_dict(specs.get("memory"))
    igpu = as_dict(specs.get("integratedGraphics"))
    igpu_model = igpu.get("model")

    return {
        "opendb_id": raw.get("opendb_id"),
        "name": name,
        "canonical_name": clean_name(name),
        "manufacturer": meta.get("manufacturer"),
        "part_numbers": as_list(meta.get("part_numbers")),
        "series": raw.get("series") or meta.get("series"),
        "release_year": meta.get("releaseYear"),
        "microarchitecture": raw.get("microarchitecture"),
        "core_family": raw.get("coreFamily"),
        "socket": raw.get("socket"),
        "cores": {
            "total": cores.get("total"),
            "performance": cores.get("performance"),
            "efficiency": cores.get("efficiency"),
            "threads": cores.get("threads"),
        },
        "clocks_ghz": {
            "performance_base": unknown_if_zero(perf_clocks.get("base")),
            "performance_boost": unknown_if_zero(perf_clocks.get("boost")),
            "efficiency_base": unknown_if_zero(eff_clocks.get("base")),
            "efficiency_boost": unknown_if_zero(eff_clocks.get("boost")),
        },
        "cache": {
            "l1": cache.get("l1"),
            "l2_mb": unknown_if_zero(cache.get("l2")),
            "l3_mb": unknown_if_zero(cache.get("l3")),
        },
        "tdp_w": unknown_if_zero(specs.get("tdp")),
        "lithography": specs.get("lithography"),
        "smt": specs.get("simultaneousMultithreading"),
        "ecc_support": specs.get("eccSupport"),
        "memory": {
            "max_gb": unknown_if_zero(memory.get("maxSupport")),
            "types": as_list(memory.get("types")),
            "channels": unknown_if_zero(memory.get("channels")),
        },
        "integrated_graphics": None
        if igpu_model in (None, "None", "")
        else igpu_model,
    }


def normalize_gpu(raw: dict[str, Any]) -> dict[str, Any] | None:
    meta = as_dict(raw.get("metadata"))
    name = meta.get("name")
    chipset = raw.get("chipset")
    if not name or not chipset:
        return None

    return {
        "opendb_id": raw.get("opendb_id"),
        "name": name,
        "canonical_name": clean_name(name),
        # `chipset` is the key the GPU scorers read (e.g. "Radeon RX 7800 XT").
        "chipset": chipset,
        "chipset_manufacturer": raw.get("chipset_manufacturer"),
        "manufacturer": meta.get("manufacturer"),
        "part_numbers": as_list(meta.get("part_numbers")),
        "series": meta.get("series"),
        "variant": meta.get("variant"),
        "release_year": meta.get("releaseYear"),
        "core_count": unknown_if_zero(raw.get("core_count")),
        "core_clock_mhz": {
            "base": unknown_if_zero(raw.get("core_base_clock")),
            "boost": unknown_if_zero(raw.get("core_boost_clock")),
        },
        "memory_gb": unknown_if_zero(raw.get("memory")),
        "memory_type": raw.get("memory_type"),
        "memory_clock_mhz": unknown_if_zero(raw.get("effective_memory_clock")),
        "memory_bus_bits": unknown_if_zero(raw.get("memory_bus")),
        "tdp_w": unknown_if_zero(raw.get("tdp")),
        "interface": raw.get("interface"),
        "length_mm": unknown_if_zero(raw.get("length")),
    }


def fetch_archive(url: str) -> bytes:
    print(f"Downloading {url} ...")
    # GitHub rejects requests without a User-Agent.
    request = urllib.request.Request(url, headers={"User-Agent": "specs-script"})
    with urllib.request.urlopen(request, timeout=TIMEOUT_SECONDS) as response:
        return response.read()


def load_archive(path: str | None) -> bytes:
    if path is None:
        return fetch_archive(ARCHIVE_URL)
    print(f"Reading archive {path} ...")
    return Path(path).read_bytes()


def extract_records(
    archive: bytes,
    folder: str,
    normalize: Callable[[dict[str, Any]], dict[str, Any] | None],
) -> tuple[list[dict[str, Any]], int]:
    marker = f"/open-db/{folder}/"
    records: list[dict[str, Any]] = []
    seen: set[str] = set()
    duplicates = 0
    with zipfile.ZipFile(io.BytesIO(archive)) as zf:
        for filename in zf.namelist():
            if marker not in filename or not filename.endswith(".json"):
                continue
            with zf.open(filename) as handle:
                raw = json.load(handle)
            if not isinstance(raw, dict):
                continue
            record = normalize(raw)
            if record is None:
                continue
            # Same product, same specs, listed twice: keep one copy.
            key = json.dumps(
                {k: v for k, v in record.items() if k != "opendb_id"}, sort_keys=True
            )
            if key in seen:
                duplicates += 1
                continue
            seen.add(key)
            records.append(record)
    records.sort(key=lambda record: (str(record["canonical_name"]), str(record["name"])))
    return records, duplicates


def cpu_estimate_record(cpu: dict[str, Any]) -> dict[str, Any]:
    cores = as_dict(cpu.get("cores"))
    clocks = as_dict(cpu.get("clocks_ghz"))
    return {
        "name": cpu["canonical_name"],
        "microarchitecture": cpu.get("microarchitecture"),
        "threads": cores.get("threads"),
        "boost_ghz": clocks.get("performance_boost"),
    }


def gpu_estimate_record(gpus: list[dict[str, Any]]) -> list[dict[str, Any]]:
    # One entry per chipset: board partners share the same silicon, so the first non-null value wins.
    by_chipset: dict[str, dict[str, Any]] = {}
    for gpu in gpus:
        entry = by_chipset.setdefault(
            gpu["chipset"],
            {
                "chipset": gpu["chipset"],
                "shaders": None,
                "boost_mhz": None,
                "bus_bits": None,
                "memory_clock_mhz": None,
                # Board partners ship different sizes of one chipset, so keep the range.
                "vram_min_gb": None,
                "vram_max_gb": None,
            },
        )
        memory_gb = gpu.get("memory_gb")
        if isinstance(memory_gb, (int, float)) and memory_gb > 0:
            low, high = entry["vram_min_gb"], entry["vram_max_gb"]
            entry["vram_min_gb"] = memory_gb if low is None else min(low, memory_gb)
            entry["vram_max_gb"] = memory_gb if high is None else max(high, memory_gb)
        clocks = as_dict(gpu.get("core_clock_mhz"))
        values = {
            "shaders": gpu.get("core_count"),
            "boost_mhz": clocks.get("boost"),
            "bus_bits": gpu.get("memory_bus_bits"),
            "memory_clock_mhz": gpu.get("memory_clock_mhz"),
        }
        for field, value in values.items():
            if entry[field] is None and value is not None:
                entry[field] = value
    return sorted(by_chipset.values(), key=lambda entry: entry["chipset"])


def write_estimates(kind: str, records: list[dict[str, Any]]) -> None:
    ESTIMATE_DIR.mkdir(parents=True, exist_ok=True)
    path = ESTIMATE_DIR / f"{kind}-estimates.json"
    path.write_text(
        # Compact: this file ships in the server bundle, so whitespace is wasted bytes.
        json.dumps(records, separators=(",", ":"), ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    print(f"Wrote {len(records)} {kind} estimate records to {path}")


def write_dataset(path: Path, source: str, records: list[dict[str, Any]], key: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    payload = {
        "source": source,
        "fetched_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "count": len(records),
        key: records,
    }
    path.write_text(
        json.dumps(payload, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )


def parse_args(argv: list[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    parser.add_argument("--cpus", action="store_true", help="fetch CPUs only")
    parser.add_argument("--gpus", action="store_true", help="fetch GPUs only")
    parser.add_argument(
        "--archive",
        metavar="PATH",
        help="use a local copy of the OpenDB zip instead of downloading",
    )
    args = parser.parse_args(argv)
    if not args.cpus and not args.gpus:
        args.cpus = args.gpus = True
    return args


def main(argv: list[str]) -> int:
    args = parse_args(argv)
    try:
        archive = load_archive(args.archive)
    except (urllib.error.URLError, OSError) as error:
        print(f"Could not load archive: {error}", file=sys.stderr)
        return 1

    jobs = []
    if args.cpus:
        jobs.append(("CPU", "cpu", normalize_cpu, "cpus"))
    if args.gpus:
        jobs.append(("GPU", "gpu", normalize_gpu, "gpus"))

    for folder, slug, normalize, key in jobs:
        records, duplicates = extract_records(archive, folder, normalize)
        if not records:
            print(f"No {folder} JSON files found in archive.", file=sys.stderr)
            return 1
        out = DATA_DIR / f"buildcores-{slug}-specs.json"
        write_dataset(out, ARCHIVE_URL, records, key)
        print(f"{folder}: wrote {len(records)} records to {out} ({duplicates} duplicates dropped)")
        if slug == "cpu":
            cpu_records = [cpu_estimate_record(cpu) for cpu in records]
            write_estimates("cpu", cpu_records)
        else:
            write_estimates("gpu", gpu_estimate_record(records))
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
