import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

export default function Settings() {
  const { profile, updateProfile, signOut } = useAuth();
  const { addToast } = useToast();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({ nome: '', avatar_url: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setProfileForm({ nome: profile.nome || '', avatar_url: profile.avatar_url || '' });
    }
  }, [profile]);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile(profileForm);
      addToast('Perfil atualizado com sucesso', 'success');
    } catch {
      addToast('Erro ao atualizar perfil', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="app-content-area">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="app-main">
          <h1 style={{ marginBottom: '1.5rem' }}>Configurações</h1>

          {/* Profile Section */}
          <div className="settings-section">
            <h3>Meu Perfil</h3>
            <form className="settings-form" onSubmit={handleProfileSave}>
              <div className="form-group">
                <label className="form-label">NOME</label>
                <input
                  className="form-input"
                  value={profileForm.nome}
                  onChange={e => setProfileForm(p => ({ ...p, nome: e.target.value }))}
                  id="settings-name"
                />
              </div>
              <div className="form-group">
                <label className="form-label">URL DO AVATAR</label>
                <input
                  className="form-input"
                  placeholder="https://..."
                  value={profileForm.avatar_url}
                  onChange={e => setProfileForm(p => ({ ...p, avatar_url: e.target.value }))}
                />
              </div>
              <div>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <span className="spinner" /> : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </div>

          {/* Preferences */}
          <div className="settings-section">
            <h3>Preferências</h3>
            <div className="settings-form">
              <div className="form-group">
                <label className="form-label">TEMA</label>
                <select className="form-select" defaultValue="light" disabled>
                  <option value="light">Claro (padrão)</option>
                </select>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Tema escuro em breve.
                </span>
              </div>
              <div className="form-group">
                <label className="form-label">IDIOMA</label>
                <select className="form-select" defaultValue="pt">
                  <option value="pt">Português (Brasil)</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>
          </div>

          {/* About */}
          <div className="settings-section">
            <h3>Sobre</h3>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.8 }}>
              <p><strong>BiblioHome</strong> — Biblioteca Particular Digital</p>
              <p>Versão 1.0.0</p>
              <p>Desenvolvido com React, Express, Supabase e Google Books API.</p>
            </div>
          </div>

          {/* Logout */}
          <button className="btn btn-outline" onClick={signOut} style={{ marginTop: '0.5rem' }} id="btn-logout">
            Sair da Conta
          </button>
        </main>
      </div>
    </div>
  );
}
