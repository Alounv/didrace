import { ConvexClient } from "convex/browser";
import { FunctionReference, FunctionArgs, FunctionReturnType } from "convex/server";
import { Context, createContext, from, useContext } from "solid-js";

export const ConvexContext: Context<ConvexClient | undefined> = createContext();

// Create a reactive SolidJS atom attached to a Convex query function.
export function createQuery<Query extends FunctionReference<"query">>(
  query: Query,
  args?: FunctionArgs<Query>
): () => FunctionReturnType<Query> | undefined {
  const convex = useContext(ConvexContext);
  if (convex === undefined) {
    throw new Error("No convex context - ensure ConvexProvider wraps your components");
  }
  const fullArgs = args ?? ({} as FunctionArgs<Query>);
  return from((setter) => {
    const unsubber = convex!.onUpdate(query, fullArgs, setter);
    return unsubber;
  });
}

export function createMutation<Mutation extends FunctionReference<"mutation">>(
  mutation: Mutation
): (args?: FunctionArgs<Mutation>) => Promise<FunctionReturnType<Mutation>> {
  const convex = useContext(ConvexContext);
  if (convex === undefined) {
    throw new Error("No convex context - ensure ConvexProvider wraps your components");
  }

  return (args) => {
    const fullArgs = args ?? ({} as FunctionArgs<Mutation>);
    return convex.mutation(mutation, fullArgs);
  };
}

export function createAction<Action extends FunctionReference<"action">>(
  action: Action
): (args?: FunctionArgs<Action>) => Promise<FunctionReturnType<Action>> {
  const convex = useContext(ConvexContext);
  if (convex === undefined) {
    throw new Error("No convex context - ensure ConvexProvider wraps your components");
  }
  return (args) => {
    const fullArgs = args ?? ({} as FunctionArgs<Action>);
    return convex.action(action, fullArgs);
  };
}