import { describe, expect, it } from 'vitest';
import { Types } from 'mongoose';
import {
  buildPendingTurn,
  getEffectiveRent,
  hasMonopolyForColour,
  resolveSingleTurn,
} from '../src/services/games/turn-resolution.shared';

const createPlayer = ({
  name,
  turnOrder,
  balance = 16,
  positionIndex = 0,
  isBankrupt = false,
}: {
  name: string;
  turnOrder: number;
  balance?: number;
  positionIndex?: number;
  isBankrupt?: boolean;
}) => ({
  _id: new Types.ObjectId(),
  gameId: new Types.ObjectId(),
  name,
  turnOrder,
  balance,
  positionIndex,
  isActive: !isBankrupt,
  isBankrupt,
  lastAction: 'Game started',
  lastActionAt: null,
});

const createProperty = ({
  boardSpaceIndex,
  colour,
  price = 3,
  baseRent = 6,
  owner = null,
  name,
}: {
  boardSpaceIndex: number;
  colour: string;
  price?: number;
  baseRent?: number;
  owner?: Types.ObjectId | null;
  name: string;
}) => ({
  _id: new Types.ObjectId(),
  gameId: new Types.ObjectId(),
  boardSpaceIndex,
  colour,
  price,
  baseRent,
  owner,
  name,
});

const createBoard = () => ({
  _id: new Types.ObjectId(),
  name: 'Test Board',
  version: '1',
  spaces: [
    { index: 0, name: 'GO', type: 'go' as const, price: null, colour: null },
    { index: 1, name: 'Old Kent Road', type: 'property' as const, price: 3, colour: 'Brown' },
    { index: 2, name: 'Whitechapel Road', type: 'property' as const, price: 3, colour: 'Brown' },
    { index: 3, name: 'The Angel', type: 'property' as const, price: 4, colour: 'Blue' },
  ],
});

const createGame = (currentPlayerId: Types.ObjectId): {
  _id: Types.ObjectId;
  boardId: Types.ObjectId;
  gameNumber: number;
  rollSetUsed: string;
  status: string;
  currentTurn: number;
  nextRollIndex: number;
  currentPlayerId: Types.ObjectId | null;
  winnerPlayerId: Types.ObjectId | null;
  completedAt: Date | null;
  pendingActionType: string | null;
  pendingActionData: null;
  pendingTurnData: null;
} => ({
  _id: new Types.ObjectId(),
  boardId: new Types.ObjectId(),
  gameNumber: 1,
  rollSetUsed: 'rolls_1',
  status: 'IN_PROGRESS',
  currentTurn: 0,
  nextRollIndex: 0,
  currentPlayerId,
  winnerPlayerId: null,
  completedAt: null,
  pendingActionType: null,
  pendingActionData: null,
  pendingTurnData: null,
});


describe('turn resolution shared helpers', () => {
  it('detects a monopoly and doubles rent', () => {
    const ownerId = new Types.ObjectId();
    const properties = [
      createProperty({
        boardSpaceIndex: 1,
        colour: 'Brown',
        owner: ownerId,
        name: 'Old Kent Road',
      }),
      createProperty({
        boardSpaceIndex: 2,
        colour: 'Brown',
        owner: ownerId,
        name: 'Whitechapel Road',
      }),
    ];

    expect(hasMonopolyForColour(ownerId.toString(), 'Brown', properties as never[])).toBe(true);
    expect(getEffectiveRent(properties[0] as never, properties as never[])).toBe(12);
  });

  it('queues GO collection and a property purchase when the player wraps around the board', () => {
    const board = createBoard();
    const player = createPlayer({ name: 'Peter', turnOrder: 1, positionIndex: 3 });
    const players = [player, createPlayer({ name: 'Billy', turnOrder: 2 })];
    const properties = [
      createProperty({ boardSpaceIndex: 1, colour: 'Brown', name: 'Old Kent Road' }),
      createProperty({ boardSpaceIndex: 2, colour: 'Brown', name: 'Whitechapel Road' }),
      createProperty({ boardSpaceIndex: 3, colour: 'Blue', name: 'The Angel', price: 4, baseRent: 7 }),
    ];
    const game = createGame(player._id);

    const result = buildPendingTurn({
      board: board as never,
      game: game as never,
      players: players as never[],
      properties: properties as never[],
      diceRoll: 2,
      turnNumber: 1,
    });

    expect(result.pendingTurnData.startPosition).toBe(3);
    expect(result.pendingTurnData.endPosition).toBe(1);
    expect(result.pendingTurnData.passedGo).toBe(true);
    expect(result.pendingTurnData.actionQueue.map((action) => action.type)).toEqual([
      'COLLECT_GO',
      'BUY_PROPERTY',
    ]);
  });

  it('resolves a purchase turn and advances to the next player', () => {
    const board = createBoard();
    const peter = createPlayer({ name: 'Peter', turnOrder: 1 });
    const billy = createPlayer({ name: 'Billy', turnOrder: 2 });
    const game = createGame(peter._id);
    const properties = [
      createProperty({ boardSpaceIndex: 1, colour: 'Brown', name: 'Old Kent Road', price: 3, baseRent: 6 }),
      createProperty({ boardSpaceIndex: 2, colour: 'Brown', name: 'Whitechapel Road', price: 3, baseRent: 6 }),
      createProperty({ boardSpaceIndex: 3, colour: 'Blue', name: 'The Angel', price: 4, baseRent: 7 }),
    ];

    const result = resolveSingleTurn({
      board: board as never,
      game: game as never,
      players: [peter, billy] as never[],
      properties: properties as never[],
      diceRoll: 1,
      turnNumber: 1,
    });

    expect(result.bankrupt).toBe(false);
    expect(properties[0].owner?.toString()).toBe(peter._id.toString());
    expect(peter.balance).toBe(13);
    expect(game.currentPlayerId?.toString()).toBe(billy._id.toString());
    expect(result.turnRecord.actionType).toBe('BUY_PROPERTY');
  });

  it('charges double rent for a monopoly and ends the game on bankruptcy', () => {
    const board = createBoard();
    const peter = createPlayer({ name: 'Peter', turnOrder: 1, balance: 5 });
    const billy = createPlayer({ name: 'Billy', turnOrder: 2, balance: 10 });
    const game = createGame(peter._id);
    const ownedBrownOne = createProperty({
      boardSpaceIndex: 1,
      colour: 'Brown',
      owner: billy._id,
      name: 'Old Kent Road',
      baseRent: 6,
    });
    const ownedBrownTwo = createProperty({
      boardSpaceIndex: 2,
      colour: 'Brown',
      owner: billy._id,
      name: 'Whitechapel Road',
      baseRent: 6,
    });

    const result = resolveSingleTurn({
      board: board as never,
      game: game as never,
      players: [peter, billy] as never[],
      properties: [ownedBrownOne, ownedBrownTwo] as never[],
      diceRoll: 1,
      turnNumber: 3,
    });

    expect(result.bankrupt).toBe(true);
    expect(result.gameFinished).toBe(true);
    expect(game.status).toBe('BANKRUPT_END');
    expect(game.currentPlayerId).toBeNull();
    expect(game.winnerPlayerId?.toString()).toBe(billy._id.toString());
    expect(peter.balance).toBe(0);
    expect(billy.balance).toBe(22);
    expect(result.turnRecord.actionType).toBe('BANKRUPT');
  });
});
