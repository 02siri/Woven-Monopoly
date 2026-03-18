import GamesModel from '../../models/games.model';
import PlayersModel from '../../models/players.model';
import PropertiesModel from '../../models/properties.model';
import TurnsModel from '../../models/turns.model';

export const getGames = async () => {
  return GamesModel.find().sort({ gameNumber: -1 });
};

export const getGameById = async (gameId: string) => {
  return GamesModel.findById(gameId);
};

export const getPlayersByGameId = async (gameId: string) => {
  return PlayersModel.find({ gameId }).sort({ turnOrder: 1 });
};

export const getPropertiesByGameId = async (gameId: string) => {
  return PropertiesModel.find({ gameId }).sort({ boardSpaceIndex: 1 });
};

export const getTurnsByGameId = async (gameId: string) => {
  return TurnsModel.find({ gameId }).sort({ turnNumber: 1 });
};
