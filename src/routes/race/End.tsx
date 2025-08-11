import { createSignal, JSX, Show, For } from "solid-js";
import { createQuery } from "../../convex-solid";
import { api } from "../../../convex/_generated/api";
import { getCurrentUser } from "../../convex";
import { useNavigate } from "@solidjs/router";
import { Race, PlayerRaceWithPlayer, TypedWord } from "../../types";
import { Podium } from "./Podium";
import { addKeyboardEventListener } from "../../utils/addKeyboardEventListener";
import { Button } from "../../components/Button";
import { Icon } from "solid-heroicons";
import {
  arrowLeftOnRectangle,
  chevronDoubleRight,
} from "solid-heroicons/solid-mini";
import { leave as leaveRace } from "../../domain/race-convex";

export function End(props: {
  race: Race;
  playerRaces: PlayerRaceWithPlayer[];
}) {
  const { userID, token } = getCurrentUser();
  
  const typedWords = createQuery(api.analytics.getPlayerTypedWords, {
    playerId: userID as any,
    raceId: props.race._id,
    token,
  });

  return (
    <Show when={typedWords()?.length > 0}>
      <EndInternal
        race={props.race}
        playerRaces={props.playerRaces}
        words={typedWords()!}
      />
    </Show>
  );
}

function EndInternal(props: {
  race: Race;
  playerRaces: PlayerRaceWithPlayer[];
  words: TypedWord[];
}) {
  const [rendered] = createSignal(Date.now());
  const navigate = useNavigate();
  const { userID } = getCurrentUser();

  async function leave() {
    await leaveRace({ raceID: props.race._id, isAlone: false });
    navigate("/");
  }

  addKeyboardEventListener({
    keys: ["Space", "Escape"],
    callback: (e) => {
      if (!e || Date.now() - rendered() < 1000) {
        return;
      }

      if (e.code === "Space") {
        navigate(`/races/${props.race.nextRaceID}`);
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
    return props.playerRaces.find((r) => r.playerID === userID);
  }

  function speed() {
    const race = playerRace();
    // TODO: Implement getSpeed function for Convex
    const duration = (race?.end ?? 0) - (race?.start ?? 0);
    const wpm = duration > 0 ? Math.round((race?.progress ?? 0) / 5 / (duration / 60000)) : 0;
    return { wpm };
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
            {props.race.quote?.body.slice(playerRace()?.progress)}
          </span>
        </div>
        <div class="ml-auto text-secondary text-lg">{props.race.quote?.source}</div>
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
            <RaceBar
              race={playerRace()!}
              isCurrent
              len={props.race.quote?.body.length ?? 0}
            />
          </div>
        </div>

        <Show when={props.playerRaces.length > 1}>
          <Podium
            playerRaces={props.playerRaces}
            quoteLength={props.race.quote?.body.length ?? 0}
          />
        </Show>
      </div>

      <div class="flex gap-4 justify-center">
        <Button onClick={leave}>
          <Icon path={arrowLeftOnRectangle} class="size-5" />
          Leave [ESC]
        </Button>
        {props.race.nextRaceID && (
          <Button href={`/races/${props.race.nextRaceID}`} class="self-center">
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
  race: any;
  len: number;
  isCurrent?: boolean;
}) {
  function speed() {
    const duration = (props.race.end ?? 0) - (props.race.start ?? 0);
    const wpm = duration > 0 ? Math.round(props.race.progress / 5 / (duration / 60000)) : 0;
    return { wpm };
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
