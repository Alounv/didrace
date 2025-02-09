import { For, JSX } from "solid-js";
import { Zero } from "@rocicorp/zero";
import { Player, Race, Schema } from "../../schema";
import { formatDate } from "../../date";
import { A } from "@solidjs/router";

export type PopulatedRace = Race & {
  players: Player[];
  author: Player;
};

export function RaceList(props: {
  z: Zero<Schema>;
  races: PopulatedRace[];
  children?: JSX.Element;
  title: string;
}) {
  return (
    <div class="flex flex-col gap-8 mt-20">
      <div class="text-lg">{props.title}</div>
      <ol class="flex flex-wrap gap-8">
        {props.children}
        <For each={props.races}>{(r) => <RaceCard race={r} z={props.z} />}</For>
      </ol>
    </div>
  );
}

function RaceCard(props: { race: PopulatedRace; z: Zero<Schema> }) {
  function deleteRace() {
    props.z.mutate.race.update({
      id: props.race.id,
      status: "cancelled",
    });
  }

  function title() {
    if (props.race.authorID === props.z.userID) {
      return "Your race";
    }
    return `${props.race.author.name}'s race`;
  }

  return (
    <li
      class="flex flex-col gap-2 w-50 h-50 bg-background-light p-4
      rounded-lg justify-between text-xs text-stone-500 border border-transparent
      hover:border-violet-700 group"
    >
      <div class="text-base text-text">{title()}</div>

      <A
        href={`/races/${props.race.id}`}
        class="border border-stone-500 rounded p-4 text-stone-400 group-hover:bg-violet-700 group-hover:border-transparent group-hover:text-white"
      >
        Join race ({props.race.players.length})
      </A>

      <div class="flex gap-2 justify-between items-center">
        <div>{formatDate(props.race.timestamp)}</div>
        <button class="hover:bg-stone-600 rounded-md p-2" onClick={deleteRace}>
          🗑️
        </button>
      </div>
    </li>
  );
}
