import { Id } from "../convex/_generated/dataModel";

export type Player = {
  _id: Id<"players">;
  discordID?: string;
  avatar?: string;
  color: string;
  name: string;
  lastLogin?: number;
};

export type Quote = {
  _id: Id<"quotes">;
  body: string;
  source: string;
};

export type Race = {
  _id: Id<"races">;
  quoteID: Id<"quotes">;
  authorID: Id<"players">;
  status: "ready" | "starting" | "started" | "finished" | "cancelled";
  nextRaceID?: Id<"races">;
  timestamp: number;
};

export type PlayerRace = {
  _id: Id<"playerRaces">;
  playerID: Id<"players">;
  raceID: Id<"races">;
  progress: number;
  start?: number;
  end?: number;
  effect?: "stuned" | "poisoned" | "faded";
  item?: "missile" | "blob" | "fader";
};

export type TypedWord = {
  _id: Id<"typedWords">;
  playerID: Id<"players">;
  raceID: Id<"races">;
  word: string;
  duration: number;
  hadError: boolean;
  timestamp: number;
};

// Helper types for components with populated relations
export type RaceWithRelations = Race & {
  quote?: Quote;
  author?: Player;
  players?: Player[];
};

export type PlayerRaceWithPlayer = PlayerRace & {
  player: Player;
};
