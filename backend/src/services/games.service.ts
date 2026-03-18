import BoardsModel from '../models/boards.model';
import GamesModel from '../models/games.model';
import PlayersModel from '../models/players.model';
import PropertiesModel from '../models/properties.model';
import TurnsModel from '../models/turns.model';
import {
  getRollSetByKey,
  getRollSetForGameNumber,
  type RollSetKey,
} from '../loaders/rollsets.loader';

const DEFAULT_PLAYERS = [
  { name: 'Peter', turnOrder: 1 },
  { name: 'Billy', turnOrder: 2 },
  { name: 'Charlotte', turnOrder: 3 },
  { name: 'Sweedal', turnOrder: 4 },
];

const getBoardOrThrow = async () => {
  const board = await BoardsModel.findOne({
    name: 'Woven Monopoly',
    version: 'v1',
  });

  if (!board) {
    throw new Error('Board not found. Please load the board before creating a game.');
  }

  return board;
};

const hasMonopolyForColour = (
  ownerId: string,
  colour: string,
  properties: Awaited<ReturnType<typeof getPropertiesByGameId>>
) => {
  const sameColourProperties = properties.filter(
    (property) => property.colour === colour
  );

  return sameColourProperties.every(
    (property) => property.owner && property.owner.toString() === ownerId
  );
};

const getEffectiveRent = (
  property: Awaited<ReturnType<typeof getPropertiesByGameId>>[number],
  properties: Awaited<ReturnType<typeof getPropertiesByGameId>>
) => {
  if (!property.owner) {
    return 0;
  }

  const ownerId = property.owner.toString();
  const hasMonopoly = hasMonopolyForColour(ownerId, property.colour, properties);

  return hasMonopoly ? property.baseRent * 2 : property.baseRent;
};

const getWinner = (players: Awaited<ReturnType<typeof getPlayersByGameId>>) => {
  return [...players].sort((playerA, playerB) => {
    if (playerA.balance !== playerB.balance) {
      return playerB.balance - playerA.balance;
    }

    return playerA.turnOrder - playerB.turnOrder;
  })[0];
};

const createGame = async () => {
  const latestGame = await GamesModel.findOne().sort({ gameNumber: -1 });
  const gameNumber = latestGame ? latestGame.gameNumber + 1 : 1;
  const rollSetUsed = getRollSetForGameNumber(gameNumber);

  const board = await getBoardOrThrow();

  const game = await GamesModel.create({
    gameNumber,
    boardId: board._id,
    rollSetUsed,
    status: 'IN_PROGRESS',
    currentTurn: 1,
  });

  const players = await PlayersModel.insertMany(
    DEFAULT_PLAYERS.map((player) => ({
      gameId: game._id,
      name: player.name,
      turnOrder: player.turnOrder,
      balance: 16,
      positionIndex: 0,
      isActive: true,
      isBankrupt: false,
      lastAction: 'Game started',
      lastActionAt: new Date(),
    }))
  );

  const firstPlayer = players.find((player) => player.turnOrder === 1);

  if (!firstPlayer) {
    throw new Error('Failed to determine the first player.');
  }

  game.currentPlayerId = firstPlayer._id;
  await game.save();

  const propertySpaces = board.spaces.filter((space) => space.type === 'property');

  const properties = await PropertiesModel.insertMany(
    propertySpaces.map((space) => ({
      gameId: game._id,
      boardSpaceIndex: space.index,
      name: space.name,
      colour: space.colour,
      price: space.price,
      owner: null,
      baseRent: (space.price ?? 0) + 3,
    }))
  );

  return {
    game,
    players,
    properties,
  };
};

const getGames = async () => {
  return GamesModel.find().sort({ gameNumber: -1 });
};

const getGameById = async (gameId: string) => {
  return GamesModel.findById(gameId);
};

const getPlayersByGameId = async (gameId: string) => {
  return PlayersModel.find({ gameId }).sort({ turnOrder: 1 });
};

const getPropertiesByGameId = async (gameId: string) => {
  return PropertiesModel.find({ gameId }).sort({ boardSpaceIndex: 1 });
};

const getTurnsByGameId = async (gameId: string) => {
  return TurnsModel.find({ gameId }).sort({ turnNumber: 1 });
};

const simulateGame = async (gameId: string) => {
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
  const boardSize = board.spaces.length;
  const turnsToCreate = [];
  let gameEndedByBankruptcy = false;

  for (let rollIndex = 0; rollIndex < rolls.length; rollIndex += 1) {
    const activePlayer = players[rollIndex % players.length];

    if (!activePlayer || activePlayer.isBankrupt) {
      continue;
    }

    const diceRoll = rolls[rollIndex];
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
      noteParts.push('Passed GO and received $1');
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
        noteParts.push(`Bought ${property.name} for $${property.price}`);
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
          `Paid $${effectiveRent} rent to ${owner.name} for ${property.name}`
        );
      } else {
        noteParts.push(`Landed on owned property ${property.name}`);
      }
    } else {
      noteParts.push(`Moved to ${landedSpace.name}`);
    }

    if (activePlayer.balance < 0) {
      activePlayer.balance = 0;
      activePlayer.isBankrupt = true;
      activePlayer.isActive = false;
      actionType = 'BANKRUPT';
      noteParts.push('Became bankrupt');
      gameEndedByBankruptcy = true;
    }

    activePlayer.lastAction = noteParts.join('. ');
    activePlayer.lastActionAt = turnTimestamp;

    turnsToCreate.push({
      gameId: game._id,
      turnNumber: rollIndex + 1,
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
    });

    if (gameEndedByBankruptcy) {
      break;
    }
  }

  if (turnsToCreate.length > 0) {
    await TurnsModel.insertMany(turnsToCreate);
  }

  await Promise.all(players.map((player) => player.save()));
  await Promise.all(properties.map((property) => property.save()));

  const winner = getWinner(players);
  game.currentTurn = turnsToCreate.length;
  game.currentPlayerId = null;
  game.winnerPlayerId = winner._id;
  game.completedAt = new Date();
  game.status = gameEndedByBankruptcy ? 'BANKRUPT_END' : 'COMPLETED';
  await game.save();

  return {
    game,
    players,
    properties,
    turns: turnsToCreate,
    winner,
  };
};

export {
  createGame,
  getGameById,
  getGames,
  getPlayersByGameId,
  getPropertiesByGameId,
  simulateGame,
  getTurnsByGameId,
};
