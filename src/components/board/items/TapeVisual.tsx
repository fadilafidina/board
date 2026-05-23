import { Line, Rect } from "react-konva";
import type { TapeItem } from "../../../types";
import { TAPE_HEIGHT, TAPE_WIDTH } from "../../../types";
import { withSelectionShadow } from "../itemStyles";

type TapeVisualProps = {
  isSelected: boolean;
  item: TapeItem;
};

export function TapeVisual({ isSelected, item }: TapeVisualProps) {
  return (
    <>
      <Rect
        width={TAPE_WIDTH}
        height={TAPE_HEIGHT}
        cornerRadius={9}
        fill={item.color}
        stroke={isSelected ? "rgba(138, 110, 81, 0.7)" : "rgba(255,255,255,0.5)"}
        strokeWidth={isSelected ? 2 : 1}
        opacity={0.92}
        {...withSelectionShadow(isSelected)}
      />
      <Rect
        x={12}
        y={4}
        width={TAPE_WIDTH - 24}
        height={6}
        cornerRadius={4}
        fill="rgba(255,255,255,0.22)"
      />
      <Line
        points={[8, TAPE_HEIGHT - 5, TAPE_WIDTH - 8, TAPE_HEIGHT - 5]}
        stroke="rgba(220, 199, 157, 0.55)"
        strokeWidth={1.5}
      />
    </>
  );
}
