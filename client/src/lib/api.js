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

// ─── Users API ───────────────────────────────────────────
export async function fetchUsers() {
  const res = await api.get('/api/users');
  return res.data;
}

export async function inviteUser(email) {
  const res = await api.post('/api/users/invite', { email });
  return res.data;
}

export async function changeUserRole(userId, role) {
  const res = await api.patch(`/api/users/${userId}/role`, { role });
  return res.data;
}

export async function removeUser(userId) {
  const res = await api.delete(`/api/users/${userId}`);
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
