import { createEffect, createSignal } from "solid-js";
import { createMutation } from "../../convex-solid";
import { api } from "../../../convex/_generated/api";
import { getCurrentUser } from "../../convex";
import { Race, PlayerRace } from "../../types";
import { useNavigate } from "@solidjs/router";
import { Button } from "../../components/Button";
import { addKeyboardEventListener } from "../../utils/addKeyboardEventListener";
import { Icon } from "solid-heroicons";
import {
  arrowLeftOnRectangle,
  chevronDoubleRight,
  clipboardDocumentCheck,
} from "solid-heroicons/solid-mini";
import { leave } from "../../domain/race-convex";

export function CountDown(props: {
  race: Race;
  playerRace?: PlayerRace;
  isAlone: boolean;
}) {
  const navigate = useNavigate();
  const [countdown, setCountdown] = createSignal(4);
  const { token } = getCurrentUser();
  const updateRaceStatus = createMutation(api.races.updateRaceStatus);

  const hasStartedTyping = () => (props.playerRace?.progress ?? 0) > 0;

  createEffect(() => {
    if (props.race.status === "starting" && countdown() > 0) {
      setTimeout(() => setCountdown(countdown() - 1), 1000);
    }
  });

  const handleStart = async () => {
    if (props.isAlone) {
      await updateRaceStatus({
        raceId: props.race._id,
        status: "started" as const,
        ...(token ? { token } : {}),
      });
      return;
    }

    await updateRaceStatus({
      raceId: props.race._id,
      status: "starting" as const,
      ...(token ? { token } : {}),
    });

    setTimeout(async () => {
      await updateRaceStatus({
        raceId: props.race._id,
        status: "started",
        ...(token ? { token } : {}),
      });
    }, 4000);
  };

  const handleLeave = async () => {
    await leave({ raceID: props.race._id });
    navigate("/");
  };

  addKeyboardEventListener({
    keys: ["Space", "Escape"],
    callback: (e) => {
      if (props.race.status !== "ready" || !e) {
        return;
      }

      if (e.code === "Escape") {
        handleLeave();
        return;
      }

      if (e.code === "Space") {
        e.preventDefault();
        handleStart();
        return;
      }
    },
  });

  return (
    <div
      class={`flex flex-col gap-4 items-stretch flex-1 ${hasStartedTyping() ? "opacity-0" : ""} transition-opacity`}
    >
      {props.race.status === "ready" ? (
        <div class="flex flex-col gap-2 items-start">
          <Button
            onClick={() => navigator.clipboard.writeText(window.location.href)}
          >
            <Icon path={clipboardDocumentCheck} class="size-5" />
            Copy URL
          </Button>
          <Button onClick={handleStart}>
            <Icon path={chevronDoubleRight} class="size-5" />
            Start Race [SPACE]
          </Button>
          <Button onClick={handleLeave}>
            <Icon path={arrowLeftOnRectangle} class="size-5" />
            Leave Race [ESC]
          </Button>
        </div>
      ) : (
        <div class="flex items-center gap-2">
          {["ready", "starting", "started"].includes(props.race.status) && (
            <Count status={props.race.status} countdown={countdown()} />
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

function Count(props: { status: string; countdown: number }) {
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
        return " bg-error";
      case "g":
        return " bg-success";
      default:
        return "bg-base-content";
    }
  }
  return <div class={`rounded-full h-7 w-7 ${colorClass()}`} />;
}
