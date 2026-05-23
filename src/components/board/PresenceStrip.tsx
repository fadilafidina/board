import { useEffect, useState } from "react";
import type { BoardParticipant } from "../../types";

type PresenceStripProps = {
  currentUser: BoardParticipant | null;
  onRenameCurrentUser?: (name: string) => void;
  participants: BoardParticipant[];
};

export function PresenceStrip({
  currentUser,
  onRenameCurrentUser,
  participants,
}: PresenceStripProps) {
  const [draftName, setDraftName] = useState(currentUser?.name ?? "");

  useEffect(() => {
    setDraftName(currentUser?.name ?? "");
  }, [currentUser?.name]);

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
            {isSelf ? (
              <input
                aria-label="Your nickname"
                className="presence-pill__name-input"
                maxLength={24}
                value={draftName}
                onBlur={() => onRenameCurrentUser?.(draftName)}
                onChange={(event) => setDraftName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.currentTarget.blur();
                  }

                  if (event.key === "Escape") {
                    setDraftName(currentUser.name);
                    event.currentTarget.blur();
                  }
                }}
              />
            ) : (
              <span className="presence-pill__name">{participant.name}</span>
            )}
            <span className="presence-pill__status">{status}</span>
          </div>
        );
      })}
    </div>
  );
}
