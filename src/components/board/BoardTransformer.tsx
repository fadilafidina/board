import { useEffect, useMemo, useRef } from "react";
import type { Group as KonvaGroup } from "konva/lib/Group";
import type { Transformer as KonvaTransformer } from "konva/lib/shapes/Transformer";
import { Transformer } from "react-konva";
import type { BoardItem } from "../../types";

type BoardTransformerProps = {
  nodeMapRef: React.MutableRefObject<Record<string, KonvaGroup | null>>;
  selectedItem: BoardItem | undefined;
  selectedItemId: string | null;
};

function isTransformable(item: BoardItem | undefined) {
  return (
    item?.type === "sticky-note" ||
    item?.type === "sticker" ||
    item?.type === "image"
  );
}

export function BoardTransformer({
  nodeMapRef,
  selectedItem,
  selectedItemId,
}: BoardTransformerProps) {
  const transformerRef = useRef<KonvaTransformer | null>(null);

  const transformerConfig = useMemo(() => {
    if (!selectedItem || !isTransformable(selectedItem)) {
      return null;
    }

    if (selectedItem.type === "sticky-note") {
      return {
        enabledAnchors: [
          "top-left",
          "top-right",
          "bottom-left",
          "bottom-right",
          "middle-left",
          "middle-right",
          "top-center",
          "bottom-center",
        ],
        keepRatio: false,
      };
    }

    return {
      enabledAnchors: ["top-left", "top-right", "bottom-left", "bottom-right"],
      keepRatio: true,
    };
  }, [selectedItem]);

  useEffect(() => {
    if (!transformerRef.current) {
      return;
    }

    if (!selectedItemId || !selectedItem || !isTransformable(selectedItem)) {
      transformerRef.current.nodes([]);
      transformerRef.current.getLayer()?.batchDraw();
      return;
    }

    const node = nodeMapRef.current[selectedItemId];

    if (!node) {
      return;
    }

    transformerRef.current.nodes([node]);
    transformerRef.current.getLayer()?.batchDraw();
  }, [nodeMapRef, selectedItem, selectedItemId]);

  if (!transformerConfig) {
    return null;
  }

  return (
    <Transformer
      ref={transformerRef}
      enabledAnchors={transformerConfig.enabledAnchors}
      keepRatio={transformerConfig.keepRatio}
      rotateEnabled
      rotateAnchorOffset={36}
      anchorCornerRadius={10}
      anchorSize={12}
      borderDash={[5, 5]}
      borderStroke="#81624d"
      anchorFill="#fffaf2"
      anchorStroke="#81624d"
      anchorStrokeWidth={1.5}
      padding={8}
    />
  );
}
