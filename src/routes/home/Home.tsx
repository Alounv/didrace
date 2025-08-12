import { Show, For, JSX } from "solid-js";
import { createQuery } from "../../convex-solid";
import { api } from "../../../convex/_generated/api";
import { getCurrentUser } from "../../convex";
import { CreateRace } from "./CreateRace";
import { InitializeQuotes } from "../../components/InitializeQuotes";
import { A } from "@solidjs/router";
import { Avatar } from "../../components/Avatar";
import { formatDate } from "../../utils/date";
import { Player, RaceWithRelations } from "../../types";

function Home() {
  const { token, isAuthenticated } = getCurrentUser();

  const quotes = createQuery(api.quotes.getAllQuotes, {});
  const readyRaces = createQuery(api.races.getRacesByStatus, {
    status: "ready" as const,
    ...(token ? { token } : {}),
  });

  const startedRaces = createQuery(api.races.getRacesByStatus, {
    status: "started" as const,
    ...(token ? { token } : {}),
  });

  return (
    <>
      {!isAuthenticated ? (
        <div class="text-xl mt-12 mx-auto">
          Please log in to see your races.
        </div>
      ) : (
        <Show
          when={(quotes()?.length || 0) > 0}
          fallback={
            <div class="flex justify-center mt-12">
              <InitializeQuotes />
            </div>
          }
        >
          <div class="flex flex-col items-start gap-4">
            <RaceSection races={readyRaces()} title="Open races">
              <CreateRace />
            </RaceSection>

            <Show when={(startedRaces()?.length || 0) > 0}>
              <RaceSection races={startedRaces()} title="Ongoing races" />
            </Show>
          </div>
        </Show>
      )}
    </>
  );
}

function RaceSection(props: {
  races: RaceWithRelations[] | undefined;
  title: string;
  children?: JSX.Element | JSX.Element[];
}) {
  return (
    <div class="flex flex-col gap-8 mt-20">
      <div class="text-lg">{props.title}</div>
      <ol class="flex flex-wrap gap-8">
        {props.children}
        <For each={props.races || []}>{(race) => <RaceCard race={race} />}</For>
      </ol>
    </div>
  );
}

function RaceCard(props: { race: RaceWithRelations }) {
  const { userID } = getCurrentUser();

  function title() {
    if (props.race.authorID === userID) {
      return "Your race";
    }
    return `${props.race.author?.name || "Unknown"}'s race`;
  }

  return (
    <li
      class="card w-50 h-50 bg-base-100 p-4 justify-between
      text-xs border border-transparent hover:border-primary group"
    >
      <div class="flex gap-2 items-center">
        {props.race.author && (
          <Avatar player={props.race.author} class="w-8 h-8" />
        )}
        <div class="text-base text-base-content">{title()}</div>
      </div>

      <A
        href={`/races/${props.race._id}`}
        class="border border-primary rounded p-4 group-hover:bg-primary group-hover:border-transparent group-hover:text-primary-content flex justify-between items-center"
      >
        Join race
        <AvatarStack players={props.race.players || []} />
      </A>

      <div class="flex gap-2 justify-between items-center">
        <div>{formatDate(props.race.timestamp)}</div>
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

export default Home;
