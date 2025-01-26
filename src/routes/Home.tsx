import { Show, For } from "solid-js";
import Cookies from "js-cookie";
import { useQuery } from "@rocicorp/zero/solid";
import { Zero } from "@rocicorp/zero";
import { Schema } from "../schema";
import { A } from "@solidjs/router";
import { randInt } from "../rand";
import { id } from "../id";

function Home(props: { z: Zero<Schema> }) {
  const [players] = useQuery(() => props.z.query.player);
  const [quotes] = useQuery(() => props.z.query.quote);
  const [races] = useQuery(() =>
    props.z.query.race.where("status", "IN", ["ready", "started"]),
  );

  const toggleLogin = async () => {
    if (props.z.userID === "anon") {
      await fetch("/api/login");
    } else {
      Cookies.remove("jwt");
    }
    location.reload();
  };

  const initialSyncComplete = () => players().length && quotes().length;

  const player = () =>
    players().find((p) => p.id === props.z.userID)?.name ?? "anon";

  const getRandomQuoteId = () => quotes()[randInt(quotes().length)].id;

  return (
    <Show when={initialSyncComplete()}>
      <div class="controls">
        <div style={{ "justify-content": "end" }}>
          {player() === "anon" ? "" : `Logged in as ${player()}`}
          <button onMouseDown={() => toggleLogin()}>
            {player() === "anon" ? "Login" : "Logout"}
          </button>
        </div>
      </div>

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
