import { Router } from 'express';
import {
  abandonGameHandler,
  confirmActionHandler,
  createGameHandler,
  deleteGameHandler,
  exitGameHandler,
  getGameByIdHandler,
  getGamesHandler,
  getPlayersByGameIdHandler,
  getPropertiesByGameIdHandler,
  restartGameHandler,
  resolveTurnHandler,
  resumeGameHandler,
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

router.post('/games/:gameId/exit', exitGameHandler);
router.post('/games/:gameId/abandon', abandonGameHandler);
router.post('/games/:gameId/resume', resumeGameHandler);
router.post('/games/:gameId/restart', restartGameHandler);

router.post('/games/:gameId/turns/resolve', resolveTurnHandler);
router.post('/games/:gameId/actions/confirm', confirmActionHandler);

router.post('/games/:gameId/simulate', simulateGameHandler);

router.delete('/games/delete/:gameId', deleteGameHandler);

export default router;
