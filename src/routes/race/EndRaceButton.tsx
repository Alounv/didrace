import { createSignal, onCleanup } from "solid-js";
import { Button } from "../../components/design-system";
import { PlayerRace } from "../../schema";

const TIME_TO_FINISH_IN_S = 30;

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
      <Button
        onClick={() => props.endRace()}
        disabled={sinceFirstArrival() <= TIME_TO_FINISH_IN_S}
      >
        End Race
      </Button>
      <div class="text-sm text-text">{displayEndRace()}</div>
    </div>
  );
}
