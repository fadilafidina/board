export type BoardBackground = "cream" | "soft-white" | "warm-gray";

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
