import { httpRouter } from "convex/server";
import { discordOAuth, guestLogin } from "./authentication";

const http = httpRouter();

http.route({
  path: "/discord",
  method: "GET",
  handler: discordOAuth,
});

http.route({
  path: "/guest",
  method: "GET", 
  handler: guestLogin,
});

export default http;