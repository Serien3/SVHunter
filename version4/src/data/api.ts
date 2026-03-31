/**
 * API client — wraps fetch calls to the FastAPI backend.
 * Falls back to mock data when the backend is unreachable.
 */

import type {
  GenerateParams,
  CallParams,
  TaskInfo,
  SampleInfo,
  SampleSummary,
  VcfResponse,
} from '../domain/types';
import { mockSummary, mockRecords } from './mockData';

const BASE = '/api';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, init);
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`API ${res.status}: ${body}`);
  }
  return res.json();
}

function jsonPost(body: unknown): RequestInit {
  return {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}

// ── Pipeline ────────────────────────────────────────────────────
export async function startGenerate(params: GenerateParams) {
  return request<{ taskId: string }>('/pipeline/generate', jsonPost(params));
}

export async function startCall(params: CallParams) {
  return request<{ taskId: string }>('/pipeline/call', jsonPost(params));
}

export async function getTaskStatus(taskId: string) {
  return request<TaskInfo>(`/pipeline/status/${taskId}`);
}

export function subscribeProgress(
  taskId: string,
  onLog: (line: string) => void,
  onDone: (status: string, error: string | null) => void,
): () => void {
  const es = new EventSource(`${BASE}/pipeline/progress/${taskId}`);
  es.onmessage = (e) => {
    const data = JSON.parse(e.data);
    if (data.type === 'log') onLog(data.line);
    if (data.type === 'done') {
      onDone(data.status, data.error);
      es.close();
    }
  };
  es.onerror = () => {
    onDone('failed', 'SSE connection lost');
    es.close();
  };
  return () => es.close();
}

// ── Results ─────────────────────────────────────────────────────
export async function listSamples(dir?: string) {
  const q = dir ? `?dir=${encodeURIComponent(dir)}` : '';
  return request<SampleInfo[]>(`/results/samples${q}`);
}

export async function getSampleSummary(name: string, dir?: string) {
  const q = dir ? `?dir=${encodeURIComponent(dir)}` : '';
  return request<SampleSummary>(`/results/samples/${name}${q}`);
}

export async function getVcfRecords(
  name: string,
  opts?: { dir?: string; svType?: string; chrom?: string; limit?: number; offset?: number },
) {
  const params = new URLSearchParams();
  if (opts?.dir) params.set('dir', opts.dir);
  if (opts?.svType) params.set('svType', opts.svType);
  if (opts?.chrom) params.set('chrom', opts.chrom);
  if (opts?.limit) params.set('limit', String(opts.limit));
  if (opts?.offset) params.set('offset', String(opts.offset));
  const q = params.toString() ? `?${params}` : '';
  return request<VcfResponse>(`/results/samples/${name}/vcf${q}`);
}

// ── Mock fallbacks ──────────────────────────────────────────────
export function getMockSummary(): SampleSummary {
  return mockSummary;
}

export function getMockRecords() {
  return { total: mockRecords.length, offset: 0, limit: 500, records: mockRecords };
}
