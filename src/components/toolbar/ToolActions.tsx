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
      <span className="toolbar__icon-center">{children}</span>
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
        <svg
          aria-hidden="true"
          className="toolbar__mini-icon toolbar__mini-pin"
          viewBox="0 0 24 28"
        >
          <circle
            cx="12"
            cy="8"
            r="6"
            fill="#c96f5c"
            stroke="#fff8ef"
            strokeWidth="1.5"
          />
          <path
            d="M12 13 L12 25"
            stroke="#8b7768"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </ObjectToolButton>
      <ObjectToolButton ariaLabel="Add star sticker" onClick={onAddStar}>
        <svg
          aria-hidden="true"
          className="toolbar__mini-icon toolbar__mini-sticker toolbar__mini-sticker--star"
          viewBox="0 0 28 28"
        >
          <path
            d="M14 3.5L17 10.2L24.3 10.9L18.8 15.7L20.5 22.7L14 18.8L7.5 22.7L9.2 15.7L3.7 10.9L11 10.2L14 3.5Z"
            fill="currentColor"
            stroke="#fffdf8"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
      </ObjectToolButton>
      <ObjectToolButton ariaLabel="Add heart sticker" onClick={onAddHeart}>
        <svg
          aria-hidden="true"
          className="toolbar__mini-icon toolbar__mini-sticker toolbar__mini-sticker--heart"
          viewBox="0 0 28 28"
        >
          <path
            d="M14 24L11.8 22C6.2 17 3 14.1 3 10.4C3 7.5 5.2 5.3 8.1 5.3C9.7 5.3 11.2 6 12.2 7.2L14 9.3L15.8 7.2C16.8 6 18.3 5.3 19.9 5.3C22.8 5.3 25 7.5 25 10.4C25 14.1 21.8 17 16.2 22L14 24Z"
            fill="currentColor"
            stroke="#fffdf8"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
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
        <span className="toolbar__icon-center" aria-hidden="true">
          🗑️
        </span>
      </button>
    </div>
  );
}
