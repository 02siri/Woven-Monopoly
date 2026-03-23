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
  const showRentDetails = action.type === 'PAY_RENT' && property !== null;
  const isCollectGo = action.type === 'COLLECT_GO';
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
    action.type === 'PAY_RENT'
      ? action.amount
      : property !== null
        ? ownerHasMonopoly
          ? property.baseRent * 2
          : property.baseRent
        : null;
  const resolvedOwner =
    property?.owner !== null
      ? players.find((player) => player._id === property?.owner)?.name ?? 'Unowned'
      : 'Unowned';
  const isDoubleRent = showRentDetails && ownerHasMonopoly;
  const actionTitle = isDoubleRent ? 'Pay Double Rent' : action.title;
  const actionDescription = isDoubleRent
    ? `${resolvedOwner} owns the full ${property?.colour} set, so this landing triggers double rent on ${property?.name}.`
    : action.description;
  const showCelebration = isCollectGo;

  return (
    <div className="modal-backdrop" role="presentation">
      <section
        className={`property-modal turn-action-modal ${
          showPropertyDetails ? 'turn-action-modal-property' : 'turn-action-modal-compact'
        } ${showCelebration ? 'celebration-modal celebration-modal-go' : ''} ${
          showCelebration ? 'turn-action-modal-celebration' : ''
        }`}
        role="dialog"
        aria-modal="true"
      >
        {showCelebration ? (
          <div className="confetti-cloud" aria-hidden="true">
            {Array.from({ length: 108 }).map((_, index) => (
              <span key={index} className={`confetti-piece confetti-piece-${(index % 6) + 1}`} />
            ))}
          </div>
        ) : null}
        {showCelebration ? (
          <div className="celebration-halo celebration-halo-go" aria-hidden="true">
            <span className="celebration-halo-orb" />
            <span className="celebration-halo-ring" />
          </div>
        ) : null}
        {showPropertyDetails ? (
          <div className={`property-banner property-banner-${property.colour.toLowerCase()}`} />
        ) : null}
        <p className={`eyebrow ${showCelebration ? 'celebration-eyebrow' : ''}`}>
          {showCelebration ? 'Bonus Collected' : 'Required Action'}
        </p>
        <h3>{isCollectGo ? 'Pass GO Bonus!' : actionTitle}</h3>
        <p className="modal-note">{actionDescription}</p>
        {isDoubleRent ? (
          <p className="modal-reason">
            Reason: monopoly ownership doubles the rent on this property.
          </p>
        ) : null}

        {showPropertyDetails ? (
          <div className="modal-metrics">
            <p><strong>Property:</strong> {property.name}</p>
            <p><strong>Price:</strong> ${property.price}</p>
            <p><strong>Base Rent:</strong> ${property.baseRent}</p>
            <p><strong>Current Rent:</strong> ${effectiveRent ?? property.baseRent}</p>
            <p><strong>Owner:</strong> {resolvedOwner}</p>
          </div>
        ) : null}
        {showRentDetails ? (
          <div className="modal-metrics">
            <p><strong>Property:</strong> {property.name}</p>
            <p><strong>Owner:</strong> {resolvedOwner}</p>
            <p><strong>Base Rent:</strong> ${property.baseRent}</p>
            <p><strong>Rent Due:</strong> ${action.amount}</p>
          </div>
        ) : null}
        <button
          className={`primary-button modal-action-button ${
            showCelebration ? 'celebration-button celebration-button-go' : ''
          }`}
          onClick={onConfirm}
          type="button"
        >
          {loading ? 'Working...' : action.buttonLabel}
        </button>
      </section>
    </div>
  );
};

export default TurnActionModal;
