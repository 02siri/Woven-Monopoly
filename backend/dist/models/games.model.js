"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const gamesSchema = new mongoose_1.Schema({
    gameNumber: {
        type: Number,
        required: true,
        unique: true,
        min: 1,
    },
    boardId: {
        type: mongoose_1.Types.ObjectId,
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
        type: mongoose_1.Types.ObjectId,
        ref: 'Players',
        default: null,
    },
    winnerPlayerId: {
        type: mongoose_1.Types.ObjectId,
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
}, {
    timestamps: true,
});
const GamesModel = (0, mongoose_1.model)('Games', gamesSchema, 'games');
exports.default = GamesModel;
