function hexToRgb(hex: string) {
  const clean = hex.replace("#", "");
  const bigint = Number.parseInt(clean, 16);

  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  };
}

function hexToHsl(hex: string) {
  let { r, g, b } = hexToRgb(hex);

  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);

  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }

    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/**
 * Get the background and text colors for a chip based on the input color.
 * @param color - The base color in hex format.
 * @returns An object containing the backgroundColor and textColor in HSL format.
 */
export function getChipColors(color: string) {
  const { h, s, l } = hexToHsl(color);
  const backgroundColor = `hsl(${h}, ${s}%, ${Math.min(l + 35, 92)}%)`; // lighter
  const textColor = `hsl(${h}, ${s}%, ${Math.max(l - 35, 15)}%)`; // darker
  return { backgroundColor, textColor };
}
