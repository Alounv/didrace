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
      ('t1', 'Citation 1', 'La vie est un mystère qu''il faut vivre, et non un problème à résoudre.'),
      ('t2', 'Citation 2', 'Le bonheur n''est pas une destination à atteindre, mais une façon de voyager.'),
      ('t3', 'Citation 3', 'On ne voit bien qu''avec le cœur. L''essentiel est invisible pour les yeux.'),
      ('t4', 'Citation 4', 'Le succès n''est pas final, l''échec n''est pas fatal. C''est le courage de continuer qui compte.'),
      ('t5', 'Citation 5', 'La plus grande gloire n''est pas de ne jamais tomber, mais de se relever à chaque chute.'),
      ('t6', 'Citation 6', 'La simplicité est la sophistication suprême.');

  -- Add a sample race
  INSERT INTO "race" (id, "quoteID", "authorID", status, timestamp) VALUES
    ('r1', 't1', 'p1', 'ready', 1701234567890);

  -- Add some player_race entries
  INSERT INTO "player_race" ("playerID", "raceID", progress, start, "end") VALUES
    ('p1', 'r1', 100, 1701234567890, 1701234587890),
    ('p2', 'r1', 75, 1701234567890, NULL),
    ('p3', 'r1', 0, NULL, NULL);
