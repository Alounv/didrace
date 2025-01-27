import { useQuery } from "@rocicorp/zero/solid";
import { Zero } from "@rocicorp/zero";
import { Schema } from "../../schema";
import { id } from "../../id";
import { Button } from "../../design-system";
import { randInt } from "../../rand";

export function CreateRace(props: { z: Zero<Schema> }) {
  const [quotes] = useQuery(() => props.z.query.quote);
  const getRandomQuoteId = () => quotes()[randInt(quotes().length)].id;

  return (
    <Button
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
      Create race
    </Button>
  );
}
