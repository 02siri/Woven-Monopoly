import { Schema, model, type InferSchemaType, Types } from 'mongoose';

const playersSchema = new Schema(
  {
    gameId: {
      type: Types.ObjectId,
      ref: 'Games',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    turnOrder: {
      type: Number,
      required: true,
      min: 1,
      max: 4,
    },
    balance: {
      type: Number,
      required: true,
      default: 16,
      min: 0,
    },
    positionIndex: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      required: true,
      default: true,
    },
    isBankrupt: {
      type: Boolean,
      required: true,
      default: false,
    },
    lastAction: {
      type: String,
      trim: true,
      default: null,
    },
    lastActionAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

playersSchema.index({ gameId: 1, turnOrder: 1 }, { unique: true });

export type PlayersDocument = InferSchemaType<typeof playersSchema>;

const PlayersModel = model('Players', playersSchema, 'players');

export default PlayersModel;
