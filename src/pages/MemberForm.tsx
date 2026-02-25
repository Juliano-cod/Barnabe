import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiFetch } from '../api';
import { STATUSES, User, Member } from '../types';
import { Save, ArrowLeft, Info, Church } from 'lucide-react';

export default function MemberForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    dob: '',
    gender: '',
    marital_status: '',
    phone: '',
    whatsapp: '',
    email: '',
    address: '',
    neighborhood: '',
    city: 'São Paulo',
    first_visit_date: new Date().toISOString().split('T')[0],
    invited_by: '',
    previous_church: '',
    is_baptized: false,
    wants_baptism: false,
    in_group: false,
    interest_ministry: '',
    pastoral_notes: '',
    status: 'VISITOR',
    assigned_to: ''
  });

  useEffect(() => {
    apiFetch('/api/users').then(setUsers);
    
    if (isEditing) {
      apiFetch(`/api/members/${id}`).then((member: Member) => {
        if (member) {
          setFormData({
            name: member.name || '',
            dob: member.dob ? member.dob.split('T')[0] : '',
            gender: member.gender || '',
            marital_status: member.marital_status || '',
            phone: member.phone || '',
            whatsapp: member.whatsapp || '',
            email: member.email || '',
            address: member.address || '',
            neighborhood: member.neighborhood || '',
            city: member.city || 'São Paulo',
            first_visit_date: member.first_visit_date ? member.first_visit_date.split('T')[0] : '',
            invited_by: member.invited_by || '',
            previous_church: member.previous_church || '',
            is_baptized: !!member.is_baptized,
            wants_baptism: !!member.wants_baptism,
            in_group: !!member.in_group,
            interest_ministry: member.interest_ministry || '',
            pastoral_notes: member.pastoral_notes || '',
            status: member.status || 'VISITOR',
            assigned_to: member.assigned_to?.toString() || ''
          });
        }
      });
    }
  }, [id, isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = isEditing ? `/api/members/${id}` : '/api/members';
      const method = isEditing ? 'PUT' : 'POST';
      await apiFetch(url, {
        method,
        body: JSON.stringify(formData)
      });
      navigate(isEditing ? `/members/${id}` : '/members');
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar membro');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 transition-all";
  const labelClass = "block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1.5";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate('/members')}
          className="flex items-center gap-2 text-stone-500 hover:text-stone-900 font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Cancelar
        </button>
        <h1 className="text-2xl font-bold text-stone-900">{isEditing ? 'Editar Cadastro' : 'Novo Cadastro'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm space-y-8">
          <section>
            <div className="flex items-center gap-2 mb-6 text-blue-600">
              <Info className="w-5 h-5" />
              <h2 className="font-bold uppercase tracking-widest text-sm">Informações Pessoais</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className={labelClass}>Nome Completo</label>
                <input 
                  required
                  className={inputClass}
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  placeholder="Ex: João da Silva"
                />
              </div>
              <div>
                <label className={labelClass}>Data de Nascimento</label>
                <input 
                  type="date"
                  className={inputClass}
                  value={formData.dob}
                  onChange={e => setFormData({...formData, dob: e.target.value})}
                />
              </div>
              <div>
                <label className={labelClass}>Gênero</label>
                <select 
                  className={inputClass}
                  value={formData.gender}
                  onChange={e => setFormData({...formData, gender: e.target.value})}
                >
                  <option value="">Selecione...</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Feminino">Feminino</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Telefone / WhatsApp</label>
                <input 
                  className={inputClass}
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  placeholder="(11) 99999-9999"
                />
              </div>
              <div>
                <label className={labelClass}>E-mail</label>
                <input 
                  type="email"
                  className={inputClass}
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  placeholder="joao@email.com"
                />
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-6 text-blue-600">
              <Church className="w-5 h-5" />
              <h2 className="font-bold uppercase tracking-widest text-sm">Dados da Igreja</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Data da Primeira Visita</label>
                <input 
                  type="date"
                  className={inputClass}
                  value={formData.first_visit_date}
                  onChange={e => setFormData({...formData, first_visit_date: e.target.value})}
                />
              </div>
              <div>
                <label className={labelClass}>Quem Convidou?</label>
                <input 
                  className={inputClass}
                  value={formData.invited_by}
                  onChange={e => setFormData({...formData, invited_by: e.target.value})}
                />
              </div>
              <div>
                <label className={labelClass}>Status Inicial</label>
                <select 
                  className={inputClass}
                  value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value})}
                >
                  {Object.entries(STATUSES).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Responsável pelo Acompanhamento</label>
                <select 
                  className={inputClass}
                  value={formData.assigned_to}
                  onChange={e => setFormData({...formData, assigned_to: e.target.value})}
                >
                  <option value="">Não atribuído</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <label className="flex items-center gap-3 p-4 bg-stone-50 rounded-2xl border border-stone-100 cursor-pointer hover:bg-stone-100 transition-all">
                <input 
                  type="checkbox" 
                  className="w-5 h-5 rounded border-stone-300 text-blue-600 focus:ring-blue-500"
                  checked={formData.is_baptized}
                  onChange={e => setFormData({...formData, is_baptized: e.target.checked})}
                />
                <span className="text-sm font-bold text-stone-700">Já é Batizado</span>
              </label>
              <label className="flex items-center gap-3 p-4 bg-stone-50 rounded-2xl border border-stone-100 cursor-pointer hover:bg-stone-100 transition-all">
                <input 
                  type="checkbox" 
                  className="w-5 h-5 rounded border-stone-300 text-blue-600 focus:ring-blue-500"
                  checked={formData.wants_baptism}
                  onChange={e => setFormData({...formData, wants_baptism: e.target.checked})}
                />
                <span className="text-sm font-bold text-stone-700">Deseja Batismo</span>
              </label>
              <label className="flex items-center gap-3 p-4 bg-stone-50 rounded-2xl border border-stone-100 cursor-pointer hover:bg-stone-100 transition-all">
                <input 
                  type="checkbox" 
                  className="w-5 h-5 rounded border-stone-300 text-blue-600 focus:ring-blue-500"
                  checked={formData.in_group}
                  onChange={e => setFormData({...formData, in_group: e.target.checked})}
                />
                <span className="text-sm font-bold text-stone-700">Participa de Célula</span>
              </label>
            </div>
          </section>

          <section>
            <label className={labelClass}>Observações Pastorais (Privado)</label>
            <textarea 
              className={`${inputClass} h-32 resize-none`}
              value={formData.pastoral_notes}
              onChange={e => setFormData({...formData, pastoral_notes: e.target.value})}
              placeholder="Informações relevantes para o acompanhamento espiritual..."
            />
          </section>
        </div>

        <div className="flex justify-end gap-4">
          <button 
            type="button"
            onClick={() => navigate('/members')}
            className="px-8 py-3 text-stone-500 font-bold hover:text-stone-900 transition-all"
          >
            Descartar
          </button>
          <button 
            type="submit"
            disabled={loading}
            className="bg-blue-700 hover:bg-blue-800 text-white px-12 py-3 rounded-2xl font-bold shadow-xl shadow-blue-100 transition-all flex items-center gap-2 disabled:opacity-70"
          >
            {loading ? 'Salvando...' : (
              <>
                <Save className="w-5 h-5" />
                {isEditing ? 'Salvar Alterações' : 'Salvar Cadastro'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
