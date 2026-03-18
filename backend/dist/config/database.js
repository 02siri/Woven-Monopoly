"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const connectToDatabase = async () => {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
        throw new Error('MONGODB_URI is not defined in the environment');
    }
    await mongoose_1.default.connect(mongoUri);
    console.log('Connected to MongoDB');
};
exports.default = connectToDatabase;
