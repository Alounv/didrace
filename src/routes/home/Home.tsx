import { Zero } from "@rocicorp/zero";
import { Schema } from "../../schema";
import { CreateRace } from "./CreateRace";
import { RaceList } from "./RaceList";

function Home(props: { z: Zero<Schema> }) {
  return (
    <>
      {props.z.userID === "anon" ? (
        <div class="text-xl mt-12 mx-auto">
          Please log in to see your races.
        </div>
      ) : (
        <div class="flex flex-col items-start gap-4">
          <RaceList z={props.z} />
          <CreateRace z={props.z} />
        </div>
      )}
    </>
  );
}

export default Home;
