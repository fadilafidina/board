import { useRef, useState } from "react";
import type { Group as KonvaGroup } from "konva/lib/Group";
import type { KonvaEventObject } from "konva/lib/Node";
import { Layer, Stage } from "react-konva";
import type { ItemTransform } from "../../lib/board-actions";
import type {
  BoardBackground,
  BoardItem,
  RemoteCursor,
  StickyNoteItem,
} from "../../types";
import { BOARD_HEIGHT, BOARD_WIDTH } from "../../types";
import { BoardBackground as CanvasBoardBackground } from "./BoardBackground";
import { BoardItemNode } from "./BoardItemNode";
import { BoardTransformer } from "./BoardTransformer";
import { StickyEditor } from "./StickyEditor";

type WhiteboardCanvasProps = {
  background: BoardBackground;
  editingStickyId: string | null;
  items: BoardItem[];
  onCursorLeave: () => void;
  onCursorMove: (cursor: { x: number; y: number }) => void;
  onMoveItem: (itemId: string, x: number, y: number) => void;
  onMovePreview?: (
    itemId: string,
    x: number,
    y: number,
    pointer: { x: number; y: number } | null,
  ) => void;
  onSelectItem: (itemId: string | null) => void;
  onStartStickyEditing: (itemId: string) => void;
  onStickyTextChange: (text: string) => void;
  onStopStickyEditing: () => void;
  onTransformItem: (itemId: string, transform: ItemTransform) => void;
  remoteCursors: RemoteCursor[];
  selectedItemId: string | null;
  selfCursorColor?: string;
  selfCursorName?: string;
  usePresenceCursor: boolean;
};

export function WhiteboardCanvas({
  background,
  editingStickyId,
  items,
  onCursorLeave,
  onCursorMove,
  onMoveItem,
  onMovePreview,
  onSelectItem,
  onStartStickyEditing,
  onStickyTextChange,
  onStopStickyEditing,
  onTransformItem,
  remoteCursors,
  selectedItemId,
  selfCursorColor = "#8b6850",
  selfCursorName = "You",
  usePresenceCursor,
}: WhiteboardCanvasProps) {
  const nodeMapRef = useRef<Record<string, KonvaGroup | null>>({});
  const [selfCursorPosition, setSelfCursorPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const selectedItem = items.find((item) => item.id === selectedItemId);
  const editingSticky =
    editingStickyId &&
    selectedItem?.type === "sticky-note" &&
    selectedItem.id === editingStickyId
      ? (selectedItem as StickyNoteItem)
      : null;
  const visibleCursors = selfCursorPosition
    ? [
        {
          clientId: "self-cursor",
          color: selfCursorColor,
          name: selfCursorName,
          x: selfCursorPosition.x,
          y: selfCursorPosition.y,
        } satisfies RemoteCursor,
        ...remoteCursors,
      ]
    : remoteCursors;

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

  function handleBoardPointerMove(
    event: KonvaEventObject<MouseEvent | TouchEvent>,
  ) {
    const pointerPosition = event.target.getStage()?.getPointerPosition();

    if (!pointerPosition) {
      return;
    }

    if (usePresenceCursor) {
      setSelfCursorPosition({
        x: pointerPosition.x,
        y: pointerPosition.y,
      });
    }

    onCursorMove({
      x: pointerPosition.x,
      y: pointerPosition.y,
    });
  }

  function handleItemMovePreview(
    itemId: string,
    x: number,
    y: number,
    pointer: { x: number; y: number } | null,
  ) {
    if (usePresenceCursor && pointer) {
      setSelfCursorPosition({
        x: pointer.x,
        y: pointer.y,
      });
    }

    onMovePreview?.(itemId, x, y, pointer);
  }

  return (
    <div
      className={`whiteboard whiteboard--${background}${
        usePresenceCursor ? " whiteboard--presence-cursor" : ""
      }`}
    >
      <Stage
        width={BOARD_WIDTH}
        height={BOARD_HEIGHT}
        className="whiteboard__stage"
        onMouseDown={handleBoardPointerDown}
        onMouseLeave={() => {
          setSelfCursorPosition(null);
          onCursorLeave();
        }}
        onMouseMove={handleBoardPointerMove}
        onTouchStart={handleBoardPointerDown}
        onTouchMove={handleBoardPointerMove}
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
              onMovePreview={handleItemMovePreview}
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

      {visibleCursors.map((cursor) => (
        <div
          key={cursor.clientId}
          className="presence-cursor"
          style={{
            left: cursor.x,
            top: cursor.y,
          }}
        >
          <svg
            aria-hidden="true"
            className="presence-cursor__pointer"
            viewBox="0 0 28 36"
            style={{ color: cursor.color }}
          >
            <path
              d="M3 2L3 30L10 22L15 34L20 32L15 20L25 20L3 2Z"
              fill="currentColor"
              stroke="rgba(255, 255, 255, 0.96)"
              strokeLinejoin="round"
              strokeWidth="2"
            />
          </svg>
          <span className="presence-cursor__label">{cursor.name}</span>
        </div>
      ))}
    </div>
  );
}
