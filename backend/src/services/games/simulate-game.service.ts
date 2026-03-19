import BoardsModel from '../../models/boards.model';
import GamesModel from '../../models/games.model';
import TurnsModel from '../../models/turns.model';
import {
  getRollSetByKey,
  type RollSetKey,
} from '../../loaders/rollsets.loader';
import { getPlayersByGameId, getPropertiesByGameId } from './read-games.service';
import { getWinner, resolveSingleTurn } from './turn-resolution.shared';

export const simulateGame = async (gameId: string) => {
  const game = await GamesModel.findById(gameId);

  if (!game) {
    throw new Error('Game not found');
  }

  const existingTurnsCount = await TurnsModel.countDocuments({ gameId });

  if (existingTurnsCount > 0 || game.status !== 'IN_PROGRESS') {
    throw new Error('This game has already been simulated');
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
  const turnsToCreate = [];
  let gameEndedByBankruptcy = false;
  game.currentTurn = 0;
  game.nextRollIndex = 0;

  for (let rollIndex = 0; rollIndex < rolls.length; rollIndex += 1) {
    const turnResult = resolveSingleTurn({
      board,
      game,
      players,
      properties,
      diceRoll: rolls[rollIndex],
      turnNumber: rollIndex + 1,
    });

    turnsToCreate.push(turnResult.turnRecord);

    if (turnResult.gameFinished) {
      gameEndedByBankruptcy = true;
      break;
    }
  }

  if (turnsToCreate.length > 0) {
    await TurnsModel.insertMany(turnsToCreate);
  }

  await Promise.all(players.map((player) => player.save()));
  await Promise.all(properties.map((property) => property.save()));

  const winner = getWinner(players);

  if (!gameEndedByBankruptcy) {
    game.currentPlayerId = null;
    game.winnerPlayerId = winner._id;
    game.completedAt = new Date();
    game.status = 'COMPLETED';
  }

  await game.save();

  return {
    game,
    players,
    properties,
    turns: turnsToCreate,
    winner,
  };
};
