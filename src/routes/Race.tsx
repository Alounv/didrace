import { Zero } from "@rocicorp/zero";
import { useQuery } from "@rocicorp/zero/solid";
import { A, useParams } from "@solidjs/router";
import { createSignal, For, Show } from "solid-js";
import { Schema } from "../schema";

function Race({ z }: { z: Zero<Schema> }) {
  const params = useParams();
  if (!params.id) {
    return <>No race id</>;
  }

  const [race] = useQuery(() =>
    z.query.race
      .where("id", "=", params.id)
      .one()
      .related("author")
      .related("quote")
      .related("player_races")
      .related("players"),
  );

  return (
    <>
      <A href="/">Home</A>
      <hr />

      <Show when={race()}>
        {(race) => (
          <>
            <div>Race: {race().id}</div>
            <div>Created by: {race().author?.name}</div>
            <div>Status: {race().status}</div>
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
              quote={race().quote?.body ?? ""}
              raceID={race().id}
              z={z}
            />
          </>
        )}
      </Show>
    </>
  );
}

function RaceArea({
  z,
  raceID,
  quote,
}: {
  z: Zero<Schema>;
  raceID: string;
  quote: string;
}) {
  const [playerRace] = useQuery(() =>
    z.query.player_race
      .where("raceID", "=", raceID)
      .where("playerID", "=", z.userID)
      .one(),
  );

  function getInitialProgress() {
    const initialProgress = playerRace()?.progress ?? 0;
    const soFar = quote.slice(0, initialProgress);
    const lastSpaceIndex = soFar.lastIndexOf(" ");
    return lastSpaceIndex === -1 ? 0 : lastSpaceIndex + 1;
  }

  return (
    <Show when={playerRace()}>
      <RaceInput
        z={z}
        quote={quote}
        raceID={raceID}
        initialProgress={getInitialProgress()}
        isComplete={() => !!playerRace()?.end}
      />
    </Show>
  );
}

function RaceInput({
  z,
  quote,
  raceID,
  initialProgress,
  isComplete,
}: {
  z: Zero<Schema>;
  quote: string;
  raceID: string;
  initialProgress: number;
  isComplete: () => boolean;
}) {
  const [input, setInput] = createSignal<string>("");
  const [charIndex, setCharIndex] = createSignal(initialProgress);

  function wordIndex() {
    const soFar = quote.slice(0, charIndex());
    return soFar.split(" ").length - 1;
  }

  function target() {
    return quote.split(" ")[wordIndex()];
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

    const saved = quote.slice(0, charI);
    const correct = typed.slice(0, correctIndex);
    const incorrect = typed.slice(correctIndex);
    const rest = quote.slice(index);

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
        type="text"
        value={input()}
        disabled={isComplete()}
        onInput={(e) => {
          const value = e.currentTarget.value;
          const last = value[value.length - 1];

          if (last === " " && target() === value.slice(0, -1)) {
            // move to next word
            setCharIndex((i) => i + value.length);
            setInput("");

            const progress = charIndex() + value.length;
            const isComplete = progress >= quote.length; // could be 1 char more because of the last space

            // save progress
            z.mutate.player_race.update({
              raceID,
              playerID: z.userID,
              progress: Math.min(progress, quote.length),
              end: isComplete ? new Date().getTime() : null,
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
          z.mutate.player_race.update({
            raceID,
            playerID: z.userID,
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

export default Race;
