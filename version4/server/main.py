"""SVHunter v4 — FastAPI backend entry point."""

from __future__ import annotations

import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routes.pipeline import router as pipeline_router
from .routes.results import configure_search_paths, router as results_router

app = FastAPI(title="SVHunter API", version="4.0.0")

# CORS — allow the Vite dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routers
app.include_router(pipeline_router)
app.include_router(results_router)

# Configure default VCF search paths (override with VCF_SEARCH_DIRS env var)
_default_search = os.environ.get("VCF_SEARCH_DIRS", "")
if _default_search:
    configure_search_paths(_default_search.split(":"))
else:
    # Default: look for vcf/ directory next to version4/
    _repo_vcf = str(
        __import__("pathlib").Path(__file__).resolve().parent.parent.parent / "vcf"
    )
    configure_search_paths([_repo_vcf])


@app.get("/api/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}
