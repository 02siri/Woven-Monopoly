export type GameStatus = 'IN_PROGRESS' | 'COMPLETED' | 'BANKRUPT_END';

export type Game = {
  _id: string;
  gameNumber: number;
  boardId: string;
  rollSetUsed: 'rolls_1' | 'rolls_2';
  status: GameStatus;
  currentTurn: number;
  nextRollIndex: number;
  currentPlayerId: string | null;
  winnerPlayerId: string | null;
  startedAt: string;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};
