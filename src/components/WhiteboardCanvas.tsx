import type { BoardBackground, BoardItem } from "../types";

type WhiteboardCanvasProps = {
  background: BoardBackground;
  items: BoardItem[];
  selectedItemId: string | null;
  onSelectItem: (itemId: string | null) => void;
};

export function WhiteboardCanvas({
  background,
  items,
  selectedItemId,
  onSelectItem,
}: WhiteboardCanvasProps) {
  return (
    <div
      className={`whiteboard whiteboard--${background}`}
      onClick={() => onSelectItem(null)}
      role="presentation"
    >
      <div className="whiteboard__placeholder">
        <h1>Fridgeboard</h1>
        <p>Base scaffold is ready.</p>
        <p>
          {items.length} item{items.length === 1 ? "" : "s"} in state
          {selectedItemId ? " and one selected." : "."}
        </p>
        <p>Next step is swapping this layer to react-konva for the MVP.</p>
      </div>
    </div>
  );
}
