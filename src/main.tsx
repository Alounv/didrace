/* @refresh reload */
import { render } from "solid-js/web";
import { Router, Route } from "@solidjs/router";
import { schema } from "./schema.ts";
import Cookies from "js-cookie";
import { decodeJwt } from "jose";
import { createZero } from "@rocicorp/zero/solid";
import { lazy } from "solid-js";

const Home = lazy(() => import("./routes/Home.tsx"));
const Race = lazy(() => import("./routes/Race.tsx"));

const encodedJWT = Cookies.get("jwt");
const decodedJWT = encodedJWT && decodeJwt(encodedJWT);
const userID = decodedJWT?.sub ? (decodedJWT.sub as string) : "anon";

const z = createZero({
  userID,
  auth: () => encodedJWT,
  server: import.meta.env.VITE_PUBLIC_SERVER,
  schema,
  // This is easier to develop with until we make the persistent state
  // delete itself on schema changes. Just remove to get persistent storage.
  kvStore: "mem",
});

const root = document.getElementById("root");

render(
  () => (
    <Router>
      <Route path="/" component={() => <Home z={z} />} />
      <Route path="/races/:id" component={() => <Race z={z} />} />
    </Router>
  ),
  root!,
);
