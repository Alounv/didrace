import { Show } from "solid-js";
import Cookies from "js-cookie";
import { Zero } from "@rocicorp/zero";
import { Schema } from "../schema";
import { Icon } from "solid-heroicons";
import { arrowLeftOnRectangle } from "solid-heroicons/outline";

export function Auth() {
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
    <Show
      when={props.z.userID === "anon"}
      fallback={
        <button class="btn" onClick={logout}>
          <Icon path={arrowLeftOnRectangle} class="size-5" />
          Logout
        </button>
      }
    >
      <div class="flex gap-2 items-center">
        <button class="btn btn-primary" onClick={discordLogin}>
          Discord
        </button>
        <button class="btn btn-secondary" onClick={guestLogin}>
          Guest
        </button>
      </div>
    </Show>
  );
}
