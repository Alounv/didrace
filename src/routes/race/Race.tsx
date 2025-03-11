import { Zero } from "@rocicorp/zero";
import { useQuery } from "@rocicorp/zero/solid";
import { useNavigate, useParams } from "@solidjs/router";
import { Accessor, createEffect, Match, Show, Switch } from "solid-js";
import { Player, PlayerRace, Quote, Schema } from "../../schema";
import { CountDown } from "./CountDown";
import { End } from "./End";
import { RaceArea } from "./RaceArea";

function RacePage(props: { z: Zero<Schema> }) {
  const params = useParams();
  const [race] = useQuery(() =>
    props.z.query.race
      .where("id", "=", params.id)
      .one()
      .related("author")
      .related("quote"),
  );

  const playerRaces = useQuery(() =>
    props.z.query.player_race.where("raceID", "=", params.id).related("player"),
  )[0] as Accessor<(PlayerRace & { player: Player })[]>;

  function playerRace() {
    return playerRaces().find((r) => r.playerID === props.z.userID);
  }

  function quote() {
    return race()?.quote?.body ?? "";
  }

  const navigate = useNavigate();

  createEffect(() => {
    if (props.z.userID === "anon") {
      navigate("/");
    }
  });

  createEffect(() => {
    // If the user got here via link, the race could be finished and he has no player race
    // In this case we redirect him directly to the next race
    if (
      playerRaces().length &&
      !playerRace() &&
      race()?.status === "finished" &&
      race()?.nextRaceID
    ) {
      navigate(`/races/${race()?.nextRaceID}`);
    }
  });

  return (
    <Show when={playerRaces() && quote()}>
      <Show when={race()}>
        {(race) => (
          <>
            <Switch>
              <Match when={race().status === "finished" && playerRace()}>
                <End
                  z={props.z}
                  raceID={race().id}
                  quote={race().quote as Quote}
                  nextRaceID={race().nextRaceID}
                  playerRaces={playerRaces()}
                />
              </Match>

              <Match when={race().status !== "finished"}>
                <>
                  <div class="flex gap-8 my-auto items-center w-full h-12 relative">
                    <div class="w-4/10 flex justify-end">
                      <CountDown
                        raceID={race().id}
                        status={race().status}
                        z={props.z}
                        hasStartedTyping={(playerRace()?.progress ?? 0) > 0}
                        isAlone={playerRaces().length === 1}
                      />
                    </div>

                    <Show when={playerRaces()}>
                      {(playerRaces) => (
                        <RaceArea
                          quote={race().quote!}
                          raceID={race().id}
                          z={props.z}
                          status={race().status}
                          playerRaces={playerRaces()}
                        />
                      )}
                    </Show>
                  </div>
                </>
              </Match>
            </Switch>
          </>
        )}
      </Show>
    </Show>
  );
}

export default RacePage;
