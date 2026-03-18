import { Schema, model, type InferSchemaType } from 'mongoose';

const boardsSpacesSchema = new Schema(
  {
    index: {
      type: Number,
      required: true,
      min: 0,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['go', 'property'],
    },
    price: {
      type: Number,
      min: 0,
      default: null,
    },
    colour: {
      type: String,
      trim: true,
      default: null,
    },
  },
  {
    _id: false,
  }
);

const boardsSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    version: {
      type: String,
      required: true,
      trim: true,
    },
    spaces: {
      type: [boardsSpacesSchema],
      required: true,
      validate: {
        validator: (spaces: unknown[]) => spaces.length > 0,
        message: 'A board must contain at least one space',
      },
    },
  },
  {
    timestamps: true,
  }
);

export type BoardsDocument = InferSchemaType<typeof boardsSchema>;

const BoardsModel = model('Boards', boardsSchema, 'boards');

export default BoardsModel;
