const express = require('express');
const { authMiddleware, adminOnly, supabase } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/users
 * List all users (admin only)
 */
router.get('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('List users error:', error);
      return res.status(500).json({ error: 'Erro ao listar usuários' });
    }

    // Fetch emails from auth.users using admin API
    const { data: { users: authUsers }, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
      console.error('List auth users error:', authError);
      // Return profiles without email if auth query fails
      return res.json(profiles);
    }

    // Merge email data into profiles
    const merged = profiles.map(profile => {
      const authUser = authUsers.find(u => u.id === profile.id);
      return {
        ...profile,
        email: authUser?.email || 'N/A',
      };
    });

    res.json(merged);
  } catch (err) {
    console.error('List users error:', err);
    res.status(500).json({ error: 'Erro interno ao listar usuários' });
  }
});

/**
 * POST /api/users/invite
 * Invite a new user (admin only)
 */
router.post('/invite', authMiddleware, adminOnly, async (req, res) => {
  const { email } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Email válido é obrigatório' });
  }

  try {
    const { data, error } = await supabase.auth.admin.inviteUserByEmail(email);

    if (error) {
      console.error('Invite user error:', error);
      return res.status(400).json({ error: error.message || 'Erro ao convidar usuário' });
    }

    res.json({ message: `Convite enviado para ${email}`, data });
  } catch (err) {
    console.error('Invite user error:', err);
    res.status(500).json({ error: 'Erro interno ao convidar usuário' });
  }
});

/**
 * PATCH /api/users/:id/role
 * Change user role (admin only)
 */
router.patch('/:id/role', authMiddleware, adminOnly, async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!role || !['admin', 'member'].includes(role)) {
    return res.status(400).json({ error: 'Role deve ser "admin" ou "member"' });
  }

  // Prevent admin from removing their own admin role
  if (id === req.user.id && role !== 'admin') {
    return res.status(400).json({ error: 'Você não pode remover seu próprio acesso de administrador' });
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Update role error:', error);
      return res.status(500).json({ error: 'Erro ao atualizar role do usuário' });
    }

    if (!data) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json(data);
  } catch (err) {
    console.error('Update role error:', err);
    res.status(500).json({ error: 'Erro interno ao atualizar role' });
  }
});

/**
 * DELETE /api/users/:id
 * Remove user (admin only)
 */
router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  const { id } = req.params;

  if (id === req.user.id) {
    return res.status(400).json({ error: 'Você não pode remover a si mesmo' });
  }

  try {
    const { error } = await supabase.auth.admin.deleteUser(id);

    if (error) {
      console.error('Delete user error:', error);
      return res.status(500).json({ error: 'Erro ao remover usuário' });
    }

    res.json({ message: 'Usuário removido com sucesso', id });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ error: 'Erro interno ao remover usuário' });
  }
});

module.exports = router;
