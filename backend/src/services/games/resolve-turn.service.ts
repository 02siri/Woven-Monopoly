import BoardsModel from '../../models/boards.model';
import GamesModel from '../../models/games.model';
import TurnsModel from '../../models/turns.model';
import {
  getRollSetByKey,
  type RollSetKey,
} from '../../loaders/rollsets.loader';
import { getPlayersByGameId, getPropertiesByGameId } from './read-games.service';
import {
  buildPendingTurn,
  finalizeTurnState,
  getActivePlayerOrThrow,
} from './turn-resolution.shared';

export const resolveTurn = async (gameId: string) => {
  const game = await GamesModel.findById(gameId);

  if (!game) {
    throw new Error('Game not found');
  }

  if (game.status !== 'IN_PROGRESS') {
    throw new Error('This game is no longer in progress');
  }

  if (game.pendingActionType || game.pendingTurnData) {
    throw new Error('Resolve the pending action before playing the next turn');
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

  const turnResult = buildPendingTurn({
    board,
    game,
    players,
    properties,
    diceRoll: rolls[game.nextRollIndex],
    turnNumber: game.currentTurn + 1,
  });

  game.nextRollIndex += 1;

  if (turnResult.pendingAction) {
    game.pendingActionType = turnResult.pendingAction.type;
    game.pendingActionData = turnResult.pendingAction;
    game.pendingTurnData = turnResult.pendingTurnData;

    await Promise.all(players.map((player) => player.save()));
    await game.save();

    return {
      game,
      players,
      properties,
      turn: null,
      currentPlayer: turnResult.activePlayer,
      nextPlayer: null,
      winner: null,
      pendingAction: turnResult.pendingAction,
    };
  }

  const turnTimestamp = new Date();
  const { activePlayer, activePlayerIndex } = getActivePlayerOrThrow(players, game);
  const finalized = finalizeTurnState({
    game,
    players,
    activePlayer,
    activePlayerIndex,
    pendingTurnData: turnResult.pendingTurnData,
    turnTimestamp,
    finalActionType: turnResult.pendingTurnData.passedGo ? 'PASS_GO' : 'MOVE',
  });

  const createdTurn = await TurnsModel.create({
    gameId: game._id,
    turnNumber: turnResult.pendingTurnData.turnNumber,
    playerId: activePlayer._id,
    diceRoll: turnResult.pendingTurnData.diceRoll,
    startPosition: turnResult.pendingTurnData.startPosition,
    endPosition: turnResult.pendingTurnData.endPosition,
    passedGo: turnResult.pendingTurnData.passedGo,
    actionType: finalized.actionType,
    propertyId: turnResult.pendingTurnData.propertyId,
    transactionAmount: turnResult.pendingTurnData.transactionAmount,
    balanceAfterTurn: activePlayer.balance,
    notes: activePlayer.lastAction,
    createdAt: turnTimestamp,
    updatedAt: turnTimestamp,
  });

  await Promise.all(players.map((player) => player.save()));
  await Promise.all(properties.map((property) => property.save()));
  await game.save();

  return {
    game,
    players,
    properties,
    turn: createdTurn,
    currentPlayer: activePlayer,
    nextPlayer: finalized.nextPlayer,
    winner: finalized.winner,
    pendingAction: null,
  };
};
