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
