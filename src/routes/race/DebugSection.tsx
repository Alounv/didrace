import { Zero } from "@rocicorp/zero";
import { useQuery } from "@rocicorp/zero/solid";
import { For, Show } from "solid-js";
import { Schema } from "../../schema";
import { Button } from "../../design-system";

export function DebugSection(props: {
  z: Zero<Schema>;
  raceID: string;
  quote: string;
}) {
  const [race] = useQuery(() =>
    props.z.query.race
      .where("id", "=", props.raceID)
      .one()
      .related("author")
      .related("quote")
      .related("player_races")
      .related("players"),
  );
  return (
    <Show when={race()}>
      {(race) => (
        <div class="bg-background-light p-3 text-stone-500 mt-auto min-w-xl">
          <div class="text-xl">Debug Section</div>
          <br />
          <div>Race: {race().id}</div>
          <div>Created by: {race().author?.name}</div>
          <div>Length: {props.quote.length}</div>
          <div>Status: {race().status}</div>
          <br />
          Current Players:
          <ul>
            <For each={race().players ?? []}>
              {(p) => (
                <li>
                  <span>{p.id}</span> - <span>{p.name}</span>
                </li>
              )}
            </For>
          </ul>
          <br />
          Current Progress (in chars):
          <ul>
            <For each={race().player_races ?? []}>
              {(pr) => (
                <li>
                  <span>{pr.playerID}</span> - <span>{pr.progress}</span>
                </li>
              )}
            </For>
          </ul>
          <br />
          <div class="flex gap-2">
            <Button
              onClick={() => {
                props.z.mutate.player_race.update({
                  raceID: props.raceID,
                  playerID: props.z.userID,
                  progress: 0,
                  end: null,
                });

                window.location.reload();
              }}
            >
              Reset Progress
            </Button>
            <Button
              onClick={() => {
                props.z.mutate.race.update({
                  id: props.raceID,
                  status: "ready",
                });

                props.z.mutate.player_race.update({
                  raceID: props.raceID,
                  playerID: props.z.userID,
                  progress: 0,
                  end: null,
                });

                window.location.reload();
              }}
            >
              Reset Race
            </Button>
          </div>
        </div>
      )}
    </Show>
  );
}
