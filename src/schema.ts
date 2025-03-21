import {
  ANYONE_CAN,
  boolean,
  createSchema,
  definePermissions,
  enumeration,
  ExpressionBuilder,
  NOBODY_CAN,
  number,
  relationships,
  Row,
  string,
  table,
} from "@rocicorp/zero";

// --- Tables ---

const player = table("player")
  .columns({
    id: string(),

    discordID: string().optional(),
    avatar: string().optional(),

    color: string(),
    name: string(),
    lastLogin: number().optional(),
  })
  .primaryKey("id");

const quote = table("quote")
  .columns({
    id: string(),

    body: string(),
    source: string(),
  })
  .primaryKey("id");

const race = table("race")
  .columns({
    id: string(),
    quoteID: string(),
    authorID: string(),

    status: enumeration<
      "ready" | "starting" | "started" | "finished" | "cancelled"
    >(),
    nextRaceID: string().optional(),
    timestamp: number(),
  })
  .primaryKey("id");

const player_race = table("player_race")
  .columns({
    playerID: string(),
    raceID: string(),

    progress: number(),
    start: number().optional(), // null means the player never started typing
    end: number().optional(), // null means the player did not finish the race

    effect: enumeration<"stuned" | "poisoned" | "faded">().optional(),
    item: enumeration<"missile" | "blob" | "fader">().optional(),
  })
  .primaryKey("playerID", "raceID");

// This data should only be used for analytics never during a race itself
const typed_word = table("typed_word")
  .columns({
    id: string(),

    playerID: string(),
    raceID: string(),

    word: string(),
    duration: number(),
    hadError: boolean(),
    timestamp: number(),
  })
  .primaryKey("id");

// --- Relationships ---

const raceRelationships = relationships(race, ({ one, many }) => ({
  player_races: many({
    sourceField: ["id"],
    destField: ["raceID"],
    destSchema: player_race,
  }),
  quote: one({
    sourceField: ["quoteID"],
    destField: ["id"],
    destSchema: quote,
  }),
  author: one({
    sourceField: ["authorID"],
    destField: ["id"],
    destSchema: player,
  }),
  players: many(
    {
      sourceField: ["id"],
      destField: ["raceID"],
      destSchema: player_race,
    },
    {
      sourceField: ["playerID"],
      destField: ["id"],
      destSchema: player,
    },
  ),
}));

const playerRaceRelationships = relationships(player_race, ({ one, many }) => ({
  race: one({
    sourceField: ["raceID"],
    destField: ["id"],
    destSchema: race,
  }),
  player: one({
    sourceField: ["playerID"],
    destField: ["id"],
    destSchema: player,
  }),
  typed_words: many({
    sourceField: ["playerID", "raceID"],
    destField: ["playerID", "raceID"],
    destSchema: typed_word,
  }),
  quote: many(
    {
      sourceField: ["raceID"],
      destField: ["id"],
      destSchema: race,
    },
    {
      sourceField: ["quoteID"],
      destSchema: quote,
      destField: ["id"],
    },
  ),
}));

const playerRelationships = relationships(player, ({ many }) => ({
  races: many({
    sourceField: ["id"],
    destField: ["playerID"],
    destSchema: player_race,
  }),
  typed_words: many({
    sourceField: ["id"],
    destField: ["playerID"],
    destSchema: typed_word,
  }),
}));

// --- Schema ---

export const schema = createSchema(1, {
  tables: [player, quote, race, player_race, typed_word],
  relationships: [
    raceRelationships,
    playerRaceRelationships,
    playerRelationships,
  ],
});

export type Schema = typeof schema;
export type Player = Row<typeof schema.tables.player>;
export type Quote = Row<typeof schema.tables.quote>;
export type Race = Row<typeof schema.tables.race>;
export type PlayerRace = Row<typeof schema.tables.player_race>;
export type TypedWord = Row<typeof schema.tables.typed_word>;

// The contents of your decoded JWT.
type AuthData = { sub: string | null };

// --- Permissions ---

// export const permissions = definePermissions<AuthData, Schema>(schema, () => {
//   const allowIfIssueCreator = (
//     authData: AuthData,
//     {cmp}: ExpressionBuilder<IssueSchema>,
//   ) => cmp('creatorID', '=', authData.sub);

//   return {
//     issue: {
//       row: {
//         delete: [allowIfIssueCreator],
//       },
//     },
//   };
// });

export const permissions = definePermissions<AuthData, Schema>(schema, () => {
  const allowIfLoggedIn = (
    authData: AuthData,
    { cmpLit }: ExpressionBuilder<Schema, keyof Schema["tables"]>,
  ) => cmpLit(authData.sub, "IS NOT", null);

  const allowIfHimself = (
    authData: AuthData,
    { cmp }: ExpressionBuilder<Schema, "player">,
  ) => {
    return cmp("id", "=", authData.sub ?? "foo");
  };

  const allowIfWordPlayer = (
    authData: AuthData,
    { cmp }: ExpressionBuilder<Schema, "typed_word">,
  ) => {
    return cmp("playerID", "=", authData.sub ?? "foo");
  };

  const allowIfRacePlayer = (
    authData: AuthData,
    { cmp }: ExpressionBuilder<Schema, "player_race">,
  ) => {
    return cmp("playerID", "=", authData.sub ?? "foo");
  };

  return {
    player: {
      row: {
        select: [allowIfLoggedIn],
        insert: NOBODY_CAN,
        update: {
          preMutation: [allowIfHimself],
          postMutation: [allowIfHimself],
        },
        delete: [allowIfHimself],
      },
    },
    quote: {
      row: {
        select: ANYONE_CAN,
        insert: NOBODY_CAN,
        update: { preMutation: NOBODY_CAN, postMutation: NOBODY_CAN },
        delete: NOBODY_CAN,
      },
    },
    player_race: {
      row: {
        select: [allowIfLoggedIn],
        insert: [allowIfLoggedIn],
        update: {
          preMutation: [allowIfLoggedIn],
          postMutation: [allowIfLoggedIn],
        },
        delete: [allowIfRacePlayer],
      },
    },
    race: {
      row: {
        select: [allowIfLoggedIn],
        insert: [allowIfLoggedIn],
        update: {
          preMutation: [allowIfLoggedIn],
          postMutation: [allowIfLoggedIn],
        },
        delete: [allowIfLoggedIn],
      },
    },
    typed_word: {
      row: {
        select: [allowIfWordPlayer],
        insert: [allowIfWordPlayer],
        update: { preMutation: NOBODY_CAN, postMutation: NOBODY_CAN },
        delete: NOBODY_CAN,
      },
    },
  };
});

export default {
  schema,
  permissions,
};
