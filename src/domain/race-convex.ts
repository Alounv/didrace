import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import convex, { getCurrentUser } from "../convex";

/*

/**
 * End race and create next race
 */
export async function end({ raceID }: { raceID: Id<"races"> }) {
  const { token } = getCurrentUser();

  // Create new race
  const newRaceId = await convex.mutation(api.races.createRace, {
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
