const express = require('express');
const router = express.Router();
const { authMiddleware, requireAdmin, supabase } = require('../middleware/auth');

router.use(authMiddleware, requireAdmin);

/**
 * GET /api/admin/users
 * Lista todos os usuários cadastrados no Supabase Auth.
 */
router.get('/users', async (_req, res) => {
  try {
    const { data, error } = await supabase.auth.admin.listUsers({ perPage: 200 });
    if (error) throw error;

    const users = (data.users || []).map((u) => ({
      id: u.id,
      email: u.email,
      nome: u.user_metadata?.nome || u.user_metadata?.full_name || null,
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at,
      email_confirmed_at: u.email_confirmed_at,
    }));
    res.json(users);
  } catch (err) {
    console.error('List users error:', err);
    res.status(500).json({ error: err.message || 'Erro ao listar usuários' });
  }
});

/**
 * PATCH /api/admin/users/:id/password
 * Atualiza a senha de um usuário (admin).
 */
router.patch('/users/:id/password', async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;
  if (!password || password.length < 6) {
    return res.status(400).json({ error: 'A senha deve ter ao menos 6 caracteres.' });
  }
  try {
    const { error } = await supabase.auth.admin.updateUserById(id, { password });
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    console.error('Update password error:', err);
    res.status(500).json({ error: err.message || 'Erro ao atualizar senha' });
  }
});

/**
 * DELETE /api/admin/users/:id
 * Remove um usuário (cascata remove perfil e livros via FK).
 */
router.delete('/users/:id', async (req, res) => {
  const { id } = req.params;
  if (id === req.user.id) {
    return res.status(400).json({ error: 'Não é possível excluir sua própria conta.' });
  }
  try {
    const { error } = await supabase.auth.admin.deleteUser(id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ error: err.message || 'Erro ao excluir usuário' });
  }
});

module.exports = router;
