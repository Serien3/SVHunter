import { useState } from 'react';
import type { GenerateParams } from '../../domain/types';

interface Props {
  onSubmit: (params: GenerateParams) => void;
  disabled?: boolean;
}

export default function GenerateForm({ onSubmit, disabled }: Props) {
  const [bamPath, setBamPath] = useState('/mnt/d/desk/study/大三下/计算机设计/SVHunter-1/HG002_subset_BAM/HG002.subset.bam');
  const [outputDir, setOutputDir] = useState('/mnt/d/desk/study/大三下/计算机设计/SVHunter-1/datapath');
  const [threads, setThreads] = useState(4);
  const [chromsStr, setChromsStr] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const chroms = chromsStr.split(',').map((s) => s.trim()).filter(Boolean);
    onSubmit({ bamPath, outputDir, threads, chroms });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm text-slate-500 mb-1">BAM 文件路径</label>
        <input type="text" value={bamPath} onChange={(e) => setBamPath(e.target.value)}
          placeholder="/path/to/long_read.bam" required
          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100" />
      </div>
      <div>
        <label className="block text-sm text-slate-500 mb-1">输出目录</label>
        <input type="text" value={outputDir} onChange={(e) => setOutputDir(e.target.value)}
          placeholder="/path/to/output" required
          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-slate-500 mb-1">线程数</label>
          <input type="number" value={threads} onChange={(e) => setThreads(Number(e.target.value))} min={1} max={64}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100" />
        </div>
        <div>
          <label className="block text-sm text-slate-500 mb-1">染色体列表 <span className="text-slate-400">(可选)</span></label>
          <input type="text" value={chromsStr} onChange={(e) => setChromsStr(e.target.value)}
            placeholder="1,2,3 或留空"
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100" />
        </div>
      </div>
      <button type="submit" disabled={disabled}
        className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium transition-colors">
        开始生成特征数据
      </button>
    </form>
  );
}
