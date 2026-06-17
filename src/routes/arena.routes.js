import { Router } from 'express';
import arenaController from '../controllers/arena.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import roleMiddleware from '../middlewares/role.middleware.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Arena
 *   description: Rotas exclusivas para Arena
 */

/**
 * @swagger
 * /arena/me:
 *   get:
 *     summary: Obter perfil da Arena logada
 *     tags: [Arena]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil da Arena
 *       401:
 *         description: Não autorizado
 *       403:
 *         description: Acesso proibido (role incorreta)
 */
router.get('/', arenaController.getAll); // Listar arenas aprovadas (público)
router.get('/me', authMiddleware, roleMiddleware(['ARENA']), arenaController.getMe);
router.get('/dashboard', authMiddleware, roleMiddleware(['ARENA']), arenaController.getDashboard);
router.put('/config', authMiddleware, roleMiddleware(['ARENA']), arenaController.updateConfig);

export default router;
