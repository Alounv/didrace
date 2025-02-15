import { Zero } from "@rocicorp/zero";
import { Accessor, onMount, Show } from "solid-js";
import { Player, PlayerRace, Quote, Race, Schema } from "../../schema";
import { RaceInput } from "./RaceInput";
import { resetPlayerRace } from "../../domain/playerRace";

export function RaceArea(props: {
  z: Zero<Schema>;
  raceID: string;
  quote: Quote;
  status: Race["status"];
  playerRaces: Accessor<(PlayerRace & { player: Player })[]>;
}) {
  // Initialize player race, or reset it  on mount
  onMount(() => {
    resetPlayerRace(props);
  });

  return (
    <Show when={props.playerRaces().some((r) => r.playerID === props.z.userID)}>
      <RaceInput
        z={props.z}
        quote={props.quote}
        raceID={props.raceID}
        playerRaces={props.playerRaces()}
        status={props.status}
      />
    </Show>
  );
}
