import { Zero } from "@rocicorp/zero";
import { Schema } from "../schema";
import { id } from "../utils/id";

export async function saveTypedWord({
  word,
  start,
  now,
  hadError,
  z,
  raceID,
}: {
  word: string;
  start: number;
  now: number;
  hadError: boolean;
  z: Zero<Schema>;
  raceID: string;
}) {
  await z.mutate.typed_word.insert({
    id: id(),
    playerID: z.userID,
    raceID,
    word,
    duration: now - start,
    hadError,
    timestamp: now,
  });
}
