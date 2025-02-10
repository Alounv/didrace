import { id } from "./utils/id";
import { randBetween, randInt } from "./utils/rand";
import type { Player, PlayerRace, Quote, Race } from "./schema";

const PLAYER_NAMES = [
  "SpeedTyper",
  "WordNinja",
  "KeyboardWarrior",
  "TypeMaster",
  "SwiftFingers",
  "TextRacer",
  "TypeLightning",
  "WordWizard",
  "KeyboardKing",
  "RapidTyper",
];

const SAMPLE_QUOTES = [
  "The quick brown fox jumps over the lazy dog.",
  "A wizard's job is to vex chumps quickly in fog.",
  "Pack my box with five dozen liquor jugs.",
  "How vexingly quick daft zebras jump!",
  "The five boxing wizards jump quickly.",
];

export function generateQuotes(count: number): Quote[] {
  return Array.from({ length: count }, (_, i) => ({
    id: id(),
    source: `Quote ${i + 1}`,
    body: SAMPLE_QUOTES[i % SAMPLE_QUOTES.length],
  }));
}

export function generatePlayers(count: number): Player[] {
  return Array.from({ length: count }, (_, i) => ({
    id: id(),
    name: PLAYER_NAMES[i % PLAYER_NAMES.length],
    color: "",
    discordID: null,
    avatar: null,
    lastLogin: 0,
  }));
}

export function generateRaces(
  count: number,
  quotes: Quote[],
  players: Player[],
): Race[] {
  return Array.from({ length: count }, () => ({
    id: id(),
    quoteID: quotes[randInt(quotes.length - 1)].id,
    authorID: players[randInt(players.length - 1)].id,
    status: "ready" as const,
    timestamp: Date.now(),
    nextRaceID: null,
  }));
}

export function generatePlayerRaces(
  races: Race[],
  players: Player[],
  participationRate = 0.7,
): PlayerRace[] {
  const playerRaces: PlayerRace[] = [];

  for (const race of races) {
    for (const player of players) {
      // Randomly decide if this player participates in this race
      if (Math.random() < participationRate) {
        const hasStarted = Math.random() < 0.8;
        const hasFinished = hasStarted && Math.random() < 0.7;

        playerRaces.push({
          playerID: player.id,
          raceID: race.id,
          progress: hasFinished ? 100 : hasStarted ? randBetween(0, 99) : 0,
          start: hasStarted ? Date.now() - randBetween(0, 60000) : null,
          end: hasFinished ? Date.now() : null,
        });
      }
    }
  }

  return playerRaces;
}

export function generateTestData(
  options: {
    quoteCount?: number;
    playerCount?: number;
    raceCount?: number;
    participationRate?: number;
  } = {},
) {
  const {
    quoteCount = 5,
    playerCount = 10,
    raceCount = 8,
    participationRate = 0.7,
  } = options;

  const quotes = generateQuotes(quoteCount);
  const players = generatePlayers(playerCount);
  const races = generateRaces(raceCount, quotes, players);
  const playerRaces = generatePlayerRaces(races, players, participationRate);

  return {
    quotes,
    players,
    races,
    playerRaces,
  };
}
