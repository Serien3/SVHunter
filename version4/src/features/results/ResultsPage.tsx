import { useEffect, useState } from 'react';
import type { SampleSummary, SampleInfo, SvRecord } from '../../domain/types';
import { listSamples, getSampleSummary, getVcfRecords, getMockSummary, getMockRecords } from '../../data/api';
import SummaryCards from './SummaryCards';
import SvTypeChart from './SvTypeChart';
import ChromDistChart from './ChromDistChart';
import VcfTable from './VcfTable';

export default function ResultsPage() {
  const [samples, setSamples] = useState<SampleInfo[]>([]);
  const [selected, setSelected] = useState('');
  const [summary, setSummary] = useState<SampleSummary | null>(null);
  const [records, setRecords] = useState<SvRecord[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [useMock, setUseMock] = useState(false);
  const [loading, setLoading] = useState(true);
  const [vcfDir, setVcfDir] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const list = await listSamples(vcfDir || undefined);
        if (list.length > 0) { setSamples(list); setSelected(list[0].name); setUseMock(false); }
        else throw new Error('empty');
      } catch { setUseMock(true); setSummary(getMockSummary()); const mock = getMockRecords(); setRecords(mock.records); setTotalRecords(mock.total); }
      finally { setLoading(false); }
    })();
  }, [vcfDir]);

  useEffect(() => {
    if (!selected || useMock) return;
    (async () => {
      try {
        const [s, v] = await Promise.all([getSampleSummary(selected, vcfDir || undefined), getVcfRecords(selected, { dir: vcfDir || undefined, limit: 500 })]);
        setSummary(s); setRecords(v.records); setTotalRecords(v.total);
      } catch { setUseMock(true); setSummary(getMockSummary()); const mock = getMockRecords(); setRecords(mock.records); setTotalRecords(mock.total); }
    })();
  }, [selected, useMock]);

  if (loading) return <div className="text-slate-400 text-sm">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">样本结果展示</h2>
          <p className="text-sm text-slate-500 mt-1">{useMock ? '当前使用演示数据' : `已加载 ${samples.length} 个样本`}</p>
        </div>
        <div className="flex items-center gap-3">
          {!useMock && (
            <select value={selected} onChange={(e) => setSelected(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600">
              {samples.map((s) => <option key={s.name} value={s.name}>{s.name}</option>)}
            </select>
          )}
          <input type="text" value={vcfDir} onChange={(e) => setVcfDir(e.target.value)} placeholder="VCF 目录路径 (可选)"
            className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600 placeholder-slate-400 w-64 focus:outline-none focus:border-blue-400" />
        </div>
      </div>

      {useMock && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 text-sm text-amber-700">
          未连接后端或未找到 VCF 文件，当前展示 Mock 演示数据。
        </div>
      )}

      {summary && (
        <>
          <SummaryCards summary={summary} />
          <div className="grid lg:grid-cols-2 gap-6">
            <SvTypeChart data={summary.byType} />
            <ChromDistChart data={summary.byChrom} />
          </div>
          <VcfTable records={records} total={totalRecords} />
        </>
      )}
    </div>
  );
}
