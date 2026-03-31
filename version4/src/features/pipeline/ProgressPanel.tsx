import { useEffect, useRef, useState } from 'react';
import type { StageStatus } from '../../domain/types';
import { subscribeProgress, getTaskStatus } from '../../data/api';

interface Props {
  taskId: string | null;
}

const STATUS_BADGE: Record<string, string> = {
  pending: 'bg-slate-200 text-slate-600',
  running: 'bg-blue-100 text-blue-600 animate-pulse',
  success: 'bg-emerald-100 text-emerald-700',
  failed: 'bg-red-100 text-red-600',
};

export default function ProgressPanel({ taskId }: Props) {
  const [logs, setLogs] = useState<string[]>([]);
  const [status, setStatus] = useState<StageStatus>('pending');
  const [elapsed, setElapsed] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!taskId) return;
    setLogs([]);
    setStatus('running');
    setError(null);
    const unsub = subscribeProgress(
      taskId,
      (line) => setLogs((prev) => [...prev, line]),
      (doneStatus, doneError) => { setStatus(doneStatus as StageStatus); setError(doneError); },
    );
    const timer = setInterval(async () => {
      try {
        const info = await getTaskStatus(taskId);
        setElapsed(info.elapsed);
        if (info.status === 'success' || info.status === 'failed') { setStatus(info.status); clearInterval(timer); }
      } catch { /* ignore */ }
    }, 2000);
    return () => { unsub(); clearInterval(timer); };
  }, [taskId]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [logs]);

  if (!taskId) {
    return (
      <div className="border border-dashed border-slate-300 rounded-lg p-8 text-center text-slate-400 text-sm">
        填写参数并点击运行后，此处将显示实时进度
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className={`px-2.5 py-1 rounded text-xs font-medium ${STATUS_BADGE[status]}`}>{status.toUpperCase()}</span>
          <span className="text-xs text-slate-400">Task: {taskId}</span>
        </div>
        {elapsed !== null && <span className="text-xs text-slate-400">{elapsed.toFixed(1)}s</span>}
      </div>
      {error && <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-sm text-red-600">{error}</div>}
      <div className="bg-slate-900 border border-slate-200 rounded-lg h-80 overflow-y-auto font-mono text-xs p-3 space-y-0.5">
        {logs.length === 0 && <span className="text-slate-500">Waiting for output...</span>}
        {logs.map((line, i) => (
          <div key={i} className="text-slate-300 whitespace-pre-wrap break-all leading-5">
            <span className="text-slate-600 select-none mr-2">{String(i + 1).padStart(4)}</span>{line}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
