import { Link } from 'react-router-dom';
import {
  ScanLine,
  BookOpen,
  Users,
  LayoutDashboard,
  BookMarked,
  Lock,
  ArrowRight,
} from 'lucide-react';

const features = [
  {
    icon: ScanLine,
    title: 'Leitura de código de barras',
    text: 'Cadastre livros pela câmera (ZXing) ou leitor HID em segundos — basta apontar e capturar.',
  },
  {
    icon: BookMarked,
    title: 'Metadados automáticos',
    text: 'Título, autor, capa, editora e descrição preenchidos automaticamente via Google Books API.',
  },
  {
    icon: LayoutDashboard,
    title: 'Painel da coleção',
    text: 'Estatísticas em tempo real: total, lendo, desejos e concluídos — visão de curador.',
  },
  {
    icon: BookOpen,
    title: 'Controle de leitura',
    text: 'Progresso por livro e status (na coleção, lendo, desejo, concluído).',
  },
  {
    icon: Users,
    title: 'Multi-usuário com convite',
    text: 'Acesso restrito por chave de convite. Cada membro tem sua coleção privada (RLS no Supabase).',
  },
  {
    icon: Lock,
    title: 'Privado por padrão',
    text: 'Autenticação Supabase, Row Level Security e administração centralizada.',
  },
];

export default function Landing() {
  return (
    <div className="landing-page" style={{ backgroundImage: 'url(/library-bg.png)' }}>
      <header className="landing-header">
        <div className="landing-brand">
          <h2>BiblioHome</h2>
          <span className="landing-brand-tag">SANTUÁRIO PRIVADO</span>
        </div>
        <Link to="/login" className="landing-nav-link">Entrar</Link>
      </header>

      <main className="landing-main">
        <section className="landing-hero">
          <div className="landing-eyebrow">Ex Libris · Coleção Particular</div>
          <h1 className="landing-title">
            Sua biblioteca particular,<br />
            <em>organizada como um santuário.</em>
          </h1>
          <p className="landing-subtitle">
            BiblioHome é uma biblioteca digital privada para curadores de livros.
            Cadastre por código de barras, busque metadados automaticamente e mantenha
            sua coleção em um só lugar — bonito, rápido e seu.
          </p>

          <div className="landing-cta-group">
            <Link to="/login" className="btn btn-primary btn-lg landing-cta-primary">
              Entrar <ArrowRight size={18} />
            </Link>
            <Link to="/login?signup=1" className="btn btn-outline btn-lg landing-cta-secondary">
              Solicitar convite
            </Link>
          </div>

          <p className="landing-cta-hint">
            O cadastro é restrito — solicite uma chave de convite ao administrador.
          </p>
        </section>

        <section className="landing-features">
          <div className="landing-section-header">
            <span className="landing-section-eyebrow">Funcionalidades</span>
            <h2>Tudo que um colecionador precisa.</h2>
          </div>

          <div className="landing-features-grid">
            {features.map((f) => (
              <article key={f.title} className="landing-feature">
                <div className="landing-feature-icon">
                  <f.icon size={22} />
                </div>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="landing-final-cta">
          <h2>Pronto para começar?</h2>
          <p>
            Solicite seu convite e comece a organizar sua coleção hoje mesmo.
          </p>
          <div className="landing-cta-group">
            <Link to="/login" className="btn btn-primary btn-lg">
              Entrar <ArrowRight size={18} />
            </Link>
            <Link to="/login?signup=1" className="btn btn-outline btn-lg">
              Solicitar convite
            </Link>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <span>BiblioHome — Biblioteca Particular Digital</span>
        <span className="landing-footer-exlibris">Ex Libris</span>
      </footer>
    </div>
  );
}
