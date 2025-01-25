import Cookies from "js-cookie";
import { useQuery } from "@rocicorp/zero/solid";
import { Zero } from "@rocicorp/zero";
import { Schema } from "./schema";
// import { randomMessage } from "./test-data";
// import { randInt } from "./rand";
// import { formatDate } from "./date";
import { createEffect, createSignal, For, Show } from "solid-js";

function App({ z }: { z: Zero<Schema> }) {
  const [players] = useQuery(() => z.query.player);
  const [texts] = useQuery(() => z.query.text);
  const [races] = useQuery(() => z.query.race);

  const [action, setAction] = createSignal<"add" | "remove" | undefined>(
    undefined,
  );

  // Refresh the page every minute
  createEffect(() => {
    if (action() !== undefined) {
      const interval = setInterval(() => {
        if (!handleAction()) {
          clearInterval(interval);
          setAction(undefined);
        }
      }, 1000 / 60);
    }
  });

  const handleAction = () => {
    return true;
    //   if (action() === undefined) {
    //     return false;
    //   }
    //   if (action() === "add") {
    //     z.mutate.message.insert(randomMessage(users(), mediums()));
    //     return true;
    //   } else {
    //     const messages = allMessages();
    //     if (messages.length === 0) {
    //       return false;
    //     }
    //     const index = randInt(messages.length);
    //     z.mutate.message.delete({ id: messages[index].id });
    //     return true;
    //   }
  };

  // const addMessages = () => setAction("add");

  // const removeMessages = (e: MouseEvent) => {
  //   if (z.userID === "anon" && !e.shiftKey) {
  //     alert(
  //       "You must be logged in to delete. Hold the shift key to try anyway.",
  //     );
  //     return;
  //   }
  //   setAction("remove");
  // };

  // const stopAction = () => setAction(undefined);

  // const editMessage = (
  //   e: MouseEvent,
  //   id: string,
  //   senderID: string,
  //   prev: string,
  // ) => {
  //   if (senderID !== z.userID && !e.shiftKey) {
  //     alert(
  //       "You aren't logged in as the sender of this message. Editing won't be permitted. Hold the shift key to try anyway.",
  //     );
  //     return;
  //   }
  //   const body = prompt("Edit message", prev);
  //   z.mutate.message.update({
  //     id,
  //     body: body ?? prev,
  //   });
  // };

  const toggleLogin = async () => {
    if (z.userID === "anon") {
      await fetch("/api/login");
    } else {
      Cookies.remove("jwt");
    }
    location.reload();
  };

  const initialSyncComplete = () => players().length && texts().length;

  const player = () => players().find((p) => p.id === z.userID)?.name ?? "anon";

  return (
    <Show when={initialSyncComplete()}>
      <div class="controls">
        <div></div>
        <div style={{ "justify-content": "end" }}>
          {player() === "anon" ? "" : `Logged in as ${player()}`}
          <button onMouseDown={() => toggleLogin()}>
            {player() === "anon" ? "Login" : "Logout"}
          </button>
        </div>
      </div>
      <div>
        <For each={races()}>
          {(race) => (
            <div>
              <div>{race.id}</div>
              <div>{race.status}</div>
            </div>
          )}
        </For>
      </div>
    </Show>
  );
}

export default App;
