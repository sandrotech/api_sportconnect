import { Router } from 'express';
import profissionalController from '../controllers/profissional.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import roleMiddleware from '../middlewares/role.middleware.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Profissional
 *   description: Rotas exclusivas para Profissionais
 */

/**
 * @swagger
 * /profissional/me:
 *   get:
 *     summary: Obter perfil do Profissional logado
 *     tags: [Profissional]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil do Profissional
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso proibido (role incorreta)
 */
router.get('/me', authMiddleware, roleMiddleware(['PROFISSIONAL']), profissionalController.getMe);

export default router;
