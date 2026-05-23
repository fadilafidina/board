import { useEffect, useMemo, useRef, useState } from "react";
import type { Group as KonvaGroup } from "konva/lib/Group";
import type { KonvaEventObject } from "konva/lib/Node";
import type { Transformer as KonvaTransformer } from "konva/lib/shapes/Transformer";
import {
  Circle,
  Group,
  Image as KonvaImage,
  Layer,
  Line,
  Path,
  Rect,
  Stage,
  Star,
  Text,
  Transformer,
} from "react-konva";
import type {
  BoardBackground,
  BoardItem,
  ImageItem,
  StickyNoteItem,
} from "../types";
import {
  BOARD_HEIGHT,
  BOARD_WIDTH,
  PIN_HEIGHT,
  PIN_WIDTH,
  TAPE_HEIGHT,
  TAPE_WIDTH,
  getItemSize,
} from "../types";

type ItemTransform = {
  height?: number;
  rotation?: number;
  width?: number;
  x: number;
  y: number;
};

type WhiteboardCanvasProps = {
  background: BoardBackground;
  items: BoardItem[];
  selectedItemId: string | null;
  editingStickyId: string | null;
  onMoveItem: (itemId: string, x: number, y: number) => void;
  onSelectItem: (itemId: string | null) => void;
  onStartStickyEditing: (itemId: string) => void;
  onStickyTextChange: (text: string) => void;
  onStopStickyEditing: () => void;
  onTransformItem: (itemId: string, transform: ItemTransform) => void;
};

const stickyPalette = {
  "pale-cream": {
    fill: "#f8f1dd",
    edge: "#d8c499",
    fold: "#f0e0ba",
    text: "#564635",
  },
  butter: {
    fill: "#f5e198",
    edge: "#dcc26f",
    fold: "#edd37d",
    text: "#58452f",
  },
  "soft-beige": {
    fill: "#ead9c6",
    edge: "#ccb196",
    fold: "#dfc8b0",
    text: "#59473a",
  },
} as const;

const heartPath =
  "M50 88 C18 68 6 42 20 22 C31 7 53 10 62 27 C71 10 93 7 104 22 C118 42 106 68 74 88 Z";

function setCursor(cursor: string) {
  document.body.style.cursor = cursor;
}

function useLoadedImage(src: string | undefined) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!src) {
      setImage(null);
      return;
    }

    const nextImage = new window.Image();
    nextImage.onload = () => setImage(nextImage);
    nextImage.src = src;

    return () => {
      nextImage.onload = null;
    };
  }, [src]);

  return image;
}

function withSelectionShadow(isSelected: boolean) {
  return isSelected
    ? {
        shadowColor: "rgba(92, 71, 47, 0.34)",
        shadowBlur: 20,
        shadowOffsetY: 7,
        shadowOpacity: 1,
      }
    : {
        shadowColor: "rgba(92, 71, 47, 0.14)",
        shadowBlur: 10,
        shadowOffsetY: 4,
        shadowOpacity: 0.65,
      };
}

function isTransformable(item: BoardItem | undefined) {
  return (
    item?.type === "sticky-note" ||
    item?.type === "sticker" ||
    item?.type === "image"
  );
}

function renderSticky(
  item: StickyNoteItem,
  isSelected: boolean,
  isEditing: boolean,
) {
  const palette = stickyPalette[item.color];
  const selectionTone = isSelected ? "#8c6950" : palette.edge;
  const notePadding = Math.max(14, item.width * 0.08);
  const fontSize = Math.max(16, Math.min(23, item.width / 10));

  return (
    <>
      <Rect
        width={item.width}
        height={item.height}
        cornerRadius={22}
        fill={palette.fill}
        stroke={selectionTone}
        strokeWidth={isSelected ? 3 : 1.6}
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
        opacity={0.92}
      />
      {!isEditing ? (
        <Text
          x={notePadding}
          y={18}
          width={item.width - notePadding * 2}
          height={item.height - 32}
          text={item.text}
          fill={palette.text}
          fontSize={fontSize}
          fontFamily="Avenir Next, Segoe UI, sans-serif"
          lineHeight={1.35}
          ellipsis
        />
      ) : null}
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
        opacity={0.72}
      />
      <Circle
        x={PIN_WIDTH / 2}
        y={12}
        radius={12}
        fill={item.color}
        stroke={isSelected ? "#7d463c" : "#9c6255"}
        strokeWidth={isSelected ? 2.6 : 1.5}
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

  const centerX = item.width / 2;
  const centerY = item.height / 2;
  const outerRadius = Math.min(item.width, item.height) * 0.38;
  const innerRadius = outerRadius * 0.52;

  if (item.kind === "star") {
    return (
      <Star
        x={centerX}
        y={centerY}
        numPoints={5}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
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
      x={item.width * 0.1}
      y={item.height * 0.1}
      scaleX={item.width / 120}
      scaleY={item.height / 100}
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
        stroke={isSelected ? "rgba(138, 110, 81, 0.7)" : "rgba(255,255,255,0.5)"}
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

function BoardImage({
  isSelected,
  item,
}: {
  isSelected: boolean;
  item: ImageItem;
}) {
  const image = useLoadedImage(item.src);

  return (
    <>
      <Rect
        width={item.width}
        height={item.height}
        cornerRadius={18}
        fill="#f8f4ef"
        stroke={isSelected ? "#8a6850" : "rgba(135, 108, 83, 0.2)"}
        strokeWidth={isSelected ? 3 : 1.2}
        {...withSelectionShadow(isSelected)}
      />
      {image ? (
        <KonvaImage
          image={image}
          width={item.width}
          height={item.height}
          cornerRadius={18}
        />
      ) : null}
    </>
  );
}

function BoardItemNode({
  item,
  isEditing,
  isSelected,
  onMove,
  onSelect,
  onStartStickyEditing,
  onTransform,
  registerNode,
}: {
  item: BoardItem;
  isEditing: boolean;
  isSelected: boolean;
  onMove: (itemId: string, x: number, y: number) => void;
  onSelect: (itemId: string) => void;
  onStartStickyEditing: (itemId: string) => void;
  onTransform: (itemId: string, transform: ItemTransform) => void;
  registerNode: (itemId: string, node: KonvaGroup | null) => void;
}) {
  const { width, height } = getItemSize(item);

  function handlePointerDown(event: KonvaEventObject<MouseEvent | TouchEvent>) {
    event.cancelBubble = true;
    onSelect(item.id);
  }

  function handleDoubleClick(event: KonvaEventObject<MouseEvent>) {
    event.cancelBubble = true;

    if (item.type === "sticky-note") {
      onStartStickyEditing(item.id);
    }
  }

  function handleDragStart() {
    setCursor("grabbing");
    onSelect(item.id);
  }

  function handleDragEnd(event: KonvaEventObject<DragEvent>) {
    setCursor("grab");
    onMove(item.id, event.target.x() - width / 2, event.target.y() - height / 2);
  }

  function handleTransformEnd(event: KonvaEventObject<Event>) {
    const node = event.target as KonvaGroup;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    const nextWidth = width * scaleX;
    const nextHeight = height * scaleY;

    node.scaleX(1);
    node.scaleY(1);

    onTransform(item.id, {
      x: node.x() - nextWidth / 2,
      y: node.y() - nextHeight / 2,
      width: nextWidth,
      height: nextHeight,
      rotation: node.rotation(),
    });
  }

  return (
    <Group
      ref={(node) => registerNode(item.id, node)}
      x={item.x + width / 2}
      y={item.y + height / 2}
      offsetX={width / 2}
      offsetY={height / 2}
      rotation={item.rotation ?? 0}
      draggable={!isEditing}
      onDblClick={handleDoubleClick}
      onDragEnd={handleDragEnd}
      onDragStart={handleDragStart}
      onMouseDown={handlePointerDown}
      onMouseEnter={() => setCursor("grab")}
      onMouseLeave={() => setCursor("default")}
      onTouchStart={handlePointerDown}
      onTransformEnd={handleTransformEnd}
    >
      {item.type === "sticky-note"
        ? renderSticky(item, isSelected, isEditing)
        : null}
      {renderPin(item, isSelected)}
      {renderSticker(item, isSelected)}
      {renderTape(item, isSelected)}
      {item.type === "image" ? (
        <BoardImage item={item} isSelected={isSelected} />
      ) : null}
    </Group>
  );
}

export function WhiteboardCanvas({
  background,
  items,
  selectedItemId,
  editingStickyId,
  onMoveItem,
  onSelectItem,
  onStartStickyEditing,
  onStickyTextChange,
  onStopStickyEditing,
  onTransformItem,
}: WhiteboardCanvasProps) {
  const nodeMapRef = useRef<Record<string, KonvaGroup | null>>({});
  const transformerRef = useRef<KonvaTransformer | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const selectedItem = items.find((item) => item.id === selectedItemId);
  const editingSticky =
    editingStickyId && selectedItem?.type === "sticky-note" && selectedItem.id === editingStickyId
      ? selectedItem
      : null;

  const transformerConfig = useMemo(() => {
    if (!selectedItem || !isTransformable(selectedItem)) {
      return null;
    }

    if (selectedItem.type === "sticky-note") {
      return {
        enabledAnchors: [
          "top-left",
          "top-right",
          "bottom-left",
          "bottom-right",
          "middle-left",
          "middle-right",
          "top-center",
          "bottom-center",
        ],
        keepRatio: false,
      };
    }

    return {
      enabledAnchors: ["top-left", "top-right", "bottom-left", "bottom-right"],
      keepRatio: true,
    };
  }, [selectedItem]);

  useEffect(() => {
    if (!transformerRef.current) {
      return;
    }

    if (!selectedItemId || !selectedItem || !isTransformable(selectedItem)) {
      transformerRef.current.nodes([]);
      transformerRef.current.getLayer()?.batchDraw();
      return;
    }

    const node = nodeMapRef.current[selectedItemId];

    if (!node) {
      return;
    }

    transformerRef.current.nodes([node]);
    transformerRef.current.getLayer()?.batchDraw();
  }, [selectedItem, selectedItemId]);

  useEffect(() => {
    if (editingSticky && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(
        textareaRef.current.value.length,
        textareaRef.current.value.length,
      );
    }
  }, [editingSticky]);

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
          <Rect
            name="board-hit-area"
            width={BOARD_WIDTH}
            height={BOARD_HEIGHT}
            fill="rgba(0,0,0,0.001)"
            cornerRadius={32}
          />

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

          {transformerConfig ? (
            <Transformer
              ref={transformerRef}
              enabledAnchors={transformerConfig.enabledAnchors}
              keepRatio={transformerConfig.keepRatio}
              rotateEnabled
              rotateAnchorOffset={36}
              anchorCornerRadius={10}
              anchorSize={12}
              borderDash={[5, 5]}
              borderStroke="#81624d"
              anchorFill="#fffaf2"
              anchorStroke="#81624d"
              anchorStrokeWidth={1.5}
              padding={8}
            />
          ) : null}
        </Layer>
      </Stage>

      {editingSticky ? (
        <textarea
          ref={textareaRef}
          className="sticky-editor"
          value={editingSticky.text}
          onBlur={onStopStickyEditing}
          onChange={(event) => onStickyTextChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.preventDefault();
              onStopStickyEditing();
            }
          }}
          onMouseDown={(event) => event.stopPropagation()}
          style={{
            left: editingSticky.x + 16,
            top: editingSticky.y + 18,
            width: editingSticky.width - 32,
            height: editingSticky.height - 34,
            transform: `rotate(${editingSticky.rotation ?? 0}deg)`,
          }}
        />
      ) : null}
    </div>
  );
}
