import boardData from '../data/board.json';
import BoardsModel from '../models/boards.model';

const loadBoardIntoDatabase = async () => {
  const existingBoard = await BoardsModel.findOne({
    name: 'Woven Monopoly',
    version: 'v1',
  });

  if (!existingBoard) {
    const spaces = boardData.map((space, index) => ({
      index,
      name: space.name,
      type: space.type,
      price: space.price ?? null,
      colour: space.colour ?? null,
    }));

    const board = await BoardsModel.create({
      name: 'Woven Monopoly',
      version: 'v1',
      spaces,
    });
    console.log("Board loaded successfully.");
    return board;
  }

  return existingBoard;
};

export default loadBoardIntoDatabase;
