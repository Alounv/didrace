import type { Player } from "../types";
import { getContrastColor } from "../utils/color";

export function Avatar(props: { player: Player; class?: string }) {
  return (
    <div
      class={`rounded-full border-solid border-2 flex items-center justify-center ${props.class}`}
      style={{ "border-color": props.player.color }}
    >
      {props.player.avatar ? (
        <img
          src={props.player.avatar ?? ""}
          class="rounded-full"
          alt={props.player?.name ?? "player avatar"}
          title={props.player?.name}
          style={{
            "background-color": props.player.color,
          }}
        />
      ) : (
        <div
          class="font-bold w-full h-full flex items-center justify-center rounded-full"
          style={{
            "background-color": props.player.color,
            color: getContrastColor(props.player.color),
          }}
        >
          <div>{props.player.name.slice(0, 2).toUpperCase()}</div>
        </div>
      )}
    </div>
  );
}
