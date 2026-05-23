import type { KonvaEventObject } from "konva/lib/Node";
import {
  Circle,
  Group,
  Layer,
  Line,
  Path,
  Rect,
  Stage,
  Star,
  Text,
} from "react-konva";
import type { BoardBackground, BoardItem, StickyNoteItem } from "../types";
import {
  BOARD_HEIGHT,
  BOARD_WIDTH,
  PIN_HEIGHT,
  PIN_WIDTH,
  STICKER_SIZE,
  TAPE_HEIGHT,
  TAPE_WIDTH,
  getItemSize,
} from "../types";

type WhiteboardCanvasProps = {
  background: BoardBackground;
  items: BoardItem[];
  selectedItemId: string | null;
  onSelectItem: (itemId: string | null) => void;
  onMoveItem: (itemId: string, x: number, y: number) => void;
};

const stickyPalette = {
  "pale-cream": {
    fill: "#f7edd4",
    edge: "#dcc8a0",
    fold: "#f0dfb9",
    text: "#5a4a39",
  },
  butter: {
    fill: "#f5df96",
    edge: "#e1c06a",
    fold: "#edd17a",
    text: "#59452f",
  },
  "soft-beige": {
    fill: "#ead7bf",
    edge: "#ceb091",
    fold: "#ddc4a5",
    text: "#5f4e41",
  },
} as const;

const boardAccent = {
  cream: "#f5ecd8",
  "soft-white": "#f8f5ee",
  "warm-gray": "#ece6dd",
} as const;

const heartPath =
  "M50 88 C18 68 6 42 20 22 C31 7 53 10 62 27 C71 10 93 7 104 22 C118 42 106 68 74 88 Z";

function setCursor(cursor: string) {
  document.body.style.cursor = cursor;
}

function withSelectionShadow(isSelected: boolean) {
  return isSelected
    ? {
        shadowColor: "rgba(92, 71, 47, 0.3)",
        shadowBlur: 18,
        shadowOffsetY: 6,
        shadowOpacity: 1,
      }
    : {
        shadowColor: "rgba(92, 71, 47, 0.15)",
        shadowBlur: 10,
        shadowOffsetY: 4,
        shadowOpacity: 0.65,
      };
}

function renderSticky(item: StickyNoteItem, isSelected: boolean) {
  const palette = stickyPalette[item.color];
  const selectionTone = isSelected ? "#977454" : palette.edge;

  return (
    <>
      <Rect
        width={item.width}
        height={item.height}
        cornerRadius={22}
        fill={palette.fill}
        stroke={selectionTone}
        strokeWidth={isSelected ? 2.5 : 1.6}
        {...withSelectionShadow(isSelected)}
      />
      <Line
        points={[
          item.width - 42,
          0,
          item.width,
          0,
          item.width,
          42,
        ]}
        closed
        fill={palette.fold}
        opacity={0.9}
      />
      <Text
        x={18}
        y={20}
        width={item.width - 34}
        height={item.height - 34}
        text={item.text}
        fill={palette.text}
        fontSize={23}
        fontFamily="Avenir Next, Segoe UI, sans-serif"
        lineHeight={1.35}
      />
    </>
  );
}

function renderPin(item: BoardItem, isSelected: boolean) {
  if (item.type !== "pin") {
    return null;
  }

  return (
    <>
      <Line
        points={[PIN_WIDTH / 2, 16, PIN_WIDTH / 2, PIN_HEIGHT - 7]}
        stroke={isSelected ? "#8d6453" : "#8b7768"}
        strokeWidth={4}
        lineCap="round"
        opacity={0.7}
      />
      <Circle
        x={PIN_WIDTH / 2}
        y={12}
        radius={12}
        fill={item.color}
        stroke={isSelected ? "#8d4e42" : "#9c6255"}
        strokeWidth={isSelected ? 2.5 : 1.5}
        {...withSelectionShadow(isSelected)}
      />
      <Circle
        x={PIN_WIDTH / 2 - 3}
        y={8}
        radius={3.2}
        fill="rgba(255,255,255,0.6)"
      />
    </>
  );
}

function renderSticker(item: BoardItem, isSelected: boolean) {
  if (item.type !== "sticker") {
    return null;
  }

  const center = STICKER_SIZE / 2;

  if (item.kind === "star") {
    return (
      <Star
        x={center}
        y={center}
        numPoints={5}
        innerRadius={18}
        outerRadius={34}
        fill={item.color}
        stroke="#fffdf8"
        strokeWidth={isSelected ? 8 : 6}
        {...withSelectionShadow(isSelected)}
      />
    );
  }

  return (
    <Path
      data={heartPath}
      x={13}
      y={10}
      scaleX={0.62}
      scaleY={0.62}
      fill={item.color}
      stroke="#fffdf8"
      strokeWidth={isSelected ? 8 : 6}
      {...withSelectionShadow(isSelected)}
    />
  );
}

function renderTape(item: BoardItem, isSelected: boolean) {
  if (item.type !== "tape") {
    return null;
  }

  return (
    <>
      <Rect
        width={TAPE_WIDTH}
        height={TAPE_HEIGHT}
        cornerRadius={9}
        fill={item.color}
        stroke={isSelected ? "rgba(138, 110, 81, 0.65)" : "rgba(255,255,255,0.5)"}
        strokeWidth={isSelected ? 2 : 1}
        opacity={0.92}
        {...withSelectionShadow(isSelected)}
      />
      <Rect
        x={12}
        y={4}
        width={TAPE_WIDTH - 24}
        height={6}
        cornerRadius={4}
        fill="rgba(255,255,255,0.22)"
      />
      <Line
        points={[8, TAPE_HEIGHT - 5, TAPE_WIDTH - 8, TAPE_HEIGHT - 5]}
        stroke="rgba(220, 199, 157, 0.55)"
        strokeWidth={1.5}
      />
    </>
  );
}

function BoardItemNode({
  item,
  isSelected,
  onSelect,
  onMove,
}: {
  item: BoardItem;
  isSelected: boolean;
  onSelect: (itemId: string) => void;
  onMove: (itemId: string, x: number, y: number) => void;
}) {
  const { width, height } = getItemSize(item);

  function handlePointerDown(event: KonvaEventObject<MouseEvent | TouchEvent>) {
    event.cancelBubble = true;
    onSelect(item.id);
  }

  function handleDragStart() {
    setCursor("grabbing");
    onSelect(item.id);
  }

  function handleDragEnd(event: KonvaEventObject<DragEvent>) {
    setCursor("grab");
    onMove(item.id, event.target.x() - width / 2, event.target.y() - height / 2);
  }

  function handlePointerEnter() {
    setCursor("grab");
  }

  function handlePointerLeave() {
    setCursor("default");
  }

  return (
    <Group
      x={item.x + width / 2}
      y={item.y + height / 2}
      offsetX={width / 2}
      offsetY={height / 2}
      rotation={item.rotation ?? 0}
      draggable
      onMouseDown={handlePointerDown}
      onTouchStart={handlePointerDown}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onMouseEnter={handlePointerEnter}
      onMouseLeave={handlePointerLeave}
    >
      {item.type === "sticky-note" ? renderSticky(item, isSelected) : null}
      {renderPin(item, isSelected)}
      {renderSticker(item, isSelected)}
      {renderTape(item, isSelected)}
    </Group>
  );
}

export function WhiteboardCanvas({
  background,
  items,
  selectedItemId,
  onSelectItem,
  onMoveItem,
}: WhiteboardCanvasProps) {
  function handleBoardPointerDown(
    event: KonvaEventObject<MouseEvent | TouchEvent>,
  ) {
    const target = event.target;

    if (target === target.getStage() || target.name() === "board-hit-area") {
      onSelectItem(null);
    }
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
          <Rect
            name="board-hit-area"
            width={BOARD_WIDTH}
            height={BOARD_HEIGHT}
            fill="rgba(0,0,0,0.001)"
            cornerRadius={32}
          />

          <Rect
            x={32}
            y={36}
            width={182}
            height={24}
            cornerRadius={12}
            fill="rgba(255,255,255,0.22)"
            listening={false}
          />
          <Rect
            x={244}
            y={94}
            width={136}
            height={18}
            cornerRadius={10}
            fill={boardAccent[background]}
            opacity={0.3}
            listening={false}
          />
          <Rect
            x={890}
            y={118}
            width={154}
            height={18}
            cornerRadius={10}
            fill="rgba(255,255,255,0.18)"
            listening={false}
          />

          {items.map((item) => (
            <BoardItemNode
              key={item.id}
              item={item}
              isSelected={selectedItemId === item.id}
              onSelect={onSelectItem}
              onMove={onMoveItem}
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
}
