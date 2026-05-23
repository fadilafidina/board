export const stickyPalette = {
  "pale-cream": {
    fill: "#f8f1dd",
    edge: "#d8c499",
    fold: "#f0e0ba",
    text: "#564635",
  },
  butter: {
    fill: "#f5e198",
    edge: "#dcc26f",
    fold: "#edd37d",
    text: "#58452f",
  },
  "soft-beige": {
    fill: "#ead9c6",
    edge: "#ccb196",
    fold: "#dfc8b0",
    text: "#59473a",
  },
} as const;

export function setCursor(cursor: string) {
  document.body.style.cursor = cursor;
}

export function withSelectionShadow(isSelected: boolean) {
  return isSelected
    ? {
        shadowColor: "rgba(92, 71, 47, 0.34)",
        shadowBlur: 20,
        shadowOffsetY: 7,
        shadowOpacity: 1,
      }
    : {
        shadowColor: "rgba(92, 71, 47, 0.14)",
        shadowBlur: 10,
        shadowOffsetY: 4,
        shadowOpacity: 0.65,
      };
}
