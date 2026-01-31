import express from 'express';
import * as groupController from '../controllers/group.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router();

// Rotas abertas
router.get('/', groupController.getAllGroups);
router.get('/:id', groupController.getGroupById);

// Rotas protegidas
router.post('/', authMiddleware, groupController.createGroup);
router.put('/:id', authMiddleware, groupController.updateGroup);
router.delete('/:id', authMiddleware, groupController.deleteGroup);

// Gerenciamento de membros
router.post('/:id/join', authMiddleware, groupController.joinGroupRequest);
router.post('/:id/members/:memberId/approve', authMiddleware, groupController.approveJoinRequest);
router.delete('/:id/leave', authMiddleware, groupController.leaveGroup);
router.delete('/:id/members/:memberId', authMiddleware, groupController.removeMember);

export default router;
