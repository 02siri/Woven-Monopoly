import { type Request, type Response } from 'express';
import {
  createGame,
  getGameById,
  getGames,
  getPlayersByGameId,
  getPropertiesByGameId,
  getTurnsByGameId,
} from '../services/games.service';

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
      error instanceof Error ? error.message : 'Could not create Game';

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
      message: "Game Data imported successfully",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Could not import Game data';

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
        message: 'GameId not found',
      });
      return;
    }

    res.status(200).json({
      data,
      message: "Got Game Id successfully",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'GameId not found';

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
      message: "Players Data Loaded Successfully"
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Could not find Players Data';

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
      message: "Properties Data Loaded Successfully"
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Could not find Properties data';

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
      message: "Turns loaded in the Game"
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Could not load turn sequence';

    res.status(500).json({
      message,
    });
  }
};
