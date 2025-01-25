import {
  createSchema,
  definePermissions,
  ExpressionBuilder,
  Row,
  NOBODY_CAN,
  table,
  string,
  boolean,
  relationships,
  number,
  enumeration,
} from "@rocicorp/zero";

// --- Tables ---

const player = table("player")
  .columns({
    id: string(),

    name: string(),
  })
  .primaryKey("id");

const text = table("text")
  .columns({
    id: string(),

    title: string(),
    body: string(),
  })
  .primaryKey("id");

const race = table("race")
  .columns({
    id: string(),
    textID: string(),
    authorID: string(),

    status: enumeration<"ready" | "started" | "finished">(),
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
  text: one({
    sourceField: ["textID"],
    destField: ["id"],
    destSchema: text,
  }),
  author: one({
    sourceField: ["authorID"],
    destField: ["id"],
    destSchema: player,
  }),
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
  tables: [player, text, race, player_race, typed_word],
  relationships: [
    raceRelationships,
    playerRaceRelationships,
    playerRelationships,
  ],
});

export type Schema = typeof schema;
export type Player = Row<typeof schema.tables.player>;
export type Text = Row<typeof schema.tables.text>;
export type Race = Row<typeof schema.tables.race>;
export type PlayerRace = Row<typeof schema.tables.player_race>;
export type TypedWord = Row<typeof schema.tables.typed_word>;

// The contents of your decoded JWT.
type AuthData = { sub: string | null };

// --- Permissions ---

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

  const allowIfAuthor = (
    authData: AuthData,
    { cmp }: ExpressionBuilder<Schema, "race">,
  ) => {
    return cmp("authorID", "=", authData.sub ?? "foo");
  };

  return {
    player: {
      row: {
        insert: NOBODY_CAN,
        update: { preMutation: [allowIfHimself] },
        delete: [allowIfHimself],
      },
    },
    text: {
      row: {
        insert: NOBODY_CAN,
        update: { preMutation: NOBODY_CAN },
        delete: NOBODY_CAN,
      },
    },
    player_race: {
      row: {
        insert: [allowIfLoggedIn],
        update: { preMutation: [allowIfRacePlayer] },
        delete: NOBODY_CAN,
      },
    },
    race: {
      row: {
        insert: [allowIfLoggedIn],
        update: { preMutation: [allowIfAuthor] },
        delete: NOBODY_CAN,
      },
    },
    typed_word: {
      row: {
        insert: [allowIfWordPlayer],
        update: { preMutation: NOBODY_CAN },
        delete: NOBODY_CAN,
      },
    },
  };
});

// --- Exports ---

export default {
  schema,
  permissions,
};
