import axios from 'axios';
import { supabase } from './supabase';

const API_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach auth token to every request
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

// ─── Auth ────────────────────────────────────────────────
export async function getMe() {
  const res = await api.get('/api/auth/me');
  return res.data;
}

// ─── Books API ───────────────────────────────────────────
export async function fetchBookByISBN(isbn) {
  const res = await api.get(`/api/books/isbn/${isbn}`);
  return res.data;
}

export async function saveBook(bookData) {
  const res = await api.post('/api/books', bookData);
  return res.data;
}

export async function updateBook(id, updates) {
  const res = await api.patch(`/api/books/${id}`, updates);
  return res.data;
}

export async function deleteBook(id) {
  const res = await api.delete(`/api/books/${id}`);
  return res.data;
}

// ─── Admin API ───────────────────────────────────────────
export async function adminListUsers() {
  const res = await api.get('/api/admin/users');
  return res.data;
}

export async function adminUpdatePassword(id, password) {
  const res = await api.patch(`/api/admin/users/${id}/password`, { password });
  return res.data;
}

export async function adminDeleteUser(id) {
  const res = await api.delete(`/api/admin/users/${id}`);
  return res.data;
}

// ─── Books from Supabase (direct) ────────────────────────
export async function fetchMyBooks(filters = {}) {
  let query = supabase
    .from('livros')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters.status && filters.status !== 'todos') {
    query = query.eq('status', filters.status);
  }
  if (filters.search) {
    query = query.or(`titulo.ilike.%${filters.search}%,autor.ilike.%${filters.search}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function fetchBookStats() {
  const { data, error } = await supabase
    .from('livros')
    .select('status');

  if (error) throw error;

  const stats = {
    total: data?.length || 0,
    lendo: data?.filter(b => b.status === 'lendo').length || 0,
    desejo: data?.filter(b => b.status === 'desejo').length || 0,
    concluido: data?.filter(b => b.status === 'concluido').length || 0,
    na_colecao: data?.filter(b => b.status === 'na_colecao').length || 0,
  };
  return stats;
}

export default api;
