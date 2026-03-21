import type { PendingAction } from '../../types/game.types';
import type { Property } from '../../types/property.types';
import type { Player } from '../../types/player.types';

type TurnActionModalProps = {
  action: PendingAction;
  property: Property | null;
  players: Player[];
  properties: Property[];
  loading: boolean;
  onConfirm: () => void;
};

const TurnActionModal = ({
  action,
  property,
  players,
  properties,
  loading,
  onConfirm,
}: TurnActionModalProps) => {
  const showPropertyDetails = action.type === 'BUY_PROPERTY' && property !== null;
  const sameColourProperties = property
    ? properties.filter((currentProperty) => currentProperty.colour === property.colour)
    : [];

  const ownerHasMonopoly =
    property?.owner !== null &&
    property !== null &&
    sameColourProperties.every(
      (currentProperty) => currentProperty.owner === property.owner
    );

  const effectiveRent =
    property !== null ? (ownerHasMonopoly ? property.baseRent * 2 : property.baseRent) : null;
  const resolvedOwner =
    property?.owner !== null
      ? players.find((player) => player._id === property?.owner)?.name ?? 'Unowned'
      : 'Unowned';

  return (
    <div className="modal-backdrop" role="presentation">
      <section
        className={`property-modal turn-action-modal ${
          showPropertyDetails ? 'turn-action-modal-property' : 'turn-action-modal-compact'
        }`}
        role="dialog"
        aria-modal="true"
      >
        {showPropertyDetails ? (
          <div className={`property-banner property-banner-${property.colour.toLowerCase()}`} />
        ) : null}
        <p className="eyebrow">Required Action</p>
        <h3>{action.title}</h3>
        <p className="modal-note">{action.description}</p>

        {showPropertyDetails ? (
          <div className="modal-metrics">
            <p><strong>Property:</strong> {property.name}</p>
            <p><strong>Price:</strong> ${property.price}</p>
            <p><strong>Base Rent:</strong> ${property.baseRent}</p>
            <p><strong>Current Rent:</strong> ${effectiveRent ?? property.baseRent}</p>
            <p><strong>Owner:</strong> {resolvedOwner}</p>
          </div>
        ) : null}

        <button className="primary-button modal-action-button" onClick={onConfirm} type="button">
          {loading ? 'Working...' : action.buttonLabel}
        </button>
      </section>
    </div>
  );
};

export default TurnActionModal;
