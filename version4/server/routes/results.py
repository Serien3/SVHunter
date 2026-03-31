"""Results browsing endpoints — list samples, fetch VCF records & summary."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, HTTPException, Query
from pathlib import Path

from ..services.vcf_parser import list_samples, parse_vcf_file, summarise_records

router = APIRouter(prefix="/api/results", tags=["results"])

# Default search paths for VCF output directories
_SEARCH_PATHS: list[str] = []


def configure_search_paths(paths: list[str]) -> None:
    _SEARCH_PATHS.clear()
    _SEARCH_PATHS.extend(paths)


@router.get("/samples")
async def get_samples(dir: str | None = None) -> list[dict[str, Any]]:
    """Return samples found in *dir* or the configured search paths."""
    if dir:
        return list_samples(dir)
    all_samples: list[dict[str, Any]] = []
    for p in _SEARCH_PATHS:
        all_samples.extend(list_samples(p))
    return all_samples


@router.get("/samples/{sample_name}")
async def get_sample_summary(sample_name: str, dir: str | None = None) -> dict[str, Any]:
    """Parse the _all.vcf for a sample and return summary statistics."""
    sample = _find_sample(sample_name, dir)
    if sample is None:
        raise HTTPException(404, f"Sample '{sample_name}' not found")

    all_vcf = Path(sample["path"]) / f"{sample_name}_all.vcf"
    if not all_vcf.exists():
        # Fallback: try any VCF in the directory
        vcfs = list(Path(sample["path"]).glob("*.vcf"))
        if not vcfs:
            raise HTTPException(404, "No VCF files found for sample")
        all_vcf = vcfs[0]

    records = parse_vcf_file(str(all_vcf))
    summary = summarise_records(records)
    summary["sampleName"] = sample_name
    summary["vcfFiles"] = sample.get("vcfFiles", [])
    return summary


@router.get("/samples/{sample_name}/vcf")
async def get_vcf_records(
    sample_name: str,
    dir: str | None = None,
    file: str | None = None,
    sv_type: str | None = Query(None, alias="svType"),
    chrom: str | None = None,
    limit: int = 500,
    offset: int = 0,
) -> dict[str, Any]:
    """Return parsed VCF records with optional filtering."""
    sample = _find_sample(sample_name, dir)
    if sample is None:
        raise HTTPException(404, f"Sample '{sample_name}' not found")

    if file:
        vcf_path = Path(sample["path"]) / file
    else:
        vcf_path = Path(sample["path"]) / f"{sample_name}_all.vcf"

    if not vcf_path.exists():
        raise HTTPException(404, f"VCF file not found: {vcf_path.name}")

    records = parse_vcf_file(str(vcf_path))

    # Apply filters
    if sv_type:
        records = [r for r in records if r.get("svType") == sv_type]
    if chrom:
        records = [r for r in records if r.get("chrom") == chrom]

    total = len(records)
    records = records[offset : offset + limit]

    return {"total": total, "offset": offset, "limit": limit, "records": records}


def _find_sample(name: str, dir: str | None) -> dict[str, Any] | None:
    dirs = [dir] if dir else _SEARCH_PATHS
    for d in dirs:
        for s in list_samples(d):
            if s["name"] == name:
                return s
    return None
