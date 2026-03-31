import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import type { ChromFrequency } from '../../domain/types';

interface Props { data: ChromFrequency[]; }

export default function ChromDistChart({ data }: Props) {
  return (
    <div className="bg-white/80 border border-slate-200 rounded-xl p-5 shadow-sm">
      <h4 className="text-sm font-medium text-slate-600 mb-4">染色体分布</h4>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="chrom" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={{ stroke: '#cbd5e1' }} />
          <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={{ stroke: '#cbd5e1' }} />
          <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }} itemStyle={{ color: '#334155' }} />
          <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
