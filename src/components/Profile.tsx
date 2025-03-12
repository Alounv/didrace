import { For } from "solid-js";
import { Zero } from "@rocicorp/zero";
import { Player, Schema } from "../schema";
import { updatePlayer } from "../domain/player";

const COLORS = [
  "#12C3E2",
  "#5712E2",
  "#99E212",
  "#E21249",
  "#E28B12",
  "#E2CA12",
];

export function Profile(props: { z: Zero<Schema>; player: Player }) {
  return (
    <div
      tabindex="0"
      class="dropdown-content bg-base-100 rounded-box z-[1] w-72 -right-8 top-20"
    >
      <ul class="p-3 flex flex-col gap-6">
        <label class="input">
          <span class="label">Name</span>
          <input
            type="text"
            placeholder="Type here"
            value={props.player.name}
            onInput={(e) => updatePlayer({ z: props.z, name: e.target.value })}
          />
        </label>

        <li class="flex flex-col gap-2">
          <div class="flex gap-2 p-2">
            <For each={COLORS}>
              {(color) => (
                <button
                  value={color}
                  onClick={() => updatePlayer({ z: props.z, color })}
                  class="badge btn"
                  style={{ "background-color": color }}
                />
              )}
            </For>
          </div>

          <div class="flex gap-2 items-center">
            <label class="input">
              <span class="label">Color</span>
              <input
                type="text"
                placeholder="#ffffff"
                value={props.player.color}
                onInput={(e) =>
                  updatePlayer({ z: props.z, color: e.target.value })
                }
              />
            </label>
            <div
              class="badge"
              style={{ "background-color": props.player.color }}
            />
          </div>
        </li>

        <li class="flex flex-col gap-2">
          <label class="input">
            <span class="label">Avatar</span>
            <input
              type="text"
              placeholder="https://..."
              value={props.player.avatar ?? ""}
              onInput={(e) =>
                updatePlayer({ z: props.z, avatar: e.target.value })
              }
            />
          </label>
        </li>
      </ul>
    </div>
  );
}
