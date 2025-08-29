import { createQuery } from "../../convex-solid";
import { useNavigate, useParams } from "@solidjs/router";
import { api } from "../../../convex/_generated/api";
import { getCurrentUser } from "../../convex";
import { Accessor, createEffect, JSX, Match, Show, Switch } from "solid-js";
import { PlayerRaceWithPlayer, RaceWithRelations } from "../../types";
import { CountDown } from "./CountDown";
import { End } from "./End";
import { RaceArea } from "./RaceArea";
import { Id } from "../../../convex/_generated/dataModel";

function RacePage() {
  const params = useParams();
  const { userID, token } = getCurrentUser();

  const race = createQuery(api.races.getRace, () => ({
    raceId: params.id as Id<"races">,
    ...(token ? { token } : {}),
  })) as Accessor<RaceWithRelations | null>;

  const playerRaces = createQuery(api.races.getPlayerRaces, () => ({
    raceId: params.id as Id<"races">,
    ...(token ? { token } : {}),
  })) as Accessor<PlayerRaceWithPlayer[]>;

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
    <Show when={race()} fallback={"no race"}>
      {(race) => (
        <Switch>
          <Match
            when={race().status === "ready" || race().status === "starting"}
          >
            <Layout>
              <CountDown
                race={race()}
                playerRace={playerRace()!}
                isAlone={playerRaces().length === 1}
              />
            </Layout>
          </Match>
          <Match when={race().status === "started"}>
            <Layout>
              <RaceArea
                race={race()}
                playerRaces={playerRaces()}
                quote={quote()}
              />
            </Layout>
          </Match>
          <Match when={race().status === "finished"}>
            <End race={race()} playerRaces={playerRaces()} />
          </Match>
        </Switch>
      )}
    </Show>
  );
}

function Layout(props: { children: JSX.Element }) {
  return (
    <div class="flex gap-8 my-auto items-center w-full h-12 relative">
      <div class="w-4/10 flex justify-end">{props.children}</div>
    </div>
  );
}

export default RacePage;
