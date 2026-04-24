const express = require('express');
const router = express.Router();
const { authMiddleware, isAdminEmail } = require('../middleware/auth');

/**
 * GET /api/auth/me
 * Retorna dados do usuário autenticado + flag isAdmin.
 */
router.get('/me', authMiddleware, (req, res) => {
  res.json({
    id: req.user.id,
    email: req.user.email,
    nome: req.user.user_metadata?.nome || req.user.user_metadata?.full_name || null,
    isAdmin: isAdminEmail(req.user.email),
  });
});

module.exports = router;
