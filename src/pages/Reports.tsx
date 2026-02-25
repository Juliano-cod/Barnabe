import { useEffect, useState } from 'react';
import { apiFetch } from '../api';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { FileText, Download, Calendar } from 'lucide-react';

export default function Reports() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/api/stats')
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !stats) return <div className="flex items-center justify-center h-full">Carregando...</div>;

  const monthlyGrowth = [
    { month: 'Set', visitors: 12, integrated: 4 },
    { month: 'Out', visitors: 18, integrated: 6 },
    { month: 'Nov', visitors: 15, integrated: 8 },
    { month: 'Dez', visitors: 25, integrated: 12 },
    { month: 'Jan', visitors: 20, integrated: 10 },
    { month: 'Fev', visitors: 28, integrated: 15 },
  ];

  const conversionRate = stats.total > 0 ? Math.round((stats.integrated / stats.total) * 100) : 0;

  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Relatórios e Indicadores</h1>
          <p className="text-stone-500">Analise o crescimento e a eficácia da integração.</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-white border border-stone-200 text-stone-700 px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-stone-50 transition-all">
            <Download className="w-4 h-4" />
            Exportar PDF
          </button>
          <button className="bg-blue-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-blue-100 hover:bg-blue-800 transition-all">
            <FileText className="w-4 h-4" />
            Exportar Excel
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-stone-900">Crescimento Mensal</h3>
            <div className="flex items-center gap-2 bg-stone-50 px-3 py-1.5 rounded-lg border border-stone-100">
              <Calendar className="w-4 h-4 text-stone-400" />
              <span className="text-xs font-bold text-stone-600">Últimos 6 meses</span>
            </div>
          </div>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyGrowth}>
                <defs>
                  <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="visitors" stroke="#2563eb" fillOpacity={1} fill="url(#colorVisitors)" strokeWidth={3} />
                <Area type="monotone" dataKey="integrated" stroke="#4f46e5" fillOpacity={0} strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-6 mt-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Novos Visitantes</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-indigo-500" />
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Membros Integrados</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
            <h3 className="text-sm font-bold text-stone-400 uppercase tracking-widest mb-6">Taxa de Conversão</h3>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-black text-stone-900">{conversionRate}%</span>
              <span className="text-blue-600 font-bold text-sm mb-1">Total</span>
            </div>
            <p className="text-stone-500 text-xs mt-2">Percentual de visitantes que se tornaram membros integrados.</p>
            <div className="w-full bg-stone-100 h-2 rounded-full mt-4 overflow-hidden">
              <div className="bg-blue-500 h-full transition-all duration-500" style={{ width: `${conversionRate}%` }} />
            </div>
          </div>

          <div className="bg-stone-900 p-6 rounded-3xl shadow-xl text-white">
            <h3 className="text-sm font-bold text-stone-400 uppercase tracking-widest mb-4">Resumo do Período</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-stone-400 text-sm">Total Visitantes</span>
                <span className="font-bold">{stats.visitors}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-stone-400 text-sm">Em Discipulado</span>
                <span className="font-bold">{stats.discipleship}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-stone-400 text-sm">Integrados</span>
                <span className="font-bold">{stats.integrated}</span>
              </div>
              <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                <span className="text-sky-400 text-sm font-bold">Total Geral</span>
                <span className="text-xl font-black">{stats.total}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
