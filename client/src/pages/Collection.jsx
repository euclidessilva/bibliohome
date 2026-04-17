import { useState, useEffect, useMemo } from 'react';
import { useBooks } from '../hooks/useBooks';
import { useToast } from '../hooks/useToast';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import BookCard from '../components/BookCard';
import SkeletonCard from '../components/SkeletonCard';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import { Search, PlusSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const STATUS_TABS = [
  { key: 'todos', label: 'Todos' },
  { key: 'na_colecao', label: 'Na Coleção' },
  { key: 'lendo', label: 'Lendo' },
  { key: 'desejo', label: 'Desejos' },
  { key: 'concluido', label: 'Concluídos' },
];

const STATUS_LABELS = {
  na_colecao: 'Na Coleção',
  lendo: 'Lendo',
  desejo: 'Lista de Desejos',
  concluido: 'Concluído',
};

export default function Collection() {
  const { books, loading, removeBook, editBook, loadBooks } = useBooks();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteModal, setDeleteModal] = useState(null);
  const [editModal, setEditModal] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);

  const filteredBooks = useMemo(() => {
    let result = books;
    if (activeFilter !== 'todos') {
      result = result.filter(b => b.status === activeFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(b =>
        b.titulo?.toLowerCase().includes(q) ||
        b.autor?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [books, activeFilter, searchQuery]);

  const handleDelete = async () => {
    if (!deleteModal) return;
    setDeleting(true);
    try {
      await removeBook(deleteModal.id);
      addToast('Livro removido com sucesso', 'success');
    } catch {
      addToast('Erro ao remover livro', 'error');
    } finally {
      setDeleting(false);
      setDeleteModal(null);
    }
  };

  const openEdit = (book) => {
    setEditForm({
      titulo: book.titulo || '',
      autor: book.autor || '',
      editora: book.editora || '',
      ano_publicacao: book.ano_publicacao || '',
      paginas: book.paginas || '',
      status: book.status || 'na_colecao',
      progresso: book.progresso || 0,
      categorias: book.categorias?.join(', ') || '',
      descricao: book.descricao || '',
    });
    setEditModal(book);
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!editModal) return;
    setSaving(true);
    try {
      const updates = {
        ...editForm,
        paginas: editForm.paginas ? parseInt(editForm.paginas) : null,
        progresso: parseInt(editForm.progresso) || 0,
        categorias: editForm.categorias
          ? editForm.categorias.split(',').map(c => c.trim()).filter(Boolean)
          : [],
      };
      await editBook(editModal.id, updates);
      addToast('Livro atualizado com sucesso', 'success');
      setEditModal(null);
    } catch {
      addToast('Erro ao atualizar livro', 'error');
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
          <div className="welcome-section">
            <div>
              <h1>Minha Coleção</h1>
              <p className="subtitle">{filteredBooks.length} livros encontrados</p>
            </div>
            <button className="btn btn-cta" onClick={() => navigate('/adicionar')}>
              <PlusSquare size={18} /> Novo Livro
            </button>
          </div>

          {/* Filters */}
          <div className="collection-filters">
            <div className="filter-tabs">
              {STATUS_TABS.map(tab => (
                <button
                  key={tab.key}
                  className={`filter-tab ${activeFilter === tab.key ? 'active' : ''}`}
                  onClick={() => setActiveFilter(tab.key)}
                  id={`filter-${tab.key}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="collection-search">
              <Search className="search-icon" size={15} />
              <input
                type="text"
                placeholder="Buscar por título ou autor..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                id="collection-search-input"
              />
            </div>
          </div>

          {/* Books Grid */}
          <div className="books-grid">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
            ) : filteredBooks.length > 0 ? (
              filteredBooks.map(book => (
                <div key={book.id}>
                  <BookCard
                    book={book}
                    onDelete={setDeleteModal}
                    onEdit={openEdit}
                  />
                  <div style={{ marginTop: '0.35rem' }}>
                    <Badge type="status" className={book.status}>
                      {STATUS_LABELS[book.status] || book.status}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                <div className="empty-state-icon">📚</div>
                <h3>{searchQuery ? 'Nenhum resultado encontrado' : 'Nenhum livro nesta categoria'}</h3>
                <p>
                  {searchQuery
                    ? 'Tente outra busca ou adicione um novo livro.'
                    : 'Adicione livros à sua coleção para vê-los aqui.'
                  }
                </p>
                <button className="btn btn-cta" onClick={() => navigate('/adicionar')}>
                  <PlusSquare size={16} /> Adicionar Livro
                </button>
              </div>
            )}
          </div>
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
            <button className="btn btn-danger" onClick={handleDelete} disabled={deleting}>
              {deleting ? <span className="spinner" /> : 'Remover'}
            </button>
          </>
        }
      >
        Tem certeza que deseja remover "{deleteModal?.titulo}" do seu arquivo?
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editModal}
        onClose={() => setEditModal(null)}
        title="Editar Livro"
        large
        actions={null}
      >
        <form onSubmit={handleEdit}>
          <div className="manual-form">
            <div className="form-group full-width">
              <label className="form-label">TÍTULO</label>
              <input className="form-input" value={editForm.titulo}
                onChange={e => setEditForm(p => ({ ...p, titulo: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">AUTOR</label>
              <input className="form-input" value={editForm.autor}
                onChange={e => setEditForm(p => ({ ...p, autor: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">EDITORA</label>
              <input className="form-input" value={editForm.editora}
                onChange={e => setEditForm(p => ({ ...p, editora: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">ANO</label>
              <input className="form-input" value={editForm.ano_publicacao}
                onChange={e => setEditForm(p => ({ ...p, ano_publicacao: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">PÁGINAS</label>
              <input className="form-input" type="number" value={editForm.paginas}
                onChange={e => setEditForm(p => ({ ...p, paginas: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">STATUS</label>
              <select className="form-select" value={editForm.status}
                onChange={e => setEditForm(p => ({ ...p, status: e.target.value }))}>
                <option value="na_colecao">Na Coleção</option>
                <option value="lendo">Lendo</option>
                <option value="desejo">Lista de Desejos</option>
                <option value="concluido">Concluído</option>
              </select>
            </div>
            {editForm.status === 'lendo' && (
              <div className="form-group">
                <label className="form-label">PROGRESSO (%)</label>
                <input className="form-input" type="number" min="0" max="100"
                  value={editForm.progresso}
                  onChange={e => setEditForm(p => ({ ...p, progresso: e.target.value }))} />
              </div>
            )}
            <div className="form-group full-width">
              <label className="form-label">CATEGORIAS (separadas por vírgula)</label>
              <input className="form-input" value={editForm.categorias}
                onChange={e => setEditForm(p => ({ ...p, categorias: e.target.value }))} />
            </div>
            <div className="form-group full-width">
              <label className="form-label">DESCRIÇÃO</label>
              <textarea className="form-input form-textarea" value={editForm.descricao}
                onChange={e => setEditForm(p => ({ ...p, descricao: e.target.value }))} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.25rem' }}>
            <button type="button" className="btn btn-outline" onClick={() => setEditModal(null)}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <span className="spinner" /> : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
