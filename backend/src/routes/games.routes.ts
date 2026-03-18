import { Router } from 'express';
import {
  createGameHandler,
  getGameByIdHandler,
  getGamesHandler,
  getPlayersByGameIdHandler,
  getPropertiesByGameIdHandler,
  simulateGameHandler,
  getTurnsByGameIdHandler,
} from '../controllers/games.controller';

const router = Router();

router.get('/games', getGamesHandler);
router.get('/games/:gameId', getGameByIdHandler);
router.get('/games/:gameId/players', getPlayersByGameIdHandler);
router.get('/games/:gameId/properties', getPropertiesByGameIdHandler);
router.get('/games/:gameId/turns', getTurnsByGameIdHandler);
router.post('/games/:gameId/simulate', simulateGameHandler)
router.post('/games', createGameHandler);

export default router;
