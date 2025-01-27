import Cookies from "js-cookie";
import { useQuery } from "@rocicorp/zero/solid";
import { Zero } from "@rocicorp/zero";
import { Schema } from "./schema";

function Header(props: { z: Zero<Schema> }) {
  const [player] = useQuery(() =>
    props.z.query.player.where("id", "=", props.z.userID).one(),
  );

  const toggleLogin = async () => {
    if (props.z.userID === "anon") {
      await fetch("/api/login");
    } else {
      Cookies.remove("jwt");
    }
    location.reload();
  };

  return (
    <div class="bg-background-light rounded-xl p-3">
      <div style={{ "justify-content": "end" }}>
        {player() ? `Logged in as ${player()?.name}` : ""}
        <button onMouseDown={() => toggleLogin()}>
          {player() ? "Logout" : "Login"}
        </button>
      </div>
    </div>
  );
}

export default Header;
