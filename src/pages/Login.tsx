import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store';
import { Globe, Lock, Mail, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        setAuth(data.user, data.token);
        navigate('/');
      } else {
        setError(data.error || 'Falha no login');
      }
    } catch (err) {
      console.error("Login error:", err);
      setError('Erro ao conectar ao servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-stone-200"
      >
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-20 h-20 bg-blue-900 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-blue-200 relative overflow-hidden border-4 border-sky-400">
            <Globe className="text-sky-300 w-12 h-12 absolute opacity-20" />
            <span className="text-white font-black text-xl z-10 tracking-tighter">ADMEC</span>
          </div>
          <h1 className="text-2xl font-bold text-stone-900 leading-tight">Projeto Barnabé</h1>
          <p className="text-stone-500 text-sm">Gestão de Novos Membros</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">E-mail</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 w-5 h-5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                placeholder="seu@email.com"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 w-5 h-5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                placeholder="••••••••"
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <button 
              type="button"
              onClick={() => alert('Entre em contato com o administrador do sistema para resetar sua senha.')}
              className="text-xs text-blue-600 hover:underline font-medium"
            >
              Esqueceu a senha?
            </button>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2.5 rounded-xl transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Entrar'}
          </button>
        </form>
        
        <div className="mt-8 pt-6 border-top border-stone-100 text-center">
          <p className="text-xs text-stone-400">
            Apenas pessoal autorizado. Em conformidade com a LGPD.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
