import { Show, For } from "solid-js";
import { createQuery } from "../../convex-solid";
import { api } from "../../../convex/_generated/api";
import { getCurrentUser } from "../../convex";
import { CreateRace } from "./CreateRace";
import { A } from "@solidjs/router";
import { Avatar } from "../../components/Avatar";
import { formatDate } from "../../utils/date";

function Home() {
  const { userID, token, isAuthenticated } = getCurrentUser();
  
  const readyRaces = createQuery(api.races.getRacesByStatus, {
    status: "ready",
    token,
  });
  
  const startedRaces = createQuery(api.races.getRacesByStatus, {
    status: "started", 
    token,
  });

  return (
    <>
      {!isAuthenticated ? (
        <div class="text-xl mt-12 mx-auto">
          Please log in to see your races.
        </div>
      ) : (
        <div class="flex flex-col items-start gap-4">
          <RaceSection races={readyRaces()} title="Open races">
            <CreateRace />
          </RaceSection>

          <Show when={(startedRaces()?.length || 0) > 0}>
            <RaceSection races={startedRaces()} title="Ongoing races" />
          </Show>
        </div>
      )}
    </>
  );
}

export default Home;
