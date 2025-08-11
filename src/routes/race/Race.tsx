import { createQuery } from "../../convex-solid";
import { useNavigate, useParams } from "@solidjs/router";
import { api } from "../../../convex/_generated/api";
import { getCurrentUser } from "../../convex";
import { Accessor, createEffect, Match, Show, Switch } from "solid-js";
import { PlayerRaceWithPlayer, RaceWithRelations } from "../../types";
import { CountDown } from "./CountDown";
import { End } from "./End";
import { RaceArea } from "./RaceArea";

function RacePage() {
  const params = useParams();
  const { userID, token } = getCurrentUser();
  
  const race = createQuery(api.races.getRace, {
    raceId: params.id as any,
    token,
  }) as Accessor<RaceWithRelations | null>;

  const playerRaces = createQuery(api.races.getPlayerRaces, {
    raceId: params.id as any,
    token,
  }) as Accessor<PlayerRaceWithPlayer[]>;

  function playerRace() {
    return playerRaces()?.find((r) => r.playerID === userID);
  }

  function quote() {
    return race()?.quote?.body ?? "";
  }

  const navigate = useNavigate();

  createEffect(() => {
    if (userID === "anon") {
      navigate("/");
    }
  });

  createEffect(() => {
    // If the user got here via link, the race could be finished and he has no player race
    // In this case we redirect him directly to the next race
    const raceData = race();
    const playerRacesData = playerRaces();
    
    if (
      playerRacesData?.length &&
      !playerRace() &&
      raceData?.status === "finished" &&
      raceData?.nextRaceID
    ) {
      navigate(`/races/${raceData.nextRaceID}`);
    }
  });

  return (
    <Show when={race()}>
      <Switch>
        <Match when={race()?.status === "ready"}>
          <CountDown race={race()!} playerRace={playerRace()} />
        </Match>
        <Match when={race()?.status === "starting"}>
          <CountDown race={race()!} playerRace={playerRace()} />
        </Match>
        <Match when={race()?.status === "started"}>
          <RaceArea
            race={race()!}
            playerRace={playerRace()}
            playerRaces={playerRaces()}
            quote={quote()}
          />
        </Match>
        <Match when={race()?.status === "finished"}>
          <End race={race()!} playerRaces={playerRaces()} />
        </Match>
      </Switch>
    </Show>
  );
}

export default RacePage;
