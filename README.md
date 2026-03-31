# SVHunter
SVHunter is a long-read-based structural variation detection through transformer model.
SVHunter can detect and genotype DEL/INS/DUP/INV/TRA.
The shared pre-trained model is compatible with CCS, CLR, and ONT sequencing data, allowing for structural variation detection across these platforms without the need for additional training or fine-tuning.

## Installation
### Requirements
* python 3.11, numpy, pandas, TensorFlow 2.12.1, pysam, math,  scikit-learn 1.5.1
### 1. Create a virtual environment  
```
#create
conda create -n SVHunter python=3.11
#activate
conda activate SVHunter
#deactivate
conda deactivate
```   
### 2. clone SVHunter
* After creating and activating the SVHunter virtual environment, download SVHunter from github:
```　 
git clone https://github.com/eioyuou/SVHunter.git
cd SVHunter
```
### 3. Install 
```　
conda activate SVHunter
conda install python 3.11, numpy, pandas, TensorFlow 2.12.1, pysam, math,  scikit-learn 1.5.1
```
## Usage
### 1.Produce data for call SV
```　 
python SVHunter.py generate bamfile_path_long output_data_folder thread includecontig(default:[](all chromosomes))
    
bamfile_path_long is the path to the alignment file between the reference genome and the long-read dataset.;    
output_data_folder is the directory used to store the generated data.;  
thread specifies the number of threads to use;  
includecontig is the list of contigs to perform detection on (default: [], meaning all contigs are used).
   
eg: python SVHunter.py generate ./long_read.bam ./outpath 16 [12,13,14,15,16,17,18,19,20,21,22] 

``` 
### 2.Call SV 

SVHunter achieves optimal performance with GPU acceleration. While it can be run on a CPU, the computational efficiency will be significantly lower. Users are encouraged to use a GPU for the best experience.
```　 
python SVHunter.py call predict_weight,datapath,bamfilepath,predict_path,outvcfpath,thread,includecontig,num_gpus

Parameters:
- predict_weight: path to the model weights file
- datapath: folder used to store evaluation data 
- bamfilepath: path to the alignment file between reference and long read set
- predict_path: path for model prediction data
- outvcfpath: path for output vcf file
- thread: number of threads to use
- includecontig: list of contigs to perform detection on (default: [], meaning all contigs will be used)
- num_gpus: number of GPUs to use (optional parameter, default: auto-detect and use all available GPUs)

Usage examples:
# Use default GPU configuration
python SVHunter.py call ./predict_weight.h5 ./datapath ./long_read.bam ./predict_path ./outvcfpath 10 [12,13,14,15,16,17,18,19,20,21,22]

# Specify using 2 GPUs
python SVHunter.py call ./predict_weight.h5 ./datapath ./long_read.bam ./predict_path ./outvcfpath 10 [12,13,14,15,16,17,18,19,20,21,22] 2

# Use all contigs and specify 1 GPU
python SVHunter.py call ./predict_weight.h5 ./datapath ./long_read.bam ./predict_path ./outvcfpath 10 [] 1  
```  


---

## Web Interface (version4)

SVHunter v4 provides a web-based interface for running the pipeline and browsing results without using the command line.

### Environment Setup

Two separate conda environments are required:

**1. Inference environment** (`svhunter-infer`) — runs SVHunter.py:
```bash
conda create -n svhunter-infer python=3.11 -y
conda activate svhunter-infer
python -m pip install --upgrade pip setuptools wheel
python -m pip install "numpy==1.24.3" "pandas==2.0.3" "scipy==1.10.1" "scikit-learn==1.5.1" "pysam==0.22.1" "tensorflow==2.12.1"
```

For GPU support (CUDA 11.8 / TF 2.12.1, tested with RTX 4060):
```bash
python -m pip install \
  nvidia-cudnn-cu11==8.6.0.163 \
  nvidia-cuda-runtime-cu11==11.8.89 \
  nvidia-cufft-cu11==10.9.0.58 \
  nvidia-curand-cu11==10.3.0.86 \
  nvidia-cusolver-cu11==11.4.1.48 \
  nvidia-cusparse-cu11==11.7.5.86
```

**2. API environment** (`svhunter-api`) — runs the FastAPI backend:
```bash
conda create -n svhunter-api python=3.11 -y
conda run -n svhunter-api python -m pip install -r version4/server/requirements.txt
```

**3. Frontend dependencies:**
```bash
npm --prefix version4 install
```

### WSL Memory (if running on WSL2)

Add to `C:\Users\<username>\.wslconfig`:
```ini
[wsl2]
memory=16GB
swap=8GB
```
Then run `wsl --shutdown` and restart.

### Starting the Services

**Terminal 1 — Backend:**
```bash
cd version4
/home/<user>/miniconda3/envs/svhunter-api/bin/python -m uvicorn server.main:app --port 8000
```
Verify: http://localhost:8000/api/health → `{"status":"ok"}`

**Terminal 2 — Frontend:**
```bash
cd version4
npm run dev
```
Open http://localhost:5173

### Running Inference via the UI

**Step 1 — Generate features (Pipeline → Generate):**

| Field | Example |
|-------|--------|
| BAM file path | `/abs/path/to/HG002.subset.bam` |
| Output directory | `/abs/path/to/datapath` |
| Threads | `1` |
| Chromosomes | `1` (no `chr` prefix for GRCh38 BAMs without chr prefix) |

> The output directory must exist before running. Create it with `mkdir -p /path/to/datapath`.

**Step 2 — Call SVs (Pipeline → Call):**

| Field | Example |
|-------|--------|
| Model weights | `/abs/path/to/model_predict.h5` |
| Feature data dir | same as Generate output dir |
| BAM file path | same BAM as Step 1 |
| Predict output dir | `/abs/path/to/predict` |
| VCF output dir | `/abs/path/to/vcf` |
| Threads | `1` |
| Chromosomes | `1` |
| GPUs | `1` (or `0` for CPU-only) |

> Both `predict/` and `vcf/` directories must exist before running.

**Step 3 — View results (Results page):**

Results are loaded automatically from the `vcf/` directory next to `version4/`. The page shows:
- SV counts by type (DEL/INS/DUP/INV/TRA)
- Chromosome distribution chart
- Filterable VCF record table

### Notes

- Chromosome names must match the BAM file exactly. HG002 GRCh38 BAMs typically use `1`, `2`, ... (no `chr` prefix).
- GPU device is fixed to index `0`. If you have multiple GPUs, edit `CUDA_VISIBLE_DEVICES` in `SVHunter.py` and `SVHunter_detect.py`.
- The backend automatically searches for VCF results in `../vcf/` relative to `version4/`. Override with `VCF_SEARCH_DIRS=/path/to/vcf uvicorn ...`.
