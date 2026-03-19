import { type Request, type Response } from 'express';
import {
  createGame,
  getGameById,
  getGames,
  getPlayersByGameId,
  getPropertiesByGameId,
  resolveTurn,
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
