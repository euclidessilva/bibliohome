import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LayoutDashboard, BookOpen, PlusSquare, Settings, Plus } from 'lucide-react';

const navItems = [
  { to: '/', label: 'Painel', icon: LayoutDashboard },
  { to: '/colecao', label: 'Minha Coleção', icon: BookOpen },
  { to: '/adicionar', label: 'Adicionar Livro', icon: PlusSquare },
  { to: '/configuracoes', label: 'Configurações', icon: Settings },
];

export default function Sidebar({ isOpen, onClose }) {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'show' : ''}`} onClick={onClose} />
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <h2>O Arquivo</h2>
          <div className="subtitle">SANTUÁRIO PRIVADO</div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <item.icon className="nav-icon" size={20} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button
            className="sidebar-new-entry"
            onClick={() => { navigate('/adicionar'); onClose?.(); }}
          >
            <Plus size={16} />
            Nova Entrada
          </button>

          <div className="sidebar-profile">
            <div className="sidebar-profile-avatar">
              {profile?.avatar_url
                ? <img src={profile.avatar_url} alt={profile.nome} />
                : getInitials(profile?.nome)
              }
            </div>
            <div className="sidebar-profile-info">
              <div className="sidebar-profile-name">{profile?.nome || 'Curador'}</div>
              <div className="sidebar-profile-role">
                {profile?.role === 'admin' ? 'Acesso Admin' : 'Membro Pro'}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
