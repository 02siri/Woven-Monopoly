// import GamesModel from '../../models/games.model';
// import PlayersModel from '../../models/players.model';
// import PropertiesModel from '../../models/properties.model';
// import TurnsModel from '../../models/turns.model';

// export const deleteGame = async (gameId: string) => {
//   const existingGame = await GamesModel.findById(gameId);

//   if (!existingGame) {
//     throw new Error('Game not found');
//   }

//   await Promise.all([
//     PlayersModel.deleteMany({ gameId }),
//     PropertiesModel.deleteMany({ gameId }),
//     TurnsModel.deleteMany({ gameId }),
//   ]);

//   await GamesModel.findByIdAndDelete(gameId);

//   return {
//     gameId,
//     deleted: true,
//   };
// };
