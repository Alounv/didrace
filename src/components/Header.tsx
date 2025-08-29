import { Show } from "solid-js";
import { A } from "@solidjs/router";
import { Avatar } from "./Avatar";
import { ThemeController } from "./Theme";
import { Logo } from "./Logo";
import { PlayerName } from "../routes/race/PlayerName";
import Cookies from "js-cookie";
import { Icon } from "solid-heroicons";
import { arrowLeftOnRectangle } from "solid-heroicons/outline";
import { getCurrentUser } from "../convex";
import { createQuery } from "../convex-solid";
import { api } from "../../convex/_generated/api";
import { guestLogin as doGuestLogin } from "../auth/guestAuth";
import { redirectToDiscordOAuth } from "../auth/discordAuth";
import { Id } from "../../convex/_generated/dataModel";
import { Settings } from "./Settings";

function Header() {
  const { isAuthenticated } = getCurrentUser();
  const quotes = createQuery(api.quotes.getAllQuotes, () => ({}));

  function discordLogin() {
    try {
      redirectToDiscordOAuth();
    } catch (error) {
      console.error("Failed to initiate Discord login:", error);
      alert("Failed to start Discord login. Please try again.");
    }
  }

  async function guestLogin() {
    try {
      await doGuestLogin();
    } catch (error) {
      console.error("Failed to login as guest:", error);
      alert("Failed to login as guest. Please try again.");
    }
  }

  function logout() {
    Cookies.remove("jwt");
    location.href = "/";
  }

  function hasQuotes() {
    const values = quotes();
    return (values?.length ?? 0) > 0;
  }

  return (
    <div class="bg-base-100 p-8 items-center h-22 card flex-row">
      <A href="/">
        <Logo />
      </A>

      <div class="ml-auto flex gap-4 items-center">
        {isAuthenticated && <ThemeController />}

        {hasQuotes() ? (
          <Show
            when={!isAuthenticated}
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
        ) : (
          <div class="text-error">db connection issue</div>
        )}

        {isAuthenticated && <CurrentUser />}
      </div>
    </div>
  );
}

function CurrentUser() {
  const { userID } = getCurrentUser();
  const player = createQuery(api.players.getPlayer, () => ({
    playerId: userID as Id<"players">,
  }));

  return (
    <Show when={player()}>
      {(playerData) => (
        <div class="flex gap-4 items-center">
          <div class="dropdown">
            <PlayerName
              color={playerData().color}
              class="text-lg py-4"
              isButton
            >
              {playerData().name}
            </PlayerName>

            <Settings player={playerData()} class="dropdown-content" />
          </div>

          <A href="/profile">
            <Avatar player={playerData()} class="w-10 h-10" />
          </A>
        </div>
      )}
    </Show>
  );
}

export default Header;
