export type Property = {
  _id: string;
  gameId: string;
  boardSpaceIndex: number;
  name: string;
  colour: string;
  price: number;
  owner: string | null;
  baseRent: number;
  createdAt: string;
  updatedAt: string;
};
