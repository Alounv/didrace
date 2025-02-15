import { Zero } from "@rocicorp/zero";
import { Schema } from "../schema";
import { id } from "../utils/id";
import { randInt } from "../utils/rand";

/*
 * Create a new race
 */
export function create({
  z,
  newId,
  quotes,
}: {
  z: Zero<Schema>;
  newId?: string;
  quotes: { id: string }[];
}) {
  const quoteID = quotes[randInt(quotes.length)].id;
  z.mutate.race.insert({
    id: newId ?? id(),
    status: "ready",
    authorID: z.userID,
    quoteID: quoteID,
    timestamp: Date.now(),
  });
}

/**
 * Starts a race
 */
export function start({
  z,
  raceID,
  isAlone,
}: {
  z: Zero<Schema>;
  raceID: string;
  isAlone: boolean;
}) {
  if (isAlone) {
    z.mutate.race.update({
      id: raceID,
      status: "started",
    });
    return;
  }

  z.mutate.race.update({
    id: raceID,
    status: "starting",
  });

  setTimeout(() => {
    z.mutate.race.update({
      id: raceID,
      status: "started",
    });
  }, 1000 * 4);
}

/**
 * End race and create next race
 */
export async function end({
  z,
  raceID,
  quotes,
}: {
  z: Zero<Schema>;
  raceID: string;
  quotes: { id: string }[];
}) {
  const newId = id();

  await Promise.all([
    create({ z, newId, quotes }),
    z.mutate.race.update({
      id: raceID,
      status: "finished",
      nextRaceID: newId,
    }),
  ]);
}

/*
 * Logic each time a player leaves the race
 */
export async function leave({
  z,
  raceID,
  isAlone,
}: {
  z: Zero<Schema>;
  raceID: string;
  isAlone: boolean;
}) {
  await z.mutate.player_race.delete({
    playerID: z.userID,
    raceID,
  });

  if (isAlone) {
    await z.mutate.race.update({ id: raceID, status: "finished" });
  }
}
