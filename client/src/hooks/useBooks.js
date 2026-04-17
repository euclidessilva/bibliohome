import { useState, useCallback, useEffect } from 'react';
import { fetchMyBooks, fetchBookStats, saveBook, updateBook, deleteBook } from '../lib/api';

export function useBooks() {
  const [books, setBooks] = useState([]);
  const [stats, setStats] = useState({ total: 0, lendo: 0, desejo: 0, concluido: 0, na_colecao: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadBooks = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMyBooks(filters);
      setBooks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadStats = useCallback(async () => {
    try {
      const s = await fetchBookStats();
      setStats(s);
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  }, []);

  const addBook = useCallback(async (bookData) => {
    const saved = await saveBook(bookData);
    setBooks(prev => [saved, ...prev]);
    await loadStats();
    return saved;
  }, [loadStats]);

  const editBook = useCallback(async (id, updates) => {
    const updated = await updateBook(id, updates);
    setBooks(prev => prev.map(b => b.id === id ? updated : b));
    await loadStats();
    return updated;
  }, [loadStats]);

  const removeBook = useCallback(async (id) => {
    await deleteBook(id);
    setBooks(prev => prev.filter(b => b.id !== id));
    await loadStats();
  }, [loadStats]);

  useEffect(() => {
    loadBooks();
    loadStats();
  }, [loadBooks, loadStats]);

  return { books, stats, loading, error, loadBooks, loadStats, addBook, editBook, removeBook };
}
