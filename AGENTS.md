# Repository Guidelines

## Project Structure & Module Organization
`SVHunter.py` is the CLI entry point and exposes the two supported workflows: `generate` and `call`. `SVHunter_generate_data.py` extracts read features from BAM files and writes NumPy datasets. `SVHunter_detect.py` contains model initialization, prediction, clustering, genotyping, and VCF output logic. `data/` stores small reference/example files, and `model_predict.h5` is the bundled pretrained weight file.

## Build, Test, and Development Commands
Use the Python 3.11 environment described in the README:

```bash
conda create -n SVHunter python=3.11
conda activate SVHunter
conda install python=3.11 numpy pandas tensorflow=2.12.1 pysam scikit-learn=1.5.1
```

Generate model inputs:

```bash
python SVHunter.py generate <bam> <datapath> [threads] [includecontig]
```

Run calling and VCF generation:

```bash
python SVHunter.py call ./model_predict.h5 ./datapath <bam> ./predict ./vcf 4 "['12']" 1
```

There is no `Makefile`, `pytest` suite, or CI config in the repository, so development validation is done with targeted smoke runs.

## Coding Style & Naming Conventions
Follow the current script-oriented Python style: 4-space indentation, snake_case for functions and variables, and minimal comments outside complex logic. Keep imports near the top of each file. Preserve existing positional CLI behavior unless a change is intentionally user-facing and documented in `README.md`.

## Testing Guidelines
No automated tests are checked in. Validate edits by running `generate` or `call` on a small BAM input and limiting `includecontig` to one or two contigs for faster iteration. When behavior changes, compare the produced `.npy` files or VCF output before and after. If you add a test suite, create a top-level `tests/` directory and use `pytest` naming such as `test_call_pipeline.py`.

## Commit & Pull Request Guidelines
Recent history uses short imperative subjects such as `Update README.md` and `Delete SVHunter.py`, but also includes vague `Add files via upload` commits. Prefer specific messages like `Fix contig parsing in call mode`. Pull requests should state which workflow is affected, list any BAM/GPU assumptions, and include the exact command used for verification plus a short sample of the resulting output files.

## Configuration Notes
`SVHunter.py` and `SVHunter_detect.py` currently hardcode `CUDA_VISIBLE_DEVICES="4"`. Flag any GPU-related changes clearly in reviews, and prefer configurable behavior over adding more machine-specific defaults.
