import { Zero } from "@rocicorp/zero";
import { useQuery } from "@rocicorp/zero/solid";
import { createEffect, createSignal, Show } from "solid-js";
import { Player, PlayerRace, Quote, Race, Schema } from "../../schema";
import { Podium } from "./Podium";
import { Adversaries, AdversariesSides } from "./Adversaries";
import { Cursor } from "./Cursor";
import { EndRaceButton } from "./EndRaceButton";
import { getProgress, onTyped } from "../../domain/playerRace";
import { end } from "../../domain/race";
import { ItemAndEffect } from "./ItemAndEffect";
import { RaceText } from "./RaceText";

export function RaceInput(props: {
  z: Zero<Schema>;
  quote: Quote;
  raceID: string;
  status: Race["status"];
  playerRaces: (PlayerRace & { player: Player })[];
}) {
  // --- Refs ---

  let inputRef: HTMLInputElement;
  let typedRef: HTMLSpanElement | undefined;
  let textRef: HTMLDivElement | undefined;
  let containerRef: HTMLLabelElement | undefined;

  // --- States ---

  const [input, setInput] = createSignal<string>("");
  const [charIndex, setCharIndex] = createSignal(0);
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
          <div class="relative">
            <Show when={playerRace()}>
              {(playerRace) => (
                <ItemAndEffect
                  z={props.z}
                  raceID={props.raceID}
                  playerRace={playerRace()}
                  adversaries={adversaries()}
                />
              )}
            </Show>

            <Cursor
              player={playerRace()?.player as Player}
              isActive={isCursorActive()}
              isPulsing={charIndex() === 0}
              isCurrent
            >
              You
            </Cursor>
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

            <RaceText
              text={display().rest}
              effect={playerRace()?.effect ?? null}
            />

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
              endRace={() => end({ ...props, quotes: otherQuotes() })}
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
          onInput={(e) => {
            const typed = e.currentTarget.value;

            const isWordComplete = onTyped({
              ...props,
              typed,
              charIndex: charIndex(),
              text: text(),
              target: word(),
              adversaries: adversaries(),
              endRace: () => end({ ...props, quotes: otherQuotes() }),
              playerRace: playerRace()!,
            });

            if (isWordComplete) {
              setCharIndex((i) => i + typed.length);
              setInput("");
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
