import type { Player } from '../../types/player.types';
import type { Property } from '../../types/property.types';
import { PLAYER_TOKEN_IMAGES } from '../../constants/playerVisuals';

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
};

type GameBoardProps = {
  players: Player[];
  properties: Property[];
  activePlayerId?: string | null;
  onSelectProperty: (property: Property) => void;
};

const TILE_LAYOUT: BoardLayoutItem[] = [
  { index: 0, className: 'board-pos-0' },
  { index: 1, className: 'board-pos-1' },
  { index: 2, className: 'board-pos-2' },
  { index: 3, className: 'board-pos-3' },
  { index: 4, className: 'board-pos-4' },
  { index: 5, className: 'board-pos-5' },
  { index: 6, className: 'board-pos-6' },
  { index: 7, className: 'board-pos-7' },
  { index: 8, className: 'board-pos-8' },
];

const COLOUR_CLASS_MAP: Record<string, string> = {
  Brown: 'colour-brown',
  Red: 'colour-red',
  Green: 'colour-green',
  Blue: 'colour-blue',
};

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
              className={`board-tile ${layoutItem.className} ${property ? 'property-tile' : 'go-tile'} ${
                property?.colour ? COLOUR_CLASS_MAP[property.colour] ?? '' : ''
              } ${activePlayerId && tilePlayers.some((player) => player._id === activePlayerId) ? 'active-tile' : ''} ${
                layoutItem.index === 0 ? 'board-tile-go' : ''
              }`}
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
                    <img
                      key={player._id}
                      className="board-token"
                      src={PLAYER_TOKEN_IMAGES[player.name] ?? PLAYER_TOKEN_IMAGES.Peter}
                      alt={`${player.name} token`}
                      title={player.name}
                    />
                  ))}
                </div>
              ) : null}
            </button>
          );
        })}

        <div className="board-center-tile" aria-hidden="true">
          <p className="board-logo-kicker">Woven Monopoly</p>
          <h2>Monopoly</h2>
          <span>Deterministic Edition</span>
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
