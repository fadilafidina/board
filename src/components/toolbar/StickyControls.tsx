import type { StickyColor, StickyNoteItem, StickySize } from "../../types";

type StickyControlsProps = {
  onStickyColorChange: (color: StickyColor) => void;
  onStickySizeChange: (size: StickySize) => void;
  sticky: StickyNoteItem | undefined;
};

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

export function StickyControls({
  onStickyColorChange,
  onStickySizeChange,
  sticky,
}: StickyControlsProps) {
  if (!sticky) {
    return null;
  }

  return (
    <div className="toolbar__sticky-controls">
      <div className="toolbar__palette" aria-label="Sticky note colors">
        {stickyColors.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`toolbar__swatch toolbar__swatch--${option.value}${
              sticky.color === option.value ? " is-active" : ""
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
            className={sticky.size === option.value ? "is-active" : ""}
            onClick={() => onStickySizeChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
