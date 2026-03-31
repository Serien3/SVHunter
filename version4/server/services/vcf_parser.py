"""Parse VCF v4.2 files produced by SVHunter into JSON-friendly dicts."""

from __future__ import annotations

import os
import re
from pathlib import Path
from typing import Any


def parse_vcf_file(vcf_path: str) -> list[dict[str, Any]]:
    """Parse a single VCF file and return a list of record dicts."""
    records: list[dict[str, Any]] = []
    with open(vcf_path, "r") as fh:
        for line in fh:
            if line.startswith("#"):
                continue
            fields = line.strip().split("\t")
            if len(fields) < 8:
                continue
            info = _parse_info(fields[7])
            gt = ""
            if len(fields) >= 10:
                fmt_keys = fields[8].split(":")
                fmt_vals = fields[9].split(":")
                fmt = dict(zip(fmt_keys, fmt_vals))
                gt = fmt.get("GT", ".")
            records.append(
                {
                    "chrom": fields[0],
                    "pos": int(fields[1]),
                    "id": fields[2],
                    "ref": fields[3],
                    "alt": fields[4],
                    "qual": fields[5],
                    "filter": fields[6],
                    "svType": info.get("SVTYPE", ""),
                    "svLen": _int_or_none(info.get("SVLEN", "")),
                    "end": _int_or_none(info.get("END", "")),
                    "genotype": gt,
                    "info": fields[7],
                }
            )
    return records


def list_samples(base_dir: str) -> list[dict[str, Any]]:
    """Scan *base_dir* for subdirectories that contain VCF outputs.

    SVHunter writes VCFs into ``<base>/<sample>/<sample>_all.vcf`` etc.
    Also checks for VCFs directly in *base_dir*.
    """
    samples: list[dict[str, Any]] = []
    base = Path(base_dir)
    if not base.is_dir():
        return samples

    # Check subdirectories (standard SVHunter output layout)
    for entry in sorted(base.iterdir()):
        if entry.is_dir():
            vcfs = list(entry.glob("*.vcf"))
            if vcfs:
                samples.append(
                    {
                        "name": entry.name,
                        "path": str(entry),
                        "vcfCount": len(vcfs),
                        "vcfFiles": [v.name for v in sorted(vcfs)],
                    }
                )

    # Fallback: VCFs directly in base_dir
    if not samples:
        vcfs = list(base.glob("*.vcf"))
        if vcfs:
            samples.append(
                {
                    "name": base.name,
                    "path": str(base),
                    "vcfCount": len(vcfs),
                    "vcfFiles": [v.name for v in sorted(vcfs)],
                }
            )

    return samples


def summarise_records(records: list[dict[str, Any]]) -> dict[str, Any]:
    """Return aggregate statistics from a list of parsed VCF records."""
    type_counts: dict[str, int] = {}
    chrom_counts: dict[str, int] = {}
    lengths: list[int] = []

    for r in records:
        sv = r.get("svType", "UNKNOWN") or "UNKNOWN"
        type_counts[sv] = type_counts.get(sv, 0) + 1
        ch = r.get("chrom", "?")
        chrom_counts[ch] = chrom_counts.get(ch, 0) + 1
        if r.get("svLen") is not None:
            lengths.append(abs(r["svLen"]))

    return {
        "total": len(records),
        "byType": [{"type": k, "count": v} for k, v in sorted(type_counts.items())],
        "byChrom": [{"chrom": k, "count": v} for k, v in _sort_chroms(chrom_counts)],
        "medianLength": _median(lengths) if lengths else None,
    }


# ── helpers ──────────────────────────────────────────────────────────
def _parse_info(info_str: str) -> dict[str, str]:
    result: dict[str, str] = {}
    for token in info_str.split(";"):
        if "=" in token:
            k, v = token.split("=", 1)
            result[k] = v
        else:
            result[token] = ""
    return result


def _int_or_none(val: str) -> int | None:
    try:
        return int(val)
    except (ValueError, TypeError):
        return None


def _median(nums: list[int]) -> float:
    s = sorted(nums)
    n = len(s)
    if n % 2 == 1:
        return float(s[n // 2])
    return (s[n // 2 - 1] + s[n // 2]) / 2.0


def _sort_chroms(counts: dict[str, int]) -> list[tuple[str, int]]:
    """Sort chromosome keys numerically where possible."""

    def key(item: tuple[str, int]) -> tuple[int, str]:
        ch = item[0].replace("chr", "")
        try:
            return (0, f"{int(ch):04d}")
        except ValueError:
            return (1, ch)

    return sorted(counts.items(), key=key)
