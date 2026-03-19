"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const board_json_1 = __importDefault(require("../data/board.json"));
const boards_model_1 = __importDefault(require("../models/boards.model"));
const loadBoardIntoDatabase = async () => {
    const existingBoard = await boards_model_1.default.findOne({
        name: 'Woven Monopoly',
        version: 'v1',
    });
    if (!existingBoard) {
        const spaces = board_json_1.default.map((space, index) => ({
            index,
            name: space.name,
            type: space.type,
            price: space.price ?? null,
            colour: space.colour ?? null,
        }));
        const board = await boards_model_1.default.create({
            name: 'Woven Monopoly',
            version: 'v1',
            spaces,
        });
        console.log("Board loaded successfully.");
        return board;
    }
    return existingBoard;
};
exports.default = loadBoardIntoDatabase;
