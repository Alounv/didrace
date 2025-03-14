import { Zero } from "@rocicorp/zero";
import { createEffect, createSignal } from "solid-js";
import { Race, Schema } from "../../schema";
import { useNavigate } from "@solidjs/router";
import { Button } from "../../components/Button";
import { addKeyboardEventListener } from "../../utils/addKeyboardEventListener";
import { Icon } from "solid-heroicons";
import {
  arrowLeftOnRectangle,
  chevronDoubleRight,
  clipboardDocumentCheck,
} from "solid-heroicons/solid-mini";
import { leave, start } from "../../domain/race";

export function CountDown(props: {
  raceID: string;
  status: Race["status"];
  hasStartedTyping: boolean;
  z: Zero<Schema>;
  isAlone: boolean;
}) {
  const navigate = useNavigate();
  const [countdown, setCountdown] = createSignal(4);

  createEffect(() => {
    if (props.status === "starting" && countdown() > 0) {
      setTimeout(() => setCountdown(countdown() - 1), 1000);
    }
  });

  addKeyboardEventListener({
    keys: ["Space", "Escape"],
    callback: (e) => {
      if (props.status !== "ready" || !e) {
        return;
      }

      if (e.code === "Escape") {
        leave({ ...props, isAlone: props.isAlone });
        navigate("/");
        return;
      }

      if (e.code === "Space") {
        e.preventDefault();
        start({ ...props, isAlone: props.isAlone });
        return;
      }
    },
  });

  return (
    <div
      class={`flex flex-col gap-4 items-stretch flex-1 ${props.hasStartedTyping ? "opacity-0" : ""} transition-opacity`}
    >
      {props.status === "ready" ? (
        <div class="flex flex-col gap-2 items-start">
          <Button
            onClick={() => navigator.clipboard.writeText(window.location.href)}
          >
            <Icon path={clipboardDocumentCheck} class="size-5" />
            Copy URL
          </Button>
          <Button onClick={() => start({ ...props, isAlone: props.isAlone })}>
            <Icon path={chevronDoubleRight} class="size-5" />
            Start Race [SPACE]
          </Button>
          <Button
            onClick={() => {
              leave({ ...props, isAlone: props.isAlone });
              navigate("/");
            }}
          >
            <Icon path={arrowLeftOnRectangle} class="size-5" />
            Leave Race [ESC]
          </Button>
        </div>
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
        return " bg-error";
      case "g":
        return " bg-success";
      default:
        return "bg-base-content";
    }
  }
  return <div class={`rounded-full h-7 w-7 ${colorClass()}`} />;
}
