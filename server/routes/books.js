const express = require('express');
const axios = require('axios');
const { authMiddleware, supabase } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/books/isbn/:isbn
 * Proxy for Google Books API — keeps API key server-side
 */
router.get('/isbn/:isbn', async (req, res) => {
  const { isbn } = req.params;
  const cleanISBN = isbn.replace(/[-\s]/g, '');

  if (!/^\d{10}(\d{3})?$/.test(cleanISBN)) {
    return res.status(400).json({ error: 'ISBN inválido. Use ISBN-10 ou ISBN-13.' });
  }

  try {
    const apiKey = process.env.GOOGLE_BOOKS_API_KEY;
    let url = `https://www.googleapis.com/books/v1/volumes?q=isbn:${cleanISBN}`;
    if (apiKey) url += `&key=${apiKey}`;

    const response = await axios.get(url, { timeout: 10000 });

    if (!response.data.totalItems || response.data.totalItems === 0) {
      return res.status(404).json({ error: 'Livro não encontrado para este ISBN' });
    }

    const item = response.data.items[0];
    const info = item.volumeInfo;

    // Upgrade thumbnail to higher quality
    let capaUrl = info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail || '';
    if (capaUrl) {
      capaUrl = capaUrl.replace('zoom=1', 'zoom=2').replace('&edge=curl', '');
      capaUrl = capaUrl.replace('http://', 'https://');
    }

    // Fallback: Open Library covers when Google Books has no image
    if (!capaUrl && cleanISBN) {
      try {
        const olUrl = `https://covers.openlibrary.org/b/isbn/${cleanISBN}-L.jpg?default=false`;
        const check = await axios.head(olUrl, { timeout: 4000 });
        if (check.status === 200) {
          capaUrl = `https://covers.openlibrary.org/b/isbn/${cleanISBN}-L.jpg`;
        }
      } catch (_) {
        // Open Library also has no cover — leave capaUrl empty
      }
    }

    const book = {
      isbn: cleanISBN,
      titulo: info.title || 'Sem título',
      autor: info.authors ? info.authors.join(', ') : 'Autor desconhecido',
      editora: info.publisher || '',
      ano_publicacao: info.publishedDate ? info.publishedDate.substring(0, 4) : '',
      descricao: info.description || '',
      paginas: info.pageCount || 0,
      capa_url: capaUrl,
      categorias: info.categories || [],
    };

    res.json(book);
  } catch (err) {
    console.error('Google Books API error:', err.message);
    if (err.code === 'ECONNABORTED') {
      return res.status(504).json({ error: 'Timeout ao consultar Google Books API' });
    }
    res.status(500).json({ error: 'Erro ao buscar metadados do livro' });
  }
});

/**
 * POST /api/books
 * Save a book to Supabase
 */
router.post('/', authMiddleware, async (req, res) => {
  const { isbn, titulo, autor, editora, ano_publicacao, descricao, paginas, capa_url, categorias, status } = req.body;

  if (!titulo || titulo.trim() === '') {
    return res.status(400).json({ error: 'O título do livro é obrigatório' });
  }

  const bookData = {
    user_id: req.user.id,
    isbn: isbn || null,
    titulo: titulo.trim(),
    autor: autor || null,
    editora: editora || null,
    ano_publicacao: ano_publicacao || null,
    descricao: descricao || null,
    paginas: paginas ? parseInt(paginas) : null,
    capa_url: capa_url || null,
    categorias: Array.isArray(categorias) ? categorias : [],
    status: status || 'na_colecao',
    progresso: 0,
  };

  try {
    const { data, error } = await supabase
      .from('livros')
      .insert(bookData)
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return res.status(500).json({ error: 'Erro ao salvar livro no banco de dados' });
    }

    res.status(201).json(data);
  } catch (err) {
    console.error('Save book error:', err);
    res.status(500).json({ error: 'Erro interno ao salvar livro' });
  }
});

/**
 * PATCH /api/books/:id
 * Update a book
 */
router.patch('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  try {
    const { data, error } = await supabase
      .from('livros')
      .update(updates)
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) {
      console.error('Update book error:', error);
      return res.status(500).json({ error: 'Erro ao atualizar livro' });
    }

    if (!data) {
      return res.status(404).json({ error: 'Livro não encontrado' });
    }

    res.json(data);
  } catch (err) {
    console.error('Update book error:', err);
    res.status(500).json({ error: 'Erro interno ao atualizar livro' });
  }
});

/**
 * DELETE /api/books/:id
 * Delete a book (ownership validated)
 */
router.delete('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    const { data, error } = await supabase
      .from('livros')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) {
      console.error('Delete book error:', error);
      return res.status(500).json({ error: 'Erro ao deletar livro' });
    }

    if (!data) {
      return res.status(404).json({ error: 'Livro não encontrado ou acesso negado' });
    }

    res.json({ message: 'Livro removido com sucesso', id });
  } catch (err) {
    console.error('Delete book error:', err);
    res.status(500).json({ error: 'Erro interno ao deletar livro' });
  }
});

module.exports = router;
