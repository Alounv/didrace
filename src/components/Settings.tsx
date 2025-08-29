import { For } from "solid-js";
import { Player } from "../types";
import { createMutation } from "../convex-solid";
import { api } from "../../convex/_generated/api";

const COLORS = [
  "#12C3E2",
  "#5712E2",
  "#99E212",
  "#E21249",
  "#E28B12",
  "#E2CA12",
];

export function Settings(props: {
  player: Player;
  class: string;
}) {
  const updatePlayerMutation = createMutation(api.players.updatePlayer);

  const handleUpdatePlayer = async (updates: { name?: string; color?: string; avatar?: string }) => {
    try {
      await updatePlayerMutation({
        playerId: props.player._id,
        ...updates,
      });
    } catch (error) {
      console.error("Failed to update player:", error);
    }
  };

  return (
    <div
      tabindex="0"
      class={`bg-base-100 rounded-box z-[1] w-72 -right-8 top-20 ${props.class}`}
    >
      <ul class="p-3 flex flex-col gap-6">
        <label class="input">
          <span class="label">Name</span>
          <input
            type="text"
            placeholder="Type here"
            value={props.player.name}
            onInput={(e) => handleUpdatePlayer({ name: e.target.value })}
          />
        </label>

        <li class="flex flex-col gap-2">
          <div class="flex gap-2 p-2">
            <For each={COLORS}>
              {(color) => (
                <button
                  value={color}
                  onClick={() => handleUpdatePlayer({ color })}
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
                  handleUpdatePlayer({ color: e.target.value })
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
                handleUpdatePlayer({ avatar: e.target.value })
              }
            />
          </label>
        </li>
      </ul>
    </div>
  );
}
