import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { getCurrentUser } from "../convex";
import convex from "../convex";

export async function saveTypedWord({
  word,
  start,
  now,
  hadError,
  raceID,
}: {
  word: string;
  start: number;
  now: number;
  hadError: boolean;
  raceID: Id<"races">;
}) {
  const { token } = getCurrentUser();
  
  await convex.mutation(api.analytics.saveTypedWord, {
    raceId: raceID,
    word,
    duration: now - start,
    hadError,
    timestamp: now,
    token,
  });
}