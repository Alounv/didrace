import { Accessor, For } from "solid-js";
import { Player, PlayerRace } from "../../schema";
import { PlayerName } from "./Player";
import { getSpeed } from "./End";

export function Podium(props: {
  playerRaces: Accessor<(PlayerRace & { player: Player })[]>;
  quoteLength: number;
}) {
  function firstStart() {
    return Math.min(
      ...props.playerRaces().flatMap((r) => (r.start ? [r.start] : [])),
    );
  }
  function sortedPlayerRaces() {
    const races = [...props.playerRaces()];

    races.sort((a, b) => {
      const aEnd = a.end;
      const bEnd = b.end;

      if (aEnd && bEnd) {
        return aEnd - bEnd;
      }

      if (aEnd) return -1;
      if (bEnd) return 1;

      return b.progress - a.progress;
    });

    return races;
  }
  function speed(playerRace: PlayerRace) {
    return getSpeed({
      end: playerRace.end,
      start: firstStart(),
      len: playerRace.progress,
    });
  }

  return (
    <ol class="flex flex-col gap-2 text-sm text-white shrink-0">
      <For each={sortedPlayerRaces()}>
        {(playerRace, index) => (
          <li class="flex items-center gap-4">
            <span>{index() + 1}.</span>

            <PlayerName
              color={playerRace.player.color}
              class={playerRace.end ? "opacity-100" : "opacity-30"}
            >
              {playerRace.player.name}
            </PlayerName>

            <span>{`${speed(playerRace).wpm} WPM`}</span>
          </li>
        )}
      </For>
    </ol>
  );
}
