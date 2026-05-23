import type { Group as KonvaGroup } from "konva/lib/Group";
import type { KonvaEventObject } from "konva/lib/Node";
import { Group } from "react-konva";
import type { BoardItem } from "../../types";
import { getItemSize } from "../../types";
import { setCursor } from "./itemStyles";
import { ImageVisual } from "./items/ImageVisual";
import { PinVisual } from "./items/PinVisual";
import { StickerVisual } from "./items/StickerVisual";
import { StickyNoteVisual } from "./items/StickyNoteVisual";
import { TapeVisual } from "./items/TapeVisual";
import type { ItemTransform } from "../../lib/board-actions";

type BoardItemNodeProps = {
  isEditing: boolean;
  isSelected: boolean;
  item: BoardItem;
  onMove: (itemId: string, x: number, y: number) => void;
  onSelect: (itemId: string) => void;
  onStartStickyEditing: (itemId: string) => void;
  onTransform: (itemId: string, transform: ItemTransform) => void;
  registerNode: (itemId: string, node: KonvaGroup | null) => void;
};

export function BoardItemNode({
  isEditing,
  isSelected,
  item,
  onMove,
  onSelect,
  onStartStickyEditing,
  onTransform,
  registerNode,
}: BoardItemNodeProps) {
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
      {item.type === "sticky-note" ? (
        <StickyNoteVisual item={item} isSelected={isSelected} isEditing={isEditing} />
      ) : null}
      {item.type === "pin" ? <PinVisual item={item} isSelected={isSelected} /> : null}
      {item.type === "sticker" ? (
        <StickerVisual item={item} isSelected={isSelected} />
      ) : null}
      {item.type === "tape" ? <TapeVisual item={item} isSelected={isSelected} /> : null}
      {item.type === "image" ? <ImageVisual item={item} isSelected={isSelected} /> : null}
    </Group>
  );
}
