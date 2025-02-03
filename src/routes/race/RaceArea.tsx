import { Zero } from "@rocicorp/zero";
import { useQuery } from "@rocicorp/zero/solid";
import { Accessor, createEffect, createSignal, For, JSX, Show } from "solid-js";
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
    // reset player race on refresh
    props.z.mutate.player_race.upsert({
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
      <Show when={playerRaces()}>
        {(playerRaces) => (
          <RaceInput
            z={props.z}
            quote={props.quote}
            raceID={props.raceID}
            initialProgress={getInitialProgress()}
            playerRaces={
              playerRaces as Accessor<(PlayerRace & { player: Player })[]>
            }
            status={props.status}
          />
        )}
      </Show>
    </>
  );
}

function RaceInput(props: {
  z: Zero<Schema>;
  quote: Quote;
  raceID: string;
  initialProgress: number;
  status: Race["status"];
  playerRaces: Accessor<(PlayerRace & { player: Player })[]>;
}) {
  // --- States ---

  let inputRef: HTMLInputElement;
  let typedRef: HTMLSpanElement | undefined;
  let containerRef: HTMLLabelElement | undefined;
  const [input, setInput] = createSignal<string>("");
  const [charIndex, setCharIndex] = createSignal(props.initialProgress);
  const [isCursorActive, setIsCursorActive] = createSignal(false);
  const [otherQuotes] = useQuery(() =>
    props.z.query.quote.where("id", "!=", props.quote.id),
  );

  // --- Effects ---

  createEffect(() => {
    if (canPlayerPlay()) {
      inputRef!.focus();
    }
  });

  // --- Derived ---

  function playerRace() {
    return props.playerRaces().find((r) => r.playerID === props.z.userID);
  }
  function text() {
    return props.quote.body;
  }
  function wordIndex() {
    const soFar = text().slice(0, charIndex());
    return soFar.split(" ").length - 1;
  }
  function word() {
    return text().split(" ")[wordIndex()];
  }
  function canPlayerPlay() {
    return props.status === "started" && !playerRace()?.end;
  }
  function offset() {
    return typedRef?.offsetWidth ?? 0;
  }
  function textRightOffset() {
    return offset() - (containerRef?.offsetWidth ?? 0);
  }
  function done(progress: number): string {
    return text().slice(0, progress);
  }

  // --- Helpers

  function savePlayerRace(partial: Partial<PlayerRace>) {
    props.z.mutate.player_race.update({
      raceID: props.raceID,
      playerID: props.z.userID,
      ...(!playerRace()?.start && { start: Date.now() }),
      ...partial,
    });
  }

  function endRace() {
    const newRaceId = id();
    const quoteID = otherQuotes()[randInt(otherQuotes().length)].id;

    // Create next race
    props.z.mutate.race.insert({
      id: newRaceId,
      status: "ready",
      authorID: props.z.userID,
      quoteID,

      timestamp: Date.now(),
    });

    // Terminate current race
    props.z.mutate.race.update({
      id: props.raceID,
      status: "finished",
      nextRaceID: newRaceId,
    });
  }

  // --- Logic ---

  function onChange(typed: string): boolean {
    const progress = Math.min(charIndex() + typed.length, text().length);
    const target = word();

    // There is a error --> (word not complete)
    if (!target.startsWith(typed.trim())) {
      return false;
    }

    // Player race complete --> save player progress and end player race
    if (progress === text().length) {
      savePlayerRace({
        progress,
        end: Date.now(),
      });

      const notFinishedCount = props
        .playerRaces()
        ?.filter((r) => r.end === null).length;

      // Race complete
      if (notFinishedCount <= 1) {
        endRace();
      }

      return false;
    }

    // Word complete --> (save player progress and move to next word)
    if (target.length + 1 === typed.length) {
      savePlayerRace({ progress });
      setCharIndex((i) => i + typed.length);
      return true;
    }

    savePlayerRace({ progress });
    return false;
  }

  // --- Render ---

  function display() {
    return getDisplay({
      charIndex: charIndex(),
      current: word(),
      text: text(),
      typed: input(),
    });
  }

  return (
    <label
      for="input-id"
      class="relative transition-all flex-1 h-full flex items-center"
      ref={containerRef}
    >
      {!playerRace()?.end && (
        <Cursor
          color={playerRace()?.player?.color}
          isActive={isCursorActive()}
          isPulsing={charIndex() === 0}
        >
          You
        </Cursor>
      )}

      <div
        class="absolute top-0 w-max transition-all left-0 h-full flex items-center gap-12"
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
              <Cursor color={race.player?.color} placement="bottom" isActive>
                {race.player?.name}
              </Cursor>
            </div>
          )}
        </For>
      </div>

      <div
        class="absolute right-0 transition-opacity"
        style={{ opacity: textRightOffset() / 100 }}
      >
        <Podium playerRaces={props.playerRaces} />
      </div>

      <input
        id="input-id"
        autofocus
        ref={inputRef!}
        class="fixed -top-full -left-full"
        value={input()}
        disabled={!canPlayerPlay()}
        onBlur={() => setIsCursorActive(false)}
        onFocus={() => setIsCursorActive(true)}
        onInput={(e) => {
          const value = e.currentTarget.value;
          const isWordComplete = onChange(value);
          setInput(isWordComplete ? "" : value);
        }}
      />
    </label>
  );
}

function Cursor(props: {
  children: JSX.Element;
  color: string | undefined;
  placement?: "top" | "bottom";
  isActive: boolean;
  isPulsing?: boolean;
}) {
  return (
    <div
      class={`w-[2px] h-7 relative rounded -translate-x-0.5
        ${props.isActive ? "" : "opacity-30"}
        ${props.isPulsing && props.isActive ? "animate-pulse" : ""}
      `}
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

function getDisplay({
  current,
  typed,
  charIndex,
  text,
}: {
  current: string;
  typed: string;
  charIndex: number;
  text: string;
}) {
  const chars = typed.split("");

  let correctIndex = typed.length;
  for (let i = 0; i < chars.length; i++) {
    if (chars[i] !== current[i]) {
      correctIndex = i;
      break;
    }
  }

  const index = correctIndex + charIndex;

  return {
    correct: typed.slice(0, correctIndex),
    incorrect: typed.slice(correctIndex).replace(/ /g, "_"),
    rest: text.slice(index),
    saved: text.slice(0, charIndex),
  };
}
