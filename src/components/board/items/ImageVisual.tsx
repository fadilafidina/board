import { useEffect, useState } from "react";
import { Image as KonvaImage, Rect } from "react-konva";
import type { ImageItem } from "../../../types";
import { withSelectionShadow } from "../itemStyles";

type ImageVisualProps = {
  isSelected: boolean;
  item: ImageItem;
};

function useLoadedImage(src: string) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    const nextImage = new window.Image();
    nextImage.onload = () => setImage(nextImage);
    nextImage.src = src;

    return () => {
      nextImage.onload = null;
    };
  }, [src]);

  return image;
}

export function ImageVisual({ isSelected, item }: ImageVisualProps) {
  const image = useLoadedImage(item.src);

  return (
    <>
      <Rect
        width={item.width}
        height={item.height}
        cornerRadius={18}
        fill="#f8f4ef"
        stroke={isSelected ? "#8a6850" : "rgba(135, 108, 83, 0.2)"}
        strokeWidth={isSelected ? 3 : 1.2}
        {...withSelectionShadow(isSelected)}
      />
      {image ? (
        <KonvaImage
          image={image}
          width={item.width}
          height={item.height}
          cornerRadius={18}
        />
      ) : null}
    </>
  );
}
