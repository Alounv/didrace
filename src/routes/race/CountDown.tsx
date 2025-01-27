import { Zero } from "@rocicorp/zero";
import { createEffect, createSignal } from "solid-js";
import { Race, Schema } from "../../schema";
import { Button } from "../../design-system";
import { useQuery } from "@rocicorp/zero/solid";

export function CountDown(props: {
  raceID: string;
  status: Race["status"];
  z: Zero<Schema>;
}) {
  const [playerRace] = useQuery(() =>
    props.z.query.player_race
      .where("raceID", "=", props.raceID)
      .where("playerID", "=", props.z.userID)
      .one(),
  );

  function hasStartedTyping() {
    return playerRace()?.progress ?? 0 > 0;
  }

  const [countdown, setCountdown] = createSignal(4);

  createEffect(() => {
    if (props.status === "starting" && countdown() > 0) {
      setTimeout(() => setCountdown(countdown() - 1), 1000);
    }
  });

  return (
    <div
      class={`flex flex-col gap-4 items-stretch mr-24 ${hasStartedTyping() ? "opacity-0" : ""} transition-opacity`}
    >
      {props.status === "ready" ? (
        <Button
          onClick={() => {
            props.z.mutate.race.update({
              id: props.raceID,
              status: "starting",
            });

            setTimeout(() => {
              props.z.mutate.race.update({
                id: props.raceID,
                status: "started",
              });
            }, 1000 * 4);
          }}
        >
          Start
        </Button>
      ) : (
        <div class="flex items-center gap-2">
          {["ready", "starting", "started"].includes(props.status) && (
            <Count status={props.status} countdown={countdown()} />
          )}
        </div>
      )}
    </div>
  );
}

const colorMap = {
  0: ["r", "r", "r"],
  1: ["r", "r", "r"],
  2: ["r", "r", null],
  3: ["r", null, null],
} as const;

function Count(props: { status: Race["status"]; countdown: number }) {
  const colors = () => {
    if (props.status === "started") {
      return ["g", "g", "g"] as const;
    }

    if (props.status === "starting" && [0, 1, 2, 3].includes(props.countdown)) {
      return colorMap[props.countdown as 0 | 1 | 2 | 3];
    }

    return [null, null, null] as const;
  };

  return (
    <>
      <Dot color={colors()[0]} />
      <Dot color={colors()[1]} />
      <Dot color={colors()[2]} />
    </>
  );
}

function Dot(props: { color: "r" | "g" | null }) {
  function colorClass() {
    switch (props.color) {
      case "r":
        return " bg-red-600";
      case "g":
        return " bg-green-600";
      default:
        return "bg-text";
    }
  }
  return <div class={`rounded-full h-7 w-7 ${colorClass()}`} />;
}
