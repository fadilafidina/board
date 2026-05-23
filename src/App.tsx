import { useEffect, useMemo, useState } from "react";
import { Toolbar } from "./components/Toolbar";
import { WhiteboardCanvas } from "./components/WhiteboardCanvas";
import type {
  BoardBackground,
  BoardItem,
  ImageItem,
  PinItem,
  StickerItem,
  StickyNoteItem,
  TapeItem,
} from "./types";
import { BOARD_HEIGHT, BOARD_WIDTH, STICKER_SIZE, getStickySizeDimensions } from "./types";
import {
  type PersistedState,
  STORAGE_KEY,
  loadInitialState,
  prepareUploadedImage,
} from "./lib/board-state";
import {
  deleteBoardItem,
  moveBoardItem,
  moveBoardLayer,
  transformBoardItem,
  type ItemTransform,
  updateBoardStickyColor,
  updateBoardStickySize,
  updateBoardStickyText,
} from "./lib/board-actions";

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

      if (isEditingField || !selectedItemId) {
        return;
      }

      if (event.key === "Backspace" || event.key === "Delete") {
        event.preventDefault();
        setItems((currentItems) => deleteBoardItem(currentItems, selectedItemId));
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

  function updateItems(updater: (currentItems: BoardItem[]) => BoardItem[]) {
    setItems((currentItems) => updater(currentItems));
  }

  function selectItem(itemId: string | null) {
    setSelectedItemId(itemId);

    if (itemId !== editingStickyId) {
      setEditingStickyId(null);
    }
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
    try {
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
    } catch {
      setPersistenceWarning("That image could not be added.");
    }
  }

  function moveItem(itemId: string, nextX: number, nextY: number) {
    updateItems((currentItems) => moveBoardItem(currentItems, itemId, nextX, nextY));
  }

  function transformItem(itemId: string, transform: ItemTransform) {
    updateItems((currentItems) =>
      transformBoardItem(currentItems, itemId, transform),
    );
  }

  function updateStickyText(text: string) {
    if (!selectedItemId) {
      return;
    }

    updateItems((currentItems) =>
      updateBoardStickyText(currentItems, selectedItemId, text),
    );
  }

  function updateStickyColor(color: StickyNoteItem["color"]) {
    if (!selectedItemId) {
      return;
    }

    updateItems((currentItems) =>
      updateBoardStickyColor(currentItems, selectedItemId, color),
    );
  }

  function updateStickySize(size: StickyNoteItem["size"]) {
    if (!selectedItemId) {
      return;
    }

    updateItems((currentItems) =>
      updateBoardStickySize(currentItems, selectedItemId, size),
    );
  }

  function deleteSelectedItem() {
    if (!selectedItemId) {
      return;
    }

    updateItems((currentItems) => deleteBoardItem(currentItems, selectedItemId));
    setSelectedItemId(null);
    setEditingStickyId(null);
  }

  function moveLayer(direction: "backward" | "forward") {
    if (!selectedItemId) {
      return;
    }

    updateItems((currentItems) =>
      moveBoardLayer(currentItems, selectedItemId, direction),
    );
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
          editingStickyId={editingStickyId}
          items={items}
          onMoveItem={moveItem}
          onSelectItem={selectItem}
          onStartStickyEditing={startStickyEditing}
          onStickyTextChange={updateStickyText}
          onStopStickyEditing={stopStickyEditing}
          onTransformItem={transformItem}
          selectedItemId={selectedItemId}
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
            onStickyColorChange={updateStickyColor}
            onStickySizeChange={updateStickySize}
            persistenceWarning={persistenceWarning}
            selectedItem={selectedItem}
          />
        </div>
      </section>
    </main>
  );
}
