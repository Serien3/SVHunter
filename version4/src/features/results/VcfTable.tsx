import { useState, useMemo } from 'react';
import type { SvRecord } from '../../domain/types';

interface Props { records: SvRecord[]; total: number; }

const SV_BADGE: Record<string, string> = {
  DEL: 'bg-red-100 text-red-600', INS: 'bg-blue-100 text-blue-600', DUP: 'bg-amber-100 text-amber-600',
  INV: 'bg-purple-100 text-purple-600', BND: 'bg-emerald-100 text-emerald-600', TRA: 'bg-emerald-100 text-emerald-600',
};

export default function VcfTable({ records, total }: Props) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const types = useMemo(() => [...new Set(records.map((r) => r.svType))].sort(), [records]);

  const filtered = useMemo(() => {
    let list = records;
    if (typeFilter) list = list.filter((r) => r.svType === typeFilter);
    if (search) { const q = search.toLowerCase(); list = list.filter((r) => r.chrom.toLowerCase().includes(q) || r.id.toLowerCase().includes(q) || String(r.pos).includes(q)); }
    return list;
  }, [records, typeFilter, search]);

  return (
    <div className="bg-white/80 border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      <div className="flex flex-wrap items-center gap-3 px-5 py-3 border-b border-slate-200">
        <h4 className="text-sm font-medium text-slate-600">VCF 记录 <span className="text-slate-400">({total} total)</span></h4>
        <div className="flex-1" />
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-600">
          <option value="">全部类型</option>
          {types.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜索 chrom / pos / id"
          className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-600 placeholder-slate-400 w-48 focus:outline-none focus:border-blue-400" />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-slate-400 uppercase tracking-wider bg-slate-50">
              <th className="text-left px-5 py-2.5">Chrom</th>
              <th className="text-right px-3 py-2.5">Pos</th>
              <th className="text-left px-3 py-2.5">ID</th>
              <th className="text-center px-3 py-2.5">Type</th>
              <th className="text-right px-3 py-2.5">Length</th>
              <th className="text-center px-3 py-2.5">Genotype</th>
              <th className="text-center px-5 py-2.5">Filter</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.slice(0, 100).map((r, i) => (
              <tr key={`${r.chrom}-${r.pos}-${i}`} className="hover:bg-slate-50 transition-colors">
                <td className="px-5 py-2 font-mono text-slate-700">{r.chrom}</td>
                <td className="px-3 py-2 text-right font-mono text-slate-700">{r.pos.toLocaleString()}</td>
                <td className="px-3 py-2 text-slate-500 text-xs">{r.id}</td>
                <td className="px-3 py-2 text-center">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${SV_BADGE[r.svType] ?? 'bg-slate-100 text-slate-600'}`}>{r.svType}</span>
                </td>
                <td className="px-3 py-2 text-right font-mono text-slate-700">{r.svLen != null ? `${Math.abs(r.svLen).toLocaleString()} bp` : '—'}</td>
                <td className="px-3 py-2 text-center font-mono text-slate-700">{r.genotype || '.'}</td>
                <td className="px-5 py-2 text-center text-xs text-slate-500">{r.filter}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filtered.length > 100 && <div className="px-5 py-2 text-xs text-slate-400 border-t border-slate-100">显示前 100 条 / 共 {filtered.length} 条</div>}
    </div>
  );
}
