import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { fetchUsers, inviteUser, changeUserRole, removeUser } from '../lib/api';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Modal from '../components/Modal';
import { UserPlus, Shield, Trash2 } from 'lucide-react';

export default function Settings() {
  const { profile, updateProfile, isAdmin, signOut } = useAuth();
  const { addToast } = useToast();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({ nome: '', avatar_url: '' });
  const [saving, setSaving] = useState(false);

  // Admin state
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  useEffect(() => {
    if (profile) {
      setProfileForm({ nome: profile.nome || '', avatar_url: profile.avatar_url || '' });
    }
  }, [profile]);

  useEffect(() => {
    if (isAdmin) {
      loadUsers();
    }
  }, [isAdmin]);

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const data = await fetchUsers();
      setUsers(data);
    } catch (err) {
      console.error('Error loading users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

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

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail) return;
    setInviting(true);
    try {
      await inviteUser(inviteEmail);
      addToast(`Convite enviado para ${inviteEmail}`, 'success');
      setInviteEmail('');
      setShowInviteModal(false);
      await loadUsers();
    } catch (err) {
      addToast(err.response?.data?.error || 'Erro ao enviar convite', 'error');
    } finally {
      setInviting(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await changeUserRole(userId, newRole);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      addToast('Role atualizada com sucesso', 'success');
    } catch (err) {
      addToast(err.response?.data?.error || 'Erro ao atualizar role', 'error');
    }
  };

  const handleRemoveUser = async (userId) => {
    if (!confirm('Tem certeza que deseja remover este usuário?')) return;
    try {
      await removeUser(userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
      addToast('Usuário removido com sucesso', 'success');
    } catch (err) {
      addToast(err.response?.data?.error || 'Erro ao remover usuário', 'error');
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

          {/* User Management (Admin Only) */}
          {isAdmin && (
            <div className="settings-section">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
                <h3 style={{ margin: 0, padding: 0, border: 'none' }}>Gerenciar Usuários</h3>
                <button className="btn btn-cta btn-sm" onClick={() => setShowInviteModal(true)} id="btn-invite-user">
                  <UserPlus size={16} /> Convidar Usuário
                </button>
              </div>

              {loadingUsers ? (
                <div className="page-loader" style={{ minHeight: '100px' }}>
                  <div className="spinner"></div>
                </div>
              ) : (
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Desde</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id}>
                        <td style={{ fontWeight: 500 }}>{user.nome || '—'}</td>
                        <td>{user.email}</td>
                        <td>
                          <select
                            className="role-select"
                            value={user.role}
                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                            disabled={user.id === profile?.id}
                          >
                            <option value="admin">Admin</option>
                            <option value="member">Member</option>
                          </select>
                        </td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                          {user.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : '—'}
                        </td>
                        <td>
                          {user.id !== profile?.id && (
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => handleRemoveUser(user.id)}
                              style={{ color: 'var(--red)' }}
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

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

      {/* Invite Modal */}
      <Modal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        title="Convidar Usuário"
        actions={null}
      >
        <form onSubmit={handleInvite} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">EMAIL DO CONVIDADO</label>
            <input
              type="email"
              className="form-input"
              placeholder="usuario@email.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={inviting}>
            {inviting ? <span className="spinner" /> : 'Enviar Convite'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
