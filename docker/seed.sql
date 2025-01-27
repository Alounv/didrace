  DROP TABLE IF EXISTS "player", "quote", "race", "player_race", "typed_word";

  CREATE TABLE "player" (
    "id" VARCHAR PRIMARY KEY,
    "name" VARCHAR NOT NULL
  );

  CREATE TABLE "quote" (
    "id" VARCHAR PRIMARY KEY,
    "body" VARCHAR NOT NULL
  );

  CREATE TABLE "race" (
    "id" VARCHAR PRIMARY KEY,
    "quoteID" VARCHAR REFERENCES "quote"(id),
    "authorID" VARCHAR REFERENCES "player"(id),
    "nextRaceID" VARCHAR REFERENCES "race"(id),
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

    INSERT INTO "quote" (id, body) VALUES
      ('t1', 'La vie est un mystère qu''il faut vivre, et non un problème à résoudre.'),
      ('t2', 'Le bonheur n''est pas une destination à atteindre, mais une façon de voyager.'),
      ('t3', 'On ne voit bien qu''avec le cœur. L''essentiel est invisible pour les yeux.'),
      ('t4', 'Le succès n''est pas final, l''échec n''est pas fatal. C''est le courage de continuer qui compte.'),
      ('t5', 'La plus grande gloire n''est pas de ne jamais tomber, mais de se relever à chaque chute.'),
      ('t6', 'La simplicité est la sophistication suprême.');
