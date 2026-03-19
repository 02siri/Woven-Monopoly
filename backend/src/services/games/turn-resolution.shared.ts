import type { HydratedDocument } from 'mongoose';
import type { GamesDocument } from '../../models/games.model';
import type { PlayersDocument } from '../../models/players.model';
import type { PropertiesDocument } from '../../models/properties.model';
import type { BoardsDocument } from '../../models/boards.model';

type PlayerDoc = HydratedDocument<PlayersDocument>;
type PropertyDoc = HydratedDocument<PropertiesDocument>;
type BoardDoc = HydratedDocument<BoardsDocument>;

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

export const resolveSingleTurn = ({
  board,
  game,
  players,
  properties,
  diceRoll,
  turnNumber,
}: {
  board: BoardDoc;
  game: HydratedDocument<GamesDocument>;
  players: PlayerDoc[];
  properties: PropertyDoc[];
  diceRoll: number;
  turnNumber: number;
}) => {
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

  const boardSize = board.spaces.length;
  const startPosition = activePlayer.positionIndex;
  const rawEndPosition = startPosition + diceRoll;
  const passedGo = rawEndPosition >= boardSize;
  const endPosition = rawEndPosition % boardSize;
  const landedSpace = board.spaces[endPosition];
  const noteParts: string[] = [];
  const turnTimestamp = new Date();
  let actionType: 'MOVE' | 'BUY_PROPERTY' | 'PAY_RENT' | 'BANKRUPT' | 'PASS_GO' =
    'MOVE';
  let transactionAmount = 0;
  let propertyId = null;

  activePlayer.positionIndex = endPosition;

  if (passedGo) {
    activePlayer.balance += 1;
    transactionAmount += 1;
    actionType = 'PASS_GO';
    noteParts.push(`${activePlayer.name} passed GO and received $1`);
  }

  if (landedSpace.type === 'property') {
    const property = properties.find(
      (currentProperty) => currentProperty.boardSpaceIndex === endPosition
    );

    if (!property) {
      throw new Error(`Property not found at board index ${endPosition}`);
    }

    propertyId = property._id;

    if (!property.owner) {
      activePlayer.balance -= property.price;
      transactionAmount -= property.price;
      property.owner = activePlayer._id;
      actionType = 'BUY_PROPERTY';
      noteParts.push(
        `${activePlayer.name} bought ${property.name} for $${property.price}`
      );
    } else if (property.owner.toString() !== activePlayer._id.toString()) {
      const owner = players.find(
        (player) => player._id.toString() === property.owner?.toString()
      );

      if (!owner) {
        throw new Error(`Owner not found for property ${property.name}`);
      }

      const effectiveRent = getEffectiveRent(property, properties);

      activePlayer.balance -= effectiveRent;
      owner.balance += effectiveRent;
      owner.lastAction = `Received $${effectiveRent} rent from ${activePlayer.name}`;
      owner.lastActionAt = turnTimestamp;
      transactionAmount -= effectiveRent;
      actionType = 'PAY_RENT';
      noteParts.push(
        `${activePlayer.name} paid $${effectiveRent} rent to ${owner.name} for ${property.name}`
      );
    } else {
      noteParts.push(`${activePlayer.name} landed on owned property ${property.name}`);
    }
  } else {
    noteParts.push(`${activePlayer.name} moved to ${landedSpace.name}`);
  }

  let bankrupt = false;

  if (activePlayer.balance < 0) {
    activePlayer.balance = 0;
    activePlayer.isBankrupt = true;
    activePlayer.isActive = false;
    actionType = 'BANKRUPT';
    noteParts.push(`${activePlayer.name} became bankrupt`);
    bankrupt = true;
  }

  activePlayer.lastAction = noteParts.join('. ');
  activePlayer.lastActionAt = turnTimestamp;

  const nextActivePlayerIndex = getNextActivePlayerIndex(players, activePlayerIndex);

  if (nextActivePlayerIndex === -1 || bankrupt) {
    const winner = getWinner(players);
    game.currentTurn = turnNumber;
    game.nextRollIndex += 1;
    game.currentPlayerId = null;
    game.winnerPlayerId = winner._id;
    game.completedAt = new Date();
    game.status = 'BANKRUPT_END';

    return {
      activePlayer,
      bankrupt: true,
      gameFinished: true,
      winner,
      nextPlayer: null,
      turnRecord: {
        gameId: game._id,
        turnNumber,
        playerId: activePlayer._id,
        diceRoll,
        startPosition,
        endPosition,
        passedGo,
        actionType,
        propertyId,
        transactionAmount,
        balanceAfterTurn: activePlayer.balance,
        notes: activePlayer.lastAction,
        createdAt: turnTimestamp,
        updatedAt: turnTimestamp,
      },
    };
  }

  const nextPlayer = players[nextActivePlayerIndex];
  game.currentTurn = turnNumber;
  game.nextRollIndex += 1;
  game.currentPlayerId = nextPlayer._id;

  return {
    activePlayer,
    bankrupt: false,
    gameFinished: false,
    winner: null,
    nextPlayer,
    turnRecord: {
      gameId: game._id,
      turnNumber,
      playerId: activePlayer._id,
      diceRoll,
      startPosition,
      endPosition,
      passedGo,
      actionType,
      propertyId,
      transactionAmount,
      balanceAfterTurn: activePlayer.balance,
      notes: activePlayer.lastAction,
      createdAt: turnTimestamp,
      updatedAt: turnTimestamp,
    },
    };
};
