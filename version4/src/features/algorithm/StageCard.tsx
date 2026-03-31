import { useEffect, useRef, useState } from 'react';
import type { AlgorithmStage } from '../../domain/types';
import StageAnimation from './StageAnimation';

interface Props {
  stage: AlgorithmStage;
  index: number;
  isActive: boolean;
  animPlaying: boolean;
}

export default function StageCard({ stage, index, isActive, animPlaying }: Props) {
  const [manualOpen, setManualOpen] = useState(false);
  const expanded = isActive || manualOpen;

  const cardRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (isActive && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [isActive]);

  return (
    <div
      ref={cardRef}
      className={`rounded-xl overflow-hidden transition-all duration-500 ${
        isActive ? 'border-2 shadow-lg' : 'border border-slate-200 hover:border-slate-300'
      }`}
      style={{
        borderColor: isActive ? stage.color : undefined,
        backgroundColor: isActive ? `${stage.color}08` : 'rgba(255,255,255,0.8)',
        boxShadow: isActive ? `0 0 24px ${stage.color}18` : undefined,
      }}
    >
      <div className="h-1" style={{ background: stage.color, opacity: isActive ? 1 : 0.4 }} />

      <button onClick={() => setManualOpen((v) => !v)} className="w-full text-left px-5 py-3 flex items-center gap-4">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 transition-all duration-300"
          style={{
            background: isActive ? `${stage.color}22` : `${stage.color}10`,
            color: stage.color,
            transform: isActive ? 'scale(1.1)' : 'scale(1)',
            boxShadow: isActive ? `0 0 12px ${stage.color}33` : 'none',
          }}
        >
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-slate-800">{stage.title}</h3>
            <span className="text-xs text-slate-400">{stage.subtitle}</span>
            {isActive && (
              <span className="px-2 py-0.5 rounded text-[10px] font-medium" style={{ background: `${stage.color}15`, color: stage.color }}>
                当前阶段
              </span>
            )}
          </div>
        </div>
        <span className="text-slate-400 text-lg shrink-0 transition-transform duration-300" style={{ transform: expanded ? 'rotate(45deg)' : 'rotate(0deg)' }}>
          +
        </span>
      </button>

      <div className={`stage-card-body ${expanded ? 'expanded' : 'collapsed'}`}>
        <div className="px-4 pb-4 pt-0 space-y-4">
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-2">
            <StageAnimation stageId={stage.id} color={stage.color} playing={expanded && animPlaying} />
          </div>
          <div className="flex flex-wrap gap-2">
            {stage.params.map((p) => (
              <div key={p.label} className="bg-slate-100 rounded-lg px-3 py-1.5 flex items-center gap-2">
                <span className="text-[11px] text-slate-500">{p.label}</span>
                <span className="text-xs font-medium" style={{ color: stage.color }}>{p.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
