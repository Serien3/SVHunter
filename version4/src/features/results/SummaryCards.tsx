import type { SampleSummary } from '../../domain/types';

interface Props { summary: SampleSummary; }

const SV_COLOR: Record<string, string> = {
  DEL: 'text-red-500', INS: 'text-blue-500', DUP: 'text-amber-500', INV: 'text-purple-500', BND: 'text-emerald-500', TRA: 'text-emerald-500',
};

export default function SummaryCards({ summary }: Props) {
  const cards = [
    { label: '总 SV 数量', value: summary.total.toLocaleString(), color: 'text-slate-800' },
    ...summary.byType.map((t) => ({ label: t.type, value: t.count.toLocaleString(), color: SV_COLOR[t.type] ?? 'text-slate-600' })),
    { label: '中位长度', value: summary.medianLength ? `${summary.medianLength.toLocaleString()} bp` : '—', color: 'text-slate-600' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
      {cards.map((c) => (
        <div key={c.label} className="bg-white/80 border border-slate-200 rounded-xl px-4 py-3 shadow-sm">
          <div className="text-[11px] text-slate-400 uppercase tracking-wide">{c.label}</div>
          <div className={`text-lg font-semibold mt-1 ${c.color}`}>{c.value}</div>
        </div>
      ))}
    </div>
  );
}
