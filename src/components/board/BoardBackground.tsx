import { Rect } from "react-konva";
import { BOARD_HEIGHT, BOARD_WIDTH } from "../../types";

export function BoardBackground() {
  return (
    <Rect
      name="board-hit-area"
      width={BOARD_WIDTH}
      height={BOARD_HEIGHT}
      fill="rgba(0,0,0,0.001)"
      cornerRadius={32}
    />
  );
}
