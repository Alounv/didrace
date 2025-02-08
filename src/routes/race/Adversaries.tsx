import { createEffect, createSignal, For } from "solid-js";
import { Player, PlayerRace } from "../../schema";
import { Cursor } from "./Cursor";

export function Adversaries(props: {
  playerRaces: (PlayerRace & { player: Player })[];
  done: (progress: number) => string;
}) {
  const [offsets, setOffsets] = createSignal<Record<string, number>>({});

  return (
    <For each={props.playerRaces}>
      {(race) => {
        const typed = props.done(race.progress);
        let typedRef: HTMLDivElement | undefined;

        createEffect(() => {
          if (typed && typedRef) {
            setOffsets((p) => ({
              ...p,
              [race.playerID]: typedRef.offsetWidth,
            }));
          }
        });
        return (
          <div class="absolute top-2.5 flex items-center ">
            <div
              class="font-quote text-2xl tracking-widest invisible"
              ref={typedRef}
            >
              {typed}
            </div>

            <div
              class="absolute transition-all h-full"
              style={{ translate: `${offsets()[race.playerID]}px` }}
            >
              <Cursor
                color={race.player?.color}
                placement="bottom"
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
