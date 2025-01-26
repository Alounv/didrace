  DROP TABLE IF EXISTS "player", "quote", "race", "player_race", "typed_word";

  CREATE TABLE "player" (
    "id" VARCHAR PRIMARY KEY,
    "name" VARCHAR NOT NULL
  );

  CREATE TABLE "quote" (
    "id" VARCHAR PRIMARY KEY,
    "title" VARCHAR NOT NULL,
    "body" VARCHAR NOT NULL
  );

  CREATE TABLE "race" (
    "id" VARCHAR PRIMARY KEY,
    "quoteID" VARCHAR REFERENCES "quote"(id),
    "authorID" VARCHAR REFERENCES "player"(id),
    "status" VARCHAR CHECK (status IN ('ready', 'starting', 'started', 'finished', 'cancelled')) NOT NULL,
    "timestamp" BIGINT NOT NULL
  );

  CREATE TABLE "player_race" (
    "playerID" VARCHAR REFERENCES "player"(id),
    "raceID" VARCHAR REFERENCES "race"(id),
    "progress" INTEGER NOT NULL,
    "start" BIGINT,
    "end" BIGINT,
    PRIMARY KEY ("playerID", "raceID")
  );

  CREATE TABLE "typed_word" (
    "id" VARCHAR PRIMARY KEY,
    "playerID" VARCHAR REFERENCES "player"(id),
    "raceID" VARCHAR REFERENCES "race"(id),
    "word" VARCHAR NOT NULL,
    "duration" INTEGER NOT NULL,
    "hadError" BOOLEAN NOT NULL,
    "timestamp" BIGINT NOT NULL
  );

  -- Sample data
  INSERT INTO "player" (id, name) VALUES
    ('p1', 'SpeedTyper'),
    ('p2', 'WordNinja'),
    ('p3', 'KeyboardWarrior');

    INSERT INTO "quote" (id, title, body) VALUES
      ('t1', 'Quote 1', 'It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness, it was the epoch of belief, it was the epoch of incredulity, it was the season of Light, it was the season of Darkness, it was the spring of hope, it was the winter of despair.'),
      ('t2', 'Quote 2', 'In a hole in the ground there lived a hobbit. Not a nasty, dirty, wet hole, filled with the ends of worms and an oozy smell, nor yet a dry, bare, sandy hole with nothing in it to sit down on or to eat: it was a hobbit-hole, and that means comfort.'),
      ('t3', 'Quote 3', 'All this happened, more or less. The war parts, anyway, are pretty much true. One guy I knew really was shot in Dresden for taking a teapot that wasn''t his. Another guy I knew really did threaten to have his personal enemies killed by hired gunmen after the war.');

  -- Add a sample race
  INSERT INTO "race" (id, "quoteID", "authorID", status, timestamp) VALUES
    ('r1', 't1', 'p1', 'ready', 1701234567890);

  -- Add some player_race entries
  INSERT INTO "player_race" ("playerID", "raceID", progress, start, "end") VALUES
    ('p1', 'r1', 100, 1701234567890, 1701234587890),
    ('p2', 'r1', 75, 1701234567890, NULL),
    ('p3', 'r1', 0, NULL, NULL);
