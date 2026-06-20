import express from 'express';
import * as groupController from '../controllers/group.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';
import upload from '../config/upload.js';

const router = express.Router();

// ─── Rotas públicas ───────────────────────────────────────────────────────────
router.get('/', groupController.getAllGroups);
router.get('/:id', groupController.getGroupById);
router.get('/:id/members', groupController.getMembers);

// ─── Rotas protegidas ─────────────────────────────────────────────────────────
router.get('/mine/list', authMiddleware, groupController.getMyGroups);

// CRUD
router.post('/', authMiddleware, groupController.createGroup);
router.put('/:id', authMiddleware, groupController.updateGroup);
router.put('/:id/photo', authMiddleware, upload.single('photo'), groupController.updateGroupPhoto);
router.delete('/:id', authMiddleware, groupController.deleteGroup);

// Membros — solicitações
router.post('/:id/join', authMiddleware, groupController.joinGroupRequest);
router.delete('/:id/leave', authMiddleware, groupController.leaveGroup);
router.get('/:id/members/pending', authMiddleware, groupController.getPendingRequests);
router.post('/:id/members/:memberId/approve', authMiddleware, groupController.approveJoinRequest);
router.post('/:id/members/:memberId/reject', authMiddleware, groupController.rejectJoinRequest);
router.post('/:id/members/:memberId/promote', authMiddleware, groupController.promoteMember);
router.delete('/:id/members/:memberId', authMiddleware, groupController.removeMember);
router.post('/:id/members/:memberId/ban', authMiddleware, groupController.banMember);

// Convites por link
router.post('/:id/invite', authMiddleware, groupController.generateInviteLink);
router.post('/join-invite/:token', authMiddleware, groupController.joinByInvite);

export default router;
