import { For, JSX } from "solid-js";
import { PlayerName } from "./PlayerName";
import { Avatar } from "../../components/Avatar";
import { computePlayerRaces } from "../../domain/playerRace-convex";

export function Podium(props: {
  children?: JSX.Element;
  playerRaces: any[];
  quoteLength: number;
}) {
  return (
    <div class="flex flex-col gap-4 text-sm text-base-content items-start">
      {props?.children}

      <ol class="flex flex-col gap-2 text-sm text-base-content shrink-0">
        <For each={computePlayerRaces({ playerRaces: props.playerRaces })}>
          {(p, index) => (
            <li class="flex items-center gap-4 justify-start">
              <div class="w-3">{index() + 1}.</div>
              <div class="flex gap-2 items-center">
                <Avatar player={p.player} class="w-8 h-8" />
                <PlayerName
                  color={p.player.color}
                  class={p.end ? "" : "opacity-50"}
                >
                  {p.player.name}
                </PlayerName>
              </div>
              <div>{`${p.wpm} WPM`}</div>
            </li>
          )}
        </For>
      </ol>
    </div>
  );
}
