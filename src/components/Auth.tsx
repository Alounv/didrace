import { Show } from "solid-js";
import Cookies from "js-cookie";
import { Zero } from "@rocicorp/zero";
import { Schema } from "../schema";

export function Auth(props: { z: Zero<Schema> }) {
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
          Logout
        </button>
      }
    >
      <div class="flex gap-2 items-center">
        Login
        <button class="btn" onClick={discordLogin}>
          Discord
        </button>
        <button class="btn" onClick={guestLogin}>
          Guest
        </button>
      </div>
    </Show>
  );
}
