import { Zero } from "@rocicorp/zero";
import { Schema } from "../../schema";
import { JSX } from "solid-js";
import { useQuery } from "@rocicorp/zero/solid";
import { Link } from "../../design-system";

export function End(props: {
  z: Zero<Schema>;
  raceID: string;
  quote: string;
  nextRaceID: string | null;
}) {
  const [playerRace] = useQuery(() =>
    props.z.query.player_race
      .where("raceID", "=", props.raceID)
      .where("playerID", "=", props.z.userID)
      .one(),
  );

  function results() {
    const { start, end } = playerRace() ?? { end: 0, start: 0 };
    const duration = (end ?? 0) - (start ?? 0);
    const sec = duration / 1000;
    const min = sec / 60;

    return {
      sec: Math.round(sec),
      wpm: Math.round(props.quote.length / 5 / min),
    };
  }

  return (
    <>
      <div class="flex gap-12 items-center m-auto">
        <div class="flex flex-col gap-4 shrink-0 items-start">
          <Tag class="bg-violet-600">{`${results().wpm} WPM`}</Tag>
          <Tag class="bg-teal-600">{`${results().sec} sec`}</Tag>
        </div>
        <div class="font-quote text-2xl tracking-widest">{props.quote}</div>
      </div>

      {props.nextRaceID && (
        <Link href={`/races/${props.nextRaceID}`}>Next</Link>
      )}
    </>
  );
}

function Tag(props: { children: JSX.Element; class?: string }) {
  return (
    <div
      class={`text-2xl font-bold rounded-xl px-5 py-4 bg-black ${props.class}`}
    >
      {props.children}
    </div>
  );
}
