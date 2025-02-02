import { Zero } from "@rocicorp/zero";
import { useQuery } from "@rocicorp/zero/solid";
import { createEffect, createSignal, JSX, Show, For, Accessor } from "solid-js";
import { Player, PlayerRace, Quote, Race, Schema } from "../../schema";
import { id } from "../../id";
import { randInt } from "../../rand";
import { Podium } from "./Podium";

export function RaceArea(props: {
  z: Zero<Schema>;
  raceID: string;
  quote: Quote;
  status: Race["status"];
}) {
  const [playerRaces] = useQuery(() =>
    props.z.query.player_race
      .where("raceID", "=", props.raceID)
      .related("player"),
  );

  function playerRace() {
    return playerRaces().find((r) => r.playerID === props.z.userID);
  }

  createEffect(() => {
    if (playerRace()) {
      return;
    }

    props.z.mutate.player_race.insert({
      playerID: props.z.userID,
      raceID: props.raceID,
      progress: 0,
      start: null,
      end: null,
    });
  });

  function getInitialProgress() {
    const progress = playerRace()?.progress ?? 0;
    const body = props.quote.body;
    const quoteLength = body.length;

    if (progress === quoteLength) {
      return quoteLength;
    }
    const soFar = body.slice(0, progress);
    const lastSpaceIndex = soFar.lastIndexOf(" ");

    return lastSpaceIndex === -1 ? 0 : Math.min(lastSpaceIndex + 1, progress);
  }

  return (
    <>
      <Show when={playerRace()}>
        {(playerRace) => (
          <RaceInput
            z={props.z}
            quote={props.quote}
            raceID={props.raceID}
            initialProgress={getInitialProgress()}
            hasFinished={!!playerRace()?.end}
            hasStarted={!!playerRace()?.start}
            playerRaces={
              playerRaces as Accessor<(PlayerRace & { player: Player })[]>
            }
            status={props.status}
          />
        )}
      </Show>

      <Podium
        playerRaces={
          playerRaces as Accessor<(PlayerRace & { player: Player })[]>
        }
      />
    </>
  );
}

function RaceInput(props: {
  z: Zero<Schema>;
  quote: Quote;
  raceID: string;
  initialProgress: number;
  hasFinished: boolean;
  hasStarted: boolean;
  status: Race["status"];
  playerRaces: Accessor<(PlayerRace & { player: Player })[]>;
}) {
  let inputRef: HTMLInputElement;
  const [input, setInput] = createSignal<string>("");
  const [charIndex, setCharIndex] = createSignal(props.initialProgress);

  const [otherQuotes] = useQuery(() =>
    props.z.query.quote.where("id", "!=", props.quote.id),
  );

  function playerRace() {
    return props.playerRaces().find((r) => r.playerID === props.z.userID);
  }

  function wordIndex() {
    const soFar = props.quote.body.slice(0, charIndex());
    return soFar.split(" ").length - 1;
  }

  function target() {
    return props.quote.body.split(" ")[wordIndex()];
  }

  function display() {
    const current = target();
    const typed = input();
    const chars = typed.split("");

    let correctIndex = typed.length;
    for (let i = 0; i < chars.length; i++) {
      if (chars[i] !== current[i]) {
        correctIndex = i;
        break;
      }
    }

    const charI = charIndex();
    const index = correctIndex + charI;

    const saved = props.quote.body.slice(0, charI);
    const correct = typed.slice(0, correctIndex);
    const incorrect = typed.slice(correctIndex).replace(/ /g, "_");
    const rest = props.quote.body.slice(index);

    return {
      saved,
      correct,
      incorrect,
      rest,
    };
  }

  function done(progress: number): string {
    return props.quote.body.slice(0, progress);
  }

  const [offset, setOffset] = createSignal(0);
  let typedRef: HTMLSpanElement | undefined;

  createEffect(() => {
    if (typedRef) {
      setOffset(typedRef.offsetWidth ?? 0);
    }
  });

  function getRandomQuoteId() {
    return otherQuotes()[randInt(otherQuotes().length)].id;
  }

  function onFinish() {
    const notFinishedCount = props
      .playerRaces()
      ?.filter((r) => r.end === null).length;

    if (notFinishedCount <= 1) {
      const newRaceId = id();

      // Create next race
      props.z.mutate.race.insert({
        id: newRaceId,
        status: "ready",
        authorID: props.z.userID,
        quoteID: getRandomQuoteId(),

        timestamp: Date.now(),
      });

      // Terminate current race
      props.z.mutate.race.update({
        id: props.raceID,
        status: "finished",
        nextRaceID: newRaceId,
      });
    }
  }

  function onFinishWord({
    value,
    progress,
  }: {
    value: string;
    progress: number;
  }) {
    // move to next word
    setCharIndex((i) => i + value.length);

    // could be 1 char more because of the last space
    const isComplete = progress >= props.quote.body.length;

    // save progress
    props.z.mutate.player_race.update({
      raceID: props.raceID,
      playerID: props.z.userID,
      end: isComplete ? Date.now() : null,
    });

    if (isComplete) {
      onFinish();
    }
  }

  function saveProgress(progress: number) {
    props.z.mutate.player_race.update({
      raceID: props.raceID,
      playerID: props.z.userID,
      ...(!playerRace()?.start && { start: Date.now() }),
      progress: Math.min(progress, props.quote.body.length),
    });
  }

  function onChange(value: string) {
    const last = value[value.length - 1];
    const progress = charIndex() + value.length;
    const couldFinish = progress >= props.quote.body.length;
    const isCorrectSoFar = target().startsWith(value.trim());
    let shouldReset = false;

    if (isCorrectSoFar) {
      saveProgress(progress);

      if ((last === " " || couldFinish) && target() === value.trim()) {
        onFinishWord({ value, progress });
        shouldReset = true;
      }
    }

    setInput(shouldReset ? "" : value);

    setOffset(typedRef?.offsetWidth ?? 0);
  }

  function isActive() {
    return props.status === "started" && !props.hasFinished;
  }

  createEffect(() => {
    if (isActive()) {
      inputRef!.focus();
    }
  });

  return (
    <label
      for="input-id"
      class="relative transition-all flex-1 h-full flex items-center"
    >
      {!props.hasFinished && (
        <Cursor color={playerRace()?.player?.color} isActive={isActive()}>
          You
        </Cursor>
      )}

      <div
        class="absolute top-0 w-max transition-all left-0 h-full flex items-center"
        style={{ translate: `-${offset()}px` }}
      >
        <div class="font-quote text-2xl tracking-widest">
          <span ref={typedRef}>
            <span class="text-white">{display().saved}</span>
            <span class="text-white transition-all">{display().correct}</span>
            <span class="bg-red-600 rounded-xs">{display().incorrect}</span>
          </span>
          <span class="text-stone-400">{display().rest}</span>
        </div>

        <For
          each={props
            .playerRaces()
            .filter((r) => r.playerID !== props.z.userID)}
        >
          {(race) => (
            <div class="absolute top-0 flex h-full items-center ">
              <div class="font-quote text-2xl tracking-widest invisible">
                {done(race.progress)}
              </div>
              <Cursor
                color={race.player?.color}
                placement="bottom"
                isActive={isActive()}
              >
                {race.player?.name}
              </Cursor>
            </div>
          )}
        </For>
      </div>

      <input
        id="input-id"
        autofocus
        ref={inputRef!}
        class="fixed -top-full -left-full"
        value={input()}
        disabled={!isActive()}
        onInput={(e) => onChange(e.currentTarget.value)}
      />
    </label>
  );
}

function Cursor(props: {
  children: JSX.Element;
  color: string | undefined;
  placement?: "top" | "bottom";
  isActive: boolean;
}) {
  return (
    <div
      class={`w-[2px] h-7 relative rounded -translate-x-0.5 ${props.isActive ? "" : "opacity-30"}`}
      style={{ "background-color": props.color }}
    >
      <div
        class={`bg-inherit absolute text-white rounded-lg px-2 py-0.5 text-sm -translate-x-1/2
          ${props.placement === "bottom" ? "-bottom-7" : "-top-7"}`}
      >
        {props.children}
      </div>
    </div>
  );
}
