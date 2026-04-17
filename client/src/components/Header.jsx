import { Search, Bell, Bookmark, Menu } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function Header({ tabs, activeTab, onTabChange, onMenuClick }) {
  const { profile } = useAuth();

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <header className="header">
      <button className="hamburger-btn" onClick={onMenuClick}>
        <Menu size={22} />
      </button>

      <div className="header-logo">BiblioHome</div>

      <div className="header-search">
        <Search className="search-icon" size={16} />
        <input type="text" placeholder="Pesquisar nos arquivos..." id="header-search-input" />
      </div>

      {tabs && (
        <div className="header-tabs">
          {tabs.map(tab => (
            <button
              key={tab.key}
              className={`header-tab ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => onTabChange?.(tab.key)}
              id={`header-tab-${tab.key}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      <div className="header-actions">
        <button className="header-icon-btn" id="btn-notifications"><Bell size={18} /></button>
        <button className="header-icon-btn" id="btn-bookmarks"><Bookmark size={18} /></button>
        <div className="header-avatar" id="header-avatar">
          {profile?.avatar_url
            ? <img src={profile.avatar_url} alt={profile?.nome} />
            : getInitials(profile?.nome)
          }
        </div>
      </div>
    </header>
  );
}
