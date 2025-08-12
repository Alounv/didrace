import { createSignal, onCleanup } from "solid-js";
import { PlayerRace } from "../../types";

const TIME_TO_FINISH_IN_S = 20;

export function EndRaceButton(props: {
  endRace: () => void;
  playerRaces: PlayerRace[];
}) {
  const [sinceFirstArrival, setSinceFirstArrival] = createSignal(0);

  const timer = setInterval(() => {
    const ends = props.playerRaces
      .map((r) => r.end)
      .filter(Boolean) as number[];

    if (ends.length === 0) return;

    const firstEnd = Math.min(...ends);
    const sinceFirst = Math.round((Date.now() - firstEnd) / 1000);
    setSinceFirstArrival(sinceFirst);
  }, 1000);

  onCleanup(() => clearInterval(timer));

  function displayEndRace() {
    const delay = sinceFirstArrival();
    if (delay < TIME_TO_FINISH_IN_S) {
      return "(in " + (TIME_TO_FINISH_IN_S - delay) + " seconds)";
    }
  }

  return (
    <div class="flex gap-2 items-center">
      <button
        class="btn btn-primary btn-sm"
        onClick={() => props.endRace()}
        disabled={sinceFirstArrival() < TIME_TO_FINISH_IN_S}
      >
        End Race
      </button>
      <div class="text-sm text-base-content">{displayEndRace()}</div>
    </div>
  );
}
