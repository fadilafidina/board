import { useEffect, useMemo, useState } from "react";
import { Toolbar } from "./components/Toolbar";
import { WhiteboardCanvas } from "./components/WhiteboardCanvas";
import type {
  BoardBackground,
  BoardItem,
  ImageItem,
  PinItem,
  StickerItem,
  StickyColor,
  StickyNoteItem,
  StickySize,
  TapeItem,
} from "./types";
import {
  BOARD_HEIGHT,
  BOARD_WIDTH,
  IMAGE_MAX_HEIGHT,
  IMAGE_MAX_WIDTH,
  STICKER_SIZE,
  getItemSize,
  getStickySizeDimensions,
} from "./types";

const STORAGE_KEY = "fridgeboard-mvp-state";

type PersistedState = {
  background: BoardBackground;
  items: BoardItem[];
};

type ItemTransform = {
  height?: number;
  rotation?: number;
  width?: number;
  x: number;
  y: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function clampPosition(x: number, y: number, width: number, height: number) {
  return {
    x: clamp(x, 0, BOARD_WIDTH - width),
    y: clamp(y, 0, BOARD_HEIGHT - height),
  };
}

function getNearestStickySize(width: number): StickySize {
  if (width <= 200) {
    return "small";
  }

  if (width >= 250) {
    return "large";
  }

  return "medium";
}

function normalizeBackground(background: unknown): BoardBackground {
  if (background === "grid" || background === "dots" || background === "plain") {
    return background;
  }

  return "grid";
}

function normalizeItem(item: BoardItem | Record<string, unknown>): BoardItem | null {
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

function createSeedItems(): BoardItem[] {
  const starterSticky = getStickySizeDimensions("medium");

  return [
    {
      id: crypto.randomUUID(),
      type: "sticky-note",
      x: 450,
      y: 170,
      ...starterSticky,
      text: "Pick up lemons and oat milk.",
      color: "pale-cream",
      size: "medium",
      rotation: -3,
    } satisfies StickyNoteItem,
    {
      id: crypto.randomUUID(),
      type: "pin",
      x: 606,
      y: 148,
      kind: "round",
      color: "#c96f5c",
      rotation: 0,
    } satisfies PinItem,
    {
      id: crypto.randomUUID(),
      type: "sticker",
      x: 800,
      y: 280,
      kind: "star",
      color: "#f0bf67",
      width: STICKER_SIZE,
      height: STICKER_SIZE,
      rotation: 8,
    } satisfies StickerItem,
  ];
}

function loadInitialState(): PersistedState {
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

function prepareUploadedImage(file: File) {
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

export default function App() {
  const initialState = useMemo(() => loadInitialState(), []);
  const [items, setItems] = useState<BoardItem[]>(initialState.items);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [editingStickyId, setEditingStickyId] = useState<string | null>(null);
  const [persistenceWarning, setPersistenceWarning] = useState<string | null>(null);
  const [background, setBackground] = useState<BoardBackground>(
    initialState.background,
  );

  useEffect(() => {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          background,
          items,
        } satisfies PersistedState),
      );
      setPersistenceWarning(null);
    } catch {
      setPersistenceWarning(
        "This board is too large to fully save locally right now.",
      );
    }
  }, [background, items]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const activeElement = document.activeElement;
      const isEditingField =
        activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLTextAreaElement ||
        activeElement instanceof HTMLSelectElement;

      if (isEditingField) {
        return;
      }

      if ((event.key === "Backspace" || event.key === "Delete") && selectedItemId) {
        event.preventDefault();
        setItems((currentItems) =>
          currentItems.filter((item) => item.id !== selectedItemId),
        );
        setSelectedItemId(null);
        setEditingStickyId(null);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedItemId]);

  const selectedIndex = items.findIndex((item) => item.id === selectedItemId);
  const selectedItem = selectedIndex >= 0 ? items[selectedIndex] : undefined;

  function selectItem(itemId: string | null) {
    setSelectedItemId(itemId);

    if (itemId !== editingStickyId) {
      setEditingStickyId(null);
    }
  }

  function updateItems(updater: (currentItems: BoardItem[]) => BoardItem[]) {
    setItems((currentItems) => updater(currentItems));
  }

  function moveItem(itemId: string, nextX: number, nextY: number) {
    updateItems((currentItems) =>
      currentItems.map((item) => {
        if (item.id !== itemId) {
          return item;
        }

        const { width, height } = getItemSize(item);
        const nextPosition = clampPosition(nextX, nextY, width, height);

        return {
          ...item,
          ...nextPosition,
        };
      }),
    );
  }

  function updateItemTransform(itemId: string, transform: ItemTransform) {
    updateItems((currentItems) =>
      currentItems.map((item) => {
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
      }),
    );
  }

  function updateStickyText(text: string) {
    if (!selectedItemId) {
      return;
    }

    updateItems((currentItems) =>
      currentItems.map((item) =>
        item.id === selectedItemId && item.type === "sticky-note"
          ? { ...item, text }
          : item,
      ),
    );
  }

  function updateStickyColor(color: StickyColor) {
    if (!selectedItemId) {
      return;
    }

    updateItems((currentItems) =>
      currentItems.map((item) =>
        item.id === selectedItemId && item.type === "sticky-note"
          ? { ...item, color }
          : item,
      ),
    );
  }

  function updateStickySize(size: StickySize) {
    if (!selectedItemId) {
      return;
    }

    updateItems((currentItems) =>
      currentItems.map((item) => {
        if (item.id !== selectedItemId || item.type !== "sticky-note") {
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
      }),
    );
  }

  function addStickyNote() {
    const dimensions = getStickySizeDimensions("medium");
    const stickyNote: StickyNoteItem = {
      id: crypto.randomUUID(),
      type: "sticky-note",
      x: BOARD_WIDTH / 2 - dimensions.width / 2,
      y: BOARD_HEIGHT / 2 - dimensions.height / 2,
      ...dimensions,
      text: "New note",
      color: "butter",
      size: "medium",
      rotation: -4,
    };

    updateItems((currentItems) => [...currentItems, stickyNote]);
    setSelectedItemId(stickyNote.id);
    setEditingStickyId(stickyNote.id);
  }

  function addPin() {
    const pin: PinItem = {
      id: crypto.randomUUID(),
      type: "pin",
      x: BOARD_WIDTH / 2 - 16,
      y: BOARD_HEIGHT / 2 - 130,
      kind: "round",
      color: "#d27863",
    };

    updateItems((currentItems) => [...currentItems, pin]);
    setSelectedItemId(pin.id);
    setEditingStickyId(null);
  }

  function addSticker(kind: StickerItem["kind"]) {
    const sticker: StickerItem = {
      id: crypto.randomUUID(),
      type: "sticker",
      x: BOARD_WIDTH / 2 + 70,
      y: BOARD_HEIGHT / 2 - 70,
      kind,
      color: kind === "star" ? "#efc068" : "#d9868c",
      width: STICKER_SIZE,
      height: STICKER_SIZE,
      rotation: kind === "star" ? -5 : 6,
    };

    updateItems((currentItems) => [...currentItems, sticker]);
    setSelectedItemId(sticker.id);
    setEditingStickyId(null);
  }

  function addTape() {
    const tape: TapeItem = {
      id: crypto.randomUUID(),
      type: "tape",
      x: BOARD_WIDTH / 2 - 60,
      y: BOARD_HEIGHT / 2 - 150,
      kind: "strip",
      color: "rgba(244, 232, 202, 0.72)",
      rotation: -10,
    };

    updateItems((currentItems) => [...currentItems, tape]);
    setSelectedItemId(tape.id);
    setEditingStickyId(null);
  }

  async function addUploadedImage(file: File) {
    const preparedImage = await prepareUploadedImage(file);
    const imageItem: ImageItem = {
      id: crypto.randomUUID(),
      type: "image",
      name: file.name,
      src: preparedImage.src,
      width: preparedImage.width,
      height: preparedImage.height,
      x: BOARD_WIDTH / 2 - preparedImage.width / 2,
      y: BOARD_HEIGHT / 2 - preparedImage.height / 2,
      rotation: -2,
    };

    updateItems((currentItems) => [...currentItems, imageItem]);
    setSelectedItemId(imageItem.id);
    setEditingStickyId(null);
  }

  function deleteSelectedItem() {
    if (!selectedItemId) {
      return;
    }

    updateItems((currentItems) =>
      currentItems.filter((item) => item.id !== selectedItemId),
    );
    setSelectedItemId(null);
    setEditingStickyId(null);
  }

  function moveLayer(direction: "backward" | "forward") {
    if (selectedIndex < 0) {
      return;
    }

    updateItems((currentItems) => {
      const nextIndex =
        direction === "forward"
          ? Math.min(selectedIndex + 1, currentItems.length - 1)
          : Math.max(selectedIndex - 1, 0);

      if (nextIndex === selectedIndex) {
        return currentItems;
      }

      const reordered = [...currentItems];
      const [selected] = reordered.splice(selectedIndex, 1);
      reordered.splice(nextIndex, 0, selected);
      return reordered;
    });
  }

  function startStickyEditing(itemId: string) {
    setSelectedItemId(itemId);
    setEditingStickyId(itemId);
  }

  function stopStickyEditing() {
    setEditingStickyId(null);
  }

  return (
    <main className="app-shell">
      <section className="board-frame">
        <WhiteboardCanvas
          background={background}
          items={items}
          selectedItemId={selectedItemId}
          editingStickyId={editingStickyId}
          onMoveItem={moveItem}
          onSelectItem={selectItem}
          onStartStickyEditing={startStickyEditing}
          onStickyTextChange={updateStickyText}
          onStopStickyEditing={stopStickyEditing}
          onTransformItem={updateItemTransform}
        />

        <div className="board-frame__toolbar">
          <Toolbar
            background={background}
            canMoveBackward={selectedIndex > 0}
            canMoveForward={selectedIndex >= 0 && selectedIndex < items.length - 1}
            onAddHeart={() => addSticker("heart")}
            onAddImage={addUploadedImage}
            onAddPin={addPin}
            onAddStar={() => addSticker("star")}
            onAddSticky={addStickyNote}
            onAddTape={addTape}
            onBackgroundChange={setBackground}
            onDeleteSelected={deleteSelectedItem}
            onMoveBackward={() => moveLayer("backward")}
            onMoveForward={() => moveLayer("forward")}
            persistenceWarning={persistenceWarning}
            onStickyColorChange={updateStickyColor}
            onStickySizeChange={updateStickySize}
            selectedItem={selectedItem}
          />
        </div>
      </section>
    </main>
  );
}
