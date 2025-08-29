import { For, Match, Switch } from "solid-js";
import type { PlayerRace } from "../../types";
import { randInt } from "../../utils/rand";

const AFFECTED_LENGTH = 24;

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
            {(char, index) => (
              <Letter letter={char} effect={props.effect} index={index()} />
            )}
          </For>
        </div>
      )}
    </>
  );
}

function Letter(props: {
  letter: string;
  effect: PlayerRace["effect"];
  index: number;
}) {
  return (
    <Switch>
      <Match when={props.effect === "stuned"}>
        <div class={getStunedClass()}>
          <div id="letter" class={getStunedClass()}>
            {props.letter}
          </div>
        </div>
      </Match>

      <Match when={props.effect !== "stuned"}>
        <div>
          <div id="letter" class={getAnimationClass(props.effect)}>
            {props.letter}
          </div>
        </div>
      </Match>
    </Switch>
  );
}

function getAnimationClass(effect: PlayerRace["effect"]) {
  switch (effect) {
    case "poisoned":
      return "scale-300 transition-all duration-5000";
    case "faded":
      return "opacity-0 transition-all duration-5000";
    default:
      return "transition-all duration-5000";
  }
}

function getStunedClass() {
  return ANIMATIONS[randInt(3) as 0 | 1 | 2 | 3];
}

const ANIMATIONS = {
  0: "animate-spin",
  1: "animate-bounce",
  2: "animate-pulse",
  3: "animate-ping",
};
