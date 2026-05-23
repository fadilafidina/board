import type {
  BoardBackground,
  BoardItem,
  ImageItem,
  PinItem,
  StickerItem,
  StickerKind,
  StickyColor,
  StickyNoteItem,
  StickySize,
  TapeItem,
} from "../types";
import {
  BOARD_HEIGHT,
  BOARD_WIDTH,
  IMAGE_MAX_HEIGHT,
  IMAGE_MAX_WIDTH,
  STICKER_SIZE,
  getStickySizeDimensions,
} from "../types";

export const STORAGE_KEY = "fridgeboard-mvp-state";

export type PersistedState = {
  background: BoardBackground;
  items: BoardItem[];
};

type CreateStickyOptions = {
  color?: StickyColor;
  rotation?: number;
  size?: StickySize;
  text?: string;
  x?: number;
  y?: number;
};

type CreatePinOptions = {
  color?: string;
  rotation?: number;
  x?: number;
  y?: number;
};

type CreateStickerOptions = {
  color?: string;
  height?: number;
  rotation?: number;
  width?: number;
  x?: number;
  y?: number;
};

type CreateTapeOptions = {
  color?: string;
  rotation?: number;
  x?: number;
  y?: number;
};

type CreateImageOptions = {
  height: number;
  name: string;
  rotation?: number;
  src: string;
  width: number;
  x?: number;
  y?: number;
};

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function clampPosition(
  x: number,
  y: number,
  width: number,
  height: number,
) {
  return {
    x: clamp(x, 0, BOARD_WIDTH - width),
    y: clamp(y, 0, BOARD_HEIGHT - height),
  };
}

export function getRandomSpawnPosition(width: number, height: number) {
  const centerX = (BOARD_WIDTH - width) / 2;
  const centerY = (BOARD_HEIGHT - height) / 2;
  const jitterX = (Math.random() - 0.5) * 220;
  const jitterY = (Math.random() - 0.5) * 170;

  return clampPosition(centerX + jitterX, centerY + jitterY, width, height);
}

export function getNearestStickySize(width: number): StickySize {
  if (width <= 200) {
    return "small";
  }

  if (width >= 250) {
    return "large";
  }

  return "medium";
}

export function normalizeBackground(background: unknown): BoardBackground {
  if (background === "grid" || background === "dots" || background === "plain") {
    return background;
  }

  return "grid";
}

export function normalizeItem(
  item: BoardItem | Record<string, unknown>,
): BoardItem | null {
  if (!item || typeof item !== "object" || !("type" in item)) {
    return null;
  }

  if (item.type === "sticky-note") {
    const size =
      item.size === "small" || item.size === "medium" || item.size === "large"
        ? item.size
        : "medium";
    const dims = getStickySizeDimensions(size);
    const width = typeof item.width === "number" ? item.width : dims.width;
    const height = typeof item.height === "number" ? item.height : dims.height;

    return {
      color:
        item.color === "pale-cream" ||
        item.color === "butter" ||
        item.color === "pastel-blue" ||
        item.color === "pastel-green" ||
        item.color === "pastel-pink" ||
        item.color === "soft-beige"
          ? item.color
          : "butter",
      height,
      id: String(item.id ?? crypto.randomUUID()),
      rotation: typeof item.rotation === "number" ? item.rotation : 0,
      size: getNearestStickySize(width),
      text: typeof item.text === "string" ? item.text : "",
      type: "sticky-note",
      width,
      x: typeof item.x === "number" ? item.x : 0,
      y: typeof item.y === "number" ? item.y : 0,
    } satisfies StickyNoteItem;
  }

  if (item.type === "pin") {
    return {
      color: typeof item.color === "string" ? item.color : "#c96f5c",
      id: String(item.id ?? crypto.randomUUID()),
      kind: "round",
      rotation: typeof item.rotation === "number" ? item.rotation : 0,
      type: "pin",
      x: typeof item.x === "number" ? item.x : 0,
      y: typeof item.y === "number" ? item.y : 0,
    } satisfies PinItem;
  }

  if (item.type === "sticker") {
    return {
      color: typeof item.color === "string" ? item.color : "#efc068",
      height: typeof item.height === "number" ? item.height : STICKER_SIZE,
      id: String(item.id ?? crypto.randomUUID()),
      kind: item.kind === "heart" ? "heart" : "star",
      rotation: typeof item.rotation === "number" ? item.rotation : 0,
      type: "sticker",
      width: typeof item.width === "number" ? item.width : STICKER_SIZE,
      x: typeof item.x === "number" ? item.x : 0,
      y: typeof item.y === "number" ? item.y : 0,
    } satisfies StickerItem;
  }

  if (item.type === "tape") {
    return {
      color:
        typeof item.color === "string" ? item.color : "rgba(244, 232, 202, 0.72)",
      id: String(item.id ?? crypto.randomUUID()),
      kind: "strip",
      rotation: typeof item.rotation === "number" ? item.rotation : 0,
      type: "tape",
      x: typeof item.x === "number" ? item.x : 0,
      y: typeof item.y === "number" ? item.y : 0,
    } satisfies TapeItem;
  }

  if (item.type === "image" && typeof item.src === "string") {
    return {
      height: typeof item.height === "number" ? item.height : 180,
      id: String(item.id ?? crypto.randomUUID()),
      name: typeof item.name === "string" ? item.name : "Uploaded image",
      rotation: typeof item.rotation === "number" ? item.rotation : 0,
      src: item.src,
      type: "image",
      width: typeof item.width === "number" ? item.width : 240,
      x: typeof item.x === "number" ? item.x : 0,
      y: typeof item.y === "number" ? item.y : 0,
    } satisfies ImageItem;
  }

  return null;
}

export function createStickyNoteItem(options: CreateStickyOptions = {}) {
  const size = options.size ?? "small";
  const dimensions = getStickySizeDimensions(size);
  const position =
    typeof options.x === "number" && typeof options.y === "number"
      ? { x: options.x, y: options.y }
      : getRandomSpawnPosition(dimensions.width, dimensions.height);

  return {
    color: options.color ?? "butter",
    height: dimensions.height,
    id: crypto.randomUUID(),
    rotation: options.rotation ?? -2,
    size,
    text: options.text ?? "",
    type: "sticky-note",
    width: dimensions.width,
    x: position.x,
    y: position.y,
  } satisfies StickyNoteItem;
}

export function createPinItem(options: CreatePinOptions = {}) {
  const position =
    typeof options.x === "number" && typeof options.y === "number"
      ? { x: options.x, y: options.y }
      : getRandomSpawnPosition(32, 52);

  return {
    color: options.color ?? "#c96f5c",
    id: crypto.randomUUID(),
    kind: "round",
    rotation: options.rotation ?? 0,
    type: "pin",
    x: position.x,
    y: position.y,
  } satisfies PinItem;
}

export function createStickerItem(
  kind: StickerKind,
  options: CreateStickerOptions = {},
) {
  const width = options.width ?? STICKER_SIZE;
  const height = options.height ?? STICKER_SIZE;
  const position =
    typeof options.x === "number" && typeof options.y === "number"
      ? { x: options.x, y: options.y }
      : getRandomSpawnPosition(width, height);

  return {
    color: options.color ?? (kind === "heart" ? "#d9868c" : "#efc068"),
    height,
    id: crypto.randomUUID(),
    kind,
    rotation: options.rotation ?? (kind === "heart" ? -8 : 8),
    type: "sticker",
    width,
    x: position.x,
    y: position.y,
  } satisfies StickerItem;
}

export function createTapeItem(options: CreateTapeOptions = {}) {
  const position =
    typeof options.x === "number" && typeof options.y === "number"
      ? { x: options.x, y: options.y }
      : getRandomSpawnPosition(120, 30);

  return {
    color: options.color ?? "rgba(244, 232, 202, 0.72)",
    id: crypto.randomUUID(),
    kind: "strip",
    rotation: options.rotation ?? -9,
    type: "tape",
    x: position.x,
    y: position.y,
  } satisfies TapeItem;
}

export function createImageItem(options: CreateImageOptions) {
  const position =
    typeof options.x === "number" && typeof options.y === "number"
      ? { x: options.x, y: options.y }
      : getRandomSpawnPosition(options.width, options.height);

  return {
    height: options.height,
    id: crypto.randomUUID(),
    name: options.name,
    rotation: options.rotation ?? -2,
    src: options.src,
    type: "image",
    width: options.width,
    x: position.x,
    y: position.y,
  } satisfies ImageItem;
}

export function createSeedItems(): BoardItem[] {
  return [
    createStickyNoteItem({
      color: "pale-cream",
      rotation: -3,
      size: "small",
      text: "Pick up lemons and oat milk.",
      x: 450,
      y: 170,
    }),
    createPinItem({
      x: 606,
      y: 148,
    }),
    createStickerItem("star", {
      color: "#f0bf67",
      rotation: 8,
      x: 800,
      y: 280,
    }),
  ];
}

export function loadInitialState(): PersistedState {
  const fallbackState: PersistedState = {
    background: "grid",
    items: createSeedItems(),
  };

  const storedState = window.localStorage.getItem(STORAGE_KEY);

  if (!storedState) {
    return fallbackState;
  }

  try {
    const parsed = JSON.parse(storedState) as {
      background?: unknown;
      items?: Array<Record<string, unknown>>;
    };

    return {
      background: normalizeBackground(parsed.background),
      items:
        parsed.items
          ?.map((item) => normalizeItem(item))
          .filter((item): item is BoardItem => item !== null) ?? fallbackState.items,
    };
  } catch {
    return fallbackState;
  }
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("Could not read file."));
    };

    reader.onerror = () => reject(reader.error ?? new Error("Could not read file."));
    reader.readAsDataURL(file);
  });
}

export function prepareUploadedImage(file: File) {
  return new Promise<{ src: string; width: number; height: number }>(
    (resolve, reject) => {
      void readFileAsDataUrl(file)
        .then((fileSrc) => {
          const image = new window.Image();

          image.onload = () => {
            const displayScale = Math.min(
              IMAGE_MAX_WIDTH / image.width,
              IMAGE_MAX_HEIGHT / image.height,
              1,
            );
            const displayWidth = Math.round(image.width * displayScale);
            const displayHeight = Math.round(image.height * displayScale);

            const storageScale = Math.min(
              (IMAGE_MAX_WIDTH * 2) / image.width,
              (IMAGE_MAX_HEIGHT * 2) / image.height,
              1,
            );
            const storageWidth = Math.round(image.width * storageScale);
            const storageHeight = Math.round(image.height * storageScale);

            const canvas = document.createElement("canvas");
            canvas.width = storageWidth;
            canvas.height = storageHeight;

            const context = canvas.getContext("2d");

            if (!context) {
              reject(new Error("Could not prepare uploaded image."));
              return;
            }

            context.drawImage(image, 0, 0, storageWidth, storageHeight);

            resolve({
              src: canvas.toDataURL("image/jpeg", 0.82),
              width: displayWidth,
              height: displayHeight,
            });
          };

          image.onerror = () => reject(new Error("Could not load image."));
          image.src = fileSrc;
        })
        .catch(reject);
    },
  );
}
