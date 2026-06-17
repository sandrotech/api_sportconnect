import { Router } from 'express';
import quadraController from '../controllers/quadra.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import roleMiddleware from '../middlewares/role.middleware.js';

const router = Router();

// Público — atletas consultam quadras de uma arena
router.get('/arena/:arenaId', quadraController.getByArenaId);

// Privado — arena gerencia suas próprias quadras
router.use(authMiddleware, roleMiddleware(['ARENA']));
router.get('/minhas', quadraController.getMinhas);
router.post('/', quadraController.create);
router.put('/:id', quadraController.update);
router.delete('/:id', quadraController.remove);

export default router;
