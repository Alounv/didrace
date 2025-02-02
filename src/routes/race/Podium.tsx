import { Accessor, For } from "solid-js";
import { Player, PlayerRace } from "../../schema";

export function Podium(props: {
  playerRaces: Accessor<(PlayerRace & { player: Player })[]>;
}) {
  return (
    <ol>
      <For each={props.playerRaces()}>
        {(playerRace, index) => (
          <li class="flex items-center gap-4">
            <span class="text-stone-400">{index() + 1}.</span>
            {playerRace.player.name}
          </li>
        )}
      </For>
    </ol>
  );
}
