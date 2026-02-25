import { useEffect, useState } from 'react';
import { apiFetch } from '../api';
import { User } from '../types';
import { Send, Search, User as UserIcon, MessageSquare } from 'lucide-react';
import { useAuthStore } from '../store';
import { format } from 'date-fns';
// import { ptBR } from 'date-fns/locale';

export default function Messages() {
  const { user: currentUser } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch('/api/users'),
      apiFetch('/api/messages')
    ]).then(([usersData, messagesData]) => {
      setUsers(usersData.filter((u: User) => u.id !== currentUser?.id));
      setMessages(messagesData);
    }).finally(() => setLoading(false));
  }, [currentUser]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !newMessage.trim()) return;

    try {
      await apiFetch('/api/messages', {
        method: 'POST',
        body: JSON.stringify({ recipient_id: selectedUser.id, content: newMessage })
      });
      const updatedMessages = await apiFetch('/api/messages');
      setMessages(updatedMessages);
      setNewMessage('');
    } catch (err) {
      console.error(err);
      alert('Erro ao enviar mensagem');
    }
  };

  const currentChatMessages = messages.filter(m => 
    (m.sender_id === currentUser?.id && m.recipient_id === selectedUser?.id) ||
    (m.sender_id === selectedUser?.id && m.recipient_id === currentUser?.id)
  ).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  if (loading) return <div className="flex items-center justify-center h-full">Carregando...</div>;

  return (
    <div className="h-[calc(100vh-12rem)] flex bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
      {/* User List */}
      <div className="w-80 border-r border-stone-100 flex flex-col">
        <div className="p-6 border-b border-stone-100">
          <h2 className="text-xl font-bold text-stone-900 mb-4">Mensagens</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 w-4 h-4" />
            <input 
              type="text"
              placeholder="Buscar líder..."
              className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {users.map(user => (
            <button
              key={user.id}
              onClick={() => setSelectedUser(user)}
              className={`w-full p-4 flex items-center gap-3 hover:bg-stone-50 transition-all border-l-4 ${selectedUser?.id === user.id ? 'bg-blue-50 border-blue-600' : 'border-transparent'}`}
            >
              <div className="w-10 h-10 bg-stone-100 rounded-xl flex items-center justify-center text-stone-400">
                <UserIcon className="w-5 h-5" />
              </div>
              <div className="text-left flex-1 min-w-0">
                <p className="text-sm font-bold text-stone-900 truncate">{user.name}</p>
                <p className="text-[10px] text-stone-400 uppercase font-bold tracking-wider">{user.role}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-stone-50/50">
        {selectedUser ? (
          <>
            <div className="p-4 bg-white border-b border-stone-100 flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                <UserIcon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-stone-900">{selectedUser.name}</p>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                  <span className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">Online</span>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {currentChatMessages.map(msg => {
                const isMine = msg.sender_id === currentUser?.id;
                return (
                  <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] p-4 rounded-2xl shadow-sm ${isMine ? 'bg-blue-700 text-white rounded-tr-none' : 'bg-white text-stone-800 border border-stone-200 rounded-tl-none'}`}>
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                      <p className={`text-[10px] mt-1 font-medium ${isMine ? 'text-blue-200' : 'text-stone-400'}`}>
                        {format(new Date(msg.created_at), 'HH:mm')}
                      </p>
                    </div>
                  </div>
                );
              })}
              {currentChatMessages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-stone-400 space-y-2">
                  <MessageSquare className="w-12 h-12 opacity-20" />
                  <p className="text-sm">Inicie uma conversa com {selectedUser.name}</p>
                </div>
              )}
            </div>

            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-stone-100 flex gap-3">
              <input 
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Digite sua mensagem..."
                className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
              <button 
                type="submit"
                className="bg-blue-700 text-white p-2 rounded-xl shadow-lg shadow-blue-100 hover:bg-blue-800 transition-all"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-stone-400 space-y-4">
            <div className="w-20 h-20 bg-stone-100 rounded-3xl flex items-center justify-center text-stone-300">
              <MessageSquare className="w-10 h-10" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-stone-900">Suas Mensagens</h3>
              <p className="text-sm max-w-xs">Selecione um líder na lista ao lado para iniciar uma conversa interna.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
