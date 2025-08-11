import { createQuery, createMutation } from "../convex-solid";
import { api } from "../../convex/_generated/api";
import { getCurrentUser } from "../convex";

export function CreateRace() {
  const { token } = getCurrentUser();
  const quotes = createQuery(api.quotes.getAllQuotes, {});
  const createRace = createMutation(api.races.createRace);
  const joinRace = createMutation(api.races.joinRace);

  const handleCreateRace = async () => {
    const quotesData = quotes();
    if (!quotesData || quotesData.length === 0) return;
    
    // Pick a random quote
    const randomQuote = quotesData[Math.floor(Math.random() * quotesData.length)];
    
    try {
      const raceId = await createRace({
        quoteID: randomQuote._id,
        token,
      });
      
      // Auto-join the created race
      await joinRace({
        raceId,
        token,
      });
      
      // Navigate to the race
      window.location.href = `/races/${raceId}`;
    } catch (error) {
      console.error("Failed to create race:", error);
    }
  };

  return (
    <button
      class="card w-50 h-50 bg-base-100 hover:bg-primary hover:text-primary-content justify-center"
      onClick={handleCreateRace}
    >
      <div class="text-6xl">+</div>
      <div>Create race</div>
    </button>
  );
}