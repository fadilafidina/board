import { Rect, Text } from "react-konva";
import type { StickyNoteItem } from "../../../types";
import { stickyPalette, withSelectionShadow } from "../itemStyles";

type StickyNoteVisualProps = {
  isEditing: boolean;
  isSelected: boolean;
  item: StickyNoteItem;
};

export function StickyNoteVisual({
  isEditing,
  isSelected,
  item,
}: StickyNoteVisualProps) {
  const palette = stickyPalette[item.color];
  const selectionTone = isSelected ? "#8c6950" : palette.edge;
  const notePadding = Math.max(12, item.width * 0.08);
  const fontSize = Math.max(15, Math.min(21, item.width / 10));

  return (
    <>
      <Rect
        width={item.width}
        height={item.height}
        cornerRadius={6}
        fill={palette.fill}
        stroke={selectionTone}
        strokeWidth={isSelected ? 3 : 1.6}
        {...withSelectionShadow(isSelected)}
      />
      {!isEditing ? (
        <Text
          x={notePadding}
          y={16}
          width={item.width - notePadding * 2}
          height={item.height - 28}
          text={item.text}
          fill={palette.text}
          fontSize={fontSize}
          fontFamily="Avenir Next, Segoe UI, sans-serif"
          lineHeight={1.35}
          ellipsis
        />
      ) : null}
    </>
  );
}
