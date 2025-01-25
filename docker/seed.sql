DROP TABLE IF EXISTS "player", "text", "race", "player_race", "typed_word";

CREATE DATABASE didrace;

\c didrace;

CREATE TABLE "player" (
  "id" VARCHAR PRIMARY KEY,
  "name" VARCHAR NOT NULL
);

CREATE TABLE "text" (
  "id" VARCHAR PRIMARY KEY,
  "title" VARCHAR NOT NULL,
  "body" VARCHAR NOT NULL
);

CREATE TABLE "race" (
  "id" VARCHAR PRIMARY KEY,
  "textID" VARCHAR REFERENCES "text"(id),
  "authorID" VARCHAR REFERENCES "player"(id),
  "status" VARCHAR CHECK (status IN ('ready', 'started', 'finished')) NOT NULL,
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

INSERT INTO "text" (id, title, body) VALUES
  ('t1', 'Text 1', 'The quick brown fox jumps over the lazy dog.'),
  ('t2', 'Text 2', 'Pack my box with five dozen liquor jugs.'),
  ('t3', 'Text 3', 'How vexingly quick daft zebras jump!');

-- Add a sample race
INSERT INTO "race" (id, textID, authorID, status, timestamp) VALUES
  ('r1', 't1', 'p1', 'ready', 1701234567890);

-- Add some player_race entries
INSERT INTO "player_race" (playerID, raceID, progress, start, end) VALUES
  ('p1', 'r1', 100, 1701234567890, 1701234587890),
  ('p2', 'r1', 75, 1701234567890, NULL),
  ('p3', 'r1', 0, NULL, NULL);
