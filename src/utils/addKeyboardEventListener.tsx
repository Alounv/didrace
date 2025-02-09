import { onCleanup, onMount } from "solid-js";

export function addKeyboardEventListener(props: {
  callback: (event?: KeyboardEvent) => void;
  keys: string[];
}) {
  onMount(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (props.keys.includes(event.code)) {
        props.callback(event);
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    // Cleanup listener when component unmounts
    onCleanup(() => {
      window.removeEventListener("keydown", handleKeyPress);
    });
  });
}
