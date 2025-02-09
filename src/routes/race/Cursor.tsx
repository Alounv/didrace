import { JSX } from "solid-js";
import { PlayerName } from "./Player";
import { Player } from "../../schema";
import { Avatar } from "../../components/Avatar";

export function Cursor(props: {
  children: JSX.Element;
  player?: Player;
  placement?: "top" | "bottom";
  isActive: boolean;
  isPulsing?: boolean;
}) {
  function color() {
    return props.player?.color;
  }

  return (
    <div
      class={`w-[3px] h-7 relative rounded -translate-x-0.5
        ${props.isActive ? "" : "opacity-30"}
        ${props.isPulsing && props.isActive ? "animate-pulse" : ""}
      `}
      style={{ "background-color": color() }}
    >
      <div
        class={`absolute -translate-x-1/2 ${props.placement === "bottom" ? "top-8" : "bottom-8"}`}
      >
        {props.player?.avatar ? (
          <Avatar player={props.player} class="w-8 h-8" />
        ) : (
          <PlayerName color={color()}>{props.children}</PlayerName>
        )}
      </div>
    </div>
  );
}
