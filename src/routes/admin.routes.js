import { Router } from 'express';
import adminController from '../controllers/admin.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import adminMiddleware from '../middlewares/admin.middleware.js';

const router = Router();

// Aplica autenticação + verificação de admin em todas as rotas
router.use(authMiddleware, adminMiddleware);

// ─── Dashboard ─────────────────────────────────────────────────────────────────
router.get('/dashboard', adminController.getDashboard);

// ─── Atletas ───────────────────────────────────────────────────────────────────
router.get('/atletas', adminController.getAtletas);
router.get('/atletas/:id', adminController.getAtleta);
router.put('/atletas/:id', adminController.updateAtleta);
router.delete('/atletas/:id', adminController.deleteAtleta);

// ─── Arenas ────────────────────────────────────────────────────────────────────
router.get('/arenas', adminController.getArenas);
router.get('/arenas/:id', adminController.getArena);
router.put('/arenas/:id', adminController.updateArena);
router.patch('/arenas/:id/aprovar', adminController.aprovarArena);
router.patch('/arenas/:id/rejeitar', adminController.rejeitarArena);
router.delete('/arenas/:id', adminController.deleteArena);

// ─── Profissionais ─────────────────────────────────────────────────────────────
router.get('/profissionais', adminController.getProfissionais);
router.get('/profissionais/:id', adminController.getProfissional);
router.put('/profissionais/:id', adminController.updateProfissional);
router.delete('/profissionais/:id', adminController.deleteProfissional);

export default router;
