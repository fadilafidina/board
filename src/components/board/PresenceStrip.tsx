import type { BoardParticipant } from "../../types";

type PresenceStripProps = {
  currentUser: BoardParticipant | null;
  participants: BoardParticipant[];
};

export function PresenceStrip({
  currentUser,
  participants,
}: PresenceStripProps) {
  if (!currentUser && participants.length === 0) {
    return null;
  }

  const allParticipants = currentUser
    ? [{ ...currentUser, clientId: `${currentUser.clientId}-self` }, ...participants]
    : participants;

  return (
    <div className="presence-strip" aria-label="People in this board">
      {allParticipants.map((participant, index) => {
        const isSelf = index === 0 && currentUser !== null;
        const status = participant.editingStickyId ? "editing" : "here";

        return (
          <div key={participant.clientId} className="presence-pill">
            <span
              className="presence-pill__swatch"
              style={{ background: participant.color }}
              aria-hidden="true"
            />
            <span className="presence-pill__name">
              {isSelf ? "You" : participant.name}
            </span>
            <span className="presence-pill__status">{status}</span>
          </div>
        );
      })}
    </div>
  );
}
