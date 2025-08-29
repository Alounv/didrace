import { createSignal, onMount, Show } from "solid-js";
import { handleDiscordCallback } from "../auth/discordAuth";

export function DiscordCallback() {
  const [error, setError] = createSignal<string | null>(null);

  onMount(async () => {
    try {
      await handleDiscordCallback();
      // If successful, handleDiscordCallback will redirect to home
    } catch (err) {
      console.error("Discord callback error:", err);
      setError(err instanceof Error ? err.message : "Authentication failed");
    }
  });

  return (
    <div class="flex flex-col items-center justify-center min-h-screen gap-4">
      <Show
        when={!error()}
        fallback={
          <div class="flex flex-col items-center gap-4">
            <div class="text-error text-lg">Authentication Failed</div>
            <div class="text-error text-sm">{error()}</div>
            <a href="/" class="btn btn-primary">
              Back to Home
            </a>
          </div>
        }
      >
        <div class="loading loading-spinner loading-lg" />
        <div class="text-lg">Authenticating with Discord...</div>
      </Show>
    </div>
  );
}
