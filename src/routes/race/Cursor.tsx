import { JSX } from "solid-js";
import { PlayerName } from "./PlayerName";
import { Avatar } from "../../components/Avatar";
import { Effect } from "./ItemAndEffect";
import { Player, PlayerRace } from "../../types";

export function Cursor(props: {
  children: JSX.Element;
  player: Player;
  isCurrent?: boolean;
  isActive: boolean;
  isPulsing?: boolean;
  effect?: PlayerRace["effect"];
}) {
  function color() {
    return props.player.color;
  }

  return (
    <div
      class={`w-[3px] h-7 relative rounded -translate-x-0.5
        ${props.isActive ? "" : "opacity-50"}
        ${props.isPulsing && props.isActive ? "animate-pulse" : ""}
      `}
      style={{ "background-color": color() }}
    >
      <div
        class={`absolute flex flex-col gap-2 items-center -translate-x-1/2 ${props.isCurrent ? "bottom-9" : "top-9"}`}
      >
        {props.player.avatar && !props.isCurrent ? (
          <Avatar player={props.player} class="w-8 h-8" />
        ) : (
          <PlayerName color={props.player.color}>{props.children}</PlayerName>
        )}

        {props.effect && <Effect effect={props.effect} />}
      </div>
    </div>
  );
}
