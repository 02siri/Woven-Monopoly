import { type Request, type Response } from 'express';
import {
  abandonGame,
  confirmAction,
  createGame,
  deleteGame,
  exitGame,
  getGameById,
  getGames,
  getPlayersByGameId,
  getPropertiesByGameId,
  restartGame,
  resolveTurn,
  resumeGame,
  simulateGame,
  getTurnsByGameId,
} from '../services/games';

const getGameIdParam = (gameId: string | string[] | undefined) => {
  if (!gameId || Array.isArray(gameId)) {
    throw new Error('A valid gameId must be provided');
  }

  return gameId;
};

export const createGameHandler = async (_req: Request, res: Response) => {
  try {
    const data = await createGame();

    res.status(201).json({
      message: 'Game created successfully',
      data,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'An unexpected error occurred';

    res.status(500).json({
      message,
    });
  }
};

export const getGamesHandler = async (_req: Request, res: Response) => {
  try {
    const data = await getGames();

    res.status(200).json({
      data,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'An unexpected error occurred';

    res.status(500).json({
      message,
    });
  }
};

export const getGameByIdHandler = async (req: Request, res: Response) => {
  try {
    const gameId = getGameIdParam(req.params.gameId);
    const data = await getGameById(gameId);

    if (!data) {
      res.status(404).json({
        message: 'Game not found',
      });
      return;
    }

    res.status(200).json({
      data,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'An unexpected error occurred';

    res.status(500).json({
      message,
    });
  }
};

export const deleteGameHandler = async (req: Request, res: Response) => {
  try {
    const gameId = getGameIdParam(req.params.gameId);
    const data = await deleteGame(gameId);

    res.status(200).json({
      message: 'Game deleted successfully',
      data,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'An unexpected error occurred';

    if (message === 'Game not found') {
      res.status(404).json({
        message,
      });
      return;
    }

    res.status(500).json({
      message,
    });
  }
};

export const exitGameHandler = async (req: Request, res: Response) => {
  try {
    const gameId = getGameIdParam(req.params.gameId);
    const data = await exitGame(gameId);

    res.status(200).json({
      message: 'Game exited successfully',
      data,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'An unexpected error occurred';

    if (message === 'Game not found') {
      res.status(404).json({
        message,
      });
      return;
    }

    res.status(400).json({
      message,
    });
  }
};

export const abandonGameHandler = async (req: Request, res: Response) => {
  try {
    const gameId = getGameIdParam(req.params.gameId);
    const data = await abandonGame(gameId);

    res.status(200).json({
      message: 'Game abandoned successfully',
      data,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'An unexpected error occurred';

    if (message === 'Game not found') {
      res.status(404).json({
        message,
      });
      return;
    }

    res.status(400).json({
      message,
    });
  }
};

export const resumeGameHandler = async (req: Request, res: Response) => {
  try {
    const gameId = getGameIdParam(req.params.gameId);
    const data = await resumeGame(gameId);

    res.status(200).json({
      message: 'Game resumed successfully',
      data,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'An unexpected error occurred';

    if (message === 'Game not found') {
      res.status(404).json({
        message,
      });
      return;
    }

    res.status(400).json({
      message,
    });
  }
};

export const restartGameHandler = async (req: Request, res: Response) => {
  try {
    const gameId = getGameIdParam(req.params.gameId);
    const data = await restartGame(gameId);

    res.status(200).json({
      message: 'Game restarted successfully',
      data,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'An unexpected error occurred';

    if (message === 'Game not found') {
      res.status(404).json({
        message,
      });
      return;
    }

    res.status(400).json({
      message,
    });
  }
};

export const getPlayersByGameIdHandler = async (req: Request, res: Response) => {
  try {
    const gameId = getGameIdParam(req.params.gameId);
    const data = await getPlayersByGameId(gameId);

    res.status(200).json({
      data,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'An unexpected error occurred';

    res.status(500).json({
      message,
    });
  }
};

export const getPropertiesByGameIdHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const gameId = getGameIdParam(req.params.gameId);
    const data = await getPropertiesByGameId(gameId);

    res.status(200).json({
      data,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'An unexpected error occurred';

    res.status(500).json({
      message,
    });
  }
};

export const getTurnsByGameIdHandler = async (req: Request, res: Response) => {
  try {
    const gameId = getGameIdParam(req.params.gameId);
    const data = await getTurnsByGameId(gameId);

    res.status(200).json({
      data,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'An unexpected error occurred';

    res.status(500).json({
      message,
    });
  }
};

export const simulateGameHandler = async (req: Request, res: Response) => {
  try {
    const gameId = getGameIdParam(req.params.gameId);
    const data = await simulateGame(gameId);

    res.status(200).json({
      message: 'Game simulated successfully',
      data,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'An unexpected error occurred';

    res.status(500).json({
      message,
    });
  }
};

export const resolveTurnHandler = async (req: Request, res: Response) => {
  try {
    const gameId = getGameIdParam(req.params.gameId);
    const data = await resolveTurn(gameId);

    res.status(200).json({
      message: 'Turn resolved successfully',
      data,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'An unexpected error occurred';

    res.status(500).json({
      message,
    });
  }
};

export const confirmActionHandler = async (req: Request, res: Response) => {
  try {
    const gameId = getGameIdParam(req.params.gameId);
    const data = await confirmAction(gameId);

    res.status(200).json({
      message: 'Action confirmed successfully',
      data,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'An unexpected error occurred';

    res.status(500).json({
      message,
    });
  }
};
