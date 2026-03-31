import { useCallback, useEffect, useState } from 'react';
import { algorithmStages } from '../../data/mockData';
import FlowDiagram from './FlowDiagram';
import StageCard from './StageCard';

const STAGE_DWELL_MS = 3000;

export default function AlgorithmPage() {
  const [activeStage, setActiveStage] = useState(-1);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => {
      setActiveStage((s) => (s + 1 > 3 ? -1 : s + 1));
    }, STAGE_DWELL_MS);
    return () => clearInterval(timer);
  }, [playing]);

  useEffect(() => {
    if (!playing || activeStage !== -1) return;
    const t = setTimeout(() => setActiveStage(0), 800);
    return () => clearTimeout(t);
  }, [playing, activeStage]);

  const handleStageClick = useCallback((index: number) => { setPlaying(false); setActiveStage(index); }, []);
  const goPrev = () => { setPlaying(false); setActiveStage((s) => Math.max(0, s - 1)); };
  const goNext = () => { setPlaying(false); setActiveStage((s) => Math.min(3, s + 1)); };
  const togglePlay = () => { setPlaying((p) => !p); if (!playing && activeStage === -1) setActiveStage(0); };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-800">算法流程可视化</h2>
        <p className="text-sm text-slate-500 mt-1">SVHunter 四阶段检测流水线 — 点击各阶段或使用控制按钮查看详情</p>
      </div>

      <div className="bg-white/80 border border-slate-200 rounded-xl p-6 shadow-sm">
        <FlowDiagram activeStage={activeStage} onStageClick={handleStageClick} />
        <div className="flex items-center justify-center gap-3 mt-4 pt-3 border-t border-slate-200">
          <button onClick={goPrev} disabled={activeStage <= 0}
            className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-sm hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
            ◀ 上一步
          </button>
          <button onClick={togglePlay}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${playing ? 'bg-blue-100 text-blue-600 border border-blue-200' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
            {playing ? '⏸ 暂停' : '▶ 播放'}
          </button>
          <button onClick={goNext} disabled={activeStage >= 3}
            className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-sm hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
            下一步 ▶
          </button>
          <div className="flex items-center gap-1.5 ml-4">
            {algorithmStages.map((stage, i) => (
              <button key={i} onClick={() => handleStageClick(i)}
                className="w-2.5 h-2.5 rounded-full transition-all duration-300"
                style={{ background: activeStage === i ? stage.color : '#cbd5e1', transform: activeStage === i ? 'scale(1.4)' : 'scale(1)', boxShadow: activeStage === i ? `0 0 8px ${stage.color}66` : 'none' }}
                title={stage.title} />
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {algorithmStages.map((stage, i) => (
          <StageCard key={stage.id} stage={stage} index={i} isActive={activeStage === i} animPlaying={activeStage === i || !playing} />
        ))}
      </div>
    </div>
  );
}
