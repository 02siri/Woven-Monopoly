"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const database_1 = __importDefault(require("./config/database"));
dotenv_1.default.config();
const PORT = process.env.PORT || 5000;
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: [
        "http://localhost:5000",
    ],
    credentials: true,
}));
app.use(express_1.default.json());
app.get('/api/v1/health', (_req, res) => {
    res.status(200).json({
        message: 'Woven Monopoly backend successfully running',
    });
});
const startServer = async () => {
    await (0, database_1.default)();
    app.listen(PORT, () => {
        console.log(`Server listening on port ${PORT}`);
    });
};
startServer().catch((error) => {
    console.error('Failed to start server', error);
    process.exit(1);
});
