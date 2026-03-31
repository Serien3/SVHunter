import { algorithmStages } from '../../data/mockData';

interface Props {
  activeStage: number;
  onStageClick: (index: number) => void;
}

export default function FlowDiagram({ activeStage, onStageClick }: Props) {
  const stageW = 120, stageH = 64, gapArrow = 50, nodeR = 32, startX = 50, centerY = 55;
  const bamX = startX;
  const firstStageX = bamX + nodeR + gapArrow;
  const stagePositions = algorithmStages.map((_, i) => firstStageX + i * (stageW + gapArrow));
  const vcfX = stagePositions[3] + stageW + gapArrow;
  const totalW = vcfX + nodeR + 30;

  return (
    <div className="w-full overflow-x-auto pb-2">
      <svg viewBox={`0 0 ${totalW} 120`} className="w-full" style={{ minWidth: 700, height: 120 }}>
        <defs>
          {algorithmStages.map((s, i) => (
            <filter key={i} id={`glow-${i}`} x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feFlood floodColor={s.color} floodOpacity="0.4" result="color" />
              <feComposite in="color" in2="blur" operator="in" result="glow" />
              <feMerge><feMergeNode in="glow" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          ))}
        </defs>

        {/* BAM node */}
        <g>
          <circle cx={bamX} cy={centerY} r={nodeR} fill="#f1f5f9" stroke={activeStage <= 0 ? '#94a3b8' : '#cbd5e1'} strokeWidth="2">
            {activeStage <= 0 && <animate attributeName="stroke-opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />}
          </circle>
          <text x={bamX} y={centerY + 1} fill="#475569" fontSize="11" textAnchor="middle" fontWeight="bold">BAM</text>
          <text x={bamX} y={centerY + 42} fill="#94a3b8" fontSize="8" textAnchor="middle">输入文件</text>
        </g>

        {/* Stages */}
        {algorithmStages.map((stage, i) => {
          const sx = stagePositions[i];
          const prevEndX = i === 0 ? bamX + nodeR : stagePositions[i - 1] + stageW;
          const arrowY = centerY;
          const isActive = activeStage === i, isPast = activeStage > i, isFuture = activeStage < i && activeStage !== -1;

          return (
            <g key={stage.id}>
              <line x1={prevEndX + 4} y1={arrowY} x2={sx - 4} y2={arrowY}
                stroke={isPast || isActive ? stage.color : '#cbd5e1'} strokeWidth={isActive ? 2 : 1.5} opacity={isFuture ? 0.3 : 0.7} />
              <polygon points={`${sx - 6},${arrowY - 4} ${sx},${arrowY} ${sx - 6},${arrowY + 4}`}
                fill={isPast || isActive ? stage.color : '#cbd5e1'} opacity={isFuture ? 0.3 : 0.7} />

              {(isActive || isPast) && [0, 1, 2].map((pi) => (
                <circle key={pi} r="2.5" fill={stage.color} opacity="0.8">
                  <animateMotion dur={`${1.2 + pi * 0.3}s`} repeatCount="indefinite" begin={`${pi * 0.4}s`}
                    path={`M ${prevEndX + 4},${arrowY} L ${sx - 4},${arrowY}`} />
                  <animate attributeName="opacity" values="0;0.9;0.9;0" dur={`${1.2 + pi * 0.3}s`} repeatCount="indefinite" begin={`${pi * 0.4}s`} />
                </circle>
              ))}

              <g onClick={() => onStageClick(i)} style={{ cursor: 'pointer' }}>
                <rect x={sx} y={centerY - stageH / 2} width={stageW} height={stageH} rx="10"
                  fill={isActive ? `${stage.color}18` : isPast ? `${stage.color}0a` : '#ffffff'}
                  stroke={isActive ? stage.color : isPast ? stage.color : '#cbd5e1'}
                  strokeWidth={isActive ? 2.5 : 1.5} opacity={isFuture ? 0.35 : 1}
                  filter={isActive ? `url(#glow-${i})` : undefined}
                  style={{ transition: 'all 0.4s ease' }} />
                {isActive && (
                  <rect x={sx - 3} y={centerY - stageH / 2 - 3} width={stageW + 6} height={stageH + 6} rx="12" fill="none" stroke={stage.color} strokeWidth="1">
                    <animate attributeName="opacity" values="0.5;0;0.5" dur="1.5s" repeatCount="indefinite" />
                    <animate attributeName="stroke-width" values="1;3;1" dur="1.5s" repeatCount="indefinite" />
                  </rect>
                )}
                <text x={sx + stageW / 2} y={centerY - 6} fill={isActive || isPast ? stage.color : '#94a3b8'}
                  fontSize="9" textAnchor="middle" fontWeight="bold" opacity={isFuture ? 0.4 : 1}>Stage {i + 1}</text>
                <text x={sx + stageW / 2} y={centerY + 10} fill={isActive ? '#1e293b' : isPast ? '#64748b' : '#94a3b8'}
                  fontSize="10" textAnchor="middle" opacity={isFuture ? 0.4 : 1}>{stage.title}</text>
              </g>
            </g>
          );
        })}

        {/* Arrow to VCF */}
        {(() => {
          const lastEnd = stagePositions[3] + stageW; const isPast = activeStage >= 3;
          return (<>
            <line x1={lastEnd + 4} y1={centerY} x2={vcfX - nodeR - 4} y2={centerY} stroke={isPast ? '#10b981' : '#cbd5e1'} strokeWidth="1.5" opacity={isPast ? 0.7 : 0.3} />
            <polygon points={`${vcfX - nodeR - 6},${centerY - 4} ${vcfX - nodeR},${centerY} ${vcfX - nodeR - 6},${centerY + 4}`} fill={isPast ? '#10b981' : '#cbd5e1'} opacity={isPast ? 0.7 : 0.3} />
            {isPast && [0, 1].map((pi) => (
              <circle key={pi} r="2.5" fill="#10b981" opacity="0.8">
                <animateMotion dur={`${1 + pi * 0.4}s`} repeatCount="indefinite" begin={`${pi * 0.5}s`} path={`M ${lastEnd + 4},${centerY} L ${vcfX - nodeR - 4},${centerY}`} />
                <animate attributeName="opacity" values="0;0.9;0.9;0" dur={`${1 + pi * 0.4}s`} repeatCount="indefinite" begin={`${pi * 0.5}s`} />
              </circle>
            ))}
          </>);
        })()}

        {/* VCF node */}
        <g>
          <circle cx={vcfX} cy={centerY} r={nodeR} fill={activeStage >= 3 ? '#ecfdf5' : '#f8fafc'}
            stroke={activeStage >= 3 ? '#10b981' : '#cbd5e1'} strokeWidth="2">
            {activeStage >= 3 && <animate attributeName="stroke-opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />}
          </circle>
          <text x={vcfX} y={centerY + 1} fill={activeStage >= 3 ? '#10b981' : '#94a3b8'} fontSize="11" textAnchor="middle" fontWeight="bold">VCF</text>
          <text x={vcfX} y={centerY + 42} fill="#94a3b8" fontSize="8" textAnchor="middle">输出结果</text>
        </g>
      </svg>
    </div>
  );
}
