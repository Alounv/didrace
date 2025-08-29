import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { getCurrentUser } from "../convex";
import { randInt } from "../utils/rand";
import convex from "../convex";

/*
 * Create a new race
 */
export async function create({ quotes }: { quotes: { _id: Id<"quotes"> }[] }) {
  const { token } = getCurrentUser();

  const quoteID = quotes[randInt(quotes.length)]._id;

  const raceId = await convex.mutation(api.races.createRace, {
    quoteID,
    ...(token ? { token } : {}),
  });

  // Auto-join the created race
  await convex.mutation(api.races.joinRace, {
    raceId,
    ...(token ? { token } : {}),
  });

  return raceId;
}

/**
 * Starts a race
 */
export async function start({
  raceID,
  isAlone,
}: {
  raceID: Id<"races">;
  isAlone: boolean;
}) {
  const { token } = getCurrentUser();

  if (isAlone) {
    await convex.mutation(api.races.updateRaceStatus, {
      raceId: raceID,
      status: "started",
      ...(token ? { token } : {}),
    });
    return;
  }

  await convex.mutation(api.races.updateRaceStatus, {
    raceId: raceID,
    status: "starting",
    ...(token ? { token } : {}),
  });

  setTimeout(async () => {
    await convex.mutation(api.races.updateRaceStatus, {
      raceId: raceID,
      status: "started",
      ...(token ? { token } : {}),
    });
  }, 1000 * 4);
}

/**
 * End race and create next race
 */
export async function end({
  raceID,
  quotes,
}: {
  raceID: Id<"races">;
  quotes: { _id: Id<"quotes"> }[];
}) {
  const { token } = getCurrentUser();

  // Create new race
  const newRaceId = await convex.mutation(api.races.createRace, {
    quoteID: quotes[randInt(quotes.length)]._id,
    ...(token ? { token } : {}),
  });

  // Update current race to finished with next race ID
  await convex.mutation(api.races.setNextRaceID, {
    raceId: raceID,
    nextRaceID: newRaceId,
    ...(token ? { token } : {}),
  });

  await convex.mutation(api.races.updateRaceStatus, {
    raceId: raceID,
    status: "finished",
    ...(token ? { token } : {}),
  });

  return newRaceId;
}

/*
 * Logic each time a player leaves the race
 */
export async function leave({ raceID }: { raceID: Id<"races"> }) {
  const { token } = getCurrentUser();

  await convex.mutation(api.races.leaveRace, {
    raceId: raceID,
    ...(token ? { token } : {}),
  });
}

/**
 * Join a race
 */
export async function join({ raceID }: { raceID: Id<"races"> }) {
  const { token } = getCurrentUser();

  return await convex.mutation(api.races.joinRace, {
    raceId: raceID,
    ...(token ? { token } : {}),
  });
}

/**
 * Update player progress in race
 */
export async function updateProgress({
  raceID,
  progress,
  start,
  end,
  effect,
  item,
}: {
  raceID: Id<"races">;
  progress: number;
  start: number;
  end?: number;
  effect?: "stuned" | "poisoned" | "faded";
  item?: "missile" | "blob" | "fader";
}) {
  const { token } = getCurrentUser();

  await convex.mutation(api.races.updatePlayerProgress, {
    raceId: raceID,
    progress,
    start,
    ...(end ? [end] : []),
    ...(effect ? [effect] : []),
    ...(item ? [item] : []),
    ...(token ? { token } : {}),
  });
}
