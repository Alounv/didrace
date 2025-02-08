import { JSX } from "solid-js";
import { PlayerName } from "./Player";

export function Cursor(props: {
  children: JSX.Element;
  color: string | undefined;
  placement?: "top" | "bottom";
  isActive: boolean;
  isPulsing?: boolean;
}) {
  return (
    <div
      class={`w-[3px] h-7 relative rounded -translate-x-0.5
        ${props.isActive ? "" : "opacity-30"}
        ${props.isPulsing && props.isActive ? "animate-pulse" : ""}
      `}
      style={{ "background-color": props.color }}
    >
      <PlayerName
        class={`absolute -translate-x-1/2 ${props.placement === "bottom" ? "-bottom-7" : "-top-7"}`}
        color={props.color}
      >
        {props.children}
      </PlayerName>
    </div>
  );
}
