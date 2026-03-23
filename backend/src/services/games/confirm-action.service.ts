import GamesModel from '../../models/games.model';
import TurnsModel from '../../models/turns.model';
import { getPlayersByGameId, getPropertiesByGameId } from './read-games.service';
import {
  finalizeTurnState,
  getActivePlayerOrThrow,
  type PendingActionData,
  type PendingTurnData,
} from './turn-resolution.shared';

export const confirmAction = async (gameId: string) => {
  const game = await GamesModel.findById(gameId);

  if (!game) {
    throw new Error('Game not found');
  }

  if (game.status !== 'IN_PROGRESS') {
    throw new Error('This game is no longer in progress');
  }

  if (!game.pendingActionType || !game.pendingActionData || !game.pendingTurnData) {
    throw new Error('There is no pending action to confirm');
  }

  const players = await getPlayersByGameId(gameId);
  const properties = await getPropertiesByGameId(gameId);

  const { activePlayer, activePlayerIndex } = getActivePlayerOrThrow(players, game);
  const pendingAction = game.pendingActionData as PendingActionData;
  const pendingTurnData = game.pendingTurnData as PendingTurnData;
  const turnTimestamp = new Date();

  switch (pendingAction.type) {
    case 'COLLECT_GO': {
      activePlayer.balance += pendingAction.amount;
      pendingTurnData.transactionAmount += pendingAction.amount;
      pendingTurnData.noteParts.push(
        `${activePlayer.name} passed GO and collected $${pendingAction.amount}`
      );
      break;
    }

    case 'BUY_PROPERTY': {
      const property = properties.find(
        (currentProperty) => currentProperty._id.toString() === pendingAction.propertyId
      );

      if (!property) {
        throw new Error('Pending property not found');
      }

      activePlayer.balance -= pendingAction.amount;
      property.owner = activePlayer._id;
      pendingTurnData.transactionAmount -= pendingAction.amount;
      pendingTurnData.noteParts.push(
        `${activePlayer.name} bought ${property.name} for $${pendingAction.amount}`
      );
      break;
    }

    case 'PAY_RENT': {
      const owner = players.find(
        (player) => player._id.toString() === pendingAction.recipientPlayerId
      );

      if (!owner) {
        throw new Error('Rent recipient not found');
      }

      activePlayer.balance -= pendingAction.amount;
      owner.balance += pendingAction.amount;
      owner.lastAction = `Received $${pendingAction.amount} rent from ${activePlayer.name}`;
      owner.lastActionAt = turnTimestamp;
      pendingTurnData.transactionAmount -= pendingAction.amount;
      pendingTurnData.noteParts.push(
        `${activePlayer.name} paid $${pendingAction.amount} rent to ${owner.name}`
      );
      break;
    }

    default:
      throw new Error('Unsupported pending action');
  }

  const remainingActions = pendingTurnData.actionQueue.slice(1);
  const updatedPendingTurnData: PendingTurnData = {
    ...pendingTurnData,
    actionQueue: activePlayer.balance < 0 ? [] : remainingActions,
    noteParts: [...pendingTurnData.noteParts],
  };

  if (updatedPendingTurnData.actionQueue.length > 0) {
    const nextPendingAction = updatedPendingTurnData.actionQueue[0];
    game.pendingActionType = nextPendingAction.type;
    game.pendingActionData = nextPendingAction;
    game.pendingTurnData = updatedPendingTurnData;
    game.markModified('pendingActionData');
    game.markModified('pendingTurnData');

    await Promise.all(players.map((player) => player.save()));
    await Promise.all(properties.map((property) => property.save()));
    await game.save();

    return {
      game,
      players,
      properties,
      turn: null,
      currentPlayer: activePlayer,
      nextPlayer: null,
      winner: null,
      pendingAction: nextPendingAction,
    };
  }

  const finalized = finalizeTurnState({
    game,
    players,
    activePlayer,
    activePlayerIndex,
    pendingTurnData: updatedPendingTurnData,
    turnTimestamp,
    finalActionType:
      pendingAction.type === 'COLLECT_GO' ? 'PASS_GO' : pendingAction.type,
  });

  const createdTurn = await TurnsModel.create({
    gameId: game._id,
    turnNumber: updatedPendingTurnData.turnNumber,
    playerId: activePlayer._id,
    diceRoll: updatedPendingTurnData.diceRoll,
    startPosition: updatedPendingTurnData.startPosition,
    endPosition: updatedPendingTurnData.endPosition,
    passedGo: updatedPendingTurnData.passedGo,
    actionType: finalized.actionType,
    propertyId: updatedPendingTurnData.propertyId,
    transactionAmount: updatedPendingTurnData.transactionAmount,
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
