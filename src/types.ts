export type BoardBackground = "grid" | "dots" | "plain";
export const BOARD_WIDTH = 1200;
export const BOARD_HEIGHT = 800;
export const PIN_WIDTH = 32;
export const PIN_HEIGHT = 52;
export const STICKER_SIZE = 92;
export const TAPE_WIDTH = 120;
export const TAPE_HEIGHT = 30;
export const IMAGE_MAX_WIDTH = 320;
export const IMAGE_MAX_HEIGHT = 240;

export type StickyColor =
  | "pale-cream"
  | "butter"
  | "soft-beige"
  | "pastel-blue"
  | "pastel-green"
  | "pastel-pink";
export type StickerKind = "star" | "heart";
export type StickySize = "small" | "medium" | "large";

type BaseItem = {
  id: string;
  x: number;
  y: number;
  rotation?: number;
};

export type StickyNoteItem = BaseItem & {
  type: "sticky-note";
  text: string;
  color: StickyColor;
  size: StickySize;
  width: number;
  height: number;
};

export type PinItem = BaseItem & {
  type: "pin";
  kind: "round";
  color: string;
};

export type StickerItem = BaseItem & {
  type: "sticker";
  kind: StickerKind;
  color: string;
  width: number;
  height: number;
};

export type TapeItem = BaseItem & {
  type: "tape";
  kind: "strip";
  color: string;
};

export type ImageItem = BaseItem & {
  type: "image";
  src: string;
  storagePath?: string;
  width: number;
  height: number;
  name: string;
};

export type BoardParticipant = {
  clientId: string;
  color: string;
  editingStickyId: string | null;
  name: string;
  selectedItemId: string | null;
};

export type RemoteCursor = {
  clientId: string;
  color: string;
  name: string;
  x: number;
  y: number;
};

export type BoardItem =
  | StickyNoteItem
  | PinItem
  | StickerItem
  | TapeItem
  | ImageItem;

export function getItemSize(item: BoardItem) {
  switch (item.type) {
    case "sticky-note":
      return { width: item.width, height: item.height };
    case "pin":
      return { width: PIN_WIDTH, height: PIN_HEIGHT };
    case "sticker":
      return { width: item.width, height: item.height };
    case "tape":
      return { width: TAPE_WIDTH, height: TAPE_HEIGHT };
    case "image":
      return { width: item.width, height: item.height };
  }
}

export function getStickySizeDimensions(size: StickySize) {
  switch (size) {
    case "small":
      return { width: 150, height: 118 };
    case "medium":
      return { width: 190, height: 148 };
    case "large":
      return { width: 240, height: 188 };
  }
}
