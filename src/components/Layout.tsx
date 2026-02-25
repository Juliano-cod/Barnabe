import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store';
import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  Settings, 
  LogOut, 
  Menu, 
  Globe,
  MessageSquare,
  BarChart3
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '../types';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Membros', path: '/members', icon: Users },
    { name: 'Novo Membro', path: '/members/new', icon: UserPlus },
    { name: 'Relatórios', path: '/reports', icon: BarChart3 },
    { name: 'Equipe', path: '/team', icon: Settings },
    { name: 'Mensagens', path: '/messages', icon: MessageSquare },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-stone-50 flex">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-stone-200 transform transition-transform duration-300 lg:relative lg:translate-x-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-full flex flex-col">
          <div className="p-6 flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-900 rounded-full flex items-center justify-center shadow-lg shadow-blue-100 border-2 border-sky-400 relative overflow-hidden">
              <Globe className="text-sky-300 w-6 h-6 absolute opacity-20" />
              <span className="text-white font-black text-[10px] z-10">ADMEC</span>
            </div>
            <div>
              <h1 className="font-bold text-stone-900 leading-none">Projeto Barnabé</h1>
              <span className="text-[10px] text-stone-400 uppercase tracking-wider font-semibold">Gestão Pastoral</span>
            </div>
          </div>

          <nav className="flex-1 px-4 py-4 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                    isActive 
                      ? "bg-blue-50 text-blue-700 shadow-sm" 
                      : "text-stone-500 hover:bg-stone-100 hover:text-stone-900"
                  )}
                >
                  <item.icon className={cn("w-5 h-5", isActive ? "text-blue-600" : "text-stone-400")} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-stone-100">
            <div className="flex items-center gap-3 px-4 py-3 mb-2">
              <div className="w-8 h-8 bg-stone-200 rounded-full flex items-center justify-center text-stone-600 font-bold text-xs">
                {user?.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-stone-900 truncate">{user?.name}</p>
                <p className="text-[10px] text-stone-500 uppercase font-bold">{user?.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all"
            >
              <LogOut className="w-5 h-5" />
              Sair do Sistema
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-bottom border-stone-200 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-stone-500 hover:bg-stone-100 rounded-lg lg:hidden"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="flex-1" />
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <p className="text-xs text-stone-400 font-medium">Hoje é</p>
              <p className="text-sm font-semibold text-stone-900">
                {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
