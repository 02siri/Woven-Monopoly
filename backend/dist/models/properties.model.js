"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const propertiesSchema = new mongoose_1.Schema({
    gameId: {
        type: mongoose_1.Types.ObjectId,
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
        type: mongoose_1.Types.ObjectId,
        ref: 'Players',
        default: null,
    },
    baseRent: {
        type: Number,
        required: true,
        min: 0,
    },
}, {
    timestamps: true,
});
propertiesSchema.index({ gameId: 1, boardSpaceIndex: 1 }, { unique: true });
const PropertiesModel = (0, mongoose_1.model)('Properties', propertiesSchema, 'properties');
exports.default = PropertiesModel;
