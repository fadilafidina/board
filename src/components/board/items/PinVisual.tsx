import { Circle, Line } from "react-konva";
import type { PinItem } from "../../../types";
import { PIN_HEIGHT, PIN_WIDTH } from "../../../types";
import { withSelectionShadow } from "../itemStyles";

type PinVisualProps = {
  isSelected: boolean;
  item: PinItem;
};

export function PinVisual({ isSelected, item }: PinVisualProps) {
  return (
    <>
      <Line
        points={[PIN_WIDTH / 2, 16, PIN_WIDTH / 2, PIN_HEIGHT - 7]}
        stroke={isSelected ? "#8d6453" : "#8b7768"}
        strokeWidth={4}
        lineCap="round"
        opacity={0.72}
      />
      <Circle
        x={PIN_WIDTH / 2}
        y={12}
        radius={12}
        fill={item.color}
        stroke={isSelected ? "#7d463c" : "#9c6255"}
        strokeWidth={isSelected ? 2.6 : 1.5}
        {...withSelectionShadow(isSelected)}
      />
      <Circle
        x={PIN_WIDTH / 2 - 3}
        y={8}
        radius={3.2}
        fill="rgba(255,255,255,0.6)"
      />
    </>
  );
}
