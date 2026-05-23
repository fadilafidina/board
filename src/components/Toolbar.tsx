import { useRef } from "react";
import type {
  BoardBackground,
  BoardItem,
  StickyColor,
  StickySize,
} from "../types";

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
  persistenceWarning: string | null;
  onStickyColorChange: (color: StickyColor) => void;
  onStickySizeChange: (size: StickySize) => void;
  selectedItem: BoardItem | undefined;
};

const backgrounds: Array<{ value: BoardBackground; label: string }> = [
  { value: "grid", label: "Grid" },
  { value: "dots", label: "Dots" },
  { value: "plain", label: "Plain" },
];

const stickyColors: Array<{ value: StickyColor; label: string }> = [
  { value: "pale-cream", label: "Cream" },
  { value: "butter", label: "Butter" },
  { value: "soft-beige", label: "Beige" },
];

const stickySizes: Array<{ value: StickySize; label: string }> = [
  { value: "small", label: "S" },
  { value: "medium", label: "M" },
  { value: "large", label: "L" },
];

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
  persistenceWarning,
  onStickyColorChange,
  onStickySizeChange,
  selectedItem,
}: ToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const selectedSticky =
    selectedItem?.type === "sticky-note" ? selectedItem : undefined;

  return (
    <div className="toolbar" aria-label="Board tools">
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
        <button type="button" onClick={() => fileInputRef.current?.click()}>
          Upload image
        </button>
        <button
          type="button"
          onClick={onMoveBackward}
          disabled={!selectedItem || !canMoveBackward}
        >
          Layer down
        </button>
        <button
          type="button"
          onClick={onMoveForward}
          disabled={!selectedItem || !canMoveForward}
        >
          Layer up
        </button>
        <button
          type="button"
          onClick={onDeleteSelected}
          disabled={!selectedItem}
          className="toolbar__delete"
        >
          Delete
        </button>
      </div>

      <input
        ref={fileInputRef}
        className="toolbar__file-input"
        type="file"
        accept="image/*"
        onChange={(event) => {
          const file = event.target.files?.[0];

          if (!file) {
            return;
          }

          void onAddImage(file);
          event.target.value = "";
        }}
      />

      <label className="toolbar__background">
        <span>Board</span>
        <select
          value={background}
          onChange={(event) =>
            onBackgroundChange(event.target.value as BoardBackground)
          }
        >
          {backgrounds.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      {selectedSticky ? (
        <div className="toolbar__sticky-controls">
          <div className="toolbar__palette" aria-label="Sticky note colors">
            {stickyColors.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`toolbar__swatch toolbar__swatch--${option.value}${
                  selectedSticky.color === option.value ? " is-active" : ""
                }`}
                onClick={() => onStickyColorChange(option.value)}
                aria-label={`Use ${option.label} note`}
              />
            ))}
          </div>

          <div className="toolbar__sizes" aria-label="Sticky note sizes">
            {stickySizes.map((option) => (
              <button
                key={option.value}
                type="button"
                className={selectedSticky.size === option.value ? "is-active" : ""}
                onClick={() => onStickySizeChange(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {persistenceWarning ? (
        <div className="toolbar__notice" role="status">
          {persistenceWarning}
        </div>
      ) : null}
    </div>
  );
}
