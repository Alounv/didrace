import { Show, For } from "solid-js";
import { useQuery } from "@rocicorp/zero/solid";
import { Zero } from "@rocicorp/zero";
import { Schema } from "../schema";
import { A } from "@solidjs/router";
import { id } from "../id";

function Home(props: { z: Zero<Schema> }) {
  const [races] = useQuery(() =>
    props.z.query.race.where("status", "IN", ["ready", "started"]),
  );

  return (
    <Show when={races().length}>
      <ol>
        <For each={races()}>
          {(race) => (
            <li>
              <A href={`/races/${race.id}`}>
                <span>{race.id}</span> - <span>{race.status}</span>
              </A>
              {race.authorID === props.z.userID && (
                <button
                  onClick={() => {
                    props.z.mutate.race.update({
                      id: race.id,
                      status: "cancelled",
                    });
                  }}
                >
                  Delete
                </button>
              )}
            </li>
          )}
        </For>
      </ol>

      <button
        onClick={() => {
          props.z.mutate.race.insert({
            id: id(),
            status: "ready",
            authorID: props.z.userID,
            quoteID: getRandomQuoteId(),
            timestamp: Date.now(),
          });
        }}
      >
        Create race
      </button>
    </Show>
  );
}

export default Home;
