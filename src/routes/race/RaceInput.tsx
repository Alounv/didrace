import { Zero } from "@rocicorp/zero";
import { useQuery } from "@rocicorp/zero/solid";
import { createEffect, createSignal } from "solid-js";
import { Player, PlayerRace, Quote, Race, Schema } from "../../schema";
import { id } from "../../utils/id";
import { randInt } from "../../utils/rand";
import { Podium } from "./Podium";
import { Adversaries, AdversariesSides } from "./Adversaries";
import { Cursor } from "./Cursor";
import { EndRaceButton } from "./EndRaceButton";

export function RaceInput(props: {
  z: Zero<Schema>;
  quote: Quote;
  raceID: string;
  initialProgress: number;
  status: Race["status"];
  playerRaces: (PlayerRace & { player: Player })[];
}) {
  // --- States ---

  let inputRef: HTMLInputElement;
  let typedRef: HTMLSpanElement | undefined;
  let textRef: HTMLDivElement | undefined;
  let containerRef: HTMLLabelElement | undefined;
  const [input, setInput] = createSignal<string>("");
  const [charIndex, setCharIndex] = createSignal(props.initialProgress);
  const [isCursorActive, setIsCursorActive] = createSignal(false);
  const [offset, setOffset] = createSignal(0);
  const [freeRightSpace, setFreeRightSpace] = createSignal(0);
  const [otherQuotes] = useQuery(() =>
    props.z.query.quote.where("id", "!=", props.quote.id),
  );
  const [offsets, setOffests] = createSignal<Record<string, number>>({});
  const [positions, setPositions] = createSignal<
    Record<string, "left" | "right">
  >({});

  // --- Effects ---

  createEffect(() => {
    if (canPlayerPlay()) {
      inputRef!.focus();
    }
  });

  // --- Derived ---

  function playerRace() {
    return props.playerRaces.find((r) => r.playerID === props.z.userID);
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
  function adversaries() {
    return props.playerRaces.filter((r) => r.playerID !== props.z.userID);
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

  async function endRace() {
    const newRaceId = id();
    const quoteID = otherQuotes()[randInt(otherQuotes().length)].id;

    await Promise.all([
      // Create next race
      props.z.mutate.race.insert({
        id: newRaceId,
        status: "ready",
        authorID: props.z.userID,
        quoteID,

        timestamp: Date.now(),
      }),

      // Terminate current race
      props.z.mutate.race.update({
        id: props.raceID,
        status: "finished",
        nextRaceID: newRaceId,
      }),
    ]);
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

      const notFinishedCount = adversaries().filter(
        (r) => r.end === null,
      ).length;

      // Race complete
      if (notFinishedCount === 0) {
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
    <>
      <AdversariesSides
        side="left"
        players={adversaries()
          .map((r) => r.player)
          .filter((p) => positions()[p.id] === "left")}
      />

      <AdversariesSides
        side="right"
        players={adversaries()
          .map((r) => r.player)
          .filter((p) => positions()[p.id] === "right")}
      />

      <label
        for="input-id"
        class="relative transition-all flex-1 h-full flex items-center"
        ref={containerRef}
      >
        {!playerRace()?.end && (
          <Cursor
            player={playerRace()?.player as Player}
            isActive={isCursorActive()}
            isPulsing={charIndex() === 0}
            isCurrent
          >
            You
          </Cursor>
        )}

        <div
          class="absolute top-0 w-max transition-all left-0 h-full flex items-center gap-12"
          style={{ translate: `-${offset()}px` }}
          ref={textRef}
        >
          <div class="font-quote text-2xl tracking-widest">
            <span ref={typedRef}>
              <span class="text-white">{display().saved}</span>
              <span class="text-white transition-all">{display().correct}</span>
              <span class="bg-red-600 rounded-xs">{display().incorrect}</span>
            </span>
            <span class="text-stone-400">{display().rest}</span>

            <Adversaries
              currentPlayerOffset={offset()}
              playerRaces={adversaries()}
              done={done}
              positionsSignal={[positions, setPositions]}
              offsetsSignal={[offsets, setOffests]}
            />
          </div>
        </div>

        <div
          class="absolute right-0 transition-opacity"
          style={{ opacity: (freeRightSpace() - 200) / 100 }}
        >
          <Podium playerRaces={props.playerRaces} quoteLength={text().length}>
            <EndRaceButton endRace={endRace} playerRaces={props.playerRaces} />
          </Podium>
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
            setOffset(typedRef?.offsetWidth ?? 0);
            setFreeRightSpace(
              (containerRef?.offsetWidth ?? 0) -
                (textRef?.offsetWidth ?? 0) +
                (typedRef?.offsetWidth ?? 0),
            );
          }}
        />
      </label>
    </>
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

  const incorrect = Math.max(chars.length - correctIndex, 0);
  const index = correctIndex + charIndex;

  return {
    correct: typed.slice(0, correctIndex),
    incorrect: typed.slice(correctIndex).replace(/ /g, "_"),
    rest: text.slice(index + incorrect),
    saved: text.slice(0, charIndex),
  };
}
