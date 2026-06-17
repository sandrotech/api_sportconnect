import { Router } from 'express';
import horarioController from '../controllers/horario.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import roleMiddleware from '../middlewares/role.middleware.js';

const router = Router();

// Público — atletas veem horários disponíveis de uma arena
router.get('/publico/:arenaId', horarioController.getPublico);

// Público — pega horários por quadra (UI usa ao carregar disponibilidade)
router.get('/quadra/:quadraId', authMiddleware, horarioController.getByQuadra);

// Privado — arena gerencia horários
router.use(authMiddleware, roleMiddleware(['ARENA']));
router.post('/', horarioController.upsertSlot);
router.put('/lote', horarioController.saveLote);
router.delete('/:id', horarioController.deleteSlot);

export default router;
