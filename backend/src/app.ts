import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import connectToDatabase from './config/database';
import loadBoardIntoDatabase from './loaders/board.loader';

dotenv.config();

const PORT = process.env.PORT || 5000;
const app = express();

app.use(cors({
  origin: [
        "http://localhost:5000",     
    ],
    credentials: true,
}));
app.use(express.json());

app.get('/api/v1/health', (_req, res) => {
  res.status(200).json({
    message: 'Woven Monopoly backend successfully running',
  });
});

const startServer = async () => {
  await connectToDatabase();
  await loadBoardIntoDatabase();

  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
};

startServer().catch((error) => {
  console.error('Failed to start server', error);
  process.exit(1);
});
