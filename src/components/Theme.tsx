import { Icon } from "solid-heroicons";
import { swatch } from "solid-heroicons/outline";
import { For } from "solid-js";
import { onMount } from "solid-js";
import { themeChange } from "theme-change";

const THEMES = [
  "acid",
  "aqua",
  "autumn",
  "black",
  "bumblebee",
  "business",
  "cmyk",
  "coffee",
  "corporate",
  "cupcake",
  "cyberpunk",
  "dark",
  "dim",
  "dracula",
  "emerald",
  "fantasy",
  "forest",
  "garden",
  "halloween",
  "lemonade",
  "light",
  "lofi",
  "luxury",
  "night",
  "nord",
  "pastel",
  "retro",
  "sunset",
  "synthwave",
  "valentine",
  "winter",
  "wireframe",
];

export function ThemeController() {
  onMount(async () => {
    themeChange(false);
  });

  return (
    <div class="dropdown">
      <div tabindex="0" role="button" class="btn m-1">
        <Icon path={swatch} class="size-5" />
      </div>
      <div
        tabindex="0"
        class="dropdown-content bg-base-300 rounded-box z-[1] w-52 p-2 shadow-2xl h-96 overflow-y-auto"
      >
        <ul class="p-2">
          <For each={THEMES}>
            {(theme) => (
              <li>
                <input
                  type="radio"
                  name="theme-dropdown"
                  class="theme-controller btn btn-sm btn-block btn-ghost justify-start"
                  aria-label={theme}
                  data-set-theme={theme}
                  value={theme}
                />
              </li>
            )}
          </For>
        </ul>
      </div>
    </div>
  );
}
