import express from 'express';
import * as gameSessionController from '../controllers/gameSession.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router({ mergeParams: true }); // herda :groupId do pai

// Listar e criar sessões do grupo
router.get('/', gameSessionController.getGroupSessions);
router.post('/', authMiddleware, gameSessionController.createGameSession);

// Detalhe, editar, cancelar, finalizar
router.get('/:sessionId', gameSessionController.getSessionById);
router.put('/:sessionId', authMiddleware, gameSessionController.updateSession);
router.post('/:sessionId/cancel', authMiddleware, gameSessionController.cancelSession);
router.post('/:sessionId/finish', authMiddleware, gameSessionController.finishSession);

// Jogadores
router.post('/:sessionId/join', authMiddleware, gameSessionController.joinSession);
router.delete('/:sessionId/leave', authMiddleware, gameSessionController.leaveSession);
router.post('/:sessionId/confirm', authMiddleware, gameSessionController.confirmPresence);
router.post('/:sessionId/players/:playerId/promote', authMiddleware, gameSessionController.promoteReserve);

export default router;
