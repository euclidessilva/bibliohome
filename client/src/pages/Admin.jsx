import { useState, useEffect, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Modal from '../components/Modal';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { adminListUsers, adminUpdatePassword, adminDeleteUser } from '../lib/api';
import { Key, Trash2, RefreshCw } from 'lucide-react';

function formatDate(d) {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return d;
  }
}

export default function Admin() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { addToast } = useToast();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [passwordTarget, setPasswordTarget] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminListUsers();
      setUsers(data);
    } catch (err) {
      addToast(err.response?.data?.error || 'Erro ao carregar usuários', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    if (isAdmin) loadUsers();
  }, [isAdmin, loadUsers]);

  if (authLoading) return null;
  if (!isAdmin) return <Navigate to="/" replace />;

  const handlePasswordChange = async () => {
    if (!newPassword || newPassword.length < 6) {
      addToast('Senha deve ter ao menos 6 caracteres', 'error');
      return;
    }
    setSaving(true);
    try {
      await adminUpdatePassword(passwordTarget.id, newPassword);
      addToast(`Senha de ${passwordTarget.email} alterada`, 'success');
      setPasswordTarget(null);
      setNewPassword('');
    } catch (err) {
      addToast(err.response?.data?.error || 'Erro ao alterar senha', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await adminDeleteUser(deleteTarget.id);
      addToast(`Usuário ${deleteTarget.email} excluído`, 'success');
      setDeleteTarget(null);
      loadUsers();
    } catch (err) {
      addToast(err.response?.data?.error || 'Erro ao excluir usuário', 'error');
    }
  };

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="app-content-area">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="app-main">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h1 style={{ margin: 0 }}>Área Administrativa</h1>
              <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Gerencie usuários cadastrados na plataforma.
              </p>
            </div>
            <button className="btn btn-outline btn-sm" onClick={loadUsers} disabled={loading}>
              <RefreshCw size={14} /> Atualizar
            </button>
          </div>

          <div className="settings-section">
            <h3>Usuários ({users.length})</h3>

            {loading ? (
              <div className="page-loader" style={{ minHeight: '120px' }}>
                <div className="spinner"></div>
              </div>
            ) : users.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                Nenhum usuário encontrado.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th>Email</th>
                      <th>Cadastro</th>
                      <th>Último login</th>
                      <th>Status</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => {
                      const isSelf = u.id === user.id;
                      return (
                        <tr key={u.id}>
                          <td style={{ fontWeight: 500 }}>
                            {u.nome || '—'}
                            {isSelf && (
                              <span style={{ marginLeft: '0.5rem', fontSize: '0.72rem', color: 'var(--primary, #0a66c2)' }}>
                                (você)
                              </span>
                            )}
                          </td>
                          <td>{u.email}</td>
                          <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                            {formatDate(u.created_at)}
                          </td>
                          <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                            {formatDate(u.last_sign_in_at)}
                          </td>
                          <td>
                            {u.email_confirmed_at ? (
                              <span className="badge badge-success">Confirmado</span>
                            ) : (
                              <span className="badge badge-neutral">Pendente</span>
                            )}
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.25rem' }}>
                              <button
                                className="btn btn-ghost btn-sm"
                                onClick={() => { setPasswordTarget(u); setNewPassword(''); }}
                                title="Trocar senha"
                              >
                                <Key size={15} />
                              </button>
                              {!isSelf && (
                                <button
                                  className="btn btn-ghost btn-sm"
                                  onClick={() => setDeleteTarget(u)}
                                  style={{ color: 'var(--red)' }}
                                  title="Excluir usuário"
                                >
                                  <Trash2 size={15} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modal: trocar senha */}
      <Modal
        isOpen={!!passwordTarget}
        onClose={() => setPasswordTarget(null)}
        title="Trocar senha"
        actions={
          <>
            <button className="btn btn-outline" onClick={() => setPasswordTarget(null)}>Cancelar</button>
            <button className="btn btn-primary" onClick={handlePasswordChange} disabled={saving}>
              {saving ? <span className="spinner" /> : 'Salvar nova senha'}
            </button>
          </>
        }
      >
        <p style={{ marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Defina uma nova senha para <strong>{passwordTarget?.email}</strong>.
          O usuário poderá fazer login imediatamente com a nova senha.
        </p>
        <div className="form-group">
          <label className="form-label">NOVA SENHA</label>
          <input
            type="password"
            className="form-input"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Mínimo 6 caracteres"
            autoFocus
          />
        </div>
      </Modal>

      {/* Modal: confirmar exclusão */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Excluir usuário"
        actions={
          <>
            <button className="btn btn-outline" onClick={() => setDeleteTarget(null)}>Cancelar</button>
            <button className="btn btn-primary" style={{ background: 'var(--red)' }} onClick={handleDelete}>
              Excluir
            </button>
          </>
        }
      >
        <p style={{ fontSize: '0.9rem' }}>
          Tem certeza que deseja excluir <strong>{deleteTarget?.email}</strong>?
          Esta ação removerá o usuário e todos os dados associados (perfil, livros).
          Não pode ser desfeita.
        </p>
      </Modal>
    </div>
  );
}
