import { useQuery } from "@rocicorp/zero/solid";
import { Zero } from "@rocicorp/zero";
import { Schema } from "../../schema";
import { create } from "../../domain/race";

export function CreateRace(props: { z: Zero<Schema> }) {
  const [quotes] = useQuery(() => props.z.query.quote);

  return (
    <button
      class="card w-50 h-50 bg-base-100 hover:bg-primary hover:text-primary-content justify-center"
      onClick={() => create({ ...props, quotes: quotes() })}
    >
      <div class="text-6xl">+</div>
      <div>Create race</div>
    </button>
  );
}
