import { Zero } from "@rocicorp/zero";
import { activateItem } from "../../domain/playerRace";
import { PlayerRace, Schema } from "../../schema";
import { addKeyboardEventListener } from "../../utils/addKeyboardEventListener";

export function ItemAndEffect(props: {
  z: Zero<Schema>;
  raceID: string;
  playerRace: PlayerRace;
  adversaries: PlayerRace[];
}) {
  return (
    <div class="absolute -top-24 -translate-x-1/2 flex flex-col gap-2">
      {props.playerRace.effect && <Effect />}
      {props.playerRace.item && <Item {...props} />}
    </div>
  );
}

export function Effect() {
  return (
    <div class="flex gap-2">
      <span>💥</span>
      <span>STUNED</span>
    </div>
  );
}

function Item(props: {
  z: Zero<Schema>;
  raceID: string;
  playerRace: PlayerRace;
  adversaries: PlayerRace[];
}) {
  addKeyboardEventListener({
    keys: ["Enter"],
    callback: (e) => {
      if (!e) return;

      if (e.code === "Enter") {
        activateItem(props);
        return;
      }
    },
  });

  return (
    <div class="flex gap-2">
      <span>🚀</span>
      <span>Missile</span>
      <span>[Enter]</span>
    </div>
  );
}
