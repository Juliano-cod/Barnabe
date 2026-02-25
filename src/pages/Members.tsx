import { useEffect, useState } from 'react';
import { apiFetch } from '../api';
import { Member, STATUSES, cn } from '../types';
import { 
  Search, 
  Filter, 
  Phone, 
  MapPin,
  UserPlus,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
// import { format } from 'date-fns';
// import { ptBR } from 'date-fns/locale';

export default function Members() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    apiFetch('/api/members')
      .then(setMembers)
      .finally(() => setLoading(false));
  }, []);

  const filteredMembers = members.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase()) || 
                         m.neighborhood?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = !statusFilter || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) return <div className="flex items-center justify-center h-full">Carregando...</div>;

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Membros e Visitantes</h1>
          <p className="text-stone-500">Gerencie todos os registros da comunidade.</p>
        </div>
        <Link 
          to="/members/new"
          className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg shadow-blue-100 transition-all"
        >
          <UserPlus className="w-5 h-5" />
          Novo Registro
        </Link>
      </header>

      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por nome ou bairro..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 w-4 h-4" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-9 pr-8 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer text-sm font-medium text-stone-700"
            >
              <option value="">Todos os Status</option>
              {Object.entries(STATUSES).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200">
                <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-wider">Membro</th>
                <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-wider">Localização</th>
                <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-wider">Responsável</th>
                <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-stone-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center text-stone-600 font-bold">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-stone-900 leading-tight">{member.name}</p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-stone-500">
                          <Phone className="w-3 h-3" />
                          {member.phone || 'Sem telefone'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                      member.status === 'VISITOR' && "bg-sky-50 text-sky-600",
                      member.status === 'FOLLOWING' && "bg-blue-50 text-blue-600",
                      member.status === 'DISCIPLESHIP' && "bg-indigo-50 text-indigo-600",
                      member.status === 'INTEGRATED' && "bg-blue-100 text-blue-800",
                      member.status === 'AWAY' && "bg-red-50 text-red-600",
                    )}>
                      {STATUSES[member.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-stone-600">
                      <MapPin className="w-4 h-4 text-stone-400" />
                      {member.neighborhood || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-stone-700">{member.assigned_name || 'Não atribuído'}</p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link 
                      to={`/members/${member.id}`}
                      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-bold text-sm"
                    >
                      Ver Detalhes
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
              {filteredMembers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-stone-500">
                    Nenhum membro encontrado com os filtros aplicados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
