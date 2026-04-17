import { BookOpen, Trash2, Edit3 } from 'lucide-react';
import Badge from './Badge';

export default function BookCard({ book, onDelete, onEdit, showActions = true }) {
  const defaultCover = null;

  return (
    <div className="book-card" id={`book-card-${book.id}`}>
      <div className="book-card-cover">
        {book.capa_url ? (
          <img src={book.capa_url} alt={book.titulo} loading="lazy" />
        ) : (
          <div className="book-card-cover-placeholder">
            <BookOpen size={32} />
          </div>
        )}
        {showActions && (
          <div className="book-card-actions">
            {onEdit && (
              <button
                className="book-card-action-btn edit"
                onClick={(e) => { e.stopPropagation(); onEdit(book); }}
                title="Editar"
              >
                <Edit3 size={14} />
              </button>
            )}
            {onDelete && (
              <button
                className="book-card-action-btn"
                onClick={(e) => { e.stopPropagation(); onDelete(book); }}
                title="Remover"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        )}
      </div>
      <div className="book-card-title">{book.titulo}</div>
      {book.autor && <div className="book-card-author">{book.autor}</div>}
      {book.categorias && book.categorias.length > 0 && (
        <Badge type="category">{book.categorias[0]}</Badge>
      )}
    </div>
  );
}
