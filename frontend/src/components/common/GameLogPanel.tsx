import type { Turn } from '../../types/turn.types';
import type { Player } from '../../types/player.types';

type GameLogPanelProps = {
  turns: Turn[];
  players: Player[];
};

const GameLogPanel = ({ turns, players }: GameLogPanelProps) => {
  const orderedTurns = [...turns].reverse();

  return (
    <section className="control-card log-card">
      <div className="panel-header">
        <h2>Game Log</h2>
        <span className="muted-text">{turns.length} entries</span>
      </div>

      {orderedTurns.length > 0 ? (
        <ul className="log-list">
          {orderedTurns.map((turn) => (
            <li key={turn._id} className="log-item">
              <div className="log-item-header">
                <strong>Turn {turn.turnNumber}</strong>
                <span className="muted-text">
                  {players.find((player) => player._id === turn.playerId)?.name ?? 'Player'}
                </span>
              </div>
              <p>{turn.notes ?? 'No note available'}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="muted-text">Turn-by-turn notes will appear here.</p>
      )}
    </section>
  );
};

export default GameLogPanel;
