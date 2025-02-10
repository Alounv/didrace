import { createEffect, For, Signal } from "solid-js";
import { Player, PlayerRace } from "../../schema";
import { Cursor } from "./Cursor";
import { PlayerName } from "./Player";

export function Adversaries(props: {
  playerRaces: (PlayerRace & { player: Player })[];
  done: (progress: number) => string;
  currentPlayerOffset: number;
  offsetsSignal: Signal<Record<string, number>>;
  positionsSignal: Signal<Record<string, "left" | "right">>;
}) {
  return (
    <For each={props.playerRaces}>
      {(race) => {
        const typed = props.done(race.progress);
        let typedRef: HTMLDivElement | undefined;

        createEffect(() => {
          if (typed && typedRef) {
            const offset = typedRef.offsetWidth;
            const dist = offset - props.currentPlayerOffset;
            const halfscreen = window.innerWidth / 2 - 40;

            if (dist > halfscreen) {
              props.positionsSignal[1]((p) => ({
                ...p,
                [race.playerID]: "right",
              }));
            } else if (dist < -halfscreen) {
              props.positionsSignal[1]((p) => ({
                ...p,
                [race.playerID]: "left",
              }));
            } else {
              props.positionsSignal[1]((p) => {
                delete p[race.playerID];
                return p;
              });
            }

            props.offsetsSignal[1]((p) => ({
              ...p,
              [race.playerID]: offset,
            }));
          }
        });
        return (
          <div class="absolute top-2.5 flex items-center tracking-normal font-normal">
            <div
              class="font-quote text-2xl tracking-widest invisible"
              ref={typedRef}
            >
              {typed}
            </div>

            <div
              class="absolute transition-all h-full"
              style={{
                translate: `${props.offsetsSignal[0]()[race.playerID]}px`,
                opacity: props.positionsSignal[0]()[race.playerID] ? 0 : 1,
              }}
            >
              <Cursor
                player={race.player as Player}
                isActive={(race.progress ?? 0) > 0}
              >
                {race.player?.name}
              </Cursor>
            </div>
          </div>
        );
      }}
    </For>
  );
}

export function AdversariesSides(props: {
  players: Player[];
  side: "left" | "right";
}) {
  return (
    <div
      class={`absolute flex flex-col gap-1 top-1/2 mt-7 ${props.side === "left" ? "-left-8" : "-right-8"}`}
    >
      <For each={props.players}>
        {(p) => (
          <div
            class={`flex gap-1 items-center ${props.side === "left" ? "flex-row-reverse" : ""}`}
          >
            <PlayerName class="opacity-50" color={p.color}>
              {p.name}
            </PlayerName>
            <div style={{ color: p.color }} class="text-xl">{`>`}</div>
          </div>
        )}
      </For>
    </div>
  );
}
