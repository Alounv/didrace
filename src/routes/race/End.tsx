import { Zero } from "@rocicorp/zero";
import { Player, PlayerRace, Schema } from "../../schema";
import { Accessor, JSX, Show } from "solid-js";
import { addKeyboardEventListener } from "../../addKeyboardEventListener";
import { useNavigate } from "@solidjs/router";
import { Podium } from "./Podium";
import { SoftButton } from "../../design-system";

export function End(props: {
  z: Zero<Schema>;
  raceID: string;
  quote: string;
  nextRaceID: string | null;
  playerRaces: Accessor<(PlayerRace & { player: Player })[]>;
  end: number | undefined | null;
}) {
  const navigate = useNavigate();

  addKeyboardEventListener({
    keys: ["Space"],
    callback: () => {
      navigate(`/races/${props.nextRaceID}`);
    },
  });
  function firstStart() {
    return Math.min(...props.playerRaces().map((r) => r.start ?? 0));
  }
  function speed() {
    return getSpeed({
      end: props.end,
      start: firstStart(),
      len: props.quote.length,
    });
  }

  return (
    <div class="flex flex-col items-center gap-24 m-auto">
      <div
        class={`flex items-center ${props.playerRaces().length > 1 ? "justify-between gap-12" : "justify-center"}`}
      >
        <div class="flex gap-12 items-center justify-center">
          <div class="flex flex-col gap-4 shrink-0 items-start">
            <Tag class="bg-violet-600">{`${speed().wpm} WPM`}</Tag>
            <Tag class="bg-teal-600">{`${speed().sec} sec`}</Tag>
          </div>
          <div class="font-quote text-2xl tracking-widest max-w-xl">
            {props.quote}
          </div>
        </div>

        <Show when={props.playerRaces().length > 1}>
          <Podium
            playerRaces={props.playerRaces}
            quoteLength={props.quote.length}
          />
        </Show>
      </div>

      {props.nextRaceID && (
        <SoftButton href={`/races/${props.nextRaceID}`}>
          Next (or press space)
        </SoftButton>
      )}
    </div>
  );
}

function Tag(props: { children: JSX.Element; class?: string }) {
  return (
    <div
      class={`text-2xl font-bold rounded-xl px-5 py-4 bg-black ${props.class}`}
    >
      {props.children}
    </div>
  );
}

export function getSpeed({
  end,
  start,
  len,
}: {
  end: number | null | undefined;
  start: number;
  len: number;
}) {
  const duration = (end ?? Date.now()) - start;
  const sec = duration / 1000;
  const min = sec / 60;

  return {
    sec: Math.round(sec),
    wpm: Math.round(len / 5 / min),
  };
}
