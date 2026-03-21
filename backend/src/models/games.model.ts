import { Schema, model, type InferSchemaType, Types } from 'mongoose';

const gamesSchema = new Schema(
  {
    gameNumber: {
      type: Number,
      required: true,
      unique: true,
      min: 1,
    },
    boardId: {
      type: Types.ObjectId,
      ref: 'Boards',
      required: true,
    },
    rollSetUsed: {
      type: String,
      required: true,
      enum: ['rolls_1', 'rolls_2'],
    },
    status: {
      type: String,
      required: true,
      enum: ['IN_PROGRESS', 'COMPLETED', 'BANKRUPT_END'],
      default: 'IN_PROGRESS',
    },
    currentTurn: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    nextRollIndex: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    currentPlayerId: {
      type: Types.ObjectId,
      ref: 'Players',
      default: null,
    },
    winnerPlayerId: {
      type: Types.ObjectId,
      ref: 'Players',
      default: null,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    pendingActionType: {
      type: String,
      enum: ['BUY_PROPERTY', 'PAY_RENT', 'COLLECT_GO', null],
      default: null,
    },
    pendingActionData: {
      type: Schema.Types.Mixed,
      default: null,
    },
    pendingTurnData: {
      type: Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export type GamesDocument = InferSchemaType<typeof gamesSchema>;

const GamesModel = model('Games', gamesSchema, 'games');

export default GamesModel;
