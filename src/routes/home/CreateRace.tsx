import { api } from "../../../convex/_generated/api";
import { getCurrentUser } from "../../convex";
import { createMutation } from "../../convex-solid";

export function CreateRace() {
  const { token } = getCurrentUser();
  const createRace = createMutation(api.races.createRace);
  const joinRace = createMutation(api.races.joinRace);

  const handleCreateRace = async () => {
    try {
      const raceId = await createRace({
        ...(token ? { token } : {}),
      });

      // Auto-join the created race
      await joinRace({
        raceId,
        ...(token ? { token } : {}),
      });

      // Navigate to the race
      window.location.href = `/races/${raceId}`;
    } catch (error) {
      console.error("Failed to create race:", error);
    }
  };

  return (
    <button
      type="button"
      class="card w-50 h-50 bg-base-100 hover:bg-primary hover:text-primary-content justify-center"
      onClick={handleCreateRace}
    >
      <div class="text-6xl">+</div>
      <div>Create race</div>
    </button>
  );
}
