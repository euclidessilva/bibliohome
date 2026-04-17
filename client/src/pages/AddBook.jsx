import { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useBooks } from '../hooks/useBooks';
import { useToast } from '../hooks/useToast';
import { fetchBookByISBN } from '../lib/api';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import ISBNInput from '../components/ISBNInput';
import Badge from '../components/Badge';
import { Camera, Scan, Plus, Pencil, Info, BookOpen } from 'lucide-react';

export default function AddBook() {
  const location = useLocation();
  const { addBook } = useBooks();
  const { addToast } = useToast();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [foundBook, setFoundBook] = useState(location.state?.scannedBook || null);
  const [showManualForm, setShowManualForm] = useState(false);
  const [discoveries, setDiscoveries] = useState([]);
  const [cameraActive, setCameraActive] = useState(false);
  const [saving, setSaving] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const readerRef = useRef(null);

  // Manual form state
  const [manualData, setManualData] = useState({
    titulo: '', autor: '', isbn: '', editora: '', ano_publicacao: '',
    paginas: '', categorias: '', capa_url: '', descricao: '', status: 'na_colecao',
  });

  // Edit found book fields
  const [editData, setEditData] = useState(null);

  useEffect(() => {
    if (foundBook && !editData) {
      setEditData({ ...foundBook, status: 'na_colecao' });
    }
  }, [foundBook]);

  // Search ISBN
  const handleSearch = async (isbn) => {
    setSearchLoading(true);
    setFoundBook(null);
    setShowManualForm(false);
    setEditData(null);
    try {
      const data = await fetchBookByISBN(isbn);
      setFoundBook(data);
      setEditData({ ...data, status: 'na_colecao' });
      setDiscoveries(prev => {
        const exists = prev.find(d => d.isbn === data.isbn);
        if (exists) return prev;
        return [data, ...prev].slice(0, 2);
      });
      addToast(`Livro encontrado: ${data.titulo}`, 'success');
    } catch (err) {
      addToast('Livro não encontrado. Preencha manualmente.', 'error');
      setShowManualForm(true);
      setManualData(prev => ({ ...prev, isbn }));
    } finally {
      setSearchLoading(false);
    }
  };

  // Save book from search result
  const handleSaveFound = async () => {
    if (!editData) return;
    setSaving(true);
    try {
      const bookToSave = {
        ...editData,
        categorias: Array.isArray(editData.categorias)
          ? editData.categorias
          : editData.categorias?.split(',').map(c => c.trim()).filter(Boolean) || [],
      };
      await addBook(bookToSave);
      addToast(`"${editData.titulo}" adicionado ao arquivo!`, 'success');
      setFoundBook(null);
      setEditData(null);
    } catch {
      addToast('Erro ao salvar livro', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Save manual entry
  const handleSaveManual = async (e) => {
    e.preventDefault();
    if (!manualData.titulo.trim()) {
      addToast('O título é obrigatório', 'error');
      return;
    }
    setSaving(true);
    try {
      const bookData = {
        ...manualData,
        paginas: manualData.paginas ? parseInt(manualData.paginas) : null,
        categorias: manualData.categorias
          ? manualData.categorias.split(',').map(c => c.trim()).filter(Boolean)
          : [],
      };
      await addBook(bookData);
      addToast(`"${manualData.titulo}" adicionado ao arquivo!`, 'success');
      setManualData({
        titulo: '', autor: '', isbn: '', editora: '', ano_publicacao: '',
        paginas: '', categorias: '', capa_url: '', descricao: '', status: 'na_colecao',
      });
      setShowManualForm(false);
    } catch {
      addToast('Erro ao salvar livro', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Add discovery to collection
  const handleAddDiscovery = async (book) => {
    setSaving(true);
    try {
      await addBook({ ...book, status: 'na_colecao' });
      addToast(`"${book.titulo}" adicionado ao arquivo!`, 'success');
      setDiscoveries(prev => prev.filter(d => d.isbn !== book.isbn));
    } catch {
      addToast('Erro ao salvar livro', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Camera scanner
  const startCamera = async () => {
    try {
      const { BrowserMultiFormatReader } = await import('@zxing/browser');
      const reader = new BrowserMultiFormatReader();
      readerRef.current = reader;

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);

        reader.decodeFromVideoElement(videoRef.current, (result) => {
          if (result) {
            const text = result.getText();
            const clean = text.replace(/[-\s]/g, '');
            // Accept ISBN-10 (10 digits) or EAN-13/ISBN-13 (13 digits)
            if (/^\d{10}$/.test(clean) || /^\d{13}$/.test(clean)) {
              stopCamera();
              handleSearch(clean);
            }
          }
        });
      }
    } catch (err) {
      console.error('Camera error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        addToast('Permissão de câmera negada. Libere nas configurações do navegador.', 'error');
      } else if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
        addToast('A câmera exige HTTPS. Acesse pelo endereço com 🔒 (porta 3443).', 'error');
      } else {
        addToast('Não foi possível acessar a câmera. Verifique se outro app está usando.', 'error');
      }
    }
  };

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (readerRef.current) {
      readerRef.current.reset?.();
      readerRef.current = null;
    }
    setCameraActive(false);
  }, []);

  useEffect(() => {
    return () => stopCamera();
  }, [stopCamera]);

  const headerTabs = [
    { key: 'catalogo', label: 'Catálogo' },
    { key: 'nova', label: 'Nova Entrada' },
    { key: 'desejos', label: 'Desejos' },
  ];

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="app-content-area">
        <Header
          tabs={headerTabs}
          activeTab="nova"
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="app-main">
          <div className="add-book-header">
            <h1>Expanda sua Coleção</h1>
            <p>
              Registre novas aquisições escaneando o código de barras ou inserindo detalhes
              manualmente para preservar os metadados do seu santuário pessoal.
            </p>
          </div>

          {/* Scanner + Manual Input */}
          <div className="scanner-section">
            {/* Camera */}
            <div>
              <div className="camera-container">
                <video ref={videoRef} autoPlay playsInline muted style={{ display: cameraActive ? 'block' : 'none' }} />
                {!cameraActive && (
                  <div style={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', padding: '2rem' }}>
                    <Scan size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                    <p>Câmera inativa</p>
                  </div>
                )}
                <div className="camera-overlay">
                  <div className="scan-frame" />
                </div>
                {cameraActive && (
                  <div className="camera-overlay-text">
                    <Scan size={14} />
                    Alinhe o código de barras na moldura
                  </div>
                )}
              </div>

              <div className="camera-info">
                <h3>Olho Digital</h3>
                <p>Aponte seu dispositivo para a capa traseira do livro.</p>
              </div>

              <div className="camera-actions">
                {!cameraActive ? (
                  <button className="btn btn-primary" onClick={startCamera} id="btn-camera">
                    <Camera size={18} />
                    Ativar Câmera
                  </button>
                ) : (
                  <button className="btn btn-outline" onClick={stopCamera}>
                    Desativar Câmera
                  </button>
                )}
              </div>
            </div>

            {/* Manual Input */}
            <div className="manual-section">
              <div className="manual-section-title">
                <Scan size={20} />
                Registro Manual
              </div>
              <p>
                Insira o ISBN-10 ou ISBN-13 encontrado na página de copyright ou na capa traseira.
              </p>
              <ISBNInput onSearch={handleSearch} loading={searchLoading} />
              <div className="info-text">
                <Info size={14} />
                Pesquisando em arquivos de bibliotecas globais
              </div>
            </div>
          </div>

          {/* Book Preview (after search) */}
          {foundBook && editData && (
            <div className="book-preview">
              <div className="book-preview-cover">
                {foundBook.capa_url ? (
                  <img src={foundBook.capa_url} alt={foundBook.titulo} />
                ) : (
                  <div className="book-card-cover-placeholder"><BookOpen size={24} /></div>
                )}
              </div>
              <div className="book-preview-info">
                <div className="book-preview-title">{foundBook.titulo}</div>
                <div className="book-preview-meta">
                  {foundBook.autor} {foundBook.ano_publicacao && `• ${foundBook.ano_publicacao}`}
                  {foundBook.editora && ` • ${foundBook.editora}`}
                </div>
                {foundBook.categorias?.length > 0 && (
                  <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', margin: '0.25rem 0' }}>
                    {foundBook.categorias.map((cat, i) => <Badge key={i} type="category">{cat}</Badge>)}
                  </div>
                )}
                {foundBook.descricao && (
                  <div className="book-preview-desc">{foundBook.descricao}</div>
                )}
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: 'auto', paddingTop: '0.75rem' }}>
                  <select
                    className="form-select"
                    value={editData.status}
                    onChange={(e) => setEditData(p => ({ ...p, status: e.target.value }))}
                    style={{ flex: 1 }}
                  >
                    <option value="na_colecao">Na Coleção</option>
                    <option value="lendo">Lendo</option>
                    <option value="desejo">Lista de Desejos</option>
                  </select>
                  <button
                    className="btn btn-cta"
                    onClick={handleSaveFound}
                    disabled={saving}
                    id="btn-add-found-book"
                  >
                    {saving ? <span className="spinner" /> : '✓ Adicionar ao Arquivo'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Manual Form (when API doesn't find) */}
          {showManualForm && !foundBook && (
            <form className="card" style={{ marginTop: '1.5rem', padding: '1.75rem' }} onSubmit={handleSaveManual}>
              <h3 style={{ marginBottom: '1rem' }}>Cadastro Manual</h3>
              <div className="manual-form">
                <div className="form-group full-width">
                  <label className="form-label">TÍTULO *</label>
                  <input className="form-input" value={manualData.titulo}
                    onChange={e => setManualData(p => ({ ...p, titulo: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">AUTOR</label>
                  <input className="form-input" value={manualData.autor}
                    onChange={e => setManualData(p => ({ ...p, autor: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">ISBN</label>
                  <input className="form-input" value={manualData.isbn}
                    onChange={e => setManualData(p => ({ ...p, isbn: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">EDITORA</label>
                  <input className="form-input" value={manualData.editora}
                    onChange={e => setManualData(p => ({ ...p, editora: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">ANO</label>
                  <input className="form-input" value={manualData.ano_publicacao}
                    onChange={e => setManualData(p => ({ ...p, ano_publicacao: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">PÁGINAS</label>
                  <input className="form-input" type="number" value={manualData.paginas}
                    onChange={e => setManualData(p => ({ ...p, paginas: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">STATUS</label>
                  <select className="form-select" value={manualData.status}
                    onChange={e => setManualData(p => ({ ...p, status: e.target.value }))}>
                    <option value="na_colecao">Na Coleção</option>
                    <option value="lendo">Lendo</option>
                    <option value="desejo">Lista de Desejos</option>
                  </select>
                </div>
                <div className="form-group full-width">
                  <label className="form-label">CATEGORIAS (separadas por vírgula)</label>
                  <input className="form-input" placeholder="Ficção, Romance, Clássico"
                    value={manualData.categorias}
                    onChange={e => setManualData(p => ({ ...p, categorias: e.target.value }))} />
                </div>
                <div className="form-group full-width">
                  <label className="form-label">URL DA CAPA</label>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <input className="form-input" placeholder="https://..." value={manualData.capa_url}
                        onChange={e => setManualData(p => ({ ...p, capa_url: e.target.value }))} />
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                        Cole uma URL de imagem ou deixe em branco para usar o ícone padrão
                      </div>
                    </div>
                    {manualData.capa_url && (
                      <div style={{
                        width: 64, height: 90, borderRadius: 6, overflow: 'hidden',
                        border: '1px solid var(--border)', flexShrink: 0, background: 'var(--bg-card)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        <img
                          src={manualData.capa_url}
                          alt="preview"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={e => { e.target.style.display = 'none'; }}
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className="form-group full-width">
                  <label className="form-label">DESCRIÇÃO</label>
                  <textarea className="form-input form-textarea" value={manualData.descricao}
                    onChange={e => setManualData(p => ({ ...p, descricao: e.target.value }))} />
                </div>
                <div className="full-width">
                  <button type="submit" className="btn btn-cta btn-full" disabled={saving}>
                    {saving ? <span className="spinner" /> : '✓ Adicionar ao Arquivo'}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Discoveries */}
          <div style={{ marginTop: '3rem' }}>
            <div className="section-header">
              <h2>Descobertas Recentes</h2>
            </div>
            <div className="discovery-grid">
              {discoveries.map((d, i) => (
                <div key={d.isbn || i} className="discovery-card">
                  <div className="discovery-card-cover">
                    {d.capa_url ? (
                      <img src={d.capa_url} alt={d.titulo} />
                    ) : (
                      <div className="book-card-cover-placeholder"><BookOpen size={20} /></div>
                    )}
                  </div>
                  <div className="discovery-card-info">
                    <Badge type="match">CORRESPONDÊNCIA</Badge>
                    <div className="discovery-card-title">{d.titulo}</div>
                    <div className="discovery-card-meta">
                      {d.autor}{d.ano_publicacao ? `, ${d.ano_publicacao}` : ''}
                    </div>
                    <button className="add-link" onClick={() => handleAddDiscovery(d)}>
                      <Plus size={14} /> Adicionar ao Arquivo
                    </button>
                  </div>
                </div>
              ))}
              {/* Placeholder */}
              <div className="discovery-card discovery-placeholder" style={{ border: '1px dashed var(--border)' }}>
                <div className="sparkle">✦</div>
                <span>Resultados aparecem conforme você escaneia...</span>
              </div>
            </div>
          </div>

          {/* FAB */}
          <button className="fab" onClick={() => setShowManualForm(true)} id="fab-manual-entry">
            <Pencil size={22} />
          </button>
        </main>
      </div>
    </div>
  );
}
