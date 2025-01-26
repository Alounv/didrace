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

  const [input, setInput] = createSignal<string>("");
  const [wordIndex, setWordIndex] = createSignal(0);
  const [charIndex, setCharIndex] = createSignal(0);

  function quote() {
    return race()?.quote?.body ?? "";
  }

  function target() {
    return quote().split(" ")[wordIndex()];
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
    const total = quote();

    const saved = total.slice(0, charI);
    const correct = typed.slice(0, correctIndex);
    const incorrect = typed.slice(correctIndex);
    const rest = total.slice(index, -1);

    return {
      saved,
      correct,
      incorrect,
      rest,
    };
  }

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
            <h3>
              <span style={{ color: "gray" }}>{display().saved}</span>
              <span style={{ color: "green" }}>{display().correct}</span>
              <span style={{ color: "red" }}>{display().incorrect}</span>
              <span>{display().rest}</span>
            </h3>
            <input
              type="text"
              value={input()}
              onInput={(e) => {
                const value = e.currentTarget.value;
                const last = value[value.length - 1];

                if (last === " " && target() === value.slice(0, -1)) {
                  // move to next word
                  setWordIndex((i) => i + 1);
                  setCharIndex((i) => i + value.length);
                  setInput("");

                  // save progress
                  z.mutate.player_race.update({
                    raceID: race().id,
                    playerID: z.userID,
                    progress: charIndex() + value.length,
                  });

                  return;
                }

                setInput(value);
              }}
            />
          </>
        )}
      </Show>
    </>
  );
}

export default Race;
