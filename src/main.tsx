/* @refresh reload */
import { render } from "solid-js/web";
import { Route, Router } from "@solidjs/router";
import { schema } from "./schema.ts";
import "./index.css";
import Cookies from "js-cookie";
import { decodeJwt } from "jose";
import { createZero } from "@rocicorp/zero/solid";
import { JSX, lazy } from "solid-js";
import Header from "./components/Header.tsx";
import { Profile } from "./routes/analytics/Analytics.tsx";

const Home = lazy(() => import("./routes/home/Home.tsx"));
const Race = lazy(() => import("./routes/race/Race.tsx"));

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

function Layout(props: { children?: JSX.Element }) {
  return (
    <div class="p-10 h-screen flex flex-col gap-8 overflow-x-hidden bg-base-300 text-base-content">
      <Header z={z} />
      <div class="flex-1 flex flex-col items-start">{props.children}</div>
    </div>
  );
}

render(
  () => (
    <Router root={Layout}>
      <Route path="/" component={() => <Home z={z} />} />
      <Route path="/races/:id" component={() => <Race z={z} />} />
      <Route path="/profile" component={() => <Profile z={z} />} />
    </Router>
  ),
  root!,
);
