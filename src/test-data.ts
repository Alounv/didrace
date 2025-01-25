import { randBetween, randID, randInt } from "./rand";
import type { Text, Player, Race, PlayerRace } from "./schema";

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

const SAMPLE_TEXTS = [
  "The quick brown fox jumps over the lazy dog.",
  "A wizard's job is to vex chumps quickly in fog.",
  "Pack my box with five dozen liquor jugs.",
  "How vexingly quick daft zebras jump!",
  "The five boxing wizards jump quickly.",
];

export function generateTexts(count: number): Text[] {
  return Array.from({ length: count }, (_, i) => ({
    id: randID(),
    title: `Text ${i + 1}`,
    body: SAMPLE_TEXTS[i % SAMPLE_TEXTS.length],
  }));
}

export function generatePlayers(count: number): Player[] {
  return Array.from({ length: count }, (_, i) => ({
    id: randID(),
    name: PLAYER_NAMES[i % PLAYER_NAMES.length],
  }));
}

export function generateRaces(
  count: number,
  texts: Text[],
  players: Player[],
): Race[] {
  return Array.from({ length: count }, () => ({
    id: randID(),
    textID: texts[randInt(texts.length - 1)].id,
    authorID: players[randInt(players.length - 1)].id,
    status: "ready" as const,
    timestamp: Date.now(),
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
    textCount?: number;
    playerCount?: number;
    raceCount?: number;
    participationRate?: number;
  } = {},
) {
  const {
    textCount = 5,
    playerCount = 10,
    raceCount = 8,
    participationRate = 0.7,
  } = options;

  const texts = generateTexts(textCount);
  const players = generatePlayers(playerCount);
  const races = generateRaces(raceCount, texts, players);
  const playerRaces = generatePlayerRaces(races, players, participationRate);

  return {
    texts,
    players,
    races,
    playerRaces,
  };
}
