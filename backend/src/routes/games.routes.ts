import { Router } from 'express';
import {
  confirmActionHandler,
  createGameHandler,
  deleteGameHandler,
  getGameByIdHandler,
  getGamesHandler,
  getPlayersByGameIdHandler,
  getPropertiesByGameIdHandler,
  resolveTurnHandler,
  simulateGameHandler,
  getTurnsByGameIdHandler,
} from '../controllers/games.controller';

const router = Router();

router.get('/games', getGamesHandler);
router.get('/games/:gameId', getGameByIdHandler);
router.get('/games/:gameId/players', getPlayersByGameIdHandler);
router.get('/games/:gameId/properties', getPropertiesByGameIdHandler);
router.get('/games/:gameId/turns', getTurnsByGameIdHandler);
router.post('/games', createGameHandler);
router.post('/games/:gameId/turns/resolve', resolveTurnHandler);
router.post('/games/:gameId/actions/confirm', confirmActionHandler);
router.post('/games/:gameId/simulate', simulateGameHandler);
router.delete('/games/delete/:gameId', deleteGameHandler);

export default router;
