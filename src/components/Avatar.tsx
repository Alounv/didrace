import { Player } from "../types";

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
          title={props.player?.name}
          style={{
            "background-color": props.player.color,
          }}
        />
      ) : (
        <div class="text-base-content text-base font-bold font-quote w-full h-full" />
      )}
    </div>
  );
}
