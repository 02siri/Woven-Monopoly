export type Player = {
  _id: string;
  gameId: string;
  name: string;
  turnOrder: number;
  balance: number;
  positionIndex: number;
  isActive: boolean;
  isBankrupt: boolean;
  lastAction: string | null;
  lastActionAt: string | null;
  createdAt: string;
  updatedAt: string;
};
