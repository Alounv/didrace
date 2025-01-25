import { Zero } from "@rocicorp/zero";
import { useQuery } from "@rocicorp/zero/solid";
import { A, useParams } from "@solidjs/router";
import { For, Show } from "solid-js";
import { Schema } from "../schema";

function Race({ z }: { z: Zero<Schema> }) {
  const params = useParams();
  if (!params.id) {
    return <>No race id</>;
  }

  const [race] = useQuery(() =>
    z.query.race
      .where("id", "=", params.id)
      .one()
      .related("author")
      .related("quote")
      .related("player_races")
      .related("players"),
  );

  return (
    <>
      <A href="/">Home</A>

      <Show when={race()}>
        {(race) => (
          <>
            <div>{race().id}</div>
            <div>{race().status}</div>
            <div>{race().quote?.body}</div>
            <ul>
              <For each={race().players ?? []}>{(p) => <li>{p.name}</li>}</For>
            </ul>
          </>
        )}
      </Show>
    </>
  );
}

export default Race;
