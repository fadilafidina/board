import type {
  BoardBackground,
  BoardItem,
  StickyColor,
  StickySize,
} from "../../types";
import { BackgroundSelector } from "./BackgroundSelector";
import { PersistenceNotice } from "./PersistenceNotice";
import { StickyControls } from "./StickyControls";
import { ToolActions } from "./ToolActions";

type ToolbarProps = {
  background: BoardBackground;
  canMoveBackward: boolean;
  canMoveForward: boolean;
  onAddHeart: () => void;
  onAddImage: (file: File) => void | Promise<void>;
  onAddPin: () => void;
  onAddStar: () => void;
  onAddSticky: () => void;
  onAddTape: () => void;
  onBackgroundChange: (background: BoardBackground) => void;
  onDeleteSelected: () => void;
  onMoveBackward: () => void;
  onMoveForward: () => void;
  onStickyColorChange: (color: StickyColor) => void;
  onStickySizeChange: (size: StickySize) => void;
  persistenceWarning: string | null;
  selectedItem: BoardItem | undefined;
  statusMessage: string | null;
};

export function Toolbar({
  background,
  canMoveBackward,
  canMoveForward,
  onAddHeart,
  onAddImage,
  onAddPin,
  onAddStar,
  onAddSticky,
  onAddTape,
  onBackgroundChange,
  onDeleteSelected,
  onMoveBackward,
  onMoveForward,
  onStickyColorChange,
  onStickySizeChange,
  persistenceWarning,
  selectedItem,
  statusMessage,
}: ToolbarProps) {
  const selectedSticky =
    selectedItem?.type === "sticky-note" ? selectedItem : undefined;

  return (
    <div className="toolbar" aria-label="Board tools">
      <ToolActions
        canMoveBackward={canMoveBackward}
        canMoveForward={canMoveForward}
        hasSelection={Boolean(selectedItem)}
        onAddHeart={onAddHeart}
        onAddImage={onAddImage}
        onAddPin={onAddPin}
        onAddStar={onAddStar}
        onAddSticky={onAddSticky}
        onAddTape={onAddTape}
        onDeleteSelected={onDeleteSelected}
        onMoveBackward={onMoveBackward}
        onMoveForward={onMoveForward}
      />

      <BackgroundSelector
        background={background}
        onBackgroundChange={onBackgroundChange}
      />

      <StickyControls
        sticky={selectedSticky}
        onStickyColorChange={onStickyColorChange}
        onStickySizeChange={onStickySizeChange}
      />

      <PersistenceNotice
        messages={[statusMessage, persistenceWarning].filter(
          (message): message is string => Boolean(message),
        )}
      />
    </div>
  );
}
