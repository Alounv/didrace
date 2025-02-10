import { For, JSX } from "solid-js";
import { Player, PlayerRace } from "../../schema";
import { PlayerName } from "./Player";
import { getSpeed } from "./End";
import { Avatar } from "../../components/Avatar";

export function Podium(props: {
  children?: JSX.Element;
  playerRaces: (PlayerRace & { player: Player })[];
  quoteLength: number;
}) {
  function firstStart() {
    return Math.min(
      ...props.playerRaces.flatMap((r) => (r.start ? [r.start] : [])),
    );
  }

  function sortedPlayerRaces() {
    const races = [...props.playerRaces];

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
    <div class="flex flex-col gap-4 text-sm text-white items-start">
      {props?.children}

      <ol class="flex flex-col gap-2 text-sm text-white shrink-0">
        <For each={sortedPlayerRaces()}>
          {(playerRace, index) => (
            <li class="flex items-center gap-4 justify-start">
              <div class="w-3">{index() + 1}.</div>
              <div class="flex gap-2 items-center">
                <Avatar player={playerRace.player} class="w-8 h-8" />
                <PlayerName
                  color={playerRace.player.color}
                  class={playerRace.end ? "opacity-100" : "opacity-30"}
                >
                  {playerRace.player.name}
                </PlayerName>
              </div>
              <div>{`${speed(playerRace).wpm} WPM`}</div>
            </li>
          )}
        </For>
      </ol>
    </div>
  );
}
