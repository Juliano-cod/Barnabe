import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiFetch } from '../api';
import { Member, STATUSES, CONTACT_TYPES, Contact } from '../types';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  MessageSquare, 
  History, 
  User as UserIcon,
  Plus,
  ArrowLeft,
  Edit
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion, AnimatePresence } from 'motion/react';

export default function MemberDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState<Member | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'history'>('info');
  
  // New contact form
  const [showContactForm, setShowContactForm] = useState(false);
  const [newContact, setNewContact] = useState({
    type: 'CALL',
    notes: '',
    next_contact_date: ''
  });

  useEffect(() => {
    Promise.all([
      apiFetch(`/api/members/${id}`),
      apiFetch(`/api/members/${id}/contacts`)
    ]).then(([memberData, contactsData]) => {
      setMember(memberData);
      setContacts(contactsData);
    }).finally(() => setLoading(false));
  }, [id]);

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch(`/api/members/${id}/contacts`, {
        method: 'POST',
        body: JSON.stringify(newContact)
      });
      const updatedContacts = await apiFetch(`/api/members/${id}/contacts`);
      setContacts(updatedContacts);
      setShowContactForm(false);
      setNewContact({ type: 'CALL', notes: '', next_contact_date: '' });
    } catch (err) {
      console.error(err);
      alert('Erro ao adicionar contato');
    }
  };

  const handleUpdateStatus = async (status: string) => {
    if (!member) return;
    try {
      await apiFetch(`/api/members/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ ...member, status })
      });
      setMember({ ...member, status: status as any });
    } catch (err) {
      console.error(err);
      alert('Erro ao atualizar status');
    }
  };

  if (loading) return <div className="flex items-center justify-center h-full">Carregando...</div>;
  if (!member) return <div>Membro não encontrado.</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <button 
        onClick={() => navigate('/members')}
        className="flex items-center gap-2 text-stone-500 hover:text-stone-900 font-medium transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar para Lista
      </button>

      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="bg-blue-900 h-32 relative">
          <div className="absolute -bottom-12 left-8">
            <div className="w-24 h-24 bg-white rounded-2xl p-1 shadow-xl">
              <div className="w-full h-full bg-stone-100 rounded-xl flex items-center justify-center text-stone-400">
                <UserIcon className="w-12 h-12" />
              </div>
            </div>
          </div>
        </div>
        
        <div className="pt-16 pb-8 px-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-stone-900">{member.name}</h1>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-stone-500">
              <span className="flex items-center gap-1 text-sm">
                <MapPin className="w-4 h-4" />
                {member.neighborhood}, {member.city}
              </span>
              <span className="flex items-center gap-1 text-sm">
                <Calendar className="w-4 h-4" />
                Primeira visita: {member.first_visit_date ? format(new Date(member.first_visit_date), 'dd/MM/yyyy') : 'N/A'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate(`/members/${id}/edit`)}
              className="bg-stone-100 text-stone-700 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-stone-200 transition-all"
            >
              <Edit className="w-4 h-4" />
              Editar
            </button>
            <select
              value={member.status}
              onChange={(e) => handleUpdateStatus(e.target.value)}
              className="bg-stone-100 border-none rounded-xl px-4 py-2 text-sm font-bold text-stone-700 outline-none cursor-pointer"
            >
              {Object.entries(STATUSES).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
            <button className="bg-blue-700 text-white p-2 rounded-xl shadow-lg shadow-blue-100">
              <MessageSquare className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="px-8 border-t border-stone-100">
          <div className="flex gap-8">
            <button 
              onClick={() => setActiveTab('info')}
              className={`py-4 text-sm font-bold uppercase tracking-wider border-b-2 transition-all ${activeTab === 'info' ? 'border-blue-700 text-blue-700' : 'border-transparent text-stone-400 hover:text-stone-600'}`}
            >
              Informações
            </button>
            <button 
              onClick={() => setActiveTab('history')}
              className={`py-4 text-sm font-bold uppercase tracking-wider border-b-2 transition-all ${activeTab === 'history' ? 'border-blue-700 text-blue-700' : 'border-transparent text-stone-400 hover:text-stone-600'}`}
            >
              Histórico de Contatos
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="wait">
            {activeTab === 'info' ? (
              <motion.div
                key="info"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white p-8 rounded-3xl border border-stone-200 shadow-sm space-y-8"
              >
                <section>
                  <h3 className="text-sm font-bold text-stone-400 uppercase tracking-widest mb-4">Dados Pessoais</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-xs text-stone-400 font-medium mb-1">Telefone / WhatsApp</p>
                      <p className="text-stone-900 font-semibold flex items-center gap-2">
                        <Phone className="w-4 h-4 text-blue-600" />
                        {member.phone || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-stone-400 font-medium mb-1">E-mail</p>
                      <p className="text-stone-900 font-semibold flex items-center gap-2">
                        <Mail className="w-4 h-4 text-blue-600" />
                        {member.email || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-stone-400 font-medium mb-1">Endereço</p>
                      <p className="text-stone-900 font-semibold">{member.address || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-stone-400 font-medium mb-1">Data de Nascimento</p>
                      <p className="text-stone-900 font-semibold">{member.dob ? format(new Date(member.dob), 'dd/MM/yyyy') : 'N/A'}</p>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-sm font-bold text-stone-400 uppercase tracking-widest mb-4">Dados Espirituais</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-xs text-stone-400 font-medium mb-1">Batizado?</p>
                      <p className="text-stone-900 font-semibold">{member.is_baptized ? 'Sim' : 'Não'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-stone-400 font-medium mb-1">Deseja Batismo?</p>
                      <p className="text-stone-900 font-semibold">{member.wants_baptism ? 'Sim' : 'Não'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-stone-400 font-medium mb-1">Igreja Anterior</p>
                      <p className="text-stone-900 font-semibold">{member.previous_church || 'Nenhuma'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-stone-400 font-medium mb-1">Ministério de Interesse</p>
                      <p className="text-stone-900 font-semibold">{member.interest_ministry || 'N/A'}</p>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-sm font-bold text-stone-400 uppercase tracking-widest mb-4">Observações Pastorais</h3>
                  <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100">
                    <p className="text-stone-700 text-sm italic">
                      {member.pastoral_notes || 'Nenhuma observação registrada.'}
                    </p>
                  </div>
                </section>
              </motion.div>
            ) : (
              <motion.div
                key="history"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xl font-bold text-stone-900">Linha do Tempo</h2>
                  <button 
                    onClick={() => setShowContactForm(true)}
                    className="bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-blue-100"
                  >
                    <Plus className="w-4 h-4" />
                    Registrar Contato
                  </button>
                </div>

                {showContactForm && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white p-6 rounded-3xl border-2 border-blue-100 shadow-xl space-y-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-stone-400 uppercase mb-1">Tipo de Contato</label>
                        <select 
                          value={newContact.type}
                          onChange={(e) => setNewContact({...newContact, type: e.target.value})}
                          className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {Object.entries(CONTACT_TYPES).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-stone-400 uppercase mb-1">Próximo Contato</label>
                        <input 
                          type="date"
                          value={newContact.next_contact_date}
                          onChange={(e) => setNewContact({...newContact, next_contact_date: e.target.value})}
                          className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-400 uppercase mb-1">Notas / Detalhes</label>
                      <textarea 
                        value={newContact.notes}
                        onChange={(e) => setNewContact({...newContact, notes: e.target.value})}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                        placeholder="Descreva como foi o contato..."
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => setShowContactForm(false)}
                        className="px-4 py-2 text-stone-500 font-bold text-sm"
                      >
                        Cancelar
                      </button>
                      <button 
                        onClick={handleAddContact}
                        className="bg-blue-700 text-white px-6 py-2 rounded-xl font-bold text-sm shadow-lg shadow-blue-100"
                      >
                        Salvar Registro
                      </button>
                    </div>
                  </motion.div>
                )}

                <div className="space-y-4">
                  {contacts.map((contact, i) => (
                    <div key={contact.id} className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                          <History className="w-5 h-5" />
                        </div>
                        {i < contacts.length - 1 && <div className="w-0.5 flex-1 bg-stone-100 my-2" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                            {CONTACT_TYPES[contact.type]}
                          </span>
                          <span className="text-xs text-stone-400">
                            {format(new Date(contact.created_at), "dd 'de' MMMM, HH:mm", { locale: ptBR })}
                          </span>
                        </div>
                        <p className="text-stone-800 text-sm leading-relaxed mb-3">{contact.notes}</p>
                        <div className="flex items-center justify-between pt-3 border-t border-stone-50">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-stone-100 rounded-full flex items-center justify-center text-[10px] font-bold text-stone-500">
                              {contact.user_name.charAt(0)}
                            </div>
                            <span className="text-xs text-stone-500 font-medium">Por {contact.user_name}</span>
                          </div>
                          {contact.next_contact_date && (
                            <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-lg uppercase">
                              Próximo: {format(new Date(contact.next_contact_date), 'dd/MM/yyyy')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {contacts.length === 0 && (
                    <div className="bg-white p-12 rounded-3xl border border-dashed border-stone-300 text-center text-stone-400">
                      Nenhum contato registrado ainda.
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
            <h3 className="text-sm font-bold text-stone-400 uppercase tracking-widest mb-4">Responsável</h3>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
                <UserIcon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-stone-900 font-bold">{member.assigned_name || 'Não atribuído'}</p>
                <p className="text-xs text-stone-500">Líder de Acompanhamento</p>
              </div>
            </div>
            <button className="w-full mt-6 py-2 border border-stone-200 rounded-xl text-sm font-bold text-stone-600 hover:bg-stone-50 transition-all">
              Alterar Responsável
            </button>
          </div>

          <div className="bg-stone-900 p-6 rounded-3xl shadow-xl text-white">
            <h3 className="text-sm font-bold text-stone-400 uppercase tracking-widest mb-4">Ações Rápidas</h3>
            <div className="space-y-2">
              <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2">
                <Phone className="w-4 h-4" />
                Ligar via WhatsApp
              </button>
              <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2">
                <Calendar className="w-4 h-4" />
                Agendar Visita
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
