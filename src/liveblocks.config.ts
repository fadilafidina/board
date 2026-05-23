import type { LiveList, LiveObject } from "@liveblocks/client";
import type { BoardBackground, BoardItem } from "./types";

export type BoardPresence = {
  color: string;
  cursor: { x: number; y: number } | null;
  draggingItem: { itemId: string; x: number; y: number } | null;
  editingStickyId: string | null;
  name: string;
  selectedItemId: string | null;
};

declare global {
  interface Liveblocks {
    Presence: BoardPresence;
    Storage: {
      background: BoardBackground;
      items: LiveList<LiveObject<BoardItem>>;
    };
  }
}

export {};
