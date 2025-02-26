import { Show } from "solid-js";
import { useQuery } from "@rocicorp/zero/solid";
import { Zero } from "@rocicorp/zero";
import { A } from "@solidjs/router";
import { Schema } from "../schema";
import { Avatar } from "./Avatar";
import { ThemeController } from "./Theme";
import { Auth } from "./Auth";
import { Logo } from "./Logo";
import { PlayerName } from "../routes/race/PlayerName";

function Header(props: { z: Zero<Schema> }) {
  const [quotes] = useQuery(() => props.z.query.quote);

  function loggedIn() {
    return props.z.userID !== "anon";
  }

  return (
    <div class="bg-base-100 p-8 items-center h-22 card flex-row">
      <A href="/">
        <Logo />
      </A>

      <div class="ml-auto flex gap-4 items-center">
        {loggedIn() && <ThemeController />}

        {quotes().length > 0 ? (
          <Auth z={props.z} />
        ) : (
          <div class="text-error">db connection issue</div>
        )}

        {loggedIn() && <CurrentUser z={props.z} />}
      </div>
    </div>
  );
}

function CurrentUser(props: { z: Zero<Schema> }) {
  const [player] = useQuery(() =>
    props.z.query.player.where("id", "=", props.z.userID).one(),
  );

  return (
    <Show when={player()}>
      {(player) => (
        <div class="flex gap-4 items-center">
          <PlayerName color={player().color} class="text-lg py-4">
            {player().name}
          </PlayerName>
          <Avatar player={player()} class="w-10 h-10" />
        </div>
      )}
    </Show>
  );
}

export default Header;
