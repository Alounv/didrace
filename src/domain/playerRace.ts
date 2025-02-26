import { Zero } from "@rocicorp/zero";
import { PlayerRace, Schema } from "../schema";
import { randInt } from "../utils/rand";

/**
 * Initialize or reset player race
 */
export function resetPlayerRace({
  z,
  raceID,
}: {
  z: Zero<Schema>;
  raceID: string;
}) {
  z.mutate.player_race.upsert({
    playerID: z.userID,
    raceID: raceID,
    progress: 0,
    start: null,
    end: null,
  });
}

/**
 * Update player race
 */
export function savePlayerRace({
  z,
  raceID,
  partial,
}: {
  z: Zero<Schema>;
  raceID: string;
  partial: Partial<PlayerRace>;
}) {
  z.mutate.player_race.update({
    raceID: raceID,
    playerID: z.userID,
    ...partial,
  });
}

/**
 * Determin in wich category each caracter should be displayed
 */
export function getProgress({
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

/**
 * Logic each time a character is typed
 * Returns a boolean that indicates if a word has been completed
 */
export function onTyped({
  z,
  raceID,
  typed,
  charIndex,
  text,
  target,
  adversaries,
  endRace,
  playerRace,
}: {
  z: Zero<Schema>;
  raceID: string;
  typed: string;
  charIndex: number;
  text: string;
  target: string;
  adversaries: { progress: number; end: null | number }[];
  endRace: () => void;
  playerRace: PlayerRace;
}): boolean {
  const progress = Math.min(charIndex + typed.length, text.length);

  // There is a error --> (word not complete)
  if (!target.startsWith(typed.trim())) {
    return false;
  }

  // Player race complete --> save player progress and end player race
  if (progress === text.length) {
    savePlayerRace({
      z,
      raceID,
      partial: { progress, end: Date.now() },
    });

    const notFinishedCount = adversaries.filter((r) => r.end === null).length;

    // Race complete
    if (notFinishedCount === 0) {
      endRace();
    }

    return false;
  }

  // Word complete --> (save player progress and move to next word)
  if (target.length + 1 === typed.length) {
    const isLast = adversaries.every((a) => a.progress > progress);
    const shouldHaveItem = isLast && !playerRace.item && randInt(4) === 0;

    savePlayerRace({
      z,
      raceID,
      partial: {
        progress,
        ...(shouldHaveItem ? { item: "missile" } : {}),
      },
    });

    return true;
  }

  savePlayerRace({
    z,
    raceID,
    partial: { progress, start: playerRace.start ?? Date.now() },
  });
  return false;
}

/**
 * Calculate speed for a race
 */
export function getSpeed({
  end,
  start,
  len,
}: {
  end: number | null | undefined;
  start: number;
  len: number;
}) {
  const duration = (end ?? Date.now()) - start;
  const sec = duration / 1000;
  const min = sec / 60;

  return {
    sec: Math.round(sec),
    wpm: Math.round(len / 5 / min),
  };
}

/**
 * Sort player races by end time, then by progress and add speed
 */
export function computePlayerRaces<P extends PlayerRace>({
  playerRaces,
}: {
  playerRaces: P[];
}): (P & { wpm: number })[] {
  // Sort player races by end time, then by progress
  const races = [...playerRaces];
  races.sort((a, b) => {
    const aEnd = a.end;
    const bEnd = b.end;

    if (aEnd && bEnd) {
      return aEnd - bEnd;
    }

    if (aEnd) return -1;
    if (bEnd) return 1;

    return b.progress - a.progress;
  });

  // Calculate start time
  const start = Math.min(
    ...playerRaces.flatMap((r) => (r.start ? [r.start] : [])),
  );

  // Calculate speed for each race
  return races.map((race) => ({
    ...race,
    wpm: getSpeed({
      end: race.end,
      start,
      len: race.progress,
    }).wpm,
  }));
}

/**
 * Activate item logic here
 */
export async function activateItem({
  z,
  raceID,
  playerRace,
  adversaries,
}: {
  z: Zero<Schema>;
  raceID: string;
  playerRace: PlayerRace;
  adversaries: PlayerRace[];
}) {
  // remove item
  await z.mutate.player_race.update({
    playerID: z.userID,
    raceID: raceID,
    item: null,
  });

  // Activate item logic here
  switch (playerRace.item) {
    case "missile": {
      const first = adversaries.reduce((acc, r) =>
        r.progress > acc.progress ? r : acc,
      );

      await z.mutate.player_race.update({
        playerID: first!.playerID,
        raceID: raceID,
        effect: "stuned",
      });

      break;
    }
    default:
      break;
  }
}
