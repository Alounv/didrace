import { Zero } from "@rocicorp/zero";
import { useQuery } from "@rocicorp/zero/solid";
import { createEffect, createSignal, Show } from "solid-js";
import { Race, Schema } from "../../schema";

export function RaceArea(props: {
  z: Zero<Schema>;
  raceID: string;
  quote: string;
  status: Race["status"];
}) {
  const [playerRaces] = useQuery(() =>
    props.z.query.player_race.where("raceID", "=", props.raceID),
  );

  function allFinished() {
    if (!playerRaces().length) return false;
    return playerRaces()?.every((r) => r.end !== null);
  }

  createEffect(() => {
    if (allFinished()) {
      props.z.mutate.race.update({
        id: props.raceID,
        status: "finished",
      });
    }
  });

  function playerRace() {
    return playerRaces()?.find((r) => r.playerID === props.z.userID);
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
    const initialProgress = playerRace()?.progress ?? 0;

    if (initialProgress === props.quote.length) {
      return props.quote.length;
    }
    const soFar = props.quote.slice(0, initialProgress);
    const lastSpaceIndex = soFar.lastIndexOf(" ");

    return lastSpaceIndex === -1
      ? 0
      : Math.min(lastSpaceIndex + 1, initialProgress);
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
  quote: string;
  raceID: string;
  initialProgress: number;
  hasFinished: boolean;
  hasStarted: boolean;
  status: Race["status"];
}) {
  let inputRef: HTMLInputElement;
  const [input, setInput] = createSignal<string>("");
  const [charIndex, setCharIndex] = createSignal(props.initialProgress);

  createEffect(() => {
    if (props.status === "started") {
      //@ts-expect-error -- Variable 'inputRef' is used before being assigned.
      inputRef.focus();
    }
  });

  function wordIndex() {
    const soFar = props.quote.slice(0, charIndex());
    return soFar.split(" ").length - 1;
  }

  function target() {
    return props.quote.split(" ")[wordIndex()];
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

    const saved = props.quote.slice(0, charI);
    const correct = typed.slice(0, correctIndex);
    const incorrect = typed.slice(correctIndex).replace(/ /g, "_");
    const rest = props.quote.slice(index);

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

  return (
    <label
      for="input-id"
      class="relative transition-all flex-1 h-full flex items-center"
    >
      {props.status === "started" && !props.hasFinished && (
        <div class="bg-sky-400 w-[2px] h-7 relative rounded -translate-x-0.5">
          <div class="bg-sky-400 absolute -top-7 text-white rounded-lg px-2 py-0.5 text-sm -translate-x-1/2">
            You
          </div>
        </div>
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
        onInput={(e) => {
          const value = e.currentTarget.value;
          const last = value[value.length - 1];
          const couldFinish = charIndex() + value.length >= props.quote.length;

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
            const isComplete = progress >= props.quote.length; // could be 1 char more because of the last space

            // save progress
            props.z.mutate.player_race.update({
              raceID: props.raceID,
              playerID: props.z.userID,
              progress: Math.min(progress, props.quote.length),
              end: isComplete ? Date.now() : null,
            });
          } else {
            setInput(value);
          }

          const typedWidth = typedRef?.offsetWidth ?? 0;
          setOffset(typedWidth);
        }}
      />
    </label>
  );
}
