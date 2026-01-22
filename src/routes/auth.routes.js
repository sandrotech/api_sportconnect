import { Router } from 'express';
import authController from '../controllers/auth.controller.js';

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

export default router;
