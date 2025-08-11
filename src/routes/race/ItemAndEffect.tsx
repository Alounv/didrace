import { activateItem } from "../../domain/playerRace-convex";
import { addKeyboardEventListener } from "../../utils/addKeyboardEventListener";
import { Id } from "../../../convex/_generated/dataModel";

export function ItemAndEffect(props: {
  raceID: Id<"races">;
  playerRace: any;
  adversaries: any[];
}) {
  return (
    <div class="absolute -top-24 -translate-x-1/2 flex flex-col gap-2">
      {props.playerRace.effect && <Effect effect={props.playerRace.effect} />}
      {props.playerRace.item && <Item {...props} />}
    </div>
  );
}

// === EFFECTS ===

export function Effect(props: { effect: "stuned" | "poisoned" | "faded" | null }) {
  return (
    <div class={`flex gap-2 text-xl ${getEffectData(props.effect).class}`}>
      <span>{getEffectData(props.effect).icon}</span>
      <span>{getEffectData(props.effect).name}</span>
    </div>
  );
}

function getEffectData(effect: "stuned" | "poisoned" | "faded" | null) {
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
  raceID: Id<"races">;
  playerRace: any;
  adversaries: any[];
}) {
  addKeyboardEventListener({
    keys: ["Enter"],
    callback: (e) => {
      if (!e) return;

      if (e.code === "Enter") {
        activateItem({
          raceID: props.raceID,
          playerRace: props.playerRace,
          adversaries: props.adversaries,
        });
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

function getItemsData(item: "missile" | "blob" | "fader" | null) {
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
