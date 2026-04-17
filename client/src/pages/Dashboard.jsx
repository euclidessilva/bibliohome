import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useBooks } from '../hooks/useBooks';
import { useISBNScanner } from '../hooks/useISBNScanner';
import { useToast } from '../hooks/useToast';
import { fetchBookByISBN } from '../lib/api';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import StatCard from '../components/StatCard';
import BookCard from '../components/BookCard';
import ProgressBar from '../components/ProgressBar';
import SkeletonCard from '../components/SkeletonCard';
import Modal from '../components/Modal';
import { BookOpen, Star, PlusSquare, ListOrdered } from 'lucide-react';

const QUOTES = [
  {
    text: '"A pessoa, seja ela cavalheiro ou dama, que não sente prazer em um bom romance, deve ser intoleravelmente estúpida."',
    author: 'Jane Austen',
    work: 'A Abadia de Northanger',
  },
  {
    text: '"Um leitor vive mil vidas antes de morrer. O homem que nunca lê vive apenas uma."',
    author: 'George R.R. Martin',
    work: 'A Dança dos Dragões',
  },
  {
    text: '"Os livros são os mais silenciosos e constantes amigos; os mais acessíveis e sábios conselheiros."',
    author: 'Charles W. Eliot',
    work: '',
  },
];

export default function Dashboard() {
  const { profile } = useAuth();
  const { books, stats, loading, removeBook } = useBooks();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [deleteModal, setDeleteModal] = useState(null);

  const recentBooks = books.slice(0, 4);
  const currentlyReading = books.find(b => b.status === 'lendo');
  const quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];

  // HID Scanner listener
  const handleScan = useCallback(async (isbn) => {
    addToast(`ISBN detectado: ${isbn}. Buscando...`, 'info');
    // Play beep
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 1200;
      gain.gain.value = 0.1;
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch (e) { /* audio not available */ }

    try {
      const bookData = await fetchBookByISBN(isbn);
      addToast(`Livro encontrado: ${bookData.titulo}`, 'success');
      navigate('/adicionar', { state: { scannedBook: bookData } });
    } catch {
      addToast('Livro não encontrado. Tente inserir manualmente.', 'error');
      navigate('/adicionar');
    }
  }, [addToast, navigate]);

  useISBNScanner(handleScan);

  const handleDelete = async () => {
    if (!deleteModal) return;
    try {
      await removeBook(deleteModal.id);
      addToast('Livro removido com sucesso', 'success');
    } catch {
      addToast('Erro ao remover livro', 'error');
    }
    setDeleteModal(null);
  };

  const dashTabs = [
    { key: 'visao', label: 'Visão Geral' },
    { key: 'arquivos', label: 'Arquivos' },
    { key: 'desejos', label: 'Lista de Desejos' },
  ];

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="app-content-area">
        <Header
          tabs={dashTabs}
          activeTab="visao"
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="app-main">
          {/* Welcome */}
          <div className="welcome-section">
            <div>
              <h1>Bem-vindo de volta, {profile?.nome || 'Curador'}.</h1>
              <p className="subtitle">
                Seu santuário privado abriga atualmente {stats.total.toLocaleString('pt-BR')} histórias.
              </p>
            </div>
            <button
              className="btn btn-cta"
              onClick={() => navigate('/adicionar')}
              id="btn-novo-livro"
            >
              <PlusSquare size={18} />
              Novo Livro
            </button>
          </div>

          {/* Stats */}
          <div className="stats-grid">
            <StatCard
              icon={<BookOpen size={20} />}
              iconClass="books"
              label="VOLUME TOTAL"
              value={stats.total}
              sublabel="Livros na coleção"
            />
            <StatCard
              icon={<BookOpen size={20} />}
              iconClass="reading"
              label="ATIVIDADE ATUAL"
              value={stats.lendo}
              sublabel="Lendo agora"
            />
            <StatCard
              icon={<Star size={20} />}
              iconClass="wishlist"
              label="AQUISIÇÕES"
              value={stats.desejo}
              sublabel="Livros na lista de desejos"
            />
          </div>

          {/* Recently Added */}
          <div className="section-header">
            <h2>Adicionados Recentemente</h2>
            <a href="/colecao" className="section-link" onClick={(e) => { e.preventDefault(); navigate('/colecao'); }}>
              Ver catálogo completo →
            </a>
          </div>

          <div className="books-grid" style={{ marginBottom: '2.5rem' }}>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            ) : recentBooks.length > 0 ? (
              recentBooks.map(book => (
                <BookCard
                  key={book.id}
                  book={book}
                  onDelete={setDeleteModal}
                  onEdit={() => navigate('/colecao')}
                />
              ))
            ) : (
              <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                <div className="empty-state-icon">📚</div>
                <h3>Sua coleção está vazia</h3>
                <p>Adicione seu primeiro livro para começar a construir seu santuário.</p>
                <button className="btn btn-cta" onClick={() => navigate('/adicionar')}>
                  <PlusSquare size={16} /> Adicionar Primeiro Livro
                </button>
              </div>
            )}
          </div>

          {/* Bottom section: Quote + Reading Now */}
          <div className="two-col-grid">
            <div className="card quote-card">
              <span className="label-uppercase">DESTAQUE ATUAL</span>
              <p className="quote-text">{quote.text}</p>
              <div className="quote-attribution">
                <span className="quote-line" />
                — {quote.author}{quote.work ? `, ${quote.work}` : ''}
              </div>
            </div>

            <div className="card reading-now-card">
              <span className="label-uppercase">LENDO AGORA</span>
              {currentlyReading ? (
                <>
                  <div className="reading-now-inner">
                    <div className="reading-now-cover">
                      {currentlyReading.capa_url && (
                        <img src={currentlyReading.capa_url} alt={currentlyReading.titulo} />
                      )}
                    </div>
                    <div className="reading-now-info">
                      <div className="reading-now-title">{currentlyReading.titulo}</div>
                      <div className="reading-now-progress">
                        <ProgressBar value={currentlyReading.progresso || 0} />
                        <div className="reading-now-progress-text">
                          {currentlyReading.progresso || 0}% CONCLUÍDO
                        </div>
                      </div>
                    </div>
                  </div>
                  <button className="btn btn-outline btn-full register-reading-btn" id="btn-register-reading">
                    <ListOrdered size={16} />
                    Registrar Leitura Diária
                  </button>
                </>
              ) : (
                <div className="empty-state" style={{ padding: '2rem 1rem' }}>
                  <p style={{ fontSize: '0.85rem' }}>
                    Nenhum livro marcado como "Lendo" ainda.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <footer className="app-footer" style={{ marginTop: '2rem', padding: '1.5rem 0' }}>
            <span>© {new Date().getFullYear()} BiblioHome — Seu santuário digital curado.</span>
            <div className="app-footer-links">
              <a href="#">Política de Privacidade</a>
              <a href="#">Termos da Biblioteca</a>
              <a href="#">Suporte</a>
            </div>
          </footer>
        </main>
      </div>

      {/* Delete Modal */}
      <Modal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        title="Remover Livro"
        actions={
          <>
            <button className="btn btn-outline" onClick={() => setDeleteModal(null)}>Cancelar</button>
            <button className="btn btn-danger" onClick={handleDelete}>Remover</button>
          </>
        }
      >
        Tem certeza que deseja remover "{deleteModal?.titulo}" do seu arquivo?
      </Modal>
    </div>
  );
}
