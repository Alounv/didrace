import { JSX } from "solid-js";

export function PlayerName(props: {
  children: JSX.Element;
  color: string | undefined;
  class?: string;
}) {
  return (
    <div
      class={`text-white rounded-lg px-2 py-0.5 text-sm ${props.class}`}
      style={{ "background-color": props.color }}
    >
      {props.children}
    </div>
  );
}
