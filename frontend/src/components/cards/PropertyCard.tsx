import type { Player } from '../../types/player.types';
import type { Property } from '../../types/property.types';

type PropertyCardProps = {
  property: Property;
  ownerName?: string;
  players: Player[];
  properties: Property[];
};

const PropertyCard = ({
  property,
  ownerName,
  players,
  properties,
}: PropertyCardProps) => {
  const sameColourProperties = properties.filter(
    (currentProperty) => currentProperty.colour === property.colour
  );

  const ownerHasMonopoly =
    property.owner !== null &&
    sameColourProperties.every(
      (currentProperty) => currentProperty.owner === property.owner
    );

  const effectiveRent = ownerHasMonopoly ? property.baseRent * 2 : property.baseRent;
  const ownerPlayer = players.find((player) => player._id === property.owner);

  return (
    <article className="card property-card">
      <div className="card-header-row">
        <div>
          <h3>{property.name}</h3>
          <p className="card-subtext">{property.colour}</p>
        </div>
        <span className="colour-pill">{property.colour}</span>
      </div>

      <div className="metric-grid">
        <div>
          <span className="metric-label">Price</span>
          <strong>${property.price}</strong>
        </div>
        <div>
          <span className="metric-label">Rent</span>
          <strong>${effectiveRent}</strong>
        </div>
      </div>

      <p className="card-subtext">
        Owner: {ownerName ?? ownerPlayer?.name ?? 'Unowned'}
      </p>
      {ownerHasMonopoly ? <p className="winner-tag">Monopoly rent active</p> : null}
    </article>
  );
};

export default PropertyCard;
