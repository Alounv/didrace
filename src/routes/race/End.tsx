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
  const [words] = useQuery(() =>
    props.z.query.typed_word
      .where("playerID", "=", props.z.userID)
      .where("raceID", "=", props.raceID)
      .orderBy("timestamp", "asc"),
  );
  return (
    <Show when={words().length > 0}>
      <EndInternal
        z={props.z}
        raceID={props.raceID}
        quote={props.quote}
        nextRaceID={props.nextRaceID}
        playerRaces={props.playerRaces}
        words={words()}
      />
    </Show>
  );
}

function EndInternal(props: {
  z: Zero<Schema>;
  raceID: string;
  quote: Quote;
  nextRaceID: string | null;
  playerRaces: (PlayerRace & { player: Player })[];
  words: TypedWord[];
}) {
  const [rendered] = createSignal(Date.now());
  const navigate = useNavigate();

  const [oldPlayerRaces] = useQuery(() => {
    return (
      props.z.query.player_race
        .where("playerID", "=", props.z.userID)
        .where("end", "IS NOT", null)
        .where("raceID", "IS NOT", props.raceID)
        // eslint-disable-next-line solid/reactivity
        .whereExists("quote", (q) => q.where("id", "=", props.quote.id))
        .orderBy("start", "asc")
        .limit(10)
    );
  });

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

  function accuracy() {
    const total = props.words.length;
    const incorrect = props.words.filter((w) => w.hadError).length;
    return Math.round(((total - incorrect) / total) * 100);
  }

  return (
    <div class="flex flex-col gap-10 m-auto">
      <div class="flex flex-col gap-4">
        <div class="font-quote text-2xl tracking-widest max-w-3xl text-justify">
          <For each={props.words}>{(w) => <Word {...w} />}</For>

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
            <Tag class="bg-info text-info-content">{`${accuracy()}% correct`}</Tag>
          </div>
        </div>

        <div class="flex-1 border border-base-100 p-2">
          <div class="text-base-100">History for this quote</div>
          <div class="flex gap-1 items-end h-40">
            <For each={oldPlayerRaces()}>
              {(r) => <RaceBar race={r} len={props.quote.body.length} />}
            </For>

            <RaceBar
              race={playerRace()!}
              isCurrent
              len={props.quote.body.length}
            />
          </div>

          <Show when={props.playerRaces.length > 1}>
            <Podium
              playerRaces={props.playerRaces}
              quoteLength={props.quote.body.length}
            />
          </Show>
        </div>
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
    <div class={`badge text-xl font-bold px-4 py-6 bg-black ${props.class}`}>
      {props.children}
    </div>
  );
}

function Word(word: TypedWord) {
  return <span class={word.hadError ? "text-error" : ""}>{word.word}</span>;
}

function RaceBar(props: {
  race: PlayerRace;
  len: number;
  isCurrent?: boolean;
}) {
  function speed() {
    return getSpeed({
      end: props.race.end,
      start: props.race.start as number,
      len: props.len,
    });
  }

  return (
    <div
      class={`badge w-6 py-1 ${props.isCurrent ? "bg-primary text-primary-content" : "bg-secondary text-secondary-content"}`}
      style={{ height: `${speed().wpm}px` }}
    >
      <div class="rotate-90 whitespace-nowrap">{`${speed().wpm}`}</div>
    </div>
  );
}
