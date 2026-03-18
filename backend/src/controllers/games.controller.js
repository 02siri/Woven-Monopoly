import { type Request, type Response } from 'express';
import createGame from '../services/games.service';

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
