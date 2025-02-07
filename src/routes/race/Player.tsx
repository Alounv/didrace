import { JSX } from "solid-js";

export function PlayerName(props: {
  children: JSX.Element;
  color: string | undefined;
  class?: string;
}) {
  return (
    <div
      class={`badge ${props.class}`}
      style={{ "background-color": props.color }}
    >
      {props.children}
    </div>
  );
}
