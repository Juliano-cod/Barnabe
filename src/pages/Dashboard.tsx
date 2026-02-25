import { useEffect, useState } from 'react';
import { apiFetch } from '../api';
import { 
  Users, 
  UserCheck, 
  UserPlus, 
  TrendingUp,
  MapPin,
  Clock
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { motion } from 'motion/react';
import { STATUSES } from '../types';

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/api/stats')
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-full">Carregando...</div>;

  const cards = [
    { title: 'Total Visitantes', value: stats.total, icon: Users, color: 'bg-blue-600' },
    { title: 'Recém convertidos', value: stats.visitors, icon: UserPlus, color: 'bg-sky-500' },
    { title: 'Integrados', value: stats.integrated, icon: UserCheck, color: 'bg-indigo-500' },
    { title: 'Em Discipulado', value: stats.discipleship, icon: TrendingUp, color: 'bg-blue-400' },
  ];

  const COLORS = ['#0284c7', '#2563eb', '#4f46e5', '#38bdf8', '#1e3a8a'];

  const statusData = stats.statuses.map((s: any) => ({
    name: STATUSES[s.status as keyof typeof STATUSES] || s.status,
    value: s.count
  }));

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-stone-900">Dashboard Pastoral</h1>
        <p className="text-stone-500">Visão geral do crescimento e acompanhamento da igreja.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`${card.color} p-2 rounded-xl text-white`}>
                <card.icon className="w-6 h-6" />
              </div>
            </div>
            <p className="text-stone-500 text-sm font-medium">{card.title}</p>
            <h3 className="text-3xl font-bold text-stone-900 mt-1">{card.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
          <h3 className="text-lg font-bold text-stone-900 mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            Status de Membros
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            {statusData.map((s: any, i: number) => (
              <div key={s.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="text-xs text-stone-600 font-medium">{s.name}: {s.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
          <h3 className="text-lg font-bold text-stone-900 mb-6 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            Membros por Bairro
          </h3>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.neighborhoods}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                <XAxis dataKey="neighborhood" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
