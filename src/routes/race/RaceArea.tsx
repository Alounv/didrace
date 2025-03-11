import { Zero } from "@rocicorp/zero";
import { onMount, Show } from "solid-js";
import { Player, PlayerRace, Quote, Race, Schema } from "../../schema";
import { RaceInput } from "./RaceInput";
import { resetPlayerRace } from "../../domain/playerRace";

export function RaceArea(props: {
  z: Zero<Schema>;
  raceID: string;
  quote: Quote;
  status: Race["status"];
  playerRaces: (PlayerRace & { player: Player })[];
}) {
  return (
    <Show
      when={props.playerRaces.some((r) => r.playerID === props.z.userID)}
      fallback={<Initializer {...props} />}
    >
      <RaceInput
        z={props.z}
        quote={props.quote}
        raceID={props.raceID}
        playerRaces={props.playerRaces}
        status={props.status}
      />
    </Show>
  );
}

function Initializer(props: {
  z: Zero<Schema>;
  raceID: string;
  status: Race["status"];
}) {
  // Initialize player race, or reset it  on mount
  onMount(() => {
    if (["ready", "started", "starting"].includes(props.status)) {
      resetPlayerRace(props);
    }
  });
  return <div />;
}
