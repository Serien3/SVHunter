import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { SvTypeFrequency } from '../../domain/types';

interface Props { data: SvTypeFrequency[]; }

const COLORS: Record<string, string> = { DEL: '#ef4444', INS: '#3b82f6', DUP: '#f59e0b', INV: '#a855f7', BND: '#10b981', TRA: '#10b981' };

export default function SvTypeChart({ data }: Props) {
  return (
    <div className="bg-white/80 border border-slate-200 rounded-xl p-5 shadow-sm">
      <h4 className="text-sm font-medium text-slate-600 mb-4">SV 类型分布</h4>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie data={data} dataKey="count" nameKey="type" cx="50%" cy="50%" outerRadius={100}
            label={({ type, percent }) => `${type} ${(percent * 100).toFixed(1)}%`}
            labelLine={{ stroke: '#94a3b8' }}>
            {data.map((entry) => <Cell key={entry.type} fill={COLORS[entry.type] ?? '#94a3b8'} />)}
          </Pie>
          <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }} itemStyle={{ color: '#334155' }} />
          <Legend wrapperStyle={{ fontSize: 12, color: '#64748b' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
