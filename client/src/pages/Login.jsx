import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Mail, KeyRound } from 'lucide-react';
import Modal from '../components/Modal';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [signupData, setSignupData] = useState({ nome: '', email: '', password: '' });
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupMsg, setSignupMsg] = useState('');

  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signIn(email, password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message === 'Invalid login credentials'
        ? 'Email ou senha incorretos. Verifique suas credenciais.'
        : err.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setSignupMsg('');
    setSignupLoading(true);
    try {
      await signUp(signupData.email, signupData.password, signupData.nome);
      setSignupMsg('Conta criada com sucesso! Verifique seu email para confirmar.');
      setTimeout(() => {
        setShowSignup(false);
        setEmail(signupData.email);
      }, 2000);
    } catch (err) {
      setSignupMsg(err.message || 'Erro ao criar conta');
    } finally {
      setSignupLoading(false);
    }
  };

  return (
    <div className="login-page" style={{ backgroundImage: 'url(/library-bg.png)' }}>
      <div className="login-card">
        <div className="login-logo">
          <h1>BiblioHome</h1>
          <div className="tagline">THE DIGITAL SANCTUARY</div>
        </div>

        <form className="login-form" onSubmit={handleLogin}>
          {error && <div className="login-error">{error}</div>}

          <div className="form-group">
            <label className="form-label">CURATOR EMAIL</label>
            <div className="form-input-icon-wrapper">
              <input
                type="email"
                className="form-input"
                placeholder="e.g. curator@archive.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                id="login-email"
              />
              <Mail className="form-input-icon" size={18} />
            </div>
          </div>

          <div className="form-group">
            <div className="login-label-row">
              <label className="form-label">SECRET KEY</label>
              <span className="login-forgot">FORGOT YOUR PATH?</span>
            </div>
            <div className="form-input-icon-wrapper">
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                id="login-password"
              />
              <KeyRound className="form-input-icon" size={18} />
            </div>
          </div>

          <label className="login-checkbox">
            <input type="checkbox" />
            Keep me signed in
          </label>

          <button
            type="submit"
            className="btn btn-primary btn-full btn-lg login-submit"
            disabled={loading}
            id="btn-login"
          >
            {loading ? <span className="spinner" /> : 'Enter Archive →'}
          </button>
        </form>

        <div className="login-footer">
          <p className="text-muted">New to the collection?</p>
          <span className="invite-link" onClick={() => setShowSignup(true)}>
            Request an Invitation ✦
          </span>
        </div>
      </div>

      <div className="login-exlibris">Ex Libris</div>

      <Modal
        isOpen={showSignup}
        onClose={() => setShowSignup(false)}
        title="Criar Conta"
        actions={null}
      >
        <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {signupMsg && (
            <div className={signupMsg.includes('sucesso') ? 'login-error' : 'login-error'}
                 style={signupMsg.includes('sucesso') ? { background: '#f0fdf4', borderColor: '#bbf7d0', color: '#166534' } : {}}>
              {signupMsg}
            </div>
          )}
          <div className="form-group">
            <label className="form-label">NOME</label>
            <input
              type="text"
              className="form-input"
              placeholder="Seu nome"
              value={signupData.nome}
              onChange={(e) => setSignupData(p => ({ ...p, nome: e.target.value }))}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">EMAIL</label>
            <input
              type="email"
              className="form-input"
              placeholder="seu@email.com"
              value={signupData.email}
              onChange={(e) => setSignupData(p => ({ ...p, email: e.target.value }))}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">SENHA</label>
            <input
              type="password"
              className="form-input"
              placeholder="Mínimo 6 caracteres"
              value={signupData.password}
              onChange={(e) => setSignupData(p => ({ ...p, password: e.target.value }))}
              required
              minLength={6}
            />
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={signupLoading}>
            {signupLoading ? <span className="spinner" /> : 'Criar Conta →'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
