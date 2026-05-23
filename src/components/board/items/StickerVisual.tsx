import { Path, Star } from "react-konva";
import type { StickerItem } from "../../../types";
import { withSelectionShadow } from "../itemStyles";

const heartPath =
  "M52 102 C20 80 8 56 8 34 C8 18 20 8 34 8 C44 8 52 14 58 24 C64 14 72 8 82 8 C96 8 108 18 108 34 C108 56 96 80 64 102 L58 108 L52 102 Z";

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
    width: 108,
    height: 108,
  };
  const heartPadding = 12;
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
      y={(item.height - heartHeight) / 2 - 1}
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
