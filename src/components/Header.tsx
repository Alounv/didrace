import { Show } from "solid-js";
import Cookies from "js-cookie";
import { useQuery } from "@rocicorp/zero/solid";
import { Zero } from "@rocicorp/zero";
import { Button, Logo } from "./design-system";
import { A } from "@solidjs/router";
import { Schema } from "../schema";
import { Avatar } from "./Avatar";

function Header(props: { z: Zero<Schema> }) {
  const [player] = useQuery(() =>
    props.z.query.player.where("id", "=", props.z.userID).one(),
  );

  function discordLogin() {
    window.location.href = "/api/discord";
  }

  async function guestLogin() {
    window.location.href = "/api/guest";
  }

  function logout() {
    Cookies.remove("jwt");
    location.href = "/";
  }

  return (
    <div class="bg-background-light rounded-xl p-8 flex items-center h-22">
      <A href="/">
        <Logo />
      </A>

      <div class="ml-auto flex gap-12 items-center">
        {props.z.userID === "anon" ? (
          <div class="flex gap-2 items-center">
            Login
            <Button onClick={discordLogin}>Discord</Button>
            <Button onClick={guestLogin}>Guest</Button>
          </div>
        ) : (
          <Button onClick={logout}>Logout</Button>
        )}

        {props.z.userID !== "anon" && (
          <Show when={player()}>
            {(player) => (
              <div class="flex gap-4 items-center">
                <div
                  class="text-white px-2 py-0.5 rounded font-quote"
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
