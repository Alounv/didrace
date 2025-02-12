import { Show } from "solid-js";
import { useQuery } from "@rocicorp/zero/solid";
import { Zero } from "@rocicorp/zero";
import { Logo } from "./design-system";
import { A } from "@solidjs/router";
import { Schema } from "../schema";
import { Avatar } from "./Avatar";
import { ThemeController } from "./Theme";
import { Auth } from "./Auth";

function Header(props: { z: Zero<Schema> }) {
  const [player] = useQuery(() =>
    props.z.query.player.where("id", "=", props.z.userID).one(),
  );

  return (
    <div class="bg-base-100 p-8 items-center h-22 card flex-row">
      <A href="/">
        <Logo />
      </A>

      <div class="ml-auto flex gap-4 items-center">
        <div class="flex gap-4 items-center">
          <Auth z={props.z} />

          <ThemeController />
        </div>

        {props.z.userID !== "anon" && (
          <Show when={player()}>
            {(player) => (
              <div class="flex gap-4 items-center">
                <div
                  class="text-base-content px-2 py-0.5 rounded font-quote"
                  style={{ "background-color": player().color }}
                >
                  {player().name}
                </div>
                <Avatar player={player()} class="w-10 h-10" />
              </div>
            )}
          </Show>
        )}
      </div>
    </div>
  );
}

export default Header;
