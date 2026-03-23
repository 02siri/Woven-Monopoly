import {
  executeRoute,
  getGameIdFromRequest,
  optionsHandler,
} from '../../../../src/lib/api-route';
//import { deleteGame } from '../../../../src/services/games';

export function OPTIONS() {
  return optionsHandler();
}

// export function DELETE(request: Request) {
//   return executeRoute(() => deleteGame(getGameIdFromRequest(request)), {
//     notFoundMessages: ['Game not found'],
//     successMessage: 'Game deleted successfully',
//   });
// }
