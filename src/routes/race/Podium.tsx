import { createEffect, createSignal, For, onCleanup } from "solid-js";
import { Player, PlayerRace } from "../../schema";
import { PlayerName } from "./Player";
import { getSpeed } from "./End";
import { Avatar } from "../../components/Avatar";
import { Button } from "../../components/design-system";

const TIME_TO_FINISH_IN_S = 30;

export function Podium(props: {
  endRace?: () => void;
  playerRaces: (PlayerRace & { player: Player })[];
  quoteLength: number;
}) {
  const [countDown, setCountDown] = createSignal(TIME_TO_FINISH_IN_S);
  const [canForceEnd, setCanForceEnd] = createSignal(false);
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

  let interval: NodeJS.Timeout | undefined;

  createEffect(() => {
    if (
      props.endRace &&
      props.playerRaces.some((r) => r.end) &&
      countDown() === TIME_TO_FINISH_IN_S
    ) {
      interval = setInterval(() => {
        if (countDown() > 0) {
          setCountDown((c) => c - 1);
          return;
        }

        if (countDown() === 0) {
          setCanForceEnd(true);
        }

        setCountDown(TIME_TO_FINISH_IN_S);
        clearInterval(interval);
      }, 1000);
    }
  });

  onCleanup(() => {
    if (interval) {
      clearInterval(interval);
    }
  });

  return (
    <div class="flex flex-col gap-4 text-sm text-white">
      {countDown() < TIME_TO_FINISH_IN_S && (
        <div class="text-lg">{`${countDown()} seconds`}</div>
      )}
      <Button
        onClick={() => props?.endRace?.()}
        disabled={!canForceEnd()}
        class="text-lg"
      >
        End Race
      </Button>
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
