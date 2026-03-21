import type { Player } from '../../types/player.types';
import type { Property } from '../../types/property.types';

type PropertyModalProps = {
  property: Property;
  ownerName?: string;
  players: Player[];
  properties: Property[];
  onClose: () => void;
};

const PropertyModal = ({
  property,
  ownerName,
  players,
  properties,
  onClose,
}: PropertyModalProps) => {
  const sameColourProperties = properties.filter(
    (currentProperty) => currentProperty.colour === property.colour
  );

  const ownerHasMonopoly =
    property.owner !== null &&
    sameColourProperties.every(
      (currentProperty) => currentProperty.owner === property.owner
    );

  const effectiveRent = ownerHasMonopoly ? property.baseRent * 2 : property.baseRent;
  const resolvedOwner =
    ownerName ?? players.find((player) => player._id === property.owner)?.name ?? 'Unowned';

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <section
        className="property-modal"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button className="modal-close" onClick={onClose} type="button">
          x
        </button>
        <div className={`property-banner property-banner-${property.colour.toLowerCase()}`} />
        <p className="eyebrow">{property.colour} Property</p>
        <h3>{property.name}</h3>
        <div className="modal-metrics">
          <p><strong>Price:</strong> ${property.price}</p>
          <p><strong>Base Rent:</strong> ${property.baseRent}</p>
          <p><strong>Current Rent:</strong> ${effectiveRent}</p>
          <p><strong>Owner:</strong> {resolvedOwner}</p>
        </div>
        <p className="modal-note">
          View property details here. Mandatory turn actions are shown separately when a
          player lands on a tile.
        </p>
      </section>
    </div>
  );
};

export default PropertyModal;
