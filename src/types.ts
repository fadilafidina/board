export type BoardBackground = "cream" | "soft-white" | "warm-gray";
export const BOARD_WIDTH = 1200;
export const BOARD_HEIGHT = 800;
export const PIN_WIDTH = 32;
export const PIN_HEIGHT = 52;
export const STICKER_SIZE = 92;
export const TAPE_WIDTH = 120;
export const TAPE_HEIGHT = 30;

export type StickyColor = "pale-cream" | "butter" | "soft-beige";
export type StickerKind = "star" | "heart";

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
};

export type TapeItem = BaseItem & {
  type: "tape";
  kind: "strip";
  color: string;
};

export type BoardItem = StickyNoteItem | PinItem | StickerItem | TapeItem;

export function getItemSize(item: BoardItem) {
  switch (item.type) {
    case "sticky-note":
      return { width: item.width, height: item.height };
    case "pin":
      return { width: PIN_WIDTH, height: PIN_HEIGHT };
    case "sticker":
      return { width: STICKER_SIZE, height: STICKER_SIZE };
    case "tape":
      return { width: TAPE_WIDTH, height: TAPE_HEIGHT };
  }
}
