import type { ReactNode } from "react";
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

type ObjectToolButtonProps = {
  ariaLabel: string;
  children: ReactNode;
  onClick: () => void;
};

function ObjectToolButton({
  ariaLabel,
  children,
  onClick,
}: ObjectToolButtonProps) {
  return (
    <button
      type="button"
      className="toolbar__object-tool"
      onClick={onClick}
      aria-label={ariaLabel}
      title={ariaLabel}
    >
      {children}
    </button>
  );
}

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
      <ObjectToolButton ariaLabel="Add sticky note" onClick={onAddSticky}>
        <span className="toolbar__mini-sticky" aria-hidden="true" />
      </ObjectToolButton>
      <ObjectToolButton ariaLabel="Add pin" onClick={onAddPin}>
        <span className="toolbar__mini-pin" aria-hidden="true">
          <span className="toolbar__mini-pin-head" />
          <span className="toolbar__mini-pin-stem" />
        </span>
      </ObjectToolButton>
      <ObjectToolButton ariaLabel="Add star sticker" onClick={onAddStar}>
        <span className="toolbar__mini-sticker toolbar__mini-sticker--star" aria-hidden="true">
          ★
        </span>
      </ObjectToolButton>
      <ObjectToolButton ariaLabel="Add heart sticker" onClick={onAddHeart}>
        <span className="toolbar__mini-sticker toolbar__mini-sticker--heart" aria-hidden="true">
          ♥
        </span>
      </ObjectToolButton>
      <ObjectToolButton ariaLabel="Add tape" onClick={onAddTape}>
        <span className="toolbar__mini-tape" aria-hidden="true" />
      </ObjectToolButton>
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
        className="toolbar__utility-button toolbar__delete"
        aria-label="Delete selected item"
        title="Delete selected item"
      >
        🗑️
      </button>
    </div>
  );
}
