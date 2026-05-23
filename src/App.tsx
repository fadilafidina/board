import { useEffect, useMemo, useState } from "react";
import { Toolbar } from "./components/Toolbar";
import { WhiteboardCanvas } from "./components/WhiteboardCanvas";
import type {
  BoardBackground,
  BoardItem,
  PinItem,
  StickerItem,
  StickyNoteItem,
  TapeItem,
} from "./types";

const STORAGE_KEY = "fridgeboard-mvp-state";
const BOARD_WIDTH = 1200;
const BOARD_HEIGHT = 800;

type PersistedState = {
  background: BoardBackground;
  items: BoardItem[];
};

function createSeedItems(): BoardItem[] {
  return [
    {
      id: crypto.randomUUID(),
      type: "sticky-note",
      x: 460,
      y: 180,
      width: 220,
      height: 180,
      text: "Pick up lemons and oat milk.",
      color: "pale-cream",
      rotation: -3,
    } satisfies StickyNoteItem,
    {
      id: crypto.randomUUID(),
      type: "pin",
      x: 608,
      y: 156,
      kind: "round",
      color: "#c96f5c",
      rotation: 0,
    } satisfies PinItem,
    {
      id: crypto.randomUUID(),
      type: "sticker",
      x: 800,
      y: 290,
      kind: "star",
      color: "#f0bf67",
      rotation: 8,
    } satisfies StickerItem,
  ];
}

function loadInitialState(): PersistedState {
  const fallbackState: PersistedState = {
    background: "cream",
    items: createSeedItems(),
  };

  const storedState = window.localStorage.getItem(STORAGE_KEY);

  if (!storedState) {
    return fallbackState;
  }

  try {
    return JSON.parse(storedState) as PersistedState;
  } catch {
    return fallbackState;
  }
}

export default function App() {
  const initialState = useMemo(() => loadInitialState(), []);
  const [items, setItems] = useState<BoardItem[]>(initialState.items);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [background, setBackground] = useState<BoardBackground>(
    initialState.background,
  );

  useEffect(() => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        background,
        items,
      } satisfies PersistedState),
    );
  }, [background, items]);

  const selectedItem = items.find((item) => item.id === selectedItemId);

  function addStickyNote() {
    const stickyNote: StickyNoteItem = {
      id: crypto.randomUUID(),
      type: "sticky-note",
      x: BOARD_WIDTH / 2 - 110,
      y: BOARD_HEIGHT / 2 - 90,
      width: 220,
      height: 180,
      text: "New note",
      color: "butter",
      rotation: -2,
    };

    setItems((currentItems) => [...currentItems, stickyNote]);
    setSelectedItemId(stickyNote.id);
  }

  function addPin() {
    const pin: PinItem = {
      id: crypto.randomUUID(),
      type: "pin",
      x: BOARD_WIDTH / 2,
      y: BOARD_HEIGHT / 2 - 120,
      kind: "round",
      color: "#d27863",
    };

    setItems((currentItems) => [...currentItems, pin]);
    setSelectedItemId(pin.id);
  }

  function addSticker(kind: StickerItem["kind"]) {
    const sticker: StickerItem = {
      id: crypto.randomUUID(),
      type: "sticker",
      x: BOARD_WIDTH / 2 + 110,
      y: BOARD_HEIGHT / 2 - 40,
      kind,
      color: kind === "star" ? "#efc068" : "#d9868c",
      rotation: kind === "star" ? -5 : 6,
    };

    setItems((currentItems) => [...currentItems, sticker]);
    setSelectedItemId(sticker.id);
  }

  function addTape() {
    const tape: TapeItem = {
      id: crypto.randomUUID(),
      type: "tape",
      x: BOARD_WIDTH / 2 - 40,
      y: BOARD_HEIGHT / 2 - 150,
      kind: "strip",
      color: "rgba(244, 232, 202, 0.72)",
      rotation: -10,
    };

    setItems((currentItems) => [...currentItems, tape]);
    setSelectedItemId(tape.id);
  }

  function deleteSelectedItem() {
    if (!selectedItemId) {
      return;
    }

    setItems((currentItems) =>
      currentItems.filter((item) => item.id !== selectedItemId),
    );
    setSelectedItemId(null);
  }

  function updateStickyText(text: string) {
    if (!selectedItemId) {
      return;
    }

    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === selectedItemId && item.type === "sticky-note"
          ? { ...item, text }
          : item,
      ),
    );
  }

  return (
    <main className="app-shell">
      <section className="board-frame">
        <WhiteboardCanvas
          background={background}
          items={items}
          selectedItemId={selectedItemId}
          onSelectItem={setSelectedItemId}
        />

        <div className="board-frame__toolbar">
          <Toolbar
            background={background}
            onBackgroundChange={setBackground}
            onAddSticky={addStickyNote}
            onAddPin={addPin}
            onAddStar={() => addSticker("star")}
            onAddHeart={() => addSticker("heart")}
            onAddTape={addTape}
            onDeleteSelected={deleteSelectedItem}
            selectedItem={selectedItem}
            onStickyTextChange={updateStickyText}
          />
        </div>
      </section>
    </main>
  );
}
