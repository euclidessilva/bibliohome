import { useState } from 'react';
import { Search } from 'lucide-react';

export default function ISBNInput({ onSearch, loading }) {
  const [isbn, setIsbn] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const clean = isbn.replace(/[-\s]/g, '');
    if (clean.length === 10 || clean.length === 13) {
      onSearch(clean);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="form-label">NÚMERO IDENTIFICADOR</label>
        <div className="form-input-icon-wrapper">
          <input
            type="text"
            className="form-input"
            placeholder="ex: 978-3-16-148410-0"
            value={isbn}
            onChange={(e) => setIsbn(e.target.value)}
            id="isbn-input"
          />
          <Search className="form-input-icon clickable" size={18} onClick={handleSubmit} />
        </div>
      </div>
      <button
        type="submit"
        className="btn btn-primary btn-full"
        disabled={loading}
        style={{ marginTop: '1rem' }}
        id="btn-search-isbn"
      >
        {loading ? <span className="spinner" /> : 'Buscar Metadados do Livro'}
      </button>
    </form>
  );
}
