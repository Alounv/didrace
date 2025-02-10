import { Zero } from "@rocicorp/zero";
import { Player, PlayerRace, Schema } from "../../schema";
import { JSX, Show } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { Podium } from "./Podium";
import { addKeyboardEventListener } from "../../utils/addKeyboardEventListener";
import { SoftButton } from "../../components/design-system";

export function End(props: {
  z: Zero<Schema>;
  raceID: string;
  quote: string;
  nextRaceID: string | null;
  playerRaces: (PlayerRace & { player: Player })[];
}) {
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
      if (!e) {
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
  function speed() {
    const playerRace = props.playerRaces.find(
      (r) => r.playerID === props.z.userID,
    );
    return getSpeed({
      end: playerRace?.end,
      start: firstStart(),
      len: playerRace?.progress ?? 0,
    });
  }

  return (
    <div class="flex flex-col gap-12 m-auto">
      <div class="font-quote text-2xl tracking-widest max-w-3xl">
        {props.quote}
      </div>

      <div class="flex items-center justify-between gap-12">
        <div class="flex gap-12 items-center justify-center">
          <div class="flex flex-col gap-4 shrink-0 items-start">
            <Tag class="bg-violet-600">{`${speed().wpm} WPM`}</Tag>
            <Tag class="bg-teal-600">{`${speed().sec} sec`}</Tag>
          </div>
        </div>

        <Show when={props.playerRaces.length > 1}>
          <Podium
            playerRaces={props.playerRaces}
            quoteLength={props.quote.length}
          />
        </Show>
      </div>

      <div class="flex gap-4 justify-center">
        <SoftButton onClick={leave}>🏃 Leave [ESC]</SoftButton>
        {props.nextRaceID && (
          <SoftButton href={`/races/${props.nextRaceID}`} class="self-center">
            🚀 Next Race [SPACE]
          </SoftButton>
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
