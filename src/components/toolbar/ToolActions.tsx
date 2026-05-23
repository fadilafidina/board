import { ImageUploadButton } from "./ImageUploadButton";
import { LayerControls } from "./LayerControls";

type ToolActionsProps = {
  canMoveBackward: boolean;
  canMoveForward: boolean;
  hasSelection: boolean;
  onAddHeart: () => void;
  onAddImage: (file: File) => void | Promise<void>;
  onAddPin: () => void;
  onAddStar: () => void;
  onAddSticky: () => void;
  onAddTape: () => void;
  onDeleteSelected: () => void;
  onMoveBackward: () => void;
  onMoveForward: () => void;
};

export function ToolActions({
  canMoveBackward,
  canMoveForward,
  hasSelection,
  onAddHeart,
  onAddImage,
  onAddPin,
  onAddStar,
  onAddSticky,
  onAddTape,
  onDeleteSelected,
  onMoveBackward,
  onMoveForward,
}: ToolActionsProps) {
  return (
    <div className="toolbar__actions">
      <button type="button" onClick={onAddSticky}>
        Add sticky
      </button>
      <button type="button" onClick={onAddPin}>
        Add pin
      </button>
      <button type="button" onClick={onAddStar}>
        Add star
      </button>
      <button type="button" onClick={onAddHeart}>
        Add heart
      </button>
      <button type="button" onClick={onAddTape}>
        Add tape
      </button>
      <ImageUploadButton onAddImage={onAddImage} />
      <LayerControls
        canMoveBackward={canMoveBackward}
        canMoveForward={canMoveForward}
        hasSelection={hasSelection}
        onMoveBackward={onMoveBackward}
        onMoveForward={onMoveForward}
      />
      <button
        type="button"
        onClick={onDeleteSelected}
        disabled={!hasSelection}
        className="toolbar__delete"
      >
        Delete
      </button>
    </div>
  );
}
