import { Schema, model, type InferSchemaType, Types } from 'mongoose';

const turnsSchema = new Schema(
  {
    gameId: {
      type: Types.ObjectId,
      ref: 'Games',
      required: true,
    },
    turnNumber: {
      type: Number,
      required: true,
      min: 1,
    },
    playerId: {
      type: Types.ObjectId,
      ref: 'Players',
      required: true,
    },
    diceRoll: {
      type: Number,
      required: true,
      min: 1,
    },
    startPosition: {
      type: Number,
      required: true,
      min: 0,
    },
    endPosition: {
      type: Number,
      required: true,
      min: 0,
    },
    passedGo: {
      type: Boolean,
      required: true,
      default: false,
    },
    actionType: {
      type: String,
      required: true,
      enum: [
        'MOVE',
        'BUY_PROPERTY',
        'PAY_RENT',
        'RECEIVE_RENT',
        'BANKRUPT',
        'PASS_GO',
      ],
    },
    propertyId: {
      type: Types.ObjectId,
      ref: 'Properties',
      default: null,
    },
    transactionAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    balanceAfterTurn: {
      type: Number,
      required: true,
      min: 0,
    },
    notes: {
      type: String,
      trim: true,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

turnsSchema.index({ gameId: 1, turnNumber: 1 }, { unique: true });

export type TurnsDocument = InferSchemaType<typeof turnsSchema>;

const TurnsModel = model('Turns', turnsSchema, 'turns');

export default TurnsModel;
