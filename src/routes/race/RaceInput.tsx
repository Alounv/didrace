import { createEffect, createSignal, Show } from "solid-js";
import { createQuery } from "../../convex-solid";
import { api } from "../../../convex/_generated/api";
import { getCurrentUser } from "../../convex";
import { Race, PlayerRaceWithPlayer, PlayerRace } from "../../types";
import { Podium } from "./Podium";
import { Adversaries, AdversariesSides } from "./Adversaries";
import { Cursor } from "./Cursor";
import { EndRaceButton } from "./EndRaceButton";
import { ItemAndEffect } from "./ItemAndEffect";
import { RaceText } from "./RaceText";
import {
  getProgress,
  onTyped,
  cleanEffect,
} from "../../domain/playerRace-convex";
import { saveTypedWord } from "../../domain/typedWords-convex";
import { end } from "../../domain/race-convex";
import { Id } from "../../../convex/_generated/dataModel";

const EFFECT_DURATION = 5000;

export function RaceInput(props: {
  race: Race;
  playerRace?: PlayerRace;
  playerRaces: PlayerRaceWithPlayer[];
  quote: string;
}) {
  const { userID, token } = getCurrentUser();
  // --- Refs ---

  let inputRef: HTMLInputElement;
  let typedRef: HTMLSpanElement | undefined;
  let textRef: HTMLDivElement | undefined;
  let containerRef: HTMLLabelElement | undefined;
  let hadErrorRef: boolean = false;
  let startRef: number | null = null;

  // --- States ---

  const [input, setInput] = createSignal<string>("");
  const [charIndex, setCharIndex] = createSignal(0);
  const [isCursorActive, setIsCursorActive] = createSignal(false);
  const [offset, setOffset] = createSignal(0);
  const [freeRightSpace, setFreeRightSpace] = createSignal(0);
  const otherQuotes = createQuery(api.quotes.getRandomQuotes, {
    excludeId: "" as Id<"quotes">,
    ...(token ? [token] : []),
  });
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

  createEffect(() => {
    if (playerRace()?.effect) {
      setTimeout(() => {
        cleanEffect({ raceID: props.race._id });
      }, EFFECT_DURATION);
    }
  });

  // --- Derived ---

  function playerRace() {
    return props.playerRaces.find((r) => r.playerID === userID);
  }
  function text() {
    return props.quote.replace(/'/g, "'") || "";
  }
  function wordIndex() {
    const soFar = text().slice(0, charIndex());
    return soFar.split(" ").length - 1;
  }
  function word() {
    return text().split(" ")[wordIndex()];
  }
  function canPlayerPlay() {
    return props.race.status === "started" && !playerRace()?.end;
  }
  function adversaries() {
    return props.playerRaces.filter((r) => r.playerID !== userID);
  }
  function done(progress: number): string {
    return text().slice(0, progress);
  }
  function display() {
    return getProgress({
      charIndex: charIndex(),
      current: word(),
      text: text(),
      typed: input(),
    });
  }

  // --- Render ---

  return (
    <>
      {JSON.stringify(props.quote)}
      <AdversariesSides
        side="left"
        players={adversaries()
          .map((r) => r.player)
          .filter((p) => positions()[p._id] === "left")}
      />

      <AdversariesSides
        side="right"
        players={adversaries()
          .map((r) => r.player)
          .filter((p) => positions()[p._id] === "right")}
      />

      <label
        for="input-id"
        class="relative transition-all flex-1 h-full flex items-center"
        ref={containerRef}
      >
        {!playerRace()?.end && (
          <div class="relative">
            <Show when={playerRace()}>
              {(playerRace) => (
                <>
                  <ItemAndEffect
                    raceID={props.race._id}
                    playerRace={playerRace()}
                    adversaries={adversaries()}
                  />

                  <Cursor
                    player={playerRace().player}
                    isActive={isCursorActive()}
                    isPulsing={charIndex() === 0}
                    isCurrent
                  >
                    You
                  </Cursor>
                </>
              )}
            </Show>
          </div>
        )}

        <div
          class="absolute top-0 w-max transition-all left-0 h-full flex items-center gap-12"
          style={{ translate: `-${offset()}px` }}
          ref={textRef}
        >
          <div class="font-quote text-2xl tracking-widest flex">
            <span ref={typedRef}>
              <span class="text-base-content">{display().saved}</span>
              <span class="text-base-content transition-all">
                {display().correct}
              </span>
              <span class="bg-error text-error-content rounded-xs">
                {display().incorrect}
              </span>
            </span>

            <RaceText text={display().rest} effect={playerRace()?.effect} />

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
            <EndRaceButton
              endRace={() => {
                void end({
                  raceID: props.race._id,
                  quotes: otherQuotes() || [],
                });
              }}
              playerRaces={props.playerRaces}
            />
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
          onInput={async (e) => {
            const typed = e.currentTarget.value;

            if (startRef === null) {
              startRef = Date.now();
            }

            const { hasError, isComplete } = await onTyped({
              raceID: props.race._id,
              typed,
              charIndex: charIndex(),
              text: text(),
              target: word(),
              adversaries: adversaries(),
              endRace: () =>
                end({ raceID: props.race._id, quotes: otherQuotes() || [] }),
              playerRace: playerRace()!,
            });

            if (hasError) {
              hadErrorRef = true;
            }

            if (isComplete) {
              const now = Date.now();
              setCharIndex((i) => i + typed.length);
              setInput("");
              saveTypedWord({
                raceID: props.race._id,
                word: typed,
                start: startRef,
                hadError: hadErrorRef,
                now,
              });
              hadErrorRef = false;
              startRef = null;
            } else {
              setInput(typed);
            }

            // Update offsets
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
