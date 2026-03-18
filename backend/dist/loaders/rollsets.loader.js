"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRollSetForGameNumber = exports.getRollSetByKey = void 0;
const rolls_1_json_1 = __importDefault(require("../data/rolls_1.json"));
const rolls_2_json_1 = __importDefault(require("../data/rolls_2.json"));
const rollSets = {
    rolls_1: rolls_1_json_1.default,
    rolls_2: rolls_2_json_1.default,
};
const getRollSetByKey = (key) => {
    return [...rollSets[key]];
};
exports.getRollSetByKey = getRollSetByKey;
const getRollSetForGameNumber = (gameNumber) => {
    return gameNumber % 2 === 1 ? 'rolls_1' : 'rolls_2';
};
exports.getRollSetForGameNumber = getRollSetForGameNumber;
