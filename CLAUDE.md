# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Scope and repository layout

This repository has two parallel tracks:

- **Core SV caller (Python, root):** `SVHunter.py`, `SVHunter_generate_data.py`, `SVHunter_detect.py`, `model_predict.h5`, `data/`
- **Frontend showcase prototypes (Vite + React):** `version1/`, `version2/`, and `version3/` (independent projects)

Treat `version1`, `version2`, and `version3` as separate frontend apps; they are not wired to a Python backend service in this repo.

## Common commands

### Python pipeline (root)

Environment (from README):

```bash
conda create -n SVHunter python=3.11
conda activate SVHunter
conda install python=3.11 numpy pandas tensorflow=2.12.1 pysam scikit-learn=1.5.1
```

Generate feature tensors from BAM:

```bash
python SVHunter.py generate <bamfile_path_long> <output_data_folder> [threads] [includecontig]
```

Call SVs and write VCFs:

```bash
python SVHunter.py call <predict_weight.h5> <datapath> <bamfile> <predict_path> <outvcfpath> [threads] [includecontig] [num_gpus]
```

Development smoke run (faster):

```bash
python SVHunter.py generate ./long_read.bam ./datapath 4 "['12']"
python SVHunter.py call ./model_predict.h5 ./datapath ./long_read.bam ./predict ./vcf 4 "['12']" 1
```

### Frontend `version1/`

```bash
npm install
npm run dev
npm run build
npm run test
```

Run a single test file:

```bash
npm run test -- src/App.test.tsx
```

### Frontend `version2/`

```bash
npm install
npm run dev
npm run build
npm run test
```

`version2` uses a custom verification script (`tests/check-app.tsx`) rather than a normal Vitest suite; run whole-script checks via `npm run test`.

### Frontend `version3/`

```bash
npm install
npm run dev
npm run build
npm run test
```

Run a single test file:

```bash
npm run test -- tests/components.test.tsx
```

### Lint / typecheck status

- Root Python pipeline: no dedicated lint/test config in repo.
- `version1`: no lint script; build runs TypeScript project build (`tsc -b`) before Vite build.
- `version2`: no lint script; build runs TypeScript check (`tsc --noEmit`) before Vite build.
- `version3`: no lint script; uses Vitest with jsdom environment.

## High-level architecture

### 1) End-to-end SV calling flow

1. `SVHunter.py generate` calls `create_data_long(...)` in `SVHunter_generate_data.py`.
2. Feature extraction traverses BAM contigs in **10 Mb chunks**, builds per-window signals, and saves:
   - `chr*_start_end.npy`
   - `chr*_start_end_index.npy`
3. `SVHunter.py call` runs `model_predict(...)` in `SVHunter_detect.py` to score windows and write:
   - `chr*_start_end_predict.npy`
4. `cluster_by_predict(...)` merges model scores with alignment-derived evidence, performs clustering + genotyping, then writes VCFs under `<output>/<sample>/`.

### 2) Data and model representation

- Core detection window: **2000 bp**.
- Feature tensor per window: **20 channels** (CIGAR indels, split-read/SA-tag evidence, clipping/strand/coverage-style signals).
- Model (`init_model` in `SVHunter_detect.py`):
  - Time-distributed CNN encoder
  - CBAM attention blocks
  - Transformer-style multi-head attention stack over frame embeddings
  - Sigmoid binary window score

### 3) Candidate refinement and output

- Raw evidence extraction combines:
  - CIGAR-based indel parsing (`cigarread` path)
  - split-read/SA-tag segment analysis (`splitreadlist`, `analyze_read_segments` path)
- `cluster_by_predict(...)` handles:
  - coverage estimation
  - candidate clustering/filtering
  - support read thresholds
  - genotype likelihood/voting
- Output VCF set:
  - `<sample>_all.vcf`
  - `<sample>_ins.vcf`, `<sample>_del.vcf`, `<sample>_inv.vcf`, `<sample>_dup.vcf`, `<sample>_tra.vcf`

### 4) Frontend architecture

#### `version1` (component-driven presentation)

- Main UI composition: `src/App.tsx`
- Content is data-driven from:
  - `src/data/siteContent.ts`
  - `src/data/benchmarkData.ts`
- Reusable UI blocks in `src/components/` (`layout`, `visual`, `demo`)
- Testing is Vitest + Testing Library (`src/**/*.test.tsx`)

#### `version2` (single-screen competition demo)

- Main UI orchestration: `src/App.tsx`
- Structured state/content model: `src/state.ts`
- Charts are ECharts loaded lazily inside the app (no dedicated chart service/module)
- Test approach is script-style verification in `tests/check-app.tsx`

#### `version3` (feature-sliced pipeline dashboard)

- Routing: `src/app/router.tsx` — two routes: `/pipeline` and `/results`, wrapped in `src/app/AppShell.tsx`
- Domain contracts: `src/domain/contracts.ts` — all shared types/enums defined with Zod schemas (pipeline stages, chunk progress, SV types, VCF artifacts, run status)
- Feature slices: `src/features/pipeline/` and `src/features/results/`, each with `pages/` and `components/` subdirectories
- Data layer: `src/data/` — mock/static data separate from UI logic
- Tests: `tests/components.test.tsx` and `tests/contracts.test.tsx` using Vitest + Testing Library with jsdom

## Operational caveats

- GPU device is hardcoded in root scripts (`os.environ["CUDA_VISIBLE_DEVICES"] = "4"` in `SVHunter.py` and `SVHunter_detect.py`); adjust for local hardware before GPU runs.
- Python CLI argument parsing is positional and somewhat permissive; preserve call signatures when editing.
- The pipeline assumes BAM files include expected indexing and SA-tag patterns; behavior can degrade on BAMs lacking those signals.
