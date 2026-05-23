import { useRef } from "react";
import type { Group as KonvaGroup } from "konva/lib/Group";
import type { KonvaEventObject } from "konva/lib/Node";
import { Layer, Stage } from "react-konva";
import type { ItemTransform } from "../../lib/board-actions";
import type { BoardBackground, BoardItem, StickyNoteItem } from "../../types";
import { BOARD_HEIGHT, BOARD_WIDTH } from "../../types";
import { BoardBackground as CanvasBoardBackground } from "./BoardBackground";
import { BoardItemNode } from "./BoardItemNode";
import { BoardTransformer } from "./BoardTransformer";
import { StickyEditor } from "./StickyEditor";

type WhiteboardCanvasProps = {
  background: BoardBackground;
  editingStickyId: string | null;
  items: BoardItem[];
  onMoveItem: (itemId: string, x: number, y: number) => void;
  onSelectItem: (itemId: string | null) => void;
  onStartStickyEditing: (itemId: string) => void;
  onStickyTextChange: (text: string) => void;
  onStopStickyEditing: () => void;
  onTransformItem: (itemId: string, transform: ItemTransform) => void;
  selectedItemId: string | null;
};

export function WhiteboardCanvas({
  background,
  editingStickyId,
  items,
  onMoveItem,
  onSelectItem,
  onStartStickyEditing,
  onStickyTextChange,
  onStopStickyEditing,
  onTransformItem,
  selectedItemId,
}: WhiteboardCanvasProps) {
  const nodeMapRef = useRef<Record<string, KonvaGroup | null>>({});
  const selectedItem = items.find((item) => item.id === selectedItemId);
  const editingSticky =
    editingStickyId &&
    selectedItem?.type === "sticky-note" &&
    selectedItem.id === editingStickyId
      ? (selectedItem as StickyNoteItem)
      : null;

  function handleBoardPointerDown(
    event: KonvaEventObject<MouseEvent | TouchEvent>,
  ) {
    const target = event.target;

    if (target === target.getStage() || target.name() === "board-hit-area") {
      onSelectItem(null);
      onStopStickyEditing();
    }
  }

  function registerNode(itemId: string, node: KonvaGroup | null) {
    nodeMapRef.current[itemId] = node;
  }

  return (
    <div className={`whiteboard whiteboard--${background}`}>
      <Stage
        width={BOARD_WIDTH}
        height={BOARD_HEIGHT}
        className="whiteboard__stage"
        onMouseDown={handleBoardPointerDown}
        onTouchStart={handleBoardPointerDown}
      >
        <Layer>
          <CanvasBoardBackground />

          {items.map((item) => (
            <BoardItemNode
              key={item.id}
              item={item}
              isEditing={editingStickyId === item.id}
              isSelected={selectedItemId === item.id}
              onMove={onMoveItem}
              onSelect={onSelectItem}
              onStartStickyEditing={onStartStickyEditing}
              onTransform={onTransformItem}
              registerNode={registerNode}
            />
          ))}

          <BoardTransformer
            nodeMapRef={nodeMapRef}
            selectedItem={selectedItem}
            selectedItemId={selectedItemId}
          />
        </Layer>
      </Stage>

      <StickyEditor
        sticky={editingSticky}
        onChange={onStickyTextChange}
        onStopEditing={onStopStickyEditing}
      />
    </div>
  );
}
