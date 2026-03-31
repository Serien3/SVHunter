import { useState } from 'react';
import type { PipelineMode, GenerateParams, CallParams } from '../../domain/types';
import { startGenerate, startCall } from '../../data/api';
import GenerateForm from './GenerateForm';
import CallForm from './CallForm';
import ProgressPanel from './ProgressPanel';

export default function PipelinePage() {
  const [mode, setMode] = useState<PipelineMode>('generate');
  const [taskId, setTaskId] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  const handleGenerate = async (params: GenerateParams) => {
    setRunning(true);
    try {
      const { taskId: id } = await startGenerate(params);
      setTaskId(id);
    } catch (err) {
      alert(`Failed to start: ${err}`);
      setRunning(false);
    }
  };

  const handleCall = async (params: CallParams) => {
    setRunning(true);
    try {
      const { taskId: id } = await startCall(params);
      setTaskId(id);
    } catch (err) {
      alert(`Failed to start: ${err}`);
      setRunning(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-800">Pipeline 运行控制台</h2>
        <p className="text-sm text-slate-500 mt-1">配置参数并运行 SVHunter 检测管线</p>
      </div>

      {/* mode tabs */}
      <div className="flex gap-2">
        {(['generate', 'call'] as PipelineMode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              mode === m
                ? m === 'generate'
                  ? 'bg-blue-600 text-white'
                  : 'bg-violet-600 text-white'
                : 'bg-white text-slate-500 hover:text-slate-700 border border-slate-200'
            }`}
          >
            {m === 'generate' ? 'Generate (特征提取)' : 'Call (SV 检测)'}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white/80 border border-slate-200 rounded-xl p-5 shadow-sm">
          <h3 className="text-sm font-medium text-slate-600 mb-4">
            {mode === 'generate' ? '特征生成参数' : 'SV 检测参数'}
          </h3>
          {mode === 'generate' ? (
            <GenerateForm onSubmit={handleGenerate} disabled={running} />
          ) : (
            <CallForm onSubmit={handleCall} disabled={running} />
          )}
        </div>
        <div>
          <h3 className="text-sm font-medium text-slate-600 mb-4">运行进度</h3>
          <ProgressPanel taskId={taskId} />
        </div>
      </div>
    </div>
  );
}
