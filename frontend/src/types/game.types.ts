export type GameStatus = 'IN_PROGRESS' | 'COMPLETED' | 'BANKRUPT_END';

export type PendingActionType = 'BUY_PROPERTY' | 'PAY_RENT' | 'COLLECT_GO';

export type PendingAction = {
  type: PendingActionType;
  title: string;
  description: string;
  buttonLabel: string;
  amount: number;
  propertyId: string | null;
  recipientPlayerId?: string | null;
  recipientPlayerName?: string | null;
};

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
  pendingActionType: PendingActionType | null;
  pendingActionData: PendingAction | null;
  pendingTurnData: {
    turnNumber: number;
    diceRoll: number;
    startPosition: number;
    endPosition: number;
    passedGo: boolean;
    propertyId: string | null;
    actionQueue: PendingAction[];
    noteParts: string[];
    transactionAmount: number;
  } | null;
  startedAt: string;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};
