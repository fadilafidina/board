import type { BoardItem, StickyColor, StickySize } from "../types";
import { getItemSize, getStickySizeDimensions } from "../types";
import { clamp, clampPosition, getNearestStickySize } from "./board-state";

export type ItemTransform = {
  height?: number;
  rotation?: number;
  width?: number;
  x: number;
  y: number;
};

export function moveBoardItem(
  items: BoardItem[],
  itemId: string,
  nextX: number,
  nextY: number,
) {
  return items.map((item) => {
    if (item.id !== itemId) {
      return item;
    }

    const { width, height } = getItemSize(item);
    const nextPosition = clampPosition(nextX, nextY, width, height);

    return {
      ...item,
      ...nextPosition,
    };
  });
}

export function transformBoardItem(
  items: BoardItem[],
  itemId: string,
  transform: ItemTransform,
) {
  return items.map((item) => {
    if (item.id !== itemId) {
      return item;
    }

    if (item.type === "sticky-note") {
      const width = clamp(transform.width ?? item.width, 140, 360);
      const height = clamp(transform.height ?? item.height, 120, 320);
      const nextPosition = clampPosition(transform.x, transform.y, width, height);

      return {
        ...item,
        ...nextPosition,
        width,
        height,
        size: getNearestStickySize(width),
        rotation: transform.rotation ?? item.rotation ?? 0,
      };
    }

    if (item.type === "sticker") {
      const width = clamp(transform.width ?? item.width, 52, 180);
      const height = clamp(transform.height ?? item.height, 52, 180);
      const nextPosition = clampPosition(transform.x, transform.y, width, height);

      return {
        ...item,
        ...nextPosition,
        width,
        height,
        rotation: transform.rotation ?? item.rotation ?? 0,
      };
    }

    if (item.type === "image") {
      const width = clamp(transform.width ?? item.width, 120, 420);
      const height = clamp(transform.height ?? item.height, 90, 320);
      const nextPosition = clampPosition(transform.x, transform.y, width, height);

      return {
        ...item,
        ...nextPosition,
        width,
        height,
        rotation: transform.rotation ?? item.rotation ?? 0,
      };
    }

    return item;
  });
}

export function updateBoardStickyText(
  items: BoardItem[],
  itemId: string,
  text: string,
) {
  return items.map((item) =>
    item.id === itemId && item.type === "sticky-note" ? { ...item, text } : item,
  );
}

export function updateBoardStickyColor(
  items: BoardItem[],
  itemId: string,
  color: StickyColor,
) {
  return items.map((item) =>
    item.id === itemId && item.type === "sticky-note" ? { ...item, color } : item,
  );
}

export function updateBoardStickySize(
  items: BoardItem[],
  itemId: string,
  size: StickySize,
) {
  return items.map((item) => {
    if (item.id !== itemId || item.type !== "sticky-note") {
      return item;
    }

    const { width, height } = getStickySizeDimensions(size);
    const nextPosition = clampPosition(item.x, item.y, width, height);

    return {
      ...item,
      ...nextPosition,
      size,
      width,
      height,
    };
  });
}

export function deleteBoardItem(items: BoardItem[], itemId: string) {
  return items.filter((item) => item.id !== itemId);
}

export function moveBoardLayer(
  items: BoardItem[],
  itemId: string,
  direction: "backward" | "forward",
) {
  const selectedIndex = items.findIndex((item) => item.id === itemId);

  if (selectedIndex < 0) {
    return items;
  }

  const nextIndex =
    direction === "forward"
      ? Math.min(selectedIndex + 1, items.length - 1)
      : Math.max(selectedIndex - 1, 0);

  if (nextIndex === selectedIndex) {
    return items;
  }

  const reordered = [...items];
  const [selected] = reordered.splice(selectedIndex, 1);
  reordered.splice(nextIndex, 0, selected);
  return reordered;
}
