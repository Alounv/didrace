import { Zero } from "@rocicorp/zero";
import { useQuery } from "@rocicorp/zero/solid";
import { useParams } from "@solidjs/router";
import { createEffect, createSignal, For, Show } from "solid-js";
import { Race, Schema } from "../schema";
import { Button } from "../design-system";

function RacePage(props: { z: Zero<Schema> }) {
  const params = useParams();
  const [race] = useQuery(() =>
    props.z.query.race
      .where("id", "=", params.id)
      .one()
      .related("author")
      .related("quote")
      .related("player_races")
      .related("players"),
  );

  function quote() {
    return race()?.quote?.body ?? "";
  }

  function hasStartedTyping(): boolean {
    const progress =
      race()?.player_races?.find((pr) => pr.playerID === props.z.userID)
        ?.progress ?? 0;
    return progress > 0;
  }

  return (
    <Show when={race()}>
      {(race) => (
        <>
          <div class="flex gap-8 my-auto items-center w-full">
            <div class="w-1/2 flex justify-end">
              <CountDown
                raceID={race().id}
                status={race().status}
                hasStartedTyping={hasStartedTyping()}
                z={props.z}
              />
            </div>

            <RaceArea
              quote={quote()}
              raceID={race().id}
              z={props.z}
              status={race().status}
            />
          </div>

          <DebugSection raceID={race().id} z={props.z} quote={quote()} />
        </>
      )}
    </Show>
  );
}

function RaceArea(props: {
  z: Zero<Schema>;
  raceID: string;
  quote: string;
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
      start: Date.now(),
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
        isComplete={() => !!playerRace()?.end}
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
  isComplete: () => boolean;
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
      class="font-quote text-2xl tracking-widest relative transition-all"
    >
      {props.status === "started" && !props.isComplete() && (
        <div class="border-sky-400 border-solid border-l-3 h-6 my-1 relative">
          <div class="bg-sky-400 absolute -top-7 text-white rounded-lg px-2 py-/2 text-sm -translate-x-1/2">
            You
          </div>
        </div>
      )}

      <div
        class="absolute top-0 w-max transition-all left-0"
        style={{ translate: `-${offset()}px` }}
      >
        <span ref={typedRef}>
          <span class="text-white">{display().saved}</span>
          <span class="text-white transition-all">{display().correct}</span>
        </span>
        <span class="bg-red-600 rounded-xs">{display().incorrect}</span>
        <span class="text-stone-400">{display().rest}</span>
      </div>

      <input
        id="input-id"
        // @ts-expect-error Variable 'inputRef' is used before being assigned
        ref={inputRef}
        // type="hidden"
        class="fixed -top-full -left-full"
        value={input()}
        disabled={props.isComplete() || props.status !== "started"}
        onInput={(e) => {
          const value = e.currentTarget.value;
          const last = value[value.length - 1];
          const couldFinish = charIndex() + value.length > props.quote.length;

          if (
            (last === " " || couldFinish) &&
            target() === value.slice(0, -1)
          ) {
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

function DebugSection(props: {
  z: Zero<Schema>;
  raceID: string;
  quote: string;
}) {
  const [race] = useQuery(() =>
    props.z.query.race
      .where("id", "=", props.raceID)
      .one()
      .related("author")
      .related("quote")
      .related("player_races")
      .related("players"),
  );
  return (
    <Show when={race()}>
      {(race) => (
        <div class="bg-background-light p-3 text-stone-500 mt-auto min-w-xl">
          <div class="text-xl">Debug Section</div>
          <br />
          <div>Race: {race().id}</div>
          <div>Created by: {race().author?.name}</div>
          <div>Length: {props.quote.length}</div>
          <div>Status: {race().status}</div>
          <br />
          Current Players:
          <ul>
            <For each={race().players ?? []}>
              {(p) => (
                <li>
                  <span>{p.id}</span> - <span>{p.name}</span>
                </li>
              )}
            </For>
          </ul>
          <br />
          Current Progress (in chars):
          <ul>
            <For each={race().player_races ?? []}>
              {(pr) => (
                <li>
                  <span>{pr.playerID}</span> - <span>{pr.progress}</span>
                </li>
              )}
            </For>
          </ul>
          <br />
          <div class="flex gap-2">
            <Button
              onClick={() => {
                props.z.mutate.player_race.update({
                  raceID: props.raceID,
                  playerID: props.z.userID,
                  progress: 0,
                  end: null,
                });

                window.location.reload();
              }}
            >
              Reset Progress
            </Button>
            <Button
              onClick={() => {
                props.z.mutate.race.update({
                  id: props.raceID,
                  status: "ready",
                });

                props.z.mutate.player_race.update({
                  raceID: props.raceID,
                  playerID: props.z.userID,
                  progress: 0,
                  end: null,
                });

                window.location.reload();
              }}
            >
              Reset Race
            </Button>
          </div>
        </div>
      )}
    </Show>
  );
}

function CountDown(props: {
  raceID: string;
  status: Race["status"];
  hasStartedTyping: boolean;
  z: Zero<Schema>;
}) {
  const [countdown, setCountdown] = createSignal(4);

  createEffect(() => {
    if (props.status === "starting" && countdown() > 0) {
      setTimeout(() => setCountdown(countdown() - 1), 1000);
    }
  });

  return (
    <div
      class={`flex flex-col gap-4 items-stretch mr-24 ${props.hasStartedTyping ? "opacity-0" : ""} transition-opacity`}
    >
      {props.status === "ready" ? (
        <Button
          class="mt-7"
          onClick={() => {
            props.z.mutate.race.update({
              id: props.raceID,
              status: "starting",
            });

            setTimeout(() => {
              props.z.mutate.race.update({
                id: props.raceID,
                status: "started",
              });
            }, 1000 * 4);
          }}
        >
          Start
        </Button>
      ) : (
        <div class="flex items-center gap-2">
          {["ready", "starting", "started"].includes(props.status) && (
            <Count status={props.status} countdown={countdown()} />
          )}
        </div>
      )}
    </div>
  );
}

const colorMap = {
  0: ["r", "r", "r"],
  1: ["r", "r", "r"],
  2: ["r", "r", null],
  3: ["r", null, null],
} as const;

function Count(props: { status: Race["status"]; countdown: number }) {
  const colors = () => {
    if (props.status === "started") {
      return ["g", "g", "g"] as const;
    }

    if (props.status === "starting" && [0, 1, 2, 3].includes(props.countdown)) {
      return colorMap[props.countdown as 0 | 1 | 2 | 3];
    }

    return [null, null, null] as const;
  };

  return (
    <>
      <Dot color={colors()[0]} />
      <Dot color={colors()[1]} />
      <Dot color={colors()[2]} />
    </>
  );
}

function Dot(props: { color: "r" | "g" | null }) {
  function colorClass() {
    switch (props.color) {
      case "r":
        return " bg-red-600";
      case "g":
        return " bg-green-600";
      default:
        return "bg-text";
    }
  }
  return <div class={`rounded-full h-7 w-7 ${colorClass()}`} />;
}

export default RacePage;
