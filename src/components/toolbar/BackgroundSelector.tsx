import type { BoardBackground } from "../../types";

type BackgroundSelectorProps = {
  background: BoardBackground;
  onBackgroundChange: (background: BoardBackground) => void;
};

const backgrounds: Array<{ value: BoardBackground; label: string }> = [
  { value: "grid", label: "Grid" },
  { value: "dots", label: "Dots" },
  { value: "plain", label: "Plain" },
];

export function BackgroundSelector({
  background,
  onBackgroundChange,
}: BackgroundSelectorProps) {
  return (
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
  );
}
