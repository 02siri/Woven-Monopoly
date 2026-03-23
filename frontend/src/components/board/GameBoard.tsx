import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
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

type TileFrame = {
  left: number;
  top: number;
  width: number;
  height: number;
};

type TokenMotionState = {
  x: number | number[];
  y: number | number[];
  rotate: number | number[];
    transition: {
      duration: number;
      times?: number[];
    };
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

const TOKEN_SIZE = 34;
const TOKEN_HOP_HEIGHT = 18;
const GO_TOKEN_SLOT_OFFSETS = [
  { x: -44, y: 0 },
  { x: -12, y: -6 },
  { x: 20, y: 0 },
  { x: 52, y: -6 },
];
const PROPERTY_TOKEN_SLOT_OFFSETS = [
  { x: 0, y: 0 },
  { x: 0, y: 34 },
  { x: -34, y: 0 },
  { x: -34, y: 34 },
];

const GameBoard = ({
  players,
  properties,
  activePlayerId,
  onSelectProperty,
}: GameBoardProps) => {
  const boardGridRef = useRef<HTMLDivElement | null>(null);
  const tileRefs = useRef<Record<number, HTMLButtonElement | null>>({});
  const previousPositionsRef = useRef<Record<string, number>>({});
  const [tileFrames, setTileFrames] = useState<Record<number, TileFrame>>({});
  const [tokenMotions, setTokenMotions] = useState<Record<string, TokenMotionState>>({});

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

  useLayoutEffect(() => {
    const measureTileFrames = () => {
      if (!boardGridRef.current) {
        return;
      }

      const boardRect = boardGridRef.current.getBoundingClientRect();
      const nextTileFrames: Record<number, TileFrame> = {};

      for (const layoutItem of TILE_LAYOUT) {
        const tileElement = tileRefs.current[layoutItem.index];

        if (!tileElement) {
          continue;
        }

        const tileRect = tileElement.getBoundingClientRect();

        nextTileFrames[layoutItem.index] = {
          left: tileRect.left - boardRect.left,
          top: tileRect.top - boardRect.top,
          width: tileRect.width,
          height: tileRect.height,
        };
      }

      setTileFrames(nextTileFrames);
    };

    measureTileFrames();
    window.addEventListener('resize', measureTileFrames);

    return () => {
      window.removeEventListener('resize', measureTileFrames);
    };
  }, [players.length, properties.length]);

  useEffect(() => {
    if (Object.keys(tileFrames).length !== TILE_LAYOUT.length) {
      return;
    }

    const sortedPlayers = [...players].sort((playerA, playerB) => playerA.turnOrder - playerB.turnOrder);

    const getPlayersAtPosition = (positionIndex: number) => {
      return sortedPlayers.filter((player) => player.positionIndex === positionIndex);
    };

    const getTokenTarget = (player: Player, positionIndex: number, useFinalSlot: boolean) => {
      const tileFrame = tileFrames[positionIndex];

      if (!tileFrame) {
        return null;
      }

      const isGoTile = positionIndex === 0;
      const baseTarget = isGoTile
        ? {
            x: tileFrame.left + tileFrame.width / 2 - TOKEN_SIZE / 2,
            y: tileFrame.top + tileFrame.height - TOKEN_SIZE - 18,
          }
        : {
            x: tileFrame.left + tileFrame.width - TOKEN_SIZE - 18,
            y: tileFrame.top + 34,
          };

      if (!useFinalSlot) {
        return baseTarget;
      }

      const playersOnTile = getPlayersAtPosition(positionIndex);
      const slotIndex = playersOnTile.findIndex(
        (currentPlayer) => currentPlayer._id === player._id
      );
      const slotOffset = isGoTile
        ? GO_TOKEN_SLOT_OFFSETS[slotIndex] ?? { x: 0, y: 0 }
        : PROPERTY_TOKEN_SLOT_OFFSETS[slotIndex] ?? { x: 0, y: 0 };

      return {
        x: baseTarget.x + slotOffset.x,
        y: baseTarget.y + slotOffset.y,
      };
    };

    setTokenMotions((currentState) => {
      const nextState: Record<string, TokenMotionState> = { ...currentState };

      for (const player of sortedPlayers) {
        const previousPosition = previousPositionsRef.current[player._id];
        const finalTarget = getTokenTarget(player, player.positionIndex, true);

        if (!finalTarget) {
          continue;
        }

        if (previousPosition === undefined || previousPosition === player.positionIndex) {
          nextState[player._id] = {
            x: finalTarget.x,
            y: finalTarget.y,
            rotate: 0,
            transition: {
              duration: 0.01,
            },
          };
          continue;
        }

        const pathIndexes: number[] = [];
        let currentIndex = previousPosition;

        while (currentIndex !== player.positionIndex) {
          currentIndex = (currentIndex + 1) % TILE_LAYOUT.length;
          pathIndexes.push(currentIndex);
        }

        const startingCenter = getTokenTarget(player, previousPosition, false);

        if (!startingCenter) {
          nextState[player._id] = {
            x: finalTarget.x,
            y: finalTarget.y,
            rotate: 0,
            transition: {
              duration: 0.01,
            },
          };
          continue;
        }

        const xFrames: number[] = [startingCenter.x];
        const yFrames: number[] = [startingCenter.y];
        const rotateFrames: number[] = [0];

        for (const pathIndex of pathIndexes) {
          const target = pathIndex === player.positionIndex
            ? finalTarget
            : getTokenTarget(player, pathIndex, false);

          if (!target) {
            continue;
          }

          xFrames.push(target.x, target.x);
          yFrames.push(target.y - TOKEN_HOP_HEIGHT, target.y);
          rotateFrames.push(-10, 0);
        }

        const times = xFrames.map((_, frameIndex) => {
          return xFrames.length === 1 ? 1 : frameIndex / (xFrames.length - 1);
        });

        nextState[player._id] = {
          x: xFrames,
          y: yFrames,
          rotate: rotateFrames,
          transition: {
            duration: Math.max(0.5, pathIndexes.length * 0.32),
            times,
          },
        };
      }

      previousPositionsRef.current = Object.fromEntries(
        sortedPlayers.map((player) => [player._id, player.positionIndex])
      );

      return nextState;
    });
  }, [players, tileFrames]);

  return (
    <section className="board-shell">
      <div className="board-grid" ref={boardGridRef}>
        {TILE_LAYOUT.map((layoutItem) => {
          const tile = tiles.find((currentTile) => currentTile.index === layoutItem.index);
          const property = properties.find(
            (currentProperty) => currentProperty.boardSpaceIndex === layoutItem.index
          );
          const owner = property
            ? players.find((player) => player._id === property.owner)
            : null;

          return (
            <button
              key={layoutItem.index}
              ref={(element) => {
                tileRefs.current[layoutItem.index] = element;
              }}
              className={`board-tile ${layoutItem.className} ${property ? 'property-tile' : 'go-tile'} ${
                property?.colour ? COLOUR_CLASS_MAP[property.colour] ?? '' : ''
              } ${
                activePlayerId && players.some(
                  (player) =>
                    player.positionIndex === layoutItem.index && player._id === activePlayerId
                )
                  ? 'active-tile'
                  : ''
              } ${
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

        <div className="board-token-overlay" aria-hidden="true">
          {players.map((player) => {
            const tokenMotion = tokenMotions[player._id];

            if (!tokenMotion) {
              return null;
            }

            return (
              <motion.img
                key={player._id}
                className={`board-token board-token-animated ${
                  player._id === activePlayerId ? 'board-token-active' : ''
                }`}
                src={PLAYER_TOKEN_IMAGES[player.name] ?? PLAYER_TOKEN_IMAGES.Peter}
                alt=""
                animate={{
                  x: tokenMotion.x,
                  y: tokenMotion.y,
                  rotate: tokenMotion.rotate,
                  scale: player._id === activePlayerId ? 1.08 : 1,
                }}
                transition={tokenMotion.transition}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default GameBoard;
