import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";

const http = httpRouter();

// Test route to check if HTTP router works
http.route({
  path: "/api/test",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    return new Response("HTTP Router is working!", { status: 200 });
  }),
});

// Guest login route
http.route({
  path: "/api/guest",
  method: "GET", 
  handler: httpAction(async (ctx, request) => {
    try {
      const guestId = await ctx.runQuery("players.getLastGuest", {});
      
      if (!guestId) {
        return new Response("No guest accounts available", { status: 404 });
      }

      return new Response("Guest login would work here", { status: 200 });
    } catch (error) {
      return new Response("Guest login failed", { status: 500 });
    }
  }),
});

export default http;
