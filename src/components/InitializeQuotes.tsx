import { createSignal } from "solid-js";
import { createMutation } from "../convex-solid";
import { api } from "../../convex/_generated/api";
import { quotes } from "../data/quotes";

export function InitializeQuotes() {
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);
  const [success, setSuccess] = createSignal(false);

  const initializeQuotes = createMutation(api.quotes.initializeQuotes);

  async function handleInitialize() {
    setLoading(true);
    setError(null);

    try {
      const result = await initializeQuotes({ quotesData: quotes });

      setSuccess(true);
      setTimeout(() => {
        window.location.reload(); // Refresh to show the quotes
      }, 2000);
    } catch (err) {
      console.error("Failed to initialize quotes:", err);
      setError(
        err instanceof Error ? err.message : "Failed to initialize quotes",
      );
    } finally {
      setLoading(false);
    }
  }

  if (success()) {
    return (
      <div class="card bg-success text-success-content p-6">
        <h3 class="text-lg font-bold mb-2">✅ Quotes Initialized!</h3>
        <p>Successfully loaded quotes. Refreshing page...</p>
      </div>
    );
  }

  return (
    <div class="card bg-base-100 p-6 max-w-md">
      <h3 class="text-lg font-bold mb-4">Initialize Quotes Database</h3>
      <p class="text-base-content/70 mb-6">
        No quotes found in the database. Click the button below to load sample
        quotes and get started with typing races.
      </p>

      {error() && (
        <div class="alert alert-error mb-4">
          <span>{error()}</span>
        </div>
      )}

      <button
        class={`btn btn-primary ${loading() ? "loading" : ""}`}
        onClick={handleInitialize}
        disabled={loading()}
      >
        {loading() ? "Loading Quotes..." : "Initialize Quotes Database"}
      </button>

      <p class="text-xs text-base-content/50 mt-2">
        This will load the first 100 quotes from the quotes collection.
      </p>
    </div>
  );
}
