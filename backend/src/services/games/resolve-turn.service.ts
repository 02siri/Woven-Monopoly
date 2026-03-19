import BoardsModel from '../../models/boards.model';
import GamesModel from '../../models/games.model';
import TurnsModel from '../../models/turns.model';
import {
  getRollSetByKey,
  type RollSetKey,
} from '../../loaders/rollsets.loader';
import { getPlayersByGameId, getPropertiesByGameId } from './read-games.service';
import { resolveSingleTurn } from './turn-resolution.shared';

export const resolveTurn = async (gameId: string) => {
  const game = await GamesModel.findById(gameId);

  if (!game) {
    throw new Error('Game not found');
  }

  if (game.status !== 'IN_PROGRESS') {
    throw new Error('This game is no longer in progress');
  }

  const board = await BoardsModel.findById(game.boardId);

  if (!board) {
    throw new Error('Board not found for this game');
  }

  const players = await getPlayersByGameId(gameId);
  const properties = await getPropertiesByGameId(gameId);

  if (players.length === 0) {
    throw new Error('Players not found for this game');
  }

  const rolls = getRollSetByKey(game.rollSetUsed as RollSetKey);

  if (game.nextRollIndex >= rolls.length) {
    throw new Error('No more dice rolls available for this game');
  }

  const turnResult = resolveSingleTurn({
    board,
    game,
    players,
    properties,
    diceRoll: rolls[game.nextRollIndex],
    turnNumber: game.currentTurn + 1,
  });

  const createdTurn = await TurnsModel.create(turnResult.turnRecord);
  await Promise.all(players.map((player) => player.save()));
  await Promise.all(properties.map((property) => property.save()));
  await game.save();

  return {
    game,
    players,
    properties,
    turn: createdTurn,
    currentPlayer: turnResult.activePlayer,
    nextPlayer: turnResult.nextPlayer,
    winner: turnResult.winner,
  };
};
