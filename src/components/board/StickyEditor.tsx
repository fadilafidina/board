import { useEffect, useRef } from "react";
import type { StickyNoteItem } from "../../types";

type StickyEditorProps = {
  sticky: StickyNoteItem | null;
  onChange: (text: string) => void;
  onStopEditing: () => void;
};

export function StickyEditor({
  sticky,
  onChange,
  onStopEditing,
}: StickyEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (sticky && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(
        textareaRef.current.value.length,
        textareaRef.current.value.length,
      );
    }
  }, [sticky]);

  if (!sticky) {
    return null;
  }

  return (
    <textarea
      ref={textareaRef}
      className="sticky-editor"
      value={sticky.text}
      onBlur={onStopEditing}
      onChange={(event) => onChange(event.target.value)}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          onStopEditing();
        }
      }}
      onMouseDown={(event) => event.stopPropagation()}
      style={{
        left: sticky.x + 16,
        top: sticky.y + 18,
        width: sticky.width - 32,
        height: sticky.height - 34,
        transform: `rotate(${sticky.rotation ?? 0}deg)`,
      }}
    />
  );
}
