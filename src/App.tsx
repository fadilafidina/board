import { LiveList, LiveObject } from "@liveblocks/client";
import {
  ClientSideSuspense,
  LiveblocksProvider,
  RoomProvider,
  useMutation,
  useMyPresence,
  useOthers,
  useStorage,
  useUpdateMyPresence,
} from "@liveblocks/react/suspense";
import { useEffect, useMemo, useRef, useState } from "react";
import { BoardWorkspace } from "./components/board/BoardWorkspace";
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
import {
  createImageItem,
  createPinItem,
  createStickerItem,
  createStickyNoteItem,
  createTapeItem,
  loadInitialState,
  prepareUploadedImage,
  STORAGE_KEY,
  type PersistedState,
} from "./lib/board-state";
import {
  createRoomId,
  getGuestProfile,
  getLiveblocksPublicKey,
  getRoomIdFromUrl,
  isLiveblocksEnabled,
  setRoomIdInUrl,
} from "./lib/liveblocks-room";
import type {
  BoardBackground,
  BoardItem,
  BoardParticipant,
  RemoteCursor,
  StickyColor,
  StickySize,
} from "./types";

function toLiveblocksItems(items: BoardItem[]) {
  return new LiveList(items.map((item) => new LiveObject({ ...item })));
}

type BoardControls = {
  background: BoardBackground;
  editingStickyId: string | null;
  items: BoardItem[];
  onAddHeart: () => void;
  onAddImage: (file: File) => Promise<void>;
  onAddPin: () => void;
  onAddStar: () => void;
  onAddSticky: () => void;
  onAddTape: () => void;
  onBackgroundChange: (background: BoardBackground) => void;
  onDeleteSelected: () => void;
  onMoveBackward: () => void;
  onMoveForward: () => void;
  onMoveItem: (itemId: string, x: number, y: number) => void;
  onSelectItem: (itemId: string | null) => void;
  onStartStickyEditing: (itemId: string) => void;
  onStickyColorChange: (color: StickyColor) => void;
  onStickySizeChange: (size: StickySize) => void;
  onStickyTextChange: (text: string) => void;
  onStopStickyEditing: () => void;
  onTransformItem: (itemId: string, transform: ItemTransform) => void;
  participants: BoardParticipant[];
  persistenceWarning: string | null;
  remoteCursors: RemoteCursor[];
  selectedItemId: string | null;
  statusMessage: string | null;
  userParticipant: BoardParticipant | null;
};

type LocalBoardProps = {
  initialBackground: BoardBackground;
  initialItems: BoardItem[];
};

export default function App() {
  const initialState = useMemo(() => loadInitialState(), []);
  const liveblocksEnabled = isLiveblocksEnabled();
  const liveblocksKey = getLiveblocksPublicKey();
  const roomId = useMemo(
    () => (liveblocksEnabled ? getRoomIdFromUrl() ?? createRoomId() : null),
    [liveblocksEnabled],
  );
  const guestProfile = useMemo(
    () => (liveblocksEnabled ? getGuestProfile() : null),
    [liveblocksEnabled],
  );

  useEffect(() => {
    if (!liveblocksEnabled || !roomId || getRoomIdFromUrl()) {
      return;
    }

    setRoomIdInUrl(roomId);
  }, [liveblocksEnabled, roomId]);

  if (!liveblocksEnabled) {
    return (
      <LocalBoard
        initialBackground={initialState.background}
        initialItems={initialState.items}
      />
    );
  }

  return (
    <LiveblocksProvider publicApiKey={liveblocksKey}>
      <RoomProvider
        id={roomId ?? createRoomId()}
        initialPresence={{
          color: guestProfile?.color ?? "#8b6850",
          cursor: null,
          editingStickyId: null,
          name: guestProfile?.name ?? "Guest",
          selectedItemId: null,
        }}
        initialStorage={{
          background: initialState.background,
          items: toLiveblocksItems(initialState.items),
        }}
      >
        <ClientSideSuspense fallback={<ConnectingBoard />}>
          {() => <LiveblocksBoard />}
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  );
}

function LocalBoard({ initialBackground, initialItems }: LocalBoardProps) {
  const [items, setItems] = useState(initialItems);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [editingStickyId, setEditingStickyId] = useState<string | null>(null);
  const [background, setBackground] = useState<BoardBackground>(initialBackground);
  const [persistenceWarning, setPersistenceWarning] = useState<string | null>(
    null,
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

  useDeleteShortcut({
    items,
    onDelete: (itemId) => {
      setItems((currentItems) => deleteBoardItem(currentItems, itemId));
      setSelectedItemId(null);
      setEditingStickyId(null);
    },
    selectedItemId,
  });

  const controls = useBoardControls({
    background,
    editingStickyId,
    items,
    onBackgroundCommit: setBackground,
    onItemsCommit: setItems,
    onSelectItem: setSelectedItemId,
    onSetEditingStickyId: setEditingStickyId,
    persistenceWarning,
    remoteParticipants: [],
    selectedItemId,
    statusMessage: "Local board mode. Add a Liveblocks public key to share it.",
  });

  return (
    <BoardWorkspace
      {...controls}
      onCursorLeave={() => {}}
      onCursorMove={() => {}}
      participants={[]}
      remoteCursors={[]}
      selfCursor={null}
      userParticipant={null}
    />
  );
}

function LiveblocksBoard() {
  const items = useStorage((root) => root.items) as BoardItem[];
  const background = useStorage((root) => root.background) as BoardBackground;
  const others = useOthers();
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [editingStickyId, setEditingStickyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const updateMyPresence = useUpdateMyPresence();
  const [myPresence, setMyPresence] = useMyPresence();

  const remoteParticipants = useMemo(
    () =>
      others.map((other) => ({
        clientId: String(other.connectionId),
        color: other.presence.color,
        editingStickyId: other.presence.editingStickyId,
        name: other.presence.name,
        selectedItemId: other.presence.selectedItemId,
      })) satisfies BoardParticipant[],
    [others],
  );

  const remoteCursors = useMemo(
    () =>
      others
        .filter((other) => other.presence.cursor !== null)
        .map((other) => ({
          clientId: String(other.connectionId),
          color: other.presence.color,
          name: other.presence.name,
          x: other.presence.cursor?.x ?? 0,
          y: other.presence.cursor?.y ?? 0,
        })) satisfies RemoteCursor[],
    [others],
  );

  const saveItems = useMutation(({ storage }, nextItems: BoardItem[]) => {
    storage.set("items", toLiveblocksItems(nextItems));
  }, []);

  const saveBackground = useMutation(
    ({ storage }, nextBackground: BoardBackground) => {
      storage.set("background", nextBackground);
    },
    [],
  );

  useEffect(() => {
    updateMyPresence({
      editingStickyId,
      selectedItemId,
    });
  }, [editingStickyId, selectedItemId, updateMyPresence]);

  useEffect(() => {
    if (selectedItemId && !items.some((item) => item.id === selectedItemId)) {
      setSelectedItemId(null);
      setEditingStickyId(null);
    }
  }, [items, selectedItemId]);

  useDeleteShortcut({
    items,
    onDelete: (itemId) => {
      saveItems(deleteBoardItem(items, itemId));
      setSelectedItemId(null);
      setEditingStickyId(null);
      setNotice(null);
    },
    selectedItemId,
  });

  const controls = useBoardControls({
    background,
    editingStickyId,
    items,
    onBackgroundCommit: (nextBackground) => {
      saveBackground(nextBackground);
      setNotice(null);
    },
    onItemsCommit: (nextItems) => {
      saveItems(nextItems);
      setNotice(null);
    },
    onSelectItem: (itemId) => {
      setSelectedItemId(itemId);

      if (itemId !== editingStickyId) {
        setEditingStickyId(null);
      }
    },
    onSetEditingStickyId: setEditingStickyId,
    persistenceWarning: notice,
    remoteParticipants,
    selectedItemId,
    statusMessage: `${others.length + 1} ${
      others.length === 0 ? "person" : "people"
    } on this board. Share this URL to collaborate live.`,
  });

  const userParticipant = useMemo(
    () =>
      ({
        clientId: "self",
        color: myPresence.color,
        editingStickyId,
        name: myPresence.name,
        selectedItemId,
      }) satisfies BoardParticipant,
    [editingStickyId, myPresence.color, myPresence.name, selectedItemId],
  );
  const selfCursor = useMemo(
    () =>
      myPresence.cursor
        ? ({
            clientId: "self-cursor",
            color: myPresence.color,
            name: myPresence.name,
            x: myPresence.cursor.x,
            y: myPresence.cursor.y,
          } satisfies RemoteCursor)
        : null,
    [myPresence.color, myPresence.cursor, myPresence.name],
  );

  const cursorThrottleRef = useRef(0);

  return (
    <BoardWorkspace
      {...controls}
      onCursorLeave={() => {
        setMyPresence({ cursor: null });
      }}
      onCursorMove={(cursor) => {
        const now = performance.now();

        if (now - cursorThrottleRef.current < 40) {
          return;
        }

        cursorThrottleRef.current = now;
        setMyPresence({ cursor });
      }}
      onStartStickyEditing={(itemId) => {
        const activeEditor = remoteParticipants.find(
          (participant) => participant.editingStickyId === itemId,
        );

        if (activeEditor) {
          setNotice(`${activeEditor.name} is editing this sticky note right now.`);
          return;
        }

        controls.onSelectItem(itemId);
        setEditingStickyId(itemId);
        setNotice(null);
      }}
      participants={remoteParticipants}
      remoteCursors={remoteCursors}
      selfCursor={selfCursor}
      statusMessage={`${others.length + 1} ${
        others.length === 0 ? "person" : "people"
      } on this board. Share this URL to collaborate live.`}
      userParticipant={userParticipant}
      usePresenceCursor
    />
  );
}

type UseBoardControlsArgs = {
  background: BoardBackground;
  editingStickyId: string | null;
  items: BoardItem[];
  onBackgroundCommit: (background: BoardBackground) => void;
  onItemsCommit: (items: BoardItem[]) => void;
  onSelectItem: (itemId: string | null) => void;
  onSetEditingStickyId: (itemId: string | null) => void;
  persistenceWarning: string | null;
  remoteParticipants: BoardParticipant[];
  selectedItemId: string | null;
  statusMessage: string | null;
};

function useBoardControls({
  background,
  editingStickyId,
  items,
  onBackgroundCommit,
  onItemsCommit,
  onSelectItem,
  onSetEditingStickyId,
  persistenceWarning,
  remoteParticipants,
  selectedItemId,
  statusMessage,
}: UseBoardControlsArgs): BoardControls {
  function commitItems(nextItems: BoardItem[]) {
    onItemsCommit(nextItems);
  }

  function handleSelectItem(itemId: string | null) {
    onSelectItem(itemId);

    if (itemId === null || itemId !== editingStickyId) {
      onSetEditingStickyId(null);
    }
  }

  return {
    background,
    editingStickyId,
    items,
    onAddHeart: () => {
      commitItems([...items, createStickerItem("heart")]);
      onSetEditingStickyId(null);
    },
    onAddImage: async (file) => {
      const preparedImage = await prepareUploadedImage(file);

      commitItems([
        ...items,
        createImageItem({
          height: preparedImage.height,
          name: file.name,
          src: preparedImage.src,
          width: preparedImage.width,
        }),
      ]);
      onSetEditingStickyId(null);
    },
    onAddPin: () => {
      commitItems([...items, createPinItem()]);
      onSetEditingStickyId(null);
    },
    onAddStar: () => {
      commitItems([...items, createStickerItem("star")]);
      onSetEditingStickyId(null);
    },
    onAddSticky: () => {
      commitItems([...items, createStickyNoteItem()]);
      onSetEditingStickyId(null);
    },
    onAddTape: () => {
      commitItems([...items, createTapeItem()]);
      onSetEditingStickyId(null);
    },
    onBackgroundChange: onBackgroundCommit,
    onDeleteSelected: () => {
      if (!selectedItemId) {
        return;
      }

      commitItems(deleteBoardItem(items, selectedItemId));
      onSelectItem(null);
      onSetEditingStickyId(null);
    },
    onMoveBackward: () => {
      if (!selectedItemId) {
        return;
      }

      commitItems(moveBoardLayer(items, selectedItemId, "backward"));
    },
    onMoveForward: () => {
      if (!selectedItemId) {
        return;
      }

      commitItems(moveBoardLayer(items, selectedItemId, "forward"));
    },
    onMoveItem: (itemId, x, y) => {
      commitItems(moveBoardItem(items, itemId, x, y));
    },
    onSelectItem: handleSelectItem,
    onStartStickyEditing: (itemId) => {
      const activeEditor = remoteParticipants.find(
        (participant) => participant.editingStickyId === itemId,
      );

      if (activeEditor) {
        return;
      }

      onSelectItem(itemId);
      onSetEditingStickyId(itemId);
    },
    onStickyColorChange: (color) => {
      if (!selectedItemId) {
        return;
      }

      commitItems(updateBoardStickyColor(items, selectedItemId, color));
    },
    onStickySizeChange: (size) => {
      if (!selectedItemId) {
        return;
      }

      commitItems(updateBoardStickySize(items, selectedItemId, size));
    },
    onStickyTextChange: (text) => {
      if (!editingStickyId) {
        return;
      }

      commitItems(updateBoardStickyText(items, editingStickyId, text));
    },
    onStopStickyEditing: () => {
      onSetEditingStickyId(null);
    },
    onTransformItem: (itemId, transform) => {
      commitItems(transformBoardItem(items, itemId, transform));
    },
    persistenceWarning,
    participants: remoteParticipants,
    remoteCursors: [],
    selectedItemId,
    statusMessage,
    userParticipant: null,
  };
}

type DeleteShortcutArgs = {
  items: BoardItem[];
  onDelete: (itemId: string) => void;
  selectedItemId: string | null;
};

function useDeleteShortcut({
  items,
  onDelete,
  selectedItemId,
}: DeleteShortcutArgs) {
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

      if (
        !items.some((item) => item.id === selectedItemId) ||
        (event.key !== "Backspace" && event.key !== "Delete")
      ) {
        return;
      }

      event.preventDefault();
      onDelete(selectedItemId);
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [items, onDelete, selectedItemId]);
}

function ConnectingBoard() {
  return (
    <main className="app-shell">
      <div className="board-frame">
        <div className="whiteboard whiteboard--grid" />
        <div className="board-frame__toolbar">
          <div className="toolbar">
            <div className="toolbar__notice" role="status">
              Connecting to shared board...
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
