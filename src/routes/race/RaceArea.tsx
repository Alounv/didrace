import { Zero } from "@rocicorp/zero";
import { useQuery } from "@rocicorp/zero/solid";
import { createEffect, createSignal, JSX, Show, For } from "solid-js";
import { Quote, Race, Schema } from "../../schema";
import { id } from "../../id";
import { randInt } from "../../rand";

export function RaceArea(props: {
  z: Zero<Schema>;
  raceID: string;
  quote: Quote;
  status: Race["status"];
}) {
  const [playerRace] = useQuery(() =>
    props.z.query.player_race
      .where("raceID", "=", props.raceID)
      .where("playerID", "=", props.z.userID)
      .one(),
  );

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
    <Show when={playerRace()}>
      <RaceInput
        z={props.z}
        quote={props.quote}
        raceID={props.raceID}
        initialProgress={getInitialProgress()}
        hasFinished={!!playerRace()?.end}
        hasStarted={!!playerRace()?.start}
        status={props.status}
      />
    </Show>
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
}) {
  let inputRef: HTMLInputElement;
  const [input, setInput] = createSignal<string>("");
  const [charIndex, setCharIndex] = createSignal(props.initialProgress);

  const [otherQuotes] = useQuery(() =>
    props.z.query.quote.where("id", "!=", props.quote.id),
  );
  const [playerRaces] = useQuery(() =>
    props.z.query.player_race
      .where("raceID", "=", props.raceID)
      .related("player"),
  );

  function playerRace() {
    return playerRaces().find((r) => r.playerID === props.z.userID);
  }

  createEffect(() => {
    if (props.status === "started") {
      //@ts-expect-error -- Variable 'inputRef' is used before being assigned.
      inputRef.focus();
    }
  });

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
    const notFinishedCount = playerRaces()?.filter(
      (r) => r.end === null,
    ).length;

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

  function onChange(value: string) {
    const last = value[value.length - 1];
    const couldFinish = charIndex() + value.length >= props.quote.body.length;

    if (!props.hasStarted) {
      props.z.mutate.player_race.update({
        raceID: props.raceID,
        playerID: props.z.userID,
        start: Date.now(),
      });
    }

    if ((last === " " || couldFinish) && target() === value.trim()) {
      // move to next word
      setCharIndex((i) => i + value.length);
      setInput("");

      const progress = charIndex();
      const isComplete = progress >= props.quote.body.length; // could be 1 char more because of the last space

      // save progress
      props.z.mutate.player_race.update({
        raceID: props.raceID,
        playerID: props.z.userID,
        progress: Math.min(progress, props.quote.body.length),
        end: isComplete ? Date.now() : null,
      });

      if (isComplete) {
        onFinish();
      }
    } else {
      setInput(value);
    }

    const typedWidth = typedRef?.offsetWidth ?? 0;
    setOffset(typedWidth);
  }

  function isActive() {
    return props.status === "started";
  }

  return (
    <label
      for="input-id"
      class="relative transition-all flex-1 h-full flex items-center"
    >
      <For each={playerRaces().filter((r) => r.playerID !== props.z.userID)}>
        {(race) => (
          <Cursor
            color={race.player?.color}
            placement="bottom"
            isActive={isActive()}
          >
            {race.player?.name}
          </Cursor>
        )}
      </For>

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
          </span>
          <span class="bg-red-600 rounded-xs">{display().incorrect}</span>
          <span class="text-stone-400">{display().rest}</span>
        </div>
      </div>

      <input
        id="input-id"
        // @ts-expect-error Variable 'inputRef' is used before being assigned
        ref={inputRef}
        // type="hidden"
        class="fixed -top-full -left-full"
        value={input()}
        disabled={props.hasFinished || props.status !== "started"}
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
