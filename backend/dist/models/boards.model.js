"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const boardsSpacesSchema = new mongoose_1.Schema({
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
}, {
    _id: false,
});
const boardsSchema = new mongoose_1.Schema({
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
            validator: (spaces) => spaces.length > 0,
            message: 'A board must contain at least one space',
        },
    },
}, {
    timestamps: true,
});
const BoardsModel = (0, mongoose_1.model)('Boards', boardsSchema, 'boards');
exports.default = BoardsModel;
