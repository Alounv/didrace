import { JSX } from "solid-js";

export function PlayerName(props: {
  children: JSX.Element;
  color: string;
  class?: string;
  isButton?: boolean;
}) {
  return (
    <div
      class={`badge font-quote ${props.isButton ? "btn" : ""} ${props.class}`}
      style={{
        "background-color": props.color,
        color: getContrastColor(props.color),
      }}
      {...(props.isButton ? { tabindex: "0", role: "button" } : {})}
    >
      {props.children}
    </div>
  );
}

function getContrastColor(bgColor: string) {
  // Convert hex to RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  };

  // Calculate relative luminance
  const rgb = hexToRgb(bgColor);
  if (!rgb) return "#000000";

  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;

  return luminance > 0.5 ? "#000000" : "#FFFFFF";
}
