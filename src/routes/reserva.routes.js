import { Router } from 'express';
import reservaController from '../controllers/reserva.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import roleMiddleware from '../middlewares/role.middleware.js';

const router = Router();

router.use(authMiddleware);

// Atleta
router.post('/', roleMiddleware(['ATLETA']), reservaController.criar);
router.get('/minhas', roleMiddleware(['ATLETA']), reservaController.minhas);

// Arena
router.get('/arena', roleMiddleware(['ARENA']), reservaController.daArena);
router.patch('/:id/status', roleMiddleware(['ARENA']), reservaController.atualizarStatus);

export default router;
