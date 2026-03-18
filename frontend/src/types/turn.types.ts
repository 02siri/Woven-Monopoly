export type Turn = {
  _id: string;
  gameId: string;
  turnNumber: number;
  playerId: string;
  diceRoll: number;
  startPosition: number;
  endPosition: number;
  passedGo: boolean;
  actionType: 'MOVE' | 'BUY_PROPERTY' | 'PAY_RENT' | 'RECEIVE_RENT' | 'BANKRUPT' | 'PASS_GO';
  propertyId: string | null;
  transactionAmount: number;
  balanceAfterTurn: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};
