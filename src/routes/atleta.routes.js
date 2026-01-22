import { Router } from 'express';
import atletaController from '../controllers/atleta.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import roleMiddleware from '../middlewares/role.middleware.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Atleta
 *   description: Rotas exclusivas para Atletas
 */

/**
 * @swagger
 * /atleta/me:
 *   get:
 *     summary: Obter perfil do Atleta logado
 *     tags: [Atleta]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil do Atleta
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso proibido (role incorreta)
 */
router.get('/me', authMiddleware, roleMiddleware(['ATLETA']), atletaController.getMe);

export default router;
