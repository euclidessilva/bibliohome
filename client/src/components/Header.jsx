import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Bookmark, Menu, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function Header({ tabs, activeTab, onTabChange, onMenuClick }) {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleSignOut = async () => {
    setMenuOpen(false);
    await signOut();
    navigate('/login');
  };

  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

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

        <div style={{ position: 'relative' }} ref={menuRef}>
          <button
            className="header-avatar"
            id="header-avatar"
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Menu do usuário"
            aria-expanded={menuOpen}
            style={{ cursor: 'pointer', border: 'none' }}
          >
            {profile?.avatar_url
              ? <img src={profile.avatar_url} alt={profile?.nome} />
              : getInitials(profile?.nome)
            }
          </button>

          {menuOpen && (
            <div
              role="menu"
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                minWidth: 220,
                background: 'var(--surface, #fff)',
                border: '1px solid var(--border, rgba(0,0,0,0.1))',
                borderRadius: 10,
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                padding: '8px 0',
                zIndex: 100,
              }}
            >
              <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--border, rgba(0,0,0,0.08))', marginBottom: 4 }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Conectado como
                </div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    marginTop: 2,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: 200,
                  }}
                  title={user?.email}
                >
                  {user?.email || '—'}
                </div>
              </div>
              <button
                role="menuitem"
                onClick={handleSignOut}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--red)',
                  cursor: 'pointer',
                  fontSize: 13,
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(192,57,43,0.08)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <LogOut size={15} />
                Sair da conta
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
