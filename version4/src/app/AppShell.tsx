import { NavLink, Outlet } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/pipeline', label: 'Pipeline', icon: '▶' },
  { to: '/algorithm', label: '算法流程', icon: '◆' },
  { to: '/results', label: '结果展示', icon: '◉' },
];

export default function AppShell() {
  return (
    <div className="flex h-screen">
      {/* sidebar */}
      <aside className="w-56 shrink-0 bg-white/40 backdrop-blur-sm border-r border-slate-200/50 flex flex-col">
        <div className="px-5 py-5 border-b border-slate-200">
          <h1 className="text-lg font-bold tracking-wide text-slate-900">SVHunter</h1>
          <span className="text-xs text-slate-400">v4.0 — SV Detection Platform</span>
        </div>
        <nav className="flex-1 py-4 space-y-1 px-3">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                }`
              }
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="px-5 py-4 border-t border-slate-200 text-[11px] text-slate-400">
          Deep-learning SV caller
        </div>
      </aside>

      {/* main content */}
      <main className="flex-1 overflow-auto bg-slate-50/60 backdrop-blur-sm p-6">
        <Outlet />
      </main>
    </div>
  );
}
