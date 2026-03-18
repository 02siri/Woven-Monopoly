import type { Player } from '../../../types/player.types';
import type { Property } from '../../../types/property.types';
import type { Turn } from '../../../types/turn.types';

type TurnCardProps = {
  turn: Turn;
  players: Player[];
  properties: Property[];
};

const TurnCard = ({ turn, players, properties }: TurnCardProps) => {
  const playerName =
    players.find((player) => player._id === turn.playerId)?.name ?? 'Unknown Player';
  const propertyName =
    properties.find((property) => property._id === turn.propertyId)?.name ?? null;

  return (
    <article className="card turn-card">
      <div className="card-header-row">
        <div>
          <h3>Turn {turn.turnNumber}</h3>
          <p className="card-subtext">{playerName}</p>
        </div>
        <span className="status-badge neutral-badge">{turn.actionType}</span>
      </div>

      <div className="turn-detail-grid">
        <span>Dice: {turn.diceRoll}</span>
        <span>
          Move: {turn.startPosition} to {turn.endPosition}
        </span>
        <span>Transaction: ${turn.transactionAmount}</span>
        <span>Balance after turn: ${turn.balanceAfterTurn}</span>
      </div>

      {propertyName ? <p className="card-subtext">Property: {propertyName}</p> : null}
      <p className="card-subtext">{turn.notes ?? 'No note available'}</p>
    </article>
  );
};

export default TurnCard;
