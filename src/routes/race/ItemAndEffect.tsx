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
      {props.playerRace.effect && <Effect effect={props.playerRace.effect} />}
      {props.playerRace.item && <Item {...props} />}
    </div>
  );
}

// === EFFECTS ===

export function Effect(props: { effect: PlayerRace["effect"] }) {
  return (
    <div class={`flex gap-2 text-xl ${getEffectData(props.effect).class}`}>
      <span>{getEffectData(props.effect).icon}</span>
      <span>{getEffectData(props.effect).name}</span>
    </div>
  );
}

function getEffectData(effect: PlayerRace["effect"]) {
  switch (effect) {
    case "stuned":
      return { icon: "💥", name: "STUNED", class: "text-error" };
    case "poisoned":
      return { icon: "☠️", name: "POISONED", class: "text-success" };
    case "faded":
      return { icon: "🌚", name: "FADED", class: "text-info" };
    default:
      return { icon: "❓", name: "UNKNOWN", class: "" };
  }
}

// === ITEMS ===

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
    <div
      class={`flex gap-2 text-xl ${getItemsData(props.playerRace.item).class}`}
    >
      <span>{getItemsData(props.playerRace.item).icon}</span>
      <span>{getItemsData(props.playerRace.item).name}</span>
      <span>[Enter]</span>
    </div>
  );
}

function getItemsData(item: PlayerRace["item"]) {
  switch (item) {
    case "missile":
      return { icon: "🚀", name: "MISSILE", class: "text-error" };
    case "blob":
      return { icon: "🦠", name: "BLOB", class: "text-success" };
    case "fader":
      return { icon: "🎚️", name: "FADER", class: "text-info" };
    default:
      return { icon: "❓", name: "UNKNOWN" };
  }
}
