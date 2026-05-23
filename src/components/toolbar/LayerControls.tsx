type LayerControlsProps = {
  canMoveBackward: boolean;
  canMoveForward: boolean;
  hasSelection: boolean;
  onMoveBackward: () => void;
  onMoveForward: () => void;
};

export function LayerControls({
  canMoveBackward,
  canMoveForward,
  hasSelection,
  onMoveBackward,
  onMoveForward,
}: LayerControlsProps) {
  return (
    <>
      <button
        type="button"
        className="toolbar__utility-button"
        onClick={onMoveForward}
        disabled={!hasSelection || !canMoveForward}
        aria-label="Layer up"
        title="Layer up"
      >
        <span className="toolbar__icon-center" aria-hidden="true">
          ⬆️
        </span>
      </button>
      <button
        type="button"
        className="toolbar__utility-button"
        onClick={onMoveBackward}
        disabled={!hasSelection || !canMoveBackward}
        aria-label="Layer down"
        title="Layer down"
      >
        <span className="toolbar__icon-center" aria-hidden="true">
          ⬇️
        </span>
      </button>
    </>
  );
}
