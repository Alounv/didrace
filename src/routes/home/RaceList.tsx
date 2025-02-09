import { For, JSX } from "solid-js";
import { Zero } from "@rocicorp/zero";
import { Player, Race, Schema } from "../../schema";
import { formatDate } from "../../utils/date";
import { A } from "@solidjs/router";
import { Avatar } from "../../components/Avatar";

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
        <div>{props.children}</div>
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
      <div class="flex gap-2 items-center">
        <Avatar player={props.race.author} class="w-8 h-8" />
        <div class="text-base text-text">{title()}</div>
      </div>

      <A
        href={`/races/${props.race.id}`}
        class="border border-stone-500 rounded p-4 text-stone-400 group-hover:bg-violet-700 group-hover:border-transparent group-hover:text-white flex justify-between items-center"
      >
        Join race
        <AvatarStack players={props.race.players} />
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

function AvatarStack(props: { players: Player[] }) {
  function avatarsFirst() {
    const sorted = [...props.players];
    sorted.sort((a, b) => {
      if (a.avatar && b.avatar) {
        return 0;
      }
      if (a.avatar) {
        return 1;
      }
      if (b.avatar) {
        return -1;
      }
      return 0;
    });
    return sorted;
  }

  return (
    <div class="flex -space-x-4 items-center">
      <For each={avatarsFirst()}>
        {(p) => <Avatar player={p} class="w-8 h-8" />}
      </For>
    </div>
  );
}
