import type { HydratedDocument } from 'mongoose';
import type { GamesDocument } from '../../models/games.model';
import type { PlayersDocument } from '../../models/players.model';
import type { PropertiesDocument } from '../../models/properties.model';
import type { BoardsDocument } from '../../models/boards.model';

type PlayerDoc = HydratedDocument<PlayersDocument>;
type PropertyDoc = HydratedDocument<PropertiesDocument>;
type BoardDoc = HydratedDocument<BoardsDocument>;
type GameDoc = HydratedDocument<GamesDocument>;

export type PendingActionType = 'BUY_PROPERTY' | 'PAY_RENT' | 'COLLECT_GO';

export type PendingActionData = {
  type: PendingActionType;
  title: string;
  description: string;
  buttonLabel: string;
  amount: number;
  propertyId: string | null;
  recipientPlayerId?: string | null;
  recipientPlayerName?: string | null;
};

export type PendingTurnData = {
  turnNumber: number;
  diceRoll: number;
  startPosition: number;
  endPosition: number;
  passedGo: boolean;
  propertyId: string | null;
  actionQueue: PendingActionData[];
  noteParts: string[];
  transactionAmount: number;
};

export const hasMonopolyForColour = (
  ownerId: string,
  colour: string,
  properties: PropertyDoc[]
) => {
  const sameColourProperties = properties.filter(
    (property) => property.colour === colour
  );

  return sameColourProperties.every(
    (property) => property.owner && property.owner.toString() === ownerId
  );
};

export const getEffectiveRent = (property: PropertyDoc, properties: PropertyDoc[]) => {
  if (!property.owner) {
    return 0;
  }

  const ownerId = property.owner.toString();
  const hasMonopoly = hasMonopolyForColour(ownerId, property.colour, properties);

  return hasMonopoly ? property.baseRent * 2 : property.baseRent;
};

export const getWinner = (players: PlayerDoc[]) => {
  return [...players].sort((playerA, playerB) => {
    if (playerA.balance !== playerB.balance) {
      return playerB.balance - playerA.balance;
    }

    return playerA.turnOrder - playerB.turnOrder;
  })[0];
};

export const getNextActivePlayerIndex = (
  players: PlayerDoc[],
  currentPlayerIndex: number
) => {
  for (let offset = 1; offset <= players.length; offset += 1) {
    const nextIndex = (currentPlayerIndex + offset) % players.length;
    const nextPlayer = players[nextIndex];

    if (nextPlayer && !nextPlayer.isBankrupt) {
      return nextIndex;
    }
  }

  return -1;
};

export const getActivePlayerOrThrow = (players: PlayerDoc[], game: GameDoc) => {
  const activePlayerIndex = players.findIndex(
    (player) => player._id.toString() === game.currentPlayerId?.toString()
  );

  if (activePlayerIndex === -1) {
    throw new Error('Current player not found for this game');
  }

  const activePlayer = players[activePlayerIndex];

  if (activePlayer.isBankrupt) {
    throw new Error('Current player is bankrupt and cannot take a turn');
  }

  return {
    activePlayer,
    activePlayerIndex,
  };
};

export const buildPendingTurn = ({
  board,
  game,
  players,
  properties,
  diceRoll,
  turnNumber,
}: {
  board: BoardDoc;
  game: GameDoc;
  players: PlayerDoc[];
  properties: PropertyDoc[];
  diceRoll: number;
  turnNumber: number;
}) => {
  const { activePlayer } = getActivePlayerOrThrow(players, game);
  const boardSize = board.spaces.length;
  const startPosition = activePlayer.positionIndex;
  const rawEndPosition = startPosition + diceRoll;
  const passedGo = rawEndPosition >= boardSize;
  const endPosition = rawEndPosition % boardSize;
  const landedSpace = board.spaces[endPosition];
  const actionQueue: PendingActionData[] = [];
  let propertyId: string | null = null;

  activePlayer.positionIndex = endPosition;

  if (passedGo) {
    actionQueue.push({
      type: 'COLLECT_GO',
      title: 'Yayy! You passed Go',
      description: 'Collect $1 each time you pass Go.',
      buttonLabel: 'Collect $1',
      amount: 1,
      propertyId: null,
    });
  }

  if (landedSpace.type === 'property') {
    const property = properties.find(
      (currentProperty) => currentProperty.boardSpaceIndex === endPosition
    );

    if (!property) {
      throw new Error(`Property not found at board index ${endPosition}`);
    }

    propertyId = property._id.toString();

    if (!property.owner) {
      actionQueue.push({
        type: 'BUY_PROPERTY',
        title: property.name,
        description: `You landed on ${property.name}. Buy it to continue your turn.`,
        buttonLabel: `Buy for $${property.price}`,
        amount: property.price,
        propertyId,
      });
    } else if (property.owner.toString() !== activePlayer._id.toString()) {
      const owner = players.find(
        (player) => player._id.toString() === property.owner?.toString()
      );

      if (!owner) {
        throw new Error(`Owner not found for property ${property.name}`);
      }

      const effectiveRent = getEffectiveRent(property, properties);

      actionQueue.push({
        type: 'PAY_RENT',
        title: 'Pay Rent',
        description: `Pay $${effectiveRent} rent to ${owner.name} for ${property.name}.`,
        buttonLabel: `Pay $${effectiveRent}`,
        amount: effectiveRent,
        propertyId,
        recipientPlayerId: owner._id.toString(),
        recipientPlayerName: owner.name,
      });
    }
  }

  const pendingTurnData: PendingTurnData = {
    turnNumber,
    diceRoll,
    startPosition,
    endPosition,
    passedGo,
    propertyId,
    actionQueue,
    noteParts: [],
    transactionAmount: 0,
  };

  return {
    activePlayer,
    pendingTurnData,
    pendingAction: actionQueue[0] ?? null,
    landedSpace,
  };
};

export const finalizeTurnState = ({
  game,
  players,
  activePlayer,
  activePlayerIndex,
  pendingTurnData,
  turnTimestamp,
  finalActionType,
}: {
  game: GameDoc;
  players: PlayerDoc[];
  activePlayer: PlayerDoc;
  activePlayerIndex: number;
  pendingTurnData: PendingTurnData;
  turnTimestamp: Date;
  finalActionType: 'MOVE' | 'BUY_PROPERTY' | 'PAY_RENT' | 'BANKRUPT' | 'PASS_GO';
}) => {
  const noteParts = pendingTurnData.noteParts.length > 0
    ? pendingTurnData.noteParts
    : [`${activePlayer.name} moved to board space ${pendingTurnData.endPosition}`];

  activePlayer.lastAction = noteParts.join('. ');
  activePlayer.lastActionAt = turnTimestamp;

  const bankrupt = activePlayer.balance < 0;

  if (bankrupt) {
    activePlayer.balance = 0;
    activePlayer.isBankrupt = true;
    activePlayer.isActive = false;
    activePlayer.lastAction = `${activePlayer.lastAction}. ${activePlayer.name} became bankrupt`;
  }

  const nextActivePlayerIndex = getNextActivePlayerIndex(players, activePlayerIndex);

  if (nextActivePlayerIndex === -1 || bankrupt) {
    const winner = getWinner(players);
    game.currentTurn = pendingTurnData.turnNumber;
    game.currentPlayerId = null;
    game.winnerPlayerId = winner._id;
    game.completedAt = new Date();
    game.status = 'BANKRUPT_END';
    game.pendingActionType = null;
    game.pendingActionData = null;
    game.pendingTurnData = null;

    return {
      winner,
      nextPlayer: null,
      actionType: bankrupt ? 'BANKRUPT' : finalActionType,
      gameFinished: true,
    };
  }

  const nextPlayer = players[nextActivePlayerIndex];
  game.currentTurn = pendingTurnData.turnNumber;
  game.currentPlayerId = nextPlayer._id;
  game.pendingActionType = null;
  game.pendingActionData = null;
  game.pendingTurnData = null;

  return {
    winner: null,
    nextPlayer,
    actionType: finalActionType,
    gameFinished: false,
  };
};

export const resolveSingleTurn = ({
  board,
  game,
  players,
  properties,
  diceRoll,
  turnNumber,
}: {
  board: BoardDoc;
  game: GameDoc;
  players: PlayerDoc[];
  properties: PropertyDoc[];
  diceRoll: number;
  turnNumber: number;
}) => {
  const { activePlayer, activePlayerIndex } = getActivePlayerOrThrow(players, game);
  const turnTimestamp = new Date();
  const builtTurn = buildPendingTurn({
    board,
    game,
    players,
    properties,
    diceRoll,
    turnNumber,
  });

  let finalActionType: 'MOVE' | 'BUY_PROPERTY' | 'PAY_RENT' | 'BANKRUPT' | 'PASS_GO' =
    builtTurn.pendingTurnData.passedGo ? 'PASS_GO' : 'MOVE';

  for (const action of builtTurn.pendingTurnData.actionQueue) {
    if (action.type === 'COLLECT_GO') {
      activePlayer.balance += action.amount;
      builtTurn.pendingTurnData.transactionAmount += action.amount;
      builtTurn.pendingTurnData.noteParts.push(
        `${activePlayer.name} passed GO and collected $${action.amount}`
      );
      finalActionType = 'PASS_GO';
      continue;
    }

    if (action.type === 'BUY_PROPERTY') {
      const property = properties.find(
        (currentProperty) => currentProperty._id.toString() === action.propertyId
      );

      if (!property) {
        throw new Error('Pending property not found');
      }

      activePlayer.balance -= action.amount;
      property.owner = activePlayer._id;
      builtTurn.pendingTurnData.transactionAmount -= action.amount;
      builtTurn.pendingTurnData.noteParts.push(
        `${activePlayer.name} bought ${property.name} for $${action.amount}`
      );
      finalActionType = 'BUY_PROPERTY';
      continue;
    }

    if (action.type === 'PAY_RENT') {
      const owner = players.find(
        (player) => player._id.toString() === action.recipientPlayerId
      );

      if (!owner) {
        throw new Error('Rent recipient not found');
      }

      activePlayer.balance -= action.amount;
      owner.balance += action.amount;
      owner.lastAction = `Received $${action.amount} rent from ${activePlayer.name}`;
      owner.lastActionAt = turnTimestamp;
      builtTurn.pendingTurnData.transactionAmount -= action.amount;
      builtTurn.pendingTurnData.noteParts.push(
        `${activePlayer.name} paid $${action.amount} rent to ${owner.name}`
      );
      finalActionType = 'PAY_RENT';
    }
  }

  const finalized = finalizeTurnState({
    game,
    players,
    activePlayer,
    activePlayerIndex,
    pendingTurnData: builtTurn.pendingTurnData,
    turnTimestamp,
    finalActionType,
  });

  return {
    activePlayer,
    bankrupt: finalized.actionType === 'BANKRUPT',
    gameFinished: finalized.gameFinished,
    winner: finalized.winner,
    nextPlayer: finalized.nextPlayer,
    turnRecord: {
      gameId: game._id,
      turnNumber: builtTurn.pendingTurnData.turnNumber,
      playerId: activePlayer._id,
      diceRoll: builtTurn.pendingTurnData.diceRoll,
      startPosition: builtTurn.pendingTurnData.startPosition,
      endPosition: builtTurn.pendingTurnData.endPosition,
      passedGo: builtTurn.pendingTurnData.passedGo,
      actionType: finalized.actionType,
      propertyId: builtTurn.pendingTurnData.propertyId,
      transactionAmount: builtTurn.pendingTurnData.transactionAmount,
      balanceAfterTurn: activePlayer.balance,
      notes: activePlayer.lastAction,
      createdAt: turnTimestamp,
      updatedAt: turnTimestamp,
    },
  };
};
