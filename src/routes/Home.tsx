import { Show, For } from "solid-js";
import { useQuery } from "@rocicorp/zero/solid";
import { Zero } from "@rocicorp/zero";
import { Schema } from "../schema";
import { id } from "../id";
import { Button, Link } from "../design-system";
import { randInt } from "../rand";
import { formatDate } from "../date";

function Home(props: { z: Zero<Schema> }) {
  const [races] = useQuery(() =>
    props.z.query.race
      .where("status", "IN", ["ready", "started"])
      .related("players"),
  );
  const [quotes] = useQuery(() => props.z.query.quote);

  const getRandomQuoteId = () => quotes()[randInt(quotes().length)].id;

  return (
    <Show when={races().length}>
      <div class="flex flex-col items-start gap-4">
        Races
        <ol class="flex flex-col gap-2">
          <For each={races()}>
            {(race) => (
              <li class="flex gap-2">
                <Link
                  href={`/races/${race.id}`}
                  class="block flex flex-row gap-2"
                >
                  <div>{formatDate(race.timestamp)}</div>
                  <div>{race.status}</div>
                  {race.players.length ? (
                    <div>({race.players.map((p) => p.name).join(", ")})</div>
                  ) : undefined}
                </Link>
                {race.authorID === props.z.userID && (
                  <Button
                    onClick={() => {
                      props.z.mutate.race.update({
                        id: race.id,
                        status: "cancelled",
                      });
                    }}
                  >
                    Delete
                  </Button>
                )}
              </li>
            )}
          </For>
        </ol>
        <Button
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
        </Button>
      </div>
    </Show>
  );
}

export default Home;
