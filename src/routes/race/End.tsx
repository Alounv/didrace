import { Zero } from "@rocicorp/zero";
import { Player, PlayerRace, Quote, Schema } from "../../schema";
import { createSignal, JSX, Show } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { Podium } from "./Podium";
import { addKeyboardEventListener } from "../../utils/addKeyboardEventListener";
import { Button } from "../../components/design-system";

export function End(props: {
  z: Zero<Schema>;
  raceID: string;
  quote: Quote;
  nextRaceID: string | null;
  playerRaces: (PlayerRace & { player: Player })[];
}) {
  const [rendered] = createSignal(Date.now());
  const navigate = useNavigate();

  function leave() {
    props.z.mutate.player_race
      .delete({
        playerID: props.z.userID,
        raceID: props.raceID,
      })
      .then(() => navigate("/"));
  }

  addKeyboardEventListener({
    keys: ["Space", "Escape"],
    callback: (e) => {
      if (!e || Date.now() - rendered() < 1000) {
        return;
      }

      if (e.code === "Space") {
        navigate(`/races/${props.nextRaceID}`);
      }

      if (e.code === "Escape") {
        leave();
      }
    },
  });
  function firstStart() {
    const starts = props.playerRaces.map((r) => r.start ?? Infinity);
    return Math.min(...starts);
  }

  function playerRace() {
    return props.playerRaces.find((r) => r.playerID === props.z.userID);
  }
  function speed() {
    const race = playerRace();
    return getSpeed({
      end: race?.end,
      start: firstStart(),
      len: race?.progress ?? 0,
    });
  }

  return (
    <div class="flex flex-col gap-10 m-auto">
      <div class="flex flex-col gap-4">
        <div class="font-quote text-2xl tracking-widest max-w-3xl text-justify">
          <span>{props.quote.body.slice(0, playerRace()?.progress)}</span>
          <span class="text-neutral-600">
            {props.quote.body.slice(playerRace()?.progress)}
          </span>
        </div>
        <div class="ml-auto text-neutral-500 text-lg">{props.quote.source}</div>
      </div>

      <div class="flex items-center justify-between gap-12">
        <div class="flex gap-12 items-center justify-center">
          <div class="flex flex-col gap-4 shrink-0 items-start">
            <Tag class="bg-primary text-primary-content">{`${speed().wpm} WPM`}</Tag>
            <Tag class="bg-secondary text-secondary-content">{`${speed().sec} sec`}</Tag>
          </div>
        </div>

        <Show when={props.playerRaces.length > 1}>
          <Podium
            playerRaces={props.playerRaces}
            quoteLength={props.quote.body.length}
          />
        </Show>
      </div>

      <div class="flex gap-4 justify-center">
        <Button onClick={leave}>🏃 Leave [ESC]</Button>
        {props.nextRaceID && (
          <Button href={`/races/${props.nextRaceID}`} class="self-center">
            🚀 Next Race [SPACE]
          </Button>
        )}
      </div>
    </div>
  );
}

function Tag(props: { children: JSX.Element; class?: string }) {
  return (
    <div
      class={`text-xl font-bold rounded-xl px-4 py-3 bg-black ${props.class}`}
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
