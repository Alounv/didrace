import { Show } from "solid-js";
import Cookies from "js-cookie";
import { useQuery } from "@rocicorp/zero/solid";
import { Zero } from "@rocicorp/zero";
import { Schema } from "./schema";
import { Button, Logo } from "./design-system";
import { A } from "@solidjs/router";

function Header(props: { z: Zero<Schema> }) {
  const [player] = useQuery(() =>
    props.z.query.player.where("id", "=", props.z.userID).one(),
  );

  const toggleLogin = async () => {
    if (props.z.userID === "anon") {
      window.location.href = "/api/discord";
    } else {
      Cookies.remove("jwt");
      location.reload();
    }
  };

  return (
    <div class="bg-background-light rounded-xl p-8 flex items-center h-22">
      <A href="/">
        <Logo />
      </A>

      <div class="ml-auto flex gap-4 items-center">
        <Button onClick={() => toggleLogin()}>
          {player() ? "Logout" : "Login"}
        </Button>

        {props.z.userID !== "anon" && (
          <Show when={player()}>
            {(player) => (
              <>
                <div
                  class="text-white px-2 py-1 rounded"
                  style={{ "background-color": player().color }}
                >
                  {player().name}
                </div>
                <div
                  class="w-10 h-10 rounded-full border-solid border-3 flex items-center justify-center"
                  style={{
                    "border-color": player().color,
                    "background-color": player().color,
                  }}
                >
                  {player().avatar ? (
                    <img
                      src={player().avatar ?? ""}
                      class="rounded-full"
                      title={player()?.name}
                    />
                  ) : (
                    <div class="text-white text-lg font-bold font-lato">
                      {player().name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>
              </>
            )}
          </Show>
        )}
      </div>
    </div>
  );
}

export default Header;
