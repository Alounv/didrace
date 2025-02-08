import { Zero } from "@rocicorp/zero";
import { Accessor, createEffect, Show } from "solid-js";
import { Player, PlayerRace, Quote, Race, Schema } from "../../schema";
import { RaceInput } from "./RaceInput";

export function RaceArea(props: {
  z: Zero<Schema>;
  raceID: string;
  quote: Quote;
  status: Race["status"];
  playerRaces: Accessor<(PlayerRace & { player: Player })[]>;
}) {
  function playerRace() {
    return props.playerRaces().find((r) => r.playerID === props.z.userID);
  }

  createEffect(() => {
    // reset player race on refresh
    props.z.mutate.player_race.upsert({
      playerID: props.z.userID,
      raceID: props.raceID,
      progress: 0,
      start: null,
      end: null,
    });
  });

  function getInitialProgress() {
    const progress = playerRace()?.progress ?? 0;
    const body = props.quote.body;
    const quoteLength = body.length;

    if (progress === quoteLength) {
      return quoteLength;
    }
    const soFar = body.slice(0, progress);
    const lastSpaceIndex = soFar.lastIndexOf(" ");

    return lastSpaceIndex === -1 ? 0 : Math.min(lastSpaceIndex + 1, progress);
  }

  return (
    <Show when={playerRace()}>
      <RaceInput
        z={props.z}
        quote={props.quote}
        raceID={props.raceID}
        initialProgress={getInitialProgress()}
        playerRaces={props.playerRaces}
        status={props.status}
      />
    </Show>
  );
}
