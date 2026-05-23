import type { StickyColor, StickyNoteItem } from "../../types";

type StickyControlsProps = {
  onStickyColorChange: (color: StickyColor) => void;
  sticky: StickyNoteItem | undefined;
};

const stickyColors: Array<{ value: StickyColor; label: string }> = [
  { value: "pale-cream", label: "Cream" },
  { value: "butter", label: "Butter" },
  { value: "soft-beige", label: "Beige" },
  { value: "pastel-blue", label: "Blue" },
  { value: "pastel-green", label: "Green" },
  { value: "pastel-pink", label: "Pink" },
];

export function StickyControls({
  onStickyColorChange,
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
    </div>
  );
}
