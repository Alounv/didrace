import { Zero } from "@rocicorp/zero";
import { useQuery } from "@rocicorp/zero/solid";
import { useParams } from "@solidjs/router";
import { Show } from "solid-js";
import { Schema } from "../../schema";
import { CountDown } from "./CountDown";
import { RaceArea } from "./RaceArea";
import { DebugSection } from "./DebugSection";

function RacePage(props: { z: Zero<Schema> }) {
  const params = useParams();
  const [race] = useQuery(() =>
    props.z.query.race
      .where("id", "=", params.id)
      .one()
      .related("author")
      .related("quote")
      .related("player_races")
      .related("players"),
  );

  function quote() {
    return race()?.quote?.body ?? "";
  }

  function hasStartedTyping(): boolean {
    const progress =
      race()?.player_races?.find((pr) => pr.playerID === props.z.userID)
        ?.progress ?? 0;
    return progress > 0;
  }

  return (
    <Show when={race()}>
      {(race) => (
        <>
          <div class="flex gap-8 my-auto items-center w-full h-12">
            <div class="w-1/2 flex justify-end">
              <CountDown
                raceID={race().id}
                status={race().status}
                hasStartedTyping={hasStartedTyping()}
                z={props.z}
              />
            </div>

            <RaceArea
              quote={quote()}
              raceID={race().id}
              z={props.z}
              status={race().status}
            />
          </div>

          <DebugSection raceID={race().id} z={props.z} quote={quote()} />
        </>
      )}
    </Show>
  );
}

export default RacePage;
