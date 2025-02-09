import { Show } from "solid-js";
import { Zero } from "@rocicorp/zero";
import { Schema } from "../../schema";
import { PopulatedRace, RaceList } from "./RaceList";
import { useQuery } from "@rocicorp/zero/solid";
import { CreateRace } from "./CreateRace";

function Home(props: { z: Zero<Schema> }) {
  const [races] = useQuery(() =>
    props.z.query.race
      .where("status", "IN", ["ready", "started"])
      .orderBy("timestamp", "desc")
      .related("author")
      .related("players"),
  );

  function openRaces() {
    return races().filter((r) => r.status === "ready") as PopulatedRace[];
  }

  function ongoingRaces() {
    return races().filter((r) => r.status === "started") as PopulatedRace[];
  }

  return (
    <>
      {props.z.userID === "anon" ? (
        <div class="text-xl mt-12 mx-auto">
          Please log in to see your races.
        </div>
      ) : (
        <div class="flex flex-col items-start gap-4">
          <RaceList z={props.z} races={openRaces()} title="Open races">
            <CreateRace z={props.z} />
          </RaceList>

          <Show when={ongoingRaces().length > 0}>
            <RaceList
              z={props.z}
              races={ongoingRaces()}
              title="Ongoing races"
            />
          </Show>
        </div>
      )}
    </>
  );
}

export default Home;
