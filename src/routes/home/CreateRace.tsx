import { useQuery } from "@rocicorp/zero/solid";
import { Zero } from "@rocicorp/zero";
import { Schema } from "../../schema";
import { id } from "../../utils/id";
import { randInt } from "../../utils/rand";

export function CreateRace(props: { z: Zero<Schema> }) {
  const [quotes] = useQuery(() => props.z.query.quote);
  const getRandomQuoteId = () => quotes()[randInt(quotes().length)].id;

  return (
    <button
      class="card w-50 h-50 bg-base-100 hover:bg-primary hover:text-primary-content justify-center"
      onClick={() => {
        props.z.mutate.race.insert({
          id: id(),
          status: "ready",
          authorID: props.z.userID,
          quoteID: getRandomQuoteId(),
          timestamp: Date.now(),
        });
      }}
    >
      <div class="text-6xl">+</div>
      <div>Create race</div>
    </button>
  );
}
