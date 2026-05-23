import { Toolbar } from "../Toolbar";
import { WhiteboardCanvas } from "../WhiteboardCanvas";
import type { ItemTransform } from "../../lib/board-actions";
import type {
  BoardBackground,
  BoardItem,
  BoardParticipant,
  RemoteCursor,
  StickyColor,
  StickySize,
} from "../../types";
import { PresenceStrip } from "./PresenceStrip";

type BoardWorkspaceProps = {
  background: BoardBackground;
  editingStickyId: string | null;
  items: BoardItem[];
  onAddHeart: () => void;
  onAddImage: (file: File) => void | Promise<void>;
  onAddPin: () => void;
  onAddStar: () => void;
  onAddSticky: () => void;
  onAddTape: () => void;
  onBackgroundChange: (background: BoardBackground) => void;
  onCursorLeave: () => void;
  onCursorMove: (cursor: { x: number; y: number }) => void;
  onDeleteSelected: () => void;
  onMoveBackward: () => void;
  onMoveForward: () => void;
  onMoveItem: (itemId: string, x: number, y: number) => void;
  onSelectItem: (itemId: string | null) => void;
  onStartStickyEditing: (itemId: string) => void;
  onStickyColorChange: (color: StickyColor) => void;
  onStickySizeChange: (size: StickySize) => void;
  onStickyTextChange: (text: string) => void;
  onStopStickyEditing: () => void;
  onTransformItem: (itemId: string, transform: ItemTransform) => void;
  participants?: BoardParticipant[];
  persistenceWarning: string | null;
  remoteCursors?: RemoteCursor[];
  selectedItemId: string | null;
  selfCursor?: RemoteCursor | null;
  statusMessage: string | null;
  userParticipant?: BoardParticipant | null;
  usePresenceCursor?: boolean;
};

export function BoardWorkspace({
  background,
  editingStickyId,
  items,
  onAddHeart,
  onAddImage,
  onAddPin,
  onAddStar,
  onAddSticky,
  onAddTape,
  onBackgroundChange,
  onCursorLeave,
  onCursorMove,
  onDeleteSelected,
  onMoveBackward,
  onMoveForward,
  onMoveItem,
  onSelectItem,
  onStartStickyEditing,
  onStickyColorChange,
  onStickySizeChange,
  onStickyTextChange,
  onStopStickyEditing,
  onTransformItem,
  participants = [],
  persistenceWarning,
  remoteCursors = [],
  selectedItemId,
  selfCursor = null,
  statusMessage,
  userParticipant = null,
  usePresenceCursor = false,
}: BoardWorkspaceProps) {
  const selectedIndex = items.findIndex((item) => item.id === selectedItemId);
  const selectedItem =
    selectedIndex >= 0 ? items[selectedIndex] : undefined;

  return (
    <main className="app-shell">
      <div className="board-frame" aria-label="Fridgeboard canvas">
        <PresenceStrip
          currentUser={userParticipant}
          participants={participants}
        />

        <WhiteboardCanvas
          background={background}
          editingStickyId={editingStickyId}
          items={items}
          onCursorLeave={onCursorLeave}
          onCursorMove={onCursorMove}
          onMoveItem={onMoveItem}
          onSelectItem={onSelectItem}
          onStartStickyEditing={onStartStickyEditing}
          onStickyTextChange={onStickyTextChange}
          onStopStickyEditing={onStopStickyEditing}
          onTransformItem={onTransformItem}
          remoteCursors={remoteCursors}
          selfCursor={selfCursor}
          selectedItemId={selectedItemId}
          usePresenceCursor={usePresenceCursor}
        />

        <div className="board-frame__toolbar">
          <Toolbar
            background={background}
            canMoveBackward={selectedIndex > 0}
            canMoveForward={
              selectedIndex >= 0 && selectedIndex < items.length - 1
            }
            onAddHeart={onAddHeart}
            onAddImage={onAddImage}
            onAddPin={onAddPin}
            onAddStar={onAddStar}
            onAddSticky={onAddSticky}
            onAddTape={onAddTape}
            onBackgroundChange={onBackgroundChange}
            onDeleteSelected={onDeleteSelected}
            onMoveBackward={onMoveBackward}
            onMoveForward={onMoveForward}
            onStickyColorChange={onStickyColorChange}
            onStickySizeChange={onStickySizeChange}
            persistenceWarning={persistenceWarning}
            selectedItem={selectedItem}
            statusMessage={statusMessage}
          />
        </div>
      </div>
    </main>
  );
}
