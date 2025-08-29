import { useNavigate, useParams } from "@solidjs/router";
import {
  type Accessor,
  createEffect,
  type JSX,
  Match,
  onCleanup,
  onMount,
  Show,
  Switch,
} from "solid-js";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { getCurrentUser } from "../../convex";
import { createMutation, createQuery } from "../../convex-solid";
import type {
  PlayerRaceWithPlayer,
  Race,
  RaceWithRelations,
} from "../../types";
import { CountDown } from "./CountDown";
import { End } from "./End";
import { RaceInput } from "./RaceInput";

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
  const leaveRace = createMutation(api.races.leaveRace);

  createEffect(() => {
    if (userID === "anon") {
      navigate("/");
    }
  });

  // Leave race when component unmounts or page is closed
  onCleanup(() => {
    if (playerRace() && token) {
      leaveRace({
        raceId: params.id as Id<"races">,
        token,
      });
    }
  });

  // Leave race when page is closed/refreshed
  onMount(() => {
    const handleBeforeUnload = () => {
      if (playerRace() && token) {
        leaveRace({
          raceId: params.id as Id<"races">,
          token,
        });
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    onCleanup(() => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    });
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
        <Show when={playerRace()} fallback={<Initializer race={race()} />}>
          {(playerRace) => (
            <Switch>
              <Match
                when={
                  race().status === "ready" ||
                  race().status === "starting" ||
                  race().status === "started"
                }
              >
                <Layout
                  countdown={
                    <CountDown
                      race={race()}
                      playerRace={playerRace()!}
                      isAlone={playerRaces().length === 1}
                    />
                  }
                  racearea={
                    <RaceInput
                      race={race()}
                      playerRace={playerRace()}
                      playerRaces={playerRaces()}
                      quote={quote()}
                    />
                  }
                />
              </Match>
              <Match when={race().status === "finished"}>
                <End race={race()} playerRaces={playerRaces()} />
              </Match>
            </Switch>
          )}
        </Show>
      )}
    </Show>
  );
}

function Layout(props: { countdown?: JSX.Element; racearea?: JSX.Element }) {
  return (
    <div class="flex gap-8 my-auto items-center w-full h-12 relative">
      <div class="w-4/10 flex justify-end">{props.countdown}</div>
      {props.racearea}
    </div>
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
        ...(token ? { token } : {}),
      });
    }
  });
  return <div />;
}

export default RacePage;
