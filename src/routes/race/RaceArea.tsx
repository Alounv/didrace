import { onMount, Show } from "solid-js";
import { createMutation } from "../../convex-solid";
import { api } from "../../../convex/_generated/api";
import { getCurrentUser } from "../../convex";
import { Race, PlayerRaceWithPlayer } from "../../types";
import { RaceInput } from "./RaceInput";

export function RaceArea(props: {
  race: Race;
  playerRace?: any;
  playerRaces: PlayerRaceWithPlayer[];
  quote: string;
}) {
  const { userID } = getCurrentUser();
  
  return (
    <Show
      when={props.playerRaces.some((r) => r.playerID === userID)}
      fallback={<Initializer race={props.race} />}
    >
      <RaceInput
        race={props.race}
        playerRace={props.playerRace}
        playerRaces={props.playerRaces}
        quote={props.quote}
      />
    </Show>
  );
}

function Initializer(props: { race: Race }) {
  const { token } = getCurrentUser();
  const joinRace = createMutation(api.races.joinRace);

  // Initialize player race on mount
  onMount(async () => {
    if (["ready", "started", "starting"].includes(props.race.status)) {
      await joinRace({
        raceId: props.race._id,
        token,
      });
    }
  });
  return <div />;
}
