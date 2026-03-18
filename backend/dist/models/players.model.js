"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const playersSchema = new mongoose_1.Schema({
    gameId: {
        type: mongoose_1.Types.ObjectId,
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
}, {
    timestamps: true,
});
playersSchema.index({ gameId: 1, turnOrder: 1 }, { unique: true });
const PlayersModel = (0, mongoose_1.model)('Players', playersSchema, 'players');
exports.default = PlayersModel;
