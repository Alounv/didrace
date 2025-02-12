import { For } from "solid-js";
import { onMount } from "solid-js";
import { themeChange } from "theme-change";

export function ThemeController() {
  onMount(async () => {
    themeChange();
  });

  return (
    <div class="dropdown">
      <div tabindex="0" role="button" class="btn m-1">
        Theme
      </div>
      <ul
        tabindex="0"
        class="dropdown-content bg-base-300 rounded-box z-[1] w-52 p-2 shadow-2xl"
      >
        <For each={["Default", "Retro", "Cyberpunk", "Valentine", "Aqua"]}>
          {(theme) => (
            <li>
              <input
                type="radio"
                name="theme-dropdown"
                class="theme-controller btn btn-sm btn-block btn-ghost justify-start"
                aria-label={theme}
                value={theme.toLowerCase()}
              />
            </li>
          )}
        </For>
      </ul>
    </div>
  );
}
