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
        {player() && props.z.userID !== "anon"
          ? `Logged in as ${player()?.name}`
          : ""}
        <Button onClick={() => toggleLogin()}>
          {player() ? "Logout" : "Login"}
        </Button>
      </div>
    </div>
  );
}

export default Header;
