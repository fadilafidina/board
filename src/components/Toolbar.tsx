import type { BoardBackground, BoardItem } from "../types";

type ToolbarProps = {
  background: BoardBackground;
  onBackgroundChange: (background: BoardBackground) => void;
  onAddSticky: () => void;
  onAddPin: () => void;
  onAddStar: () => void;
  onAddHeart: () => void;
  onAddTape: () => void;
  onDeleteSelected: () => void;
  selectedItem: BoardItem | undefined;
  onStickyTextChange: (text: string) => void;
};

const backgrounds: Array<{ value: BoardBackground; label: string }> = [
  { value: "cream", label: "Cream" },
  { value: "soft-white", label: "Soft White" },
  { value: "warm-gray", label: "Warm Gray" },
];

export function Toolbar({
  background,
  onBackgroundChange,
  onAddSticky,
  onAddPin,
  onAddStar,
  onAddHeart,
  onAddTape,
  onDeleteSelected,
  selectedItem,
  onStickyTextChange,
}: ToolbarProps) {
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
        <button
          type="button"
          onClick={onDeleteSelected}
          disabled={!selectedItem}
          className="toolbar__delete"
        >
          Delete
        </button>
      </div>

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
        <label className="toolbar__editor">
          <span>Note text</span>
          <textarea
            rows={2}
            value={selectedSticky.text}
            onChange={(event) => onStickyTextChange(event.target.value)}
            placeholder="Write a note..."
          />
        </label>
      ) : null}
    </div>
  );
}
