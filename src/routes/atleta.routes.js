import { Router } from 'express';
import atletaController from '../controllers/atleta.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import roleMiddleware from '../middlewares/role.middleware.js';
import upload from '../config/upload.js';

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

/**
 * @swagger
 * /atleta/me:
 *   put:
 *     summary: Atualizar perfil do Atleta logado
 *     tags: [Atleta]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               apelido:
 *                 type: string
 *               telefone:
 *                 type: string
 *               localizacao:
 *                 type: string
 *     responses:
 *       200:
 *         description: Perfil atualizado com sucesso
 *       400:
 *         description: Erro na atualização
 */
router.put('/me', authMiddleware, roleMiddleware(['ATLETA']), upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'banner', maxCount: 1 }]), atletaController.updateMe);

/**
 * @swagger
 * /atleta/cpf/{cpf}:
 *   get:
 *     summary: Obter atleta por CPF (para Arena usar na Reserva Manual)
 *     tags: [Atleta]
 *     security:
 *       - BearerAuth: []
 */
router.get('/cpf/:cpf', authMiddleware, roleMiddleware(['ARENA']), atletaController.getByCpf);

export default router;
