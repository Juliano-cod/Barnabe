import { useEffect, useState } from 'react';
import { apiFetch } from '../api';
import { User } from '../types';
import { Shield, Mail, User as UserIcon, Plus, MoreVertical } from 'lucide-react';

export default function Team() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/api/users')
      .then(setUsers)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-full">Carregando...</div>;

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Equipe Pastoral</h1>
          <p className="text-stone-500">Gerencie os acessos e permissões dos líderes.</p>
        </div>
        <button className="bg-stone-900 text-white px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-stone-200">
          <Plus className="w-5 h-5" />
          Convidar Líder
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => (
          <div key={user.id} className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-stone-100 rounded-2xl flex items-center justify-center text-stone-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                <UserIcon className="w-6 h-6" />
              </div>
              <button className="p-2 text-stone-400 hover:bg-stone-50 rounded-lg">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
            
            <h3 className="text-lg font-bold text-stone-900">{user.name}</h3>
            <div className="flex items-center gap-2 text-sm text-stone-500 mt-1">
              <Mail className="w-4 h-4" />
              {user.email}
            </div>

            <div className="mt-6 pt-6 border-t border-stone-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">{user.role}</span>
              </div>
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg uppercase">Ativo</span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 p-8 rounded-3xl border border-blue-100 mt-12">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="w-16 h-16 bg-blue-700 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-200">
            <Shield className="w-8 h-8" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-lg font-bold text-blue-900">Segurança e LGPD</h3>
            <p className="text-blue-700 text-sm max-w-2xl">
              Este sistema registra todas as alterações feitas nos dados dos membros. Apenas usuários com nível de Pastor ou Administrador podem excluir registros permanentemente.
            </p>
          </div>
          <button className="bg-white text-blue-700 px-6 py-2.5 rounded-xl font-bold text-sm shadow-sm hover:shadow-md transition-all">
            Ver Logs de Auditoria
          </button>
        </div>
      </div>
    </div>
  );
}
