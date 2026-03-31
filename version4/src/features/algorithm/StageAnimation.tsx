import { useEffect, useState } from 'react';

interface Props {
  stageId: string;
  color: string;
  playing: boolean;
}

export default function StageAnimation({ stageId, color, playing }: Props) {
  switch (stageId) {
    case 'feature-extraction':
      return <FeatureExtractionAnim color={color} playing={playing} />;
    case 'model-prediction':
      return <ModelPredictionAnim color={color} playing={playing} />;
    case 'candidate-clustering':
      return <ClusteringAnim color={color} playing={playing} />;
    case 'genotyping-output':
      return <GenotypingAnim color={color} playing={playing} />;
    default:
      return null;
  }
}

/* ── Stage 1: Feature Extraction ───────────────────────────────── */

function FeatureExtractionAnim({ color, playing }: { color: string; playing: boolean }) {
  const [step, setStep] = useState(0);
  const channels = 20;
  const windowCount = 8;

  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => setStep((s) => (s + 1) % 80), 80);
    return () => clearInterval(t);
  }, [playing]);

  const phase = step < 25 ? 0 : step < 50 ? 1 : 2;

  return (
    <svg viewBox="0 0 700 260" className="w-full" style={{ height: 280 }}>
      {/* ── DNA strand ── */}
      <g>
        {Array.from({ length: 50 }).map((_, i) => {
          const baseX = 10 + i * 8 - (phase === 0 ? step * 2 : 0);
          const bases = ['A', 'T', 'C', 'G'];
          const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b'];
          const idx = (i * 7 + 3) % 4;
          const clipped = Math.max(10, Math.min(140, baseX));
          const visible = baseX > 10 && baseX < 140;
          return (
            <text key={i} x={clipped} y="100" fill={colors[idx]} fontSize="16" fontFamily="monospace" fontWeight="bold" opacity={visible ? 0.9 : 0.15}>
              {bases[idx]}
            </text>
          );
        })}
        {/* double helix decorative lines */}
        <path d="M 10,70 Q 40,55 70,70 T 130,70" fill="none" stroke={color} strokeWidth="1.5" opacity="0.25" />
        <path d="M 10,120 Q 40,135 70,120 T 130,120" fill="none" stroke={color} strokeWidth="1.5" opacity="0.25" />
        {/* scan line */}
        {phase === 0 && (
          <rect x={15 + (step % 25) * 5} y="60" width="3" height="80" rx="1" fill={color} opacity="0.7">
            <animate attributeName="opacity" values="0.3;0.9;0.3" dur="0.5s" repeatCount="indefinite" />
          </rect>
        )}
      </g>

      {/* ── Arrow 1 ── */}
      <g>
        <line x1="165" y1="95" x2="210" y2="95" stroke="#94a3b8" strokeWidth="2" />
        <polygon points="210,89 222,95 210,101" fill="#94a3b8" />
        {(phase >= 1) && [0, 1].map((pi) => (
          <circle key={pi} r="3" fill={color} opacity="0.8">
            <animateMotion dur={`${0.8 + pi * 0.3}s`} repeatCount="indefinite" begin={`${pi * 0.4}s`} path="M 165,95 L 210,95" />
            <animate attributeName="opacity" values="0;1;1;0" dur={`${0.8 + pi * 0.3}s`} repeatCount="indefinite" begin={`${pi * 0.4}s`} />
          </circle>
        ))}
      </g>

      {/* ── Windows ── */}
      <g>
        {Array.from({ length: windowCount }).map((_, i) => {
          const x = 235 + i * 30;
          const visible = phase >= 1 ? Math.min(1, (step - 25 - i * 2) / 6) : 0;
          return (
            <g key={i}>
              <rect x={x} y="55" width="24" height="80" rx="4" fill={color} opacity={visible * 0.15} stroke={color} strokeOpacity={visible * 0.5} strokeWidth="1.5" />
              {/* inner lines to suggest data rows */}
              {[0, 1, 2, 3].map((li) => (
                <line key={li} x1={x + 4} y1={65 + li * 18} x2={x + 20} y2={65 + li * 18} stroke={color} strokeWidth="1" opacity={visible * 0.25} />
              ))}
            </g>
          );
        })}
        {phase >= 1 && (
          <text x={235 + windowCount * 15} y="155" fill="#64748b" fontSize="11" textAnchor="middle">2000bp</text>
        )}
      </g>

      {/* ── Arrow 2 ── */}
      <g>
        <line x1={235 + windowCount * 30 + 10} y1="95" x2={235 + windowCount * 30 + 50} y2="95" stroke="#94a3b8" strokeWidth="2" />
        <polygon points={`${235 + windowCount * 30 + 50},89 ${235 + windowCount * 30 + 62},95 ${235 + windowCount * 30 + 50},101`} fill="#94a3b8" />
        {(phase >= 2) && [0, 1].map((pi) => (
          <circle key={pi} r="3" fill={color} opacity="0.8">
            <animateMotion dur={`${0.8 + pi * 0.3}s`} repeatCount="indefinite" begin={`${pi * 0.4}s`} path={`M ${235 + windowCount * 30 + 10},95 L ${235 + windowCount * 30 + 50},95`} />
            <animate attributeName="opacity" values="0;1;1;0" dur={`${0.8 + pi * 0.3}s`} repeatCount="indefinite" begin={`${pi * 0.4}s`} />
          </circle>
        ))}
      </g>

      {/* ── 20-channel feature bars ── */}
      <g>
        {Array.from({ length: channels }).map((_, i) => {
          const barX = 530 + i * 8;
          const targetH = 30 + ((i * 17 + 7) % 60);
          const fillP = phase === 2 ? Math.min(1, (step - 50 - i * 0.8) / 10) : 0;
          const h = targetH * fillP;
          const hue = (i * 18) % 360;
          return (
            <g key={i}>
              {/* background slot */}
              <rect x={barX} y="30" width="6" height="130" rx="2" fill="#e2e8f0" opacity="0.5" />
              {/* fill */}
              <rect x={barX} y={160 - h} width="6" height={h} rx="2" fill={`hsl(${hue}, 70%, 55%)`} opacity={0.3 + fillP * 0.7} />
            </g>
          );
        })}
      </g>

      {/* ── Bottom labels ── */}
      <text x="75" y="175" fill="#94a3b8" fontSize="12" textAnchor="middle">BAM Reads</text>
      <text x={235 + windowCount * 15} y="175" fill="#94a3b8" fontSize="12" textAnchor="middle">Windowing</text>
      <text x="610" y="175" fill="#94a3b8" fontSize="12" textAnchor="middle">20ch Features</text>

      {/* ── Phase indicator bar ── */}
      <rect x="50" y="210" width="600" height="4" rx="2" fill="#e2e8f0" />
      <rect x="50" y="210" width={Math.min(600, (step / 80) * 600)} height="4" rx="2" fill={color} opacity="0.6" />
      <g>
        {['扫描读段', '窗口切分', '特征构建'].map((label, i) => {
          const cx = 50 + 100 + i * 200;
          const active = phase === i;
          return (
            <text key={i} x={cx} y="235" fill={active ? color : '#94a3b8'} fontSize="11" textAnchor="middle" fontWeight={active ? 'bold' : 'normal'}>
              {label}
            </text>
          );
        })}
      </g>
    </svg>
  );
}

/* ── Stage 2: Model Prediction ─────────────────────────────────── */

function ModelPredictionAnim({ color, playing }: { color: string; playing: boolean }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => setStep((s) => (s + 1) % 100), 70);
    return () => clearInterval(t);
  }, [playing]);

  const layers = [
    { label: 'Input', x: 30, nodes: 6, w: 55, h: 160 },
    { label: 'CNN', x: 130, nodes: 8, w: 65, h: 170 },
    { label: 'CBAM', x: 250, nodes: 8, w: 65, h: 170 },
    { label: 'Transformer', x: 370, nodes: 10, w: 90, h: 180 },
    { label: 'Dense', x: 520, nodes: 3, w: 55, h: 100 },
  ];

  const pulseLayer = Math.floor(step / 20) % 5;
  const centerY = 110;

  return (
    <svg viewBox="0 0 700 260" className="w-full" style={{ height: 280 }}>
      {/* connections */}
      {layers.slice(0, -1).map((layer, li) => {
        const next = layers[li + 1];
        const active = pulseLayer === li || pulseLayer === li + 1;
        const nSrc = Math.min(layer.nodes, 5);
        const nDst = Math.min(next.nodes, 5);
        return Array.from({ length: nSrc }).map((_, ni) =>
          Array.from({ length: nDst }).map((_, nj) => {
            const y1 = centerY - layer.h / 2 + 15 + (ni / (nSrc - 1)) * (layer.h - 30);
            const y2 = centerY - next.h / 2 + 15 + (nj / (nDst - 1)) * (next.h - 30);
            return (
              <line key={`${li}-${ni}-${nj}`} x1={layer.x + layer.w} y1={y1} x2={next.x} y2={y2}
                stroke={active ? color : '#e2e8f0'} strokeWidth={active ? 1 : 0.4} opacity={active ? 0.4 : 0.15} />
            );
          })
        );
      })}

      {/* layer boxes + nodes */}
      {layers.map((layer, li) => {
        const isActive = pulseLayer === li;
        const nShow = Math.min(layer.nodes, 5);
        const topY = centerY - layer.h / 2;
        return (
          <g key={li}>
            <rect x={layer.x} y={topY} width={layer.w} height={layer.h} rx="10"
              fill={isActive ? `${color}18` : '#f1f5f9'}
              stroke={isActive ? color : '#cbd5e1'}
              strokeWidth={isActive ? 2.5 : 1}
              style={isActive ? { filter: `drop-shadow(0 0 14px ${color}55)`, transition: 'all 0.3s' } : { transition: 'all 0.3s' }}
            />
            {Array.from({ length: nShow }).map((_, ni) => {
              const ny = topY + 15 + (ni / (nShow - 1)) * (layer.h - 30);
              return (
                <circle key={ni} cx={layer.x + layer.w / 2} cy={ny} r={isActive ? 6 : 4}
                  fill={isActive ? color : '#94a3b8'} opacity={isActive ? 0.9 : 0.4}>
                  {isActive && <animate attributeName="r" values="4;7;4" dur="1s" repeatCount="indefinite" begin={`${ni * 0.1}s`} />}
                </circle>
              );
            })}
            {layer.nodes > 5 && (
              <text x={layer.x + layer.w / 2} y={topY + layer.h - 5} fill="#64748b" fontSize="10" textAnchor="middle">...</text>
            )}
            <text x={layer.x + layer.w / 2} y={centerY + layer.h / 2 + 20} fill={isActive ? color : '#94a3b8'} fontSize="12" textAnchor="middle" fontWeight={isActive ? 'bold' : 'normal'}>
              {layer.label}
            </text>
          </g>
        );
      })}

      {/* output probability */}
      <g>
        <rect x="610" y="60" width="40" height="100" rx="6" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1" />
        {(() => {
          const fillH = pulseLayer >= 4 ? 80 * 0.78 : 80 * Math.max(0, (pulseLayer - 1) / 3) * 0.78;
          return <rect x="615" y={155 - fillH} width="30" height={fillH} rx="4" fill={color} opacity={pulseLayer >= 3 ? 0.85 : 0.3}>
            {pulseLayer >= 4 && <animate attributeName="opacity" values="0.6;1;0.6" dur="1.5s" repeatCount="indefinite" />}
          </rect>;
        })()}
        <text x="630" y="50" fill={pulseLayer >= 4 ? color : '#94a3b8'} fontSize="16" textAnchor="middle" fontWeight="bold">
          {pulseLayer >= 4 ? '0.78' : '...'}
        </text>
        <text x="630" y="185" fill="#94a3b8" fontSize="11" textAnchor="middle">P(SV)</text>
      </g>

      {/* flowing particle */}
      {playing && (
        <circle r="4" fill={color} opacity="0.9">
          <animateMotion dur="4s" repeatCount="indefinite"
            path={`M ${layers[0].x + layers[0].w},${centerY} L ${layers[1].x},${centerY} L ${layers[1].x + layers[1].w},${centerY} L ${layers[2].x},${centerY} L ${layers[2].x + layers[2].w},${centerY} L ${layers[3].x},${centerY} L ${layers[3].x + layers[3].w},${centerY} L ${layers[4].x},${centerY} L ${layers[4].x + layers[4].w},${centerY} L 610,${centerY}`}
          />
        </circle>
      )}

      {/* progress bar */}
      <rect x="50" y="230" width="600" height="4" rx="2" fill="#e2e8f0" />
      <rect x="50" y="230" width={Math.min(600, (step / 100) * 600)} height="4" rx="2" fill={color} opacity="0.6" />
    </svg>
  );
}

/* ── Stage 3: Clustering ───────────────────────────────────────── */

function ClusteringAnim({ color, playing }: { color: string; playing: boolean }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => setStep((s) => (s + 1) % 80), 80);
    return () => clearInterval(t);
  }, [playing]);

  const clusters = [
    { cx: 140, cy: 100, color: '#ef4444', label: 'DEL', points: [
      { sx: 40, sy: 30 }, { sx: 220, sy: 140 }, { sx: 80, sy: 170 },
      { sx: 200, sy: 50 }, { sx: 60, sy: 100 }, { sx: 170, sy: 120 },
      { sx: 110, sy: 40 }, { sx: 190, sy: 80 },
    ]},
    { cx: 380, cy: 110, color: '#3b82f6', label: 'INS', points: [
      { sx: 310, sy: 150 }, { sx: 450, sy: 40 }, { sx: 340, sy: 190 },
      { sx: 420, sy: 60 }, { sx: 470, sy: 130 }, { sx: 320, sy: 70 },
      { sx: 400, sy: 170 },
    ]},
    { cx: 570, cy: 90, color: '#a855f7', label: 'INV', points: [
      { sx: 520, sy: 40 }, { sx: 630, sy: 150 }, { sx: 550, sy: 180 },
      { sx: 600, sy: 50 }, { sx: 540, sy: 120 },
    ]},
  ];

  const progress = Math.min(1, step / 50);
  const phase = step < 20 ? 0 : step < 50 ? 1 : 2;

  return (
    <svg viewBox="0 0 700 260" className="w-full" style={{ height: 280 }}>
      {clusters.map((cluster, ci) => (
        <g key={ci}>
          {/* cluster boundary */}
          {progress > 0.7 && (
            <circle cx={cluster.cx} cy={cluster.cy} r={50 + cluster.points.length * 3}
              fill={cluster.color} opacity="0.06" stroke={cluster.color} strokeWidth="1.5" strokeOpacity={0.2 + progress * 0.2} strokeDasharray="5 4">
              {phase === 2 && <animate attributeName="stroke-opacity" values="0.2;0.5;0.2" dur="2s" repeatCount="indefinite" />}
            </circle>
          )}

          {/* data points */}
          {cluster.points.map((pt, pi) => {
            const appear = Math.min(1, (step - pi * 1.5) / 6);
            const x = pt.sx + (cluster.cx - pt.sx) * progress;
            const y = pt.sy + (cluster.cy - pt.sy) * progress;
            const r = 4 + (progress > 0.7 ? 1.5 : 0);
            return appear > 0 ? (
              <circle key={pi} cx={x} cy={y} r={r} fill={cluster.color} opacity={appear * 0.85}>
                {phase === 1 && <animate attributeName="r" values={`${r - 1};${r + 1};${r - 1}`} dur="1.5s" repeatCount="indefinite" begin={`${pi * 0.12}s`} />}
              </circle>
            ) : null;
          })}

          {/* label */}
          {progress > 0.7 && (
            <g className="animate-fade-in-up">
              <text x={cluster.cx} y={cluster.cy + 60 + cluster.points.length * 3} fill={cluster.color}
                fontSize="16" textAnchor="middle" fontWeight="bold">
                {cluster.label}
              </text>
              <text x={cluster.cx} y={cluster.cy + 78 + cluster.points.length * 3} fill="#64748b"
                fontSize="11" textAnchor="middle">
                {cluster.points.length} variants
              </text>
            </g>
          )}
        </g>
      ))}

      {/* phase label */}
      <text x="350" y="245" fill={color} fontSize="12" textAnchor="middle" fontWeight="bold">
        {phase === 0 ? '散点出现' : phase === 1 ? 'MeanShift 聚类' : '聚类完成'}
      </text>

      {/* progress bar */}
      <rect x="150" y="255" width="400" height="3" rx="1.5" fill="#e2e8f0" />
      <rect x="150" y="255" width={Math.min(400, progress * 400)} height="3" rx="1.5" fill={color} opacity="0.6" />
    </svg>
  );
}

/* ── Stage 4: Genotyping ───────────────────────────────────────── */

function GenotypingAnim({ color, playing }: { color: string; playing: boolean }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => setStep((s) => (s + 1) % 80), 80);
    return () => clearInterval(t);
  }, [playing]);

  const methods = [
    { label: 'Bayesian', x: 110, y: 55, mColor: '#3b82f6' },
    { label: 'EM', x: 110, y: 120, mColor: '#a855f7' },
    { label: 'Depth Ratio', x: 110, y: 185, mColor: '#f59e0b' },
  ];

  const voteCenter = { x: 380, y: 120 };
  const phase = step < 25 ? 0 : step < 50 ? 1 : 2;
  const genotypes = ['0/1', '1/1', '0/1'];
  const finalGT = '0/1';

  return (
    <svg viewBox="0 0 700 260" className="w-full" style={{ height: 280 }}>
      {/* method boxes */}
      {methods.map((m, i) => {
        const active = phase >= 0 && step > i * 6;
        return (
          <g key={i}>
            <rect x={m.x - 70} y={m.y - 22} width="140" height="44" rx="10"
              fill={active ? `${m.mColor}15` : '#f1f5f9'}
              stroke={active ? m.mColor : '#cbd5e1'}
              strokeWidth={active ? 2 : 1}
              style={active ? { filter: `drop-shadow(0 0 10px ${m.mColor}33)` } : {}}
            />
            <text x={m.x} y={m.y + 6} fill={active ? m.mColor : '#64748b'} fontSize="14" textAnchor="middle" fontWeight={active ? 'bold' : 'normal'}>
              {m.label}
            </text>

            {/* individual result */}
            {phase >= 1 && (
              <text x={m.x + 90} y={m.y + 6} fill={m.mColor} fontSize="18" fontFamily="monospace" textAnchor="start" fontWeight="bold" className="animate-fade-in-up">
                {genotypes[i]}
              </text>
            )}

            {/* converging line */}
            {phase >= 1 && (
              <line x1={m.x + 120} y1={m.y} x2={voteCenter.x - 40} y2={voteCenter.y}
                stroke={m.mColor} strokeWidth="2" opacity={Math.min(1, (step - 25 - i * 4) / 12)}
                strokeDasharray="6 4">
                {/* particle along line */}
                <animate attributeName="stroke-dashoffset" from="20" to="0" dur="1s" repeatCount="indefinite" />
              </line>
            )}
          </g>
        );
      })}

      {/* vote center */}
      {phase >= 1 && (
        <g>
          <circle cx={voteCenter.x} cy={voteCenter.y} r={phase === 2 ? 40 : 32}
            fill={`${color}12`} stroke={color} strokeWidth="2.5"
            style={phase === 2 ? { filter: `drop-shadow(0 0 20px ${color}55)`, transition: 'all 0.5s' } : { transition: 'all 0.5s' }}>
            {phase === 2 && <animate attributeName="stroke-opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite" />}
          </circle>
          <text x={voteCenter.x} y={voteCenter.y + 5} fill="#94a3b8" fontSize="14" textAnchor="middle" fontWeight="bold">
            Voting
          </text>
        </g>
      )}

      {/* arrow to result */}
      {phase === 2 && (
        <g className="animate-fade-in-up">
          <line x1={voteCenter.x + 42} y1={voteCenter.y} x2="510" y2={voteCenter.y} stroke={color} strokeWidth="3" />
          <polygon points="510,112 525,120 510,128" fill={color} />

          {/* final genotype */}
          <rect x="540" y="80" width="120" height="80" rx="14" fill={`${color}18`} stroke={color} strokeWidth="2.5">
            <animate attributeName="stroke-opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
          </rect>
          <text x="600" y="112" fill="#1e293b" fontSize="14" textAnchor="middle">Genotype</text>
          <text x="600" y="145" fill={color} fontSize="30" textAnchor="middle" fontFamily="monospace" fontWeight="bold">
            {finalGT}
          </text>
        </g>
      )}

      {/* VCF indicator */}
      {phase === 2 && step > 65 && (
        <g className="animate-fade-in-up">
          <text x="600" y="190" fill="#64748b" fontSize="11" textAnchor="middle">VCF v4.2</text>
        </g>
      )}

      {/* progress bar */}
      <rect x="50" y="240" width="600" height="4" rx="2" fill="#e2e8f0" />
      <rect x="50" y="240" width={Math.min(600, (step / 80) * 600)} height="4" rx="2" fill={color} opacity="0.6" />
    </svg>
  );
}
