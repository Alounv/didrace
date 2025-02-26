import { For } from "solid-js";
import { PlayerRace } from "../../schema";
import { randInt } from "../../utils/rand";

const AFFECTED_LENGTH = 12;

export function RaceText(props: {
  text: string;
  effect: PlayerRace["effect"];
}) {
  function text() {
    const affected = props.text.slice(0, AFFECTED_LENGTH);
    const [, ...words] = affected
      .split("\u00A0")
      .flatMap((word) => ["\u00A0", word]);
    const rest = props.text.slice(AFFECTED_LENGTH);
    return { words, rest };
  }
  return (
    <div class="flex opacity-50">
      <For each={text().words}>
        {(word) => <Word word={word} effect={props.effect} />}
      </For>
      <span>{text().rest}</span>
    </div>
  );
}

function Word(props: { word: string; effect: PlayerRace["effect"] }) {
  return (
    <>
      {props.word === " " ? (
        <div> </div>
      ) : (
        <div class="flex">
          <For each={props.word.split("")}>
            {(char) => (
              <div class={getEffect(props.effect)}>
                <div class={getEffect(props.effect)}>{char}</div>
              </div>
            )}
          </For>
        </div>
      )}
    </>
  );
}

function getEffect(effect?: PlayerRace["effect"]) {
  switch (effect) {
    case "stuned":
      return `${ANIMATIONS[randInt(3) as 0 | 1 | 2 | 3]} $`;
    default:
      return "";
  }
}

const ANIMATIONS = {
  0: "animate-spin",
  1: "animate-bounce",
  2: "animate-pulse",
  3: "animate-ping",
};
