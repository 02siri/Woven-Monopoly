import { Schema, model, type InferSchemaType, Types } from 'mongoose';

const propertiesSchema = new Schema(
  {
    gameId: {
      type: Types.ObjectId,
      ref: 'Games',
      required: true,
    },
    boardSpaceIndex: {
      type: Number,
      required: true,
      min: 0,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    colour: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    owner: {
      type: Types.ObjectId,
      ref: 'Players',
      default: null,
    },
    baseRent: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

propertiesSchema.index({ gameId: 1, boardSpaceIndex: 1 }, { unique: true });

export type PropertiesDocument = InferSchemaType<typeof propertiesSchema>;

const PropertiesModel = model('Properties', propertiesSchema, 'properties');

export default PropertiesModel;
