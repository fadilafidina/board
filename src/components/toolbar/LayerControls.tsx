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
        onClick={onMoveBackward}
        disabled={!hasSelection || !canMoveBackward}
      >
        Layer down
      </button>
      <button
        type="button"
        onClick={onMoveForward}
        disabled={!hasSelection || !canMoveForward}
      >
        Layer up
      </button>
    </>
  );
}
