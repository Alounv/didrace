import { A } from "@solidjs/router";
import type { JSX } from "solid-js";

export function Button(props: {
  children: JSX.Element;
  onClick?: () => void;
  href?: string;
  class?: string;
}) {
  const cls = () => `btn btn-outline ${props.class}`;
  return (
    <>
      {props.href ? (
        <A class={cls()} href={props.href}>
          {props.children}
        </A>
      ) : (
        <button type="button" class={cls()} onClick={() => props?.onClick?.()}>
          {props.children}
        </button>
      )}
    </>
  );
}
