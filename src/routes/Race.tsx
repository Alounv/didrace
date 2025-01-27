import { Zero } from "@rocicorp/zero";
import { useQuery } from "@rocicorp/zero/solid";
import { A, useParams } from "@solidjs/router";
import { createEffect, createSignal, For, Show } from "solid-js";
import { Race, Schema } from "../schema";

const TIME_TO_START = 1000 * 3;

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

  const [countdown, setCountdown] = createSignal(TIME_TO_START / 1000);

  // const inputRef: HTMLInputElement | null = null;

  createEffect(() => {
    if (race()?.status === "starting") {
      if (countdown() > 0) {
        setTimeout(() => setCountdown(countdown() - 1), 1000);
      } else {
        // focus
        // inputRef?.current?.focus();
      }
    }
  });

  return (
    <Show when={params.id}>
      <A href="/">Home</A>
      <hr />

      <Show when={race()}>
        {(race) => (
          <>
            <div>Race: {race().id}</div>
            <div>Created by: {race().author?.name}</div>
            <div>
              Status: {race().status}{" "}
              {race().status === "starting" && countdown()}
            </div>
            {race().status === "ready" && (
              <button
                onClick={() => {
                  props.z.mutate.race.update({
                    id: race().id,
                    status: "starting",
                  });

                  setTimeout(() => {
                    props.z.mutate.race.update({
                      id: race().id,
                      status: "started",
                    });
                  }, TIME_TO_START);
                }}
              >
                Start
              </button>
            )}
            <div>Length: {quote().length}</div>
            <hr />
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
            <hr />
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
            <RaceArea
              quote={quote()}
              raceID={race().id}
              z={props.z}
              status={race().status}
            />
          </>
        )}
      </Show>
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
    props.z.mutate.player_race.upsert({
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
    return lastSpaceIndex === -1 ? 0 : lastSpaceIndex + 1;
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

  return (
    <>
      <h3>
        <span style={{ color: "gray" }}>{display().saved}</span>
        <span style={{ color: "green" }}>{display().correct}</span>
        <span style={{ color: "red" }}>{display().incorrect}</span>
        <span>{display().rest}</span>
      </h3>

      <input
        //@ts-expect-error -- Variable 'inputRef' is used before being assigned.
        ref={inputRef}
        type="text"
        value={input()}
        disabled={props.isComplete() || props.status !== "started"}
        onInput={(e) => {
          const value = e.currentTarget.value;
          const last = value[value.length - 1];

          if (last === " " && target() === value.slice(0, -1)) {
            // move to next word
            setCharIndex((i) => i + value.length);
            setInput("");

            const progress = charIndex() + value.length;
            const isComplete = progress >= props.quote.length; // could be 1 char more because of the last space

            // save progress
            props.z.mutate.player_race.update({
              raceID: props.raceID,
              playerID: props.z.userID,
              progress: Math.min(progress, props.quote.length),
              end: isComplete ? Date.now() : null,
            });

            return;
          }

          setInput(value);
        }}
      />

      <button
        onClick={() => {
          setInput("");
          setCharIndex(0);
          props.z.mutate.player_race.update({
            raceID: props.raceID,
            playerID: props.z.userID,
            progress: 0,
            end: null,
          });
        }}
      >
        Reset
      </button>
    </>
  );
}

export default RacePage;
