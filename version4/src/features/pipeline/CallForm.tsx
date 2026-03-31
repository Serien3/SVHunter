import { useState } from 'react';
import type { CallParams } from '../../domain/types';

interface Props {
  onSubmit: (params: CallParams) => void;
  disabled?: boolean;
}

export default function CallForm({ onSubmit, disabled }: Props) {
  const [modelPath, setModelPath] = useState('/mnt/d/desk/study/大三下/计算机设计/SVHunter-1/model_predict.h5');
  const [dataPath, setDataPath] = useState('/mnt/d/desk/study/大三下/计算机设计/SVHunter-1/datapath');
  const [bamPath, setBamPath] = useState('/mnt/d/desk/study/大三下/计算机设计/SVHunter-1/HG002_subset_BAM/HG002.subset.bam');
  const [predictPath, setPredictPath] = useState('/mnt/d/desk/study/大三下/计算机设计/SVHunter-1/predict');
  const [vcfOutputPath, setVcfOutputPath] = useState('/mnt/d/desk/study/大三下/计算机设计/SVHunter-1/vcf');
  const [threads, setThreads] = useState(4);
  const [gpus, setGpus] = useState(1);
  const [chromsStr, setChromsStr] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const chroms = chromsStr.split(',').map((s) => s.trim()).filter(Boolean);
    onSubmit({ modelPath, dataPath, bamPath, predictPath, vcfOutputPath, threads, gpus, chroms } as CallParams & { chroms: string[] });
  };

  const inputCls = "w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm text-slate-500 mb-1">模型权重路径</label>
        <input type="text" value={modelPath} onChange={(e) => setModelPath(e.target.value)} required className={inputCls} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-slate-500 mb-1">特征数据目录</label>
          <input type="text" value={dataPath} onChange={(e) => setDataPath(e.target.value)} placeholder="generate 输出的目录" required className={inputCls} />
        </div>
        <div>
          <label className="block text-sm text-slate-500 mb-1">BAM 文件路径</label>
          <input type="text" value={bamPath} onChange={(e) => setBamPath(e.target.value)} placeholder="/path/to/long_read.bam" required className={inputCls} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-slate-500 mb-1">预测输出目录</label>
          <input type="text" value={predictPath} onChange={(e) => setPredictPath(e.target.value)} placeholder="/path/to/predict" required className={inputCls} />
        </div>
        <div>
          <label className="block text-sm text-slate-500 mb-1">VCF 输出目录</label>
          <input type="text" value={vcfOutputPath} onChange={(e) => setVcfOutputPath(e.target.value)} placeholder="/path/to/vcf_output" required className={inputCls} />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm text-slate-500 mb-1">线程数</label>
          <input type="number" value={threads} onChange={(e) => setThreads(Number(e.target.value))} min={1} max={64} className={inputCls} />
        </div>
        <div>
          <label className="block text-sm text-slate-500 mb-1">GPU 数量</label>
          <input type="number" value={gpus} onChange={(e) => setGpus(Number(e.target.value))} min={0} max={8} className={inputCls} />
        </div>
        <div>
          <label className="block text-sm text-slate-500 mb-1">染色体 <span className="text-slate-400">(可选)</span></label>
          <input type="text" value={chromsStr} onChange={(e) => setChromsStr(e.target.value)} placeholder="留空=全部" className={inputCls} />
        </div>
      </div>
      <button type="submit" disabled={disabled}
        className="w-full py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium transition-colors">
        开始 SV 检测
      </button>
    </form>
  );
}
