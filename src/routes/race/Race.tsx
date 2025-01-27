import { Zero } from "@rocicorp/zero";
import { useQuery } from "@rocicorp/zero/solid";
import { useParams } from "@solidjs/router";
import { Show, Match, Switch } from "solid-js";
import { Schema } from "../../schema";
import { CountDown } from "./CountDown";
import { RaceArea } from "./RaceArea";
import { DebugSection } from "./DebugSection";
import { End } from "./End";

function RacePage(props: { z: Zero<Schema> }) {
  const params = useParams();
  const [race] = useQuery(() =>
    props.z.query.race
      .where("id", "=", params.id)
      .one()
      .related("author")
      .related("quote"),
  );

  function quote() {
    return race()?.quote?.body ?? "";
  }

  return (
    <Show when={race()}>
      {(race) => (
        <>
          <Switch>
            <Match when={race().status === "finished"}>
              <End
                z={props.z}
                raceID={race().id}
                quote={quote()}
                nextRaceID={race().nextRaceID}
              />
            </Match>

            <Match when={race().status !== "finished"}>
              <>
                <div class="flex gap-8 my-auto items-center w-full h-12">
                  <div class="w-1/2 flex justify-end">
                    <CountDown
                      raceID={race().id}
                      status={race().status}
                      z={props.z}
                    />
                  </div>

                  <Show when={race().quote}>
                    {(quote) => (
                      <RaceArea
                        quote={quote()}
                        raceID={race().id}
                        z={props.z}
                        status={race().status}
                      />
                    )}
                  </Show>
                </div>
              </>
            </Match>
          </Switch>

          <DebugSection raceID={race().id} z={props.z} quote={quote()} />
        </>
      )}
    </Show>
  );
}

export default RacePage;
