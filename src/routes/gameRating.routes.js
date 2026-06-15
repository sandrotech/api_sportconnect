import express from 'express';
import * as gameRatingController from '../controllers/gameRating.controller.js';
import authMiddleware from '../middlewares/auth.middleware.js';

const router = express.Router({ mergeParams: true });

router.get('/', gameRatingController.getSessionRatings);
router.post('/', authMiddleware, gameRatingController.submitRatings);
router.get('/status', authMiddleware, gameRatingController.getRatingStatus);

export default router;
