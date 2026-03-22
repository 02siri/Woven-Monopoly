import GamesModel from '../../models/games.model';
import TurnsModel from '../../models/turns.model';
import {
  getGameById,
  getPlayersByGameId,
  getPropertiesByGameId,
  getTurnsByGameId,
} from './read-games.service';

const INITIAL_PLAYER_BALANCE = 16;
const INITIAL_PLAYER_POSITION = 0;

const getGameOrThrow = async (gameId: string) => {
  const game = await getGameById(gameId);

  if (!game) {
    throw new Error('Game not found');
  }

  return game;
};

export const exitGame = async (gameId: string) => {
  const game = await getGameOrThrow(gameId);

  if (game.status !== 'IN_PROGRESS') {
    throw new Error('Only in-progress games can be exited');
  }

  game.status = 'EXITED';
  await game.save();

  return game;
};

export const abandonGame = async (gameId: string) => {
  const game = await getGameOrThrow(gameId);

  if (game.status === 'COMPLETED' || game.status === 'BANKRUPT_END') {
    throw new Error('Completed games cannot be abandoned');
  }

  game.status = 'ABANDONED';
  game.completedAt = new Date();
  game.pendingActionType = null;
  game.pendingActionData = null;
  game.pendingTurnData = null;
  await game.save();

  return game;
};

export const resumeGame = async (gameId: string) => {
  const game = await getGameOrThrow(gameId);

  if (game.status !== 'EXITED') {
    throw new Error('Only exited games can be resumed');
  }

  game.status = 'IN_PROGRESS';
  await game.save();

  const [players, properties, turns] = await Promise.all([
    getPlayersByGameId(gameId),
    getPropertiesByGameId(gameId),
    getTurnsByGameId(gameId),
  ]);

  return {
    game,
    players,
    properties,
    turns,
  };
};

export const restartGame = async (gameId: string) => {
  const game = await getGameOrThrow(gameId);
  const [players, properties] = await Promise.all([
    getPlayersByGameId(gameId),
    getPropertiesByGameId(gameId),
  ]);
  const firstPlayer = players.find((player) => player.turnOrder === 1);

  if (!firstPlayer) {
    throw new Error('Failed to determine the first player.');
  }

  const resetTimestamp = new Date();

  await TurnsModel.deleteMany({ gameId });

  await Promise.all(
    players.map((player) => {
      player.balance = INITIAL_PLAYER_BALANCE;
      player.positionIndex = INITIAL_PLAYER_POSITION;
      player.isActive = true;
      player.isBankrupt = false;
      player.lastAction = 'Game restarted';
      player.lastActionAt = resetTimestamp;
      return player.save();
    })
  );

  await Promise.all(
    properties.map((property) => {
      property.owner = null;
      return property.save();
    })
  );

  game.status = 'IN_PROGRESS';
  game.currentTurn = 0;
  game.nextRollIndex = 0;
  game.currentPlayerId = firstPlayer._id;
  game.winnerPlayerId = null;
  game.completedAt = null;
  game.pendingActionType = null;
  game.pendingActionData = null;
  game.pendingTurnData = null;
  await game.save();

  return {
    game,
    players,
    properties,
    turns: await getTurnsByGameId(gameId),
  };
};
