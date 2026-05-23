import type { BoardBackground } from "../../types";

type BackgroundSelectorProps = {
  background: BoardBackground;
  onBackgroundChange: (background: BoardBackground) => void;
};

const backgrounds: Array<{
  value: BoardBackground;
  label: string;
  tone: string;
}> = [
  { value: "grid", label: "Notebook", tone: "toolbar__theme-preview--grid" },
  { value: "dots", label: "Pinned", tone: "toolbar__theme-preview--dots" },
  { value: "plain", label: "Cream", tone: "toolbar__theme-preview--plain" },
];

export function BackgroundSelector({
  background,
  onBackgroundChange,
}: BackgroundSelectorProps) {
  return (
    <div className="toolbar__background">
      <span>Theme</span>
      <div className="toolbar__themes" aria-label="Board themes" role="radiogroup">
        {backgrounds.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`toolbar__theme${
              background === option.value ? " is-active" : ""
            }`}
            onClick={() => onBackgroundChange(option.value)}
            aria-pressed={background === option.value}
            title={`Use ${option.label} theme`}
          >
            <span
              className={`toolbar__theme-preview ${option.tone}`}
              aria-hidden="true"
            />
            <span className="toolbar__theme-label">{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
