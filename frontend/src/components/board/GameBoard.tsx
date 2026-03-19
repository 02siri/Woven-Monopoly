import type { Player } from '../../types/player.types';
import type { Property } from '../../types/property.types';

type BoardTile = {
  index: number;
  name: string;
  type: 'go' | 'property';
  price?: number;
  colour?: string;
};

type BoardLayoutItem = {
  index: number;
  className: string;
  orientation: 'corner' | 'horizontal' | 'vertical';
};

type GameBoardProps = {
  players: Player[];
  properties: Property[];
  activePlayerId?: string | null;
  onSelectProperty: (property: Property) => void;
};

const TILE_LAYOUT: BoardLayoutItem[] = [
  { index: 0, className: 'tile-go', orientation: 'corner' },
  { index: 1, className: 'tile-bottom-1', orientation: 'horizontal' },
  { index: 2, className: 'tile-bottom-2', orientation: 'horizontal' },
  { index: 3, className: 'tile-bottom-3', orientation: 'corner' },
  { index: 4, className: 'tile-left-1', orientation: 'vertical' },
  { index: 5, className: 'tile-top-left', orientation: 'corner' },
  { index: 6, className: 'tile-top-center', orientation: 'horizontal' },
  { index: 7, className: 'tile-top-right', orientation: 'corner' },
  { index: 8, className: 'tile-right-1', orientation: 'vertical' },
];

const COLOUR_CLASS_MAP: Record<string, string> = {
  Brown: 'colour-brown',
  Red: 'colour-red',
  Green: 'colour-green',
  Blue: 'colour-blue',
};

const PLAYER_COLOURS = ['token-red', 'token-blue', 'token-green', 'token-yellow'];

const GameBoard = ({
  players,
  properties,
  activePlayerId,
  onSelectProperty,
}: GameBoardProps) => {
  const tiles: BoardTile[] = [
    {
      index: 0,
      name: 'GO',
      type: 'go',
    },
    ...properties
      .slice()
      .sort((propertyA, propertyB) => propertyA.boardSpaceIndex - propertyB.boardSpaceIndex)
      .map((property) => ({
        index: property.boardSpaceIndex,
        name: property.name,
        type: 'property' as const,
        price: property.price,
        colour: property.colour,
      })),
  ];

  return (
    <section className="board-shell">
      <div className="board-grid">
        {TILE_LAYOUT.map((layoutItem) => {
          const tile = tiles.find((currentTile) => currentTile.index === layoutItem.index);
          const property = properties.find(
            (currentProperty) => currentProperty.boardSpaceIndex === layoutItem.index
          );
          const tilePlayers = players.filter(
            (player) => player.positionIndex === layoutItem.index
          );
          const owner = property
            ? players.find((player) => player._id === property.owner)
            : null;

          return (
            <button
              key={layoutItem.index}
              className={`board-tile ${layoutItem.className} board-tile-${layoutItem.orientation} ${property ? 'property-tile' : 'go-tile'} ${
                property?.colour ? COLOUR_CLASS_MAP[property.colour] ?? '' : ''
              } ${activePlayerId && tilePlayers.some((player) => player._id === activePlayerId) ? 'active-tile' : ''}`}
              onClick={() => {
                if (property) {
                  onSelectProperty(property);
                }
              }}
              type="button"
            >
              {property?.colour ? <span className="tile-colour-bar" /> : null}
              <div className="tile-label-row">
                <span className="tile-index">{String(layoutItem.index).padStart(2, '0')}</span>
                <div className="tile-name">{tile?.name ?? 'Tile'}</div>
              </div>
              {property ? <div className="tile-price">${property.price}</div> : null}
              {owner ? <div className="tile-owner">Owned by {owner.name}</div> : null}
              {tilePlayers.length > 0 ? (
                <div className="tile-tokens">
                  {tilePlayers.map((player) => (
                    <span
                      key={player._id}
                      className={`board-token ${PLAYER_COLOURS[player.turnOrder - 1]}`}
                      title={player.name}
                    />
                  ))}
                </div>
              ) : null}
            </button>
          );
        })}

        <div className="board-center">
          <div className="board-center-mark">
            <p className="board-brand">Woven Monopoly</p>
            <h2>Deterministic Edition</h2>
            <p>Two dice on screen, one fixed roll stream under the hood.</p>
          </div>
          <div className="board-center-stats">
            <div>
              <span className="metric-label">Properties</span>
              <strong>{properties.length}</strong>
            </div>
            <div>
              <span className="metric-label">Players</span>
              <strong>{players.length}</strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GameBoard;
