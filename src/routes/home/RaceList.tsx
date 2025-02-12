import { For, JSX } from "solid-js";
import { Zero } from "@rocicorp/zero";
import { Player, Race, Schema } from "../../schema";
import { formatDate } from "../../utils/date";
import { A } from "@solidjs/router";
import { Avatar } from "../../components/Avatar";
import { trash } from "solid-heroicons/solid-mini";
import { Icon } from "solid-heroicons";

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
      class="card w-50 h-50 bg-base-100 p-4 justify-between
      text-xs border border-transparent hover:border-primary group"
    >
      <div class="flex gap-2 items-center">
        <Avatar player={props.race.author} class="w-8 h-8" />
        <div class="text-base text-base-content">{title()}</div>
      </div>

      <A
        href={`/races/${props.race.id}`}
        class="border border-primary rounded p-4 group-hover:bg-primary group-hover:border-transparent group-hover:text-primary-content flex justify-between items-center"
      >
        Join race
        <AvatarStack players={props.race.players} />
      </A>

      <div class="flex gap-2 justify-between items-center">
        <div>{formatDate(props.race.timestamp)}</div>
        <button
          class="hover:text-error btn-outline rounded-md p-2"
          onClick={deleteRace}
        >
          <Icon path={trash} class="size-4" />
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
