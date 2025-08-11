import { Zero } from "@rocicorp/zero";
import { Player, Schema } from "../schema";

/**
 * Update some player data
 */
export function updatePlayer({
  z,
  color,
  name,
  avatar,
}: Partial<Pick<Player, "name" | "color" | "avatar">>) {
  z.mutate.player.update({ id: z.userID, color, name, avatar });
}
