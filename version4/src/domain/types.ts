// ── Pipeline stage / status ──────────────────────────────────────
export type StageStatus = 'pending' | 'running' | 'success' | 'failed';

export interface PipelineStage {
  id: string;
  name: string;
  description: string;
  status: StageStatus;
  progress: number;
}

// ── SV / VCF records ────────────────────────────────────────────
export interface SvRecord {
  chrom: string;
  pos: number;
  id: string;
  ref: string;
  alt: string;
  qual: string;
  filter: string;
  info: string;
  svType: string;
  svLen: number | null;
  end: number | null;
  genotype: string;
}

export interface SvTypeFrequency {
  type: string;
  count: number;
}

export interface ChromFrequency {
  chrom: string;
  count: number;
}

// ── Log entries ─────────────────────────────────────────────────
export interface LogEntry {
  timestamp: string;
  stage: string;
  message: string;
  level: 'info' | 'warn' | 'error';
}

// ── Pipeline run params ─────────────────────────────────────────
export type PipelineMode = 'generate' | 'call';

export interface GenerateParams {
  bamPath: string;
  outputDir: string;
  threads: number;
  chroms: string[];
}

export interface CallParams {
  modelPath: string;
  dataPath: string;
  bamPath: string;
  predictPath: string;
  vcfOutputPath: string;
  threads: number;
  gpus: number;
}

// ── API response types ──────────────────────────────────────────
export interface TaskInfo {
  taskId: string;
  mode: string;
  status: StageStatus;
  elapsed: number | null;
  error: string | null;
  logCount: number;
}

export interface SampleInfo {
  name: string;
  path: string;
  vcfCount: number;
  vcfFiles: string[];
}

export interface SampleSummary {
  sampleName: string;
  total: number;
  byType: SvTypeFrequency[];
  byChrom: ChromFrequency[];
  medianLength: number | null;
  vcfFiles: string[];
}

export interface VcfResponse {
  total: number;
  offset: number;
  limit: number;
  records: SvRecord[];
}

// ── Algorithm flow stage descriptions ───────────────────────────
export interface AlgorithmStage {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  details: string[];
  params: { label: string; value: string }[];
  color: string;
}
