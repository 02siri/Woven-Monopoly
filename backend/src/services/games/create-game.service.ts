import GamesModel from '../../models/games.model';
import PlayersModel from '../../models/players.model';
import PropertiesModel from '../../models/properties.model';
import { getRollSetForGameNumber } from '../../loaders/rollsets.loader';
import { getBoardOrThrow } from './shared';

const DEFAULT_PLAYERS = [
  { name: 'Peter', turnOrder: 1 },
  { name: 'Billy', turnOrder: 2 },
  { name: 'Charlotte', turnOrder: 3 },
  { name: 'Sweedal', turnOrder: 4 },
];

const getNextAvailableGameNumber = async () => {
  const existingGames = await GamesModel.find({}, { gameNumber: 1, _id: 0 }).sort({
    gameNumber: 1,
  });

  let nextGameNumber = 1;

  for (const game of existingGames) {
    if (game.gameNumber !== nextGameNumber) {
      break;
    }

    nextGameNumber += 1;
  }

  return nextGameNumber;
};

export const createGame = async () => {
  const gameNumber = await getNextAvailableGameNumber();
  const rollSetUsed = getRollSetForGameNumber(gameNumber);
  const board = await getBoardOrThrow();

  const game = await GamesModel.create({
    gameNumber,
    boardId: board._id,
    rollSetUsed,
    status: 'IN_PROGRESS',
    currentTurn: 0,
    nextRollIndex: 0,
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
