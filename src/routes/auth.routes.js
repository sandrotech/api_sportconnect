import { Router } from 'express';
import authController from '../controllers/auth.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Autenticação e Registro de Usuários
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login de usuário
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login bem sucedido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *       401:
 *         description: Credenciais inválidas
 */
router.post('/login', authController.login);

/**
 * @swagger
 * /auth/register/arena:
 *   post:
 *     summary: Registro de Arena
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - nomeArena
 *               - cnpj
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               nomeArena:
 *                 type: string
 *               cnpj:
 *                 type: string
 *     responses:
 *       201:
 *         description: Arena registrada com sucesso
 *       400:
 *         description: Erro na requisição
 */
router.post('/register/arena', authController.registerArena);

/**
 * @swagger
 * /auth/register/atleta:
 *   post:
 *     summary: Registro de Atleta
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - apelido
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               apelido:
 *                 type: string
 *     responses:
 *       201:
 *         description: Atleta registrado com sucesso
 *       400:
 *         description: Erro na requisição
 */
router.post('/register/atleta', authController.registerAtleta);

/**
 * @swagger
 * /auth/register/profissional:
 *   post:
 *     summary: Registro de Profissional
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - especialidade
 *               - valorHora
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               especialidade:
 *                 type: string
 *               valorHora:
 *                 type: number
 *     responses:
 *       201:
 *         description: Profissional registrado com sucesso
 *       400:
 *         description: Erro na requisição
 */
router.post('/register/profissional', authController.registerProfissional);

/**
 * @swagger
 * /auth/change-password:
 *   put:
 *     summary: Alterar senha do usuário
 *     tags: [Auth]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Senha alterada com sucesso
 *       400:
 *         description: Erro na requisição
 *       401:
 *         description: Não autorizado
 */
router.put('/change-password', authMiddleware, authController.changePassword);

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Solicitar recuperação de senha
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: E-mail de recuperação enviado
 *       400:
 *         description: Usuário não encontrado
 */
router.post('/forgot-password', authController.forgotPassword);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Redefinir senha com token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - password
 *             properties:
 *               token:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Senha redefinida com sucesso
 *       400:
 *         description: Token inválido ou expirado
 */
router.post('/reset-password', authController.resetPassword);

/**
 * @swagger
 * /auth/verify-identity:
 *   post:
 *     summary: Verificar identidade com CPF e data de nascimento
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cpf
 *               - dataNascimento
 *               - email
 *             properties:
 *               cpf:
 *                 type: string
 *               dataNascimento:
 *                 type: string
 *                 format: date
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Identidade verificada com sucesso
 *       400:
 *         description: Dados não correspondem
 */
router.post('/verify-identity', authController.verifyIdentity);

/**
 * @swagger
 * /auth/reset-password-verification:
 *   post:
 *     summary: Redefinir senha após verificação
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - newPassword
 *             properties:
 *               userId:
 *                 type: integer
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Senha redefinida com sucesso
 *       400:
 *         description: Erro na requisição
 */
router.post('/reset-password-verification', authController.resetPasswordWithVerification);

export default router;
