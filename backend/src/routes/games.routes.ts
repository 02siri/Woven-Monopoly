import { Router } from 'express';
import { createGameHandler } from '../controllers/games.controller';

const router = Router();

router.post('/games', createGameHandler);

export default router;
