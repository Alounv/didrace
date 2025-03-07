import { Zero } from "@rocicorp/zero";
import { Player, PlayerRace, Quote, Schema, TypedWord } from "../../schema";
import { createSignal, JSX, Show, For } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { Podium } from "./Podium";
import { addKeyboardEventListener } from "../../utils/addKeyboardEventListener";
import { Button } from "../../components/Button";
import { Icon } from "solid-heroicons";
import {
  arrowLeftOnRectangle,
  chevronDoubleRight,
} from "solid-heroicons/solid-mini";
import { getSpeed } from "../../domain/playerRace";
import { useQuery } from "@rocicorp/zero/solid";

export function End(props: {
  z: Zero<Schema>;
  raceID: string;
  quote: Quote;
  nextRaceID: string | null;
  playerRaces: (PlayerRace & { player: Player })[];
}) {
  const [rendered] = createSignal(Date.now());
  const navigate = useNavigate();

  const [words] = useQuery(() =>
    props.z.query.typed_word
      .where("playerID", "=", props.z.userID)
      .where("raceID", "=", props.raceID)
      .orderBy("timestamp", "asc"),
  );

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
          <For each={words()}>{(w) => <Word {...w} />}</For>

          <span class="opacity-50">
            {props.quote.body.slice(playerRace()?.progress)}
          </span>
        </div>
        <div class="ml-auto text-secondary text-lg">{props.quote.source}</div>
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
        <Button onClick={leave}>
          <Icon path={arrowLeftOnRectangle} class="size-5" />
          Leave [ESC]
        </Button>
        {props.nextRaceID && (
          <Button href={`/races/${props.nextRaceID}`} class="self-center">
            <Icon path={chevronDoubleRight} class="size-5" />
            Next Race [SPACE]
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

function Word(word: TypedWord) {
  return <span class={word.hadError ? "text-error" : ""}>{word.word}</span>;
}
