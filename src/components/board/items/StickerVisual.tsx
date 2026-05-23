import { Path, Star } from "react-konva";
import type { StickerItem } from "../../../types";
import { withSelectionShadow } from "../itemStyles";

const heartPath =
  "M58 98 C24 76 10 48 22 24 C32 8 54 10 62 30 C70 10 92 8 102 24 C114 48 100 76 66 98 L58 106 L50 98 Z";

type StickerVisualProps = {
  isSelected: boolean;
  item: StickerItem;
};

export function StickerVisual({ isSelected, item }: StickerVisualProps) {
  const centerX = item.width / 2;
  const centerY = item.height / 2;
  const outerRadius = Math.min(item.width, item.height) * 0.38;
  const innerRadius = outerRadius * 0.52;

  if (item.kind === "star") {
    return (
      <Star
        x={centerX}
        y={centerY}
        numPoints={5}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        fill={item.color}
        stroke="#fffdf8"
        strokeWidth={isSelected ? 4.5 : 3}
        {...withSelectionShadow(isSelected)}
      />
    );
  }

  const heartBounds = {
    width: 104,
    height: 106,
  };
  const heartPadding = 14;
  const heartScale = Math.min(
    (item.width - heartPadding * 2) / heartBounds.width,
    (item.height - heartPadding * 2) / heartBounds.height,
  );
  const heartWidth = heartBounds.width * heartScale;
  const heartHeight = heartBounds.height * heartScale;

  return (
    <Path
      data={heartPath}
      x={(item.width - heartWidth) / 2}
      y={(item.height - heartHeight) / 2 - 3}
      scaleX={heartScale}
      scaleY={heartScale}
      fill={item.color}
      stroke="#fffdf8"
      strokeWidth={isSelected ? 4.5 : 3}
      strokeScaleEnabled={false}
      {...withSelectionShadow(isSelected)}
    />
  );
}
