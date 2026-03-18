"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const turnsSchema = new mongoose_1.Schema({
    gameId: {
        type: mongoose_1.Types.ObjectId,
        ref: 'Games',
        required: true,
    },
    turnNumber: {
        type: Number,
        required: true,
        min: 1,
    },
    playerId: {
        type: mongoose_1.Types.ObjectId,
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
        type: mongoose_1.Types.ObjectId,
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
}, {
    timestamps: true,
});
turnsSchema.index({ gameId: 1, turnNumber: 1 }, { unique: true });
const TurnsModel = (0, mongoose_1.model)('Turns', turnsSchema, 'turns');
exports.default = TurnsModel;
