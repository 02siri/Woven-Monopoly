import BoardsModel from '../../models/boards.model';

export const getBoardOrThrow = async () => {
  const board = await BoardsModel.findOne({
    name: 'Woven Monopoly',
    version: 'v1',
  });

  if (!board) {
    throw new Error('Board not found. Please load the board before creating a game.');
  }

  return board;
};
